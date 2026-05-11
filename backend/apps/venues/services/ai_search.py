"""
AI venue search service.

Responsibility: given a natural-language query and a list of Venue instances,
call the OpenAI API and return a ranked list of matches with explanations.

Architecture decision — structured prompting + function calling (no vector store):
  At seed-data scale (20-30 venues) passing the full catalogue as context is
  cheaper, faster, and more debuggable than maintaining an embedding index.
  The function-calling schema constrains the model to return only integer venue
  IDs, and we validate those IDs against the DB after the call regardless.

  For a production catalogue (100+ venues) the right upgrade path is:
    1. Store embeddings in pgvector at write time (post_save signal or async task)
    2. Embed the query at search time
    3. Retrieve top-k candidates via cosine similarity
    4. Pass only those k venues to this service for re-ranking + explanation
"""

import json
import logging
from dataclasses import dataclass

from django.conf import settings
from openai import OpenAI, OpenAIError

logger = logging.getLogger(__name__)

# Maximum number of venues to surface per search
MAX_RESULTS = 5

# Truncate descriptions to keep prompt tokens manageable
DESCRIPTION_MAX_CHARS = 300


@dataclass
class VenueMatch:
    venue_id: int
    explanation: str


def search_venues(query: str, venues: list) -> list[VenueMatch]:
    """
    Call OpenAI to rank venues against a natural-language query.

    Args:
        query:  The user's plain-English search string.
        venues: QuerySet or list of Venue ORM instances to search across.

    Returns:
        Ordered list of VenueMatch(venue_id, explanation).
        Only IDs present in `venues` are returned — hallucinated IDs are dropped.

    Raises:
        OpenAIError: propagated to the caller (Celery task handles retry logic).
    """
    if not venues:
        return []

    venue_context = _build_venue_context(venues)
    tool_schema = _build_tool_schema()
    system_prompt = _build_system_prompt(venue_context)

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    logger.info("Calling OpenAI for query: %r  (%d venues in context)", query, len(venues))

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
        tools=[tool_schema],
        # Force the model to call our function — no free-text fallback possible.
        tool_choice={"type": "function", "function": {"name": "return_venue_recommendations"}},
        timeout=45,
    )

    raw_recommendations = _parse_tool_response(response)
    return _validate_against_db(raw_recommendations, venues)


# ── Private helpers ────────────────────────────────────────────────────────────

def _build_venue_context(venues: list) -> list[dict]:
    """Serialise venues to a compact dict list suitable for the prompt."""
    return [
        {
            "id": v.id,
            "name": v.name,
            "city": v.city,
            "capacity": v.capacity,
            "price_per_day": float(v.price_per_day),
            "amenities": v.amenities,
            "description": v.description[:DESCRIPTION_MAX_CHARS],
        }
        for v in venues
    ]


def _build_system_prompt(venue_context: list[dict]) -> str:
    return (
        "You are a venue recommendation assistant for a B2B event planning platform.\n"
        "Below is the complete list of venues in our database (JSON). "
        "Find the best matches for the user's query.\n\n"
        f"VENUES:\n{json.dumps(venue_context, indent=2)}\n\n"
        "Rules:\n"
        "- You MUST only recommend venues from the list above.\n"
        "- Use the exact integer `id` field from each venue object.\n"
        "- Provide a concise, specific explanation (1-2 sentences) per venue.\n"
        f"- Return between 1 and {MAX_RESULTS} results. Fewer is better if quality is low.\n"
        "- If no venues match the query well, return an empty recommendations array."
    )


def _build_tool_schema() -> dict:
    """
    Function calling schema that forces the model to return structured venue IDs.
    Using tool_choice=required means the model cannot respond with free text —
    it must call this function, giving us a typed, parseable response every time.
    """
    return {
        "type": "function",
        "function": {
            "name": "return_venue_recommendations",
            "description": "Return the best-matching venues from the database with explanations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recommendations": {
                        "type": "array",
                        "maxItems": MAX_RESULTS,
                        "items": {
                            "type": "object",
                            "properties": {
                                "venue_id": {
                                    "type": "integer",
                                    "description": "The `id` field of the venue from the database list.",
                                },
                                "explanation": {
                                    "type": "string",
                                    "description": "Why this venue matches the query (1-2 sentences).",
                                },
                            },
                            "required": ["venue_id", "explanation"],
                        },
                    }
                },
                "required": ["recommendations"],
            },
        },
    }


def _parse_tool_response(response) -> list[dict]:
    """Extract and parse the function call arguments from the OpenAI response."""
    tool_calls = response.choices[0].message.tool_calls
    if not tool_calls:
        logger.warning("OpenAI returned no tool calls — empty recommendations")
        return []

    raw = json.loads(tool_calls[0].function.arguments)
    return raw.get("recommendations", [])


def _validate_against_db(recommendations: list[dict], venues: list) -> list[VenueMatch]:
    """
    Drop any venue_id the model returned that doesn't exist in our database.
    This is a hard safety layer — we never trust the model's IDs blindly,
    even though the function schema constrains them to integers.
    """
    valid_ids = {v.id for v in venues}
    seen = set()
    results = []

    for rec in recommendations:
        vid = rec.get("venue_id")
        if vid in valid_ids and vid not in seen:
            seen.add(vid)
            results.append(VenueMatch(venue_id=vid, explanation=rec["explanation"]))

    logger.info("Validated %d/%d recommendations against DB", len(results), len(recommendations))
    return results
