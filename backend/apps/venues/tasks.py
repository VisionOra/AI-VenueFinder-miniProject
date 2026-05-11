import logging

from celery import shared_task
from django.conf import settings
from django.core.cache import cache
from openai import OpenAIError
from apps.venues.models import Venue
from apps.venues.serializers import VenueSerializer
from apps.venues.services.ai_search import search_venues

logger = logging.getLogger(__name__)

SEARCH_JOB_TTL = getattr(settings, "SEARCH_JOB_TTL", 3600)


def _job_key(job_id: str) -> str:
    return f"ai_search:{job_id}"


def set_job_state(job_id: str, state: dict) -> None:
    cache.set(_job_key(job_id), state, timeout=SEARCH_JOB_TTL)


def get_job_state(job_id: str) -> dict | None:
    return cache.get(_job_key(job_id))


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def run_ai_venue_search(self, job_id: str, query: str) -> None:
    """
    Celery task: orchestrates the async AI venue search flow.

    Responsibilities (this file):
      - Manage job state transitions (pending → complete / failed)
      - Fetch data from the DB
      - Delegate AI logic to the service layer
      - Handle retries on transient OpenAI failures

    AI logic lives in: apps.venues.services.ai_search
    """

    set_job_state(job_id, {"status": "pending"})

    try:
        venues = list(Venue.objects.all())

        if not venues:
            set_job_state(job_id, {"status": "complete", "results": []})
            return

        matches = search_venues(query=query, venues=venues)

        venue_map = {v.id: v for v in venues}
        results = [
            {
                "venue": VenueSerializer(venue_map[match.venue_id]).data,
                "explanation": match.explanation,
            }
            for match in matches
            if match.venue_id in venue_map
        ]

        set_job_state(job_id, {"status": "complete", "results": results})
        logger.info("AI search job %s completed with %d results", job_id, len(results))

    except OpenAIError as exc:
        logger.error("OpenAI error for job %s: %s", job_id, exc)
        set_job_state(job_id, {"status": "failed", "error": str(exc)})
        raise self.retry(exc=exc)

    except Exception as exc:
        logger.exception("Unexpected error for AI search job %s", job_id)
        set_job_state(job_id, {"status": "failed", "error": "An unexpected error occurred."})
        raise self.retry(exc=exc)
