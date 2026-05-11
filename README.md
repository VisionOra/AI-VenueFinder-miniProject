# Venuefinder

A B2B platform for discovering event venues. Built with Django + DRF, Celery + Redis, OpenAI, React + Tailwind.

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url> && cd venuefinder

# 2. Configure environment
cp .env.example .env
# Edit .env and set OPENAI_API_KEY — everything else works with the defaults

# 3. Start all services
docker compose up --build

# Services:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:8000
#   Swagger:   http://localhost:8000/api/docs/

# Seed data (25 venues + demo user) runs automatically on first boot.
# Demo credentials: demo / demo1234
```

---

## Project Structure

```
venuefinder/
├── backend/
│   ├── config/             # Django project: settings, urls, celery
│   │   └── settings/       # base / development / production
│   ├── apps/
│   │   ├── venues/         # Venue model, AI search task, filters
│   │   ├── users/          # Auth endpoints (register, JWT login)
│   │   └── shortlists/     # Shortlist model + summary email task
│   └── tests/              # pytest test suite
└── frontend/
    └── src/
        ├── api/            # axios client + per-resource modules
        ├── store/          # Zustand: auth + shortlist state
        ├── components/     # VenueCard, FilterBar, AISearchBar, Navbar
        └── pages/          # VenueListPage, AISearchPage, ShortlistPage, auth pages
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register/` | — | Create account |
| POST | `/api/auth/login/` | — | Get JWT tokens |
| POST | `/api/auth/refresh/` | — | Refresh access token |
| GET | `/api/auth/me/` | ✓ | Current user |
| GET | `/api/venues/` | — | List venues (filterable, paginated) |
| GET | `/api/venues/{id}/` | — | Venue detail |
| POST | `/api/venues/search/` | — | Start AI search → returns `job_id` (202) |
| GET | `/api/venues/search/{job_id}/` | — | Poll AI search result |
| POST | `/api/venues/{id}/shortlist/` | ✓ | Add to shortlist |
| DELETE | `/api/venues/{id}/shortlist/remove/` | ✓ | Remove from shortlist |
| GET | `/api/shortlist/` | ✓ | User's shortlist |
| GET | `/api/docs/` | — | Swagger UI |

**Filter params for `GET /api/venues/`:** `city`, `min_capacity`, `max_capacity`, `max_price`, `page`

---

## Key Decisions

### Authentication: JWT (djangorestframework-simplejwt)
Stateless tokens work naturally with the React SPA — no CSRF complexity, easy header-based auth, and refresh token rotation is built in. Tokens are stored in `localStorage`; in production, `httpOnly` cookies would be preferable for XSS protection.

### AI Architecture: Structured prompting + function calling (no vector store)
At seed-data scale (25 venues), passing the full venue list as context is cheaper, faster, and more debuggable than building an embedding index:
- **No cold start** — no embedding generation step on first boot
- **Deterministic** — function calling forces a typed schema; we validate returned IDs against the DB regardless
- **Transparent** — the prompt is readable and the constraint logic is clear

For a production catalogue (100+ venues), the right move is embeddings + pgvector: embed venue descriptions at write time, embed the query at search time, retrieve top-k candidates, then pass only those to the LLM for re-ranking and explanation generation. This keeps token usage bounded regardless of catalogue size.

### AI Output Constraint
The model receives the full venue list with integer IDs and is forced via `tool_choice` to call `return_venue_recommendations(recommendations=[{venue_id, explanation}])`. After parsing, returned IDs are validated against the set of real DB IDs before any venue data is included in the response. The LLM cannot invent venues — even if it hallucinates an ID, it won't match.

### Celery + Redis
- Broker: Redis DB 0
- Result backend: Redis DB 0
- AI search job state: Django cache (Redis DB 1) — keyed by UUID, TTL 1 hour
- This separation means job state survives Celery result expiry and is cheap to poll

### Shortlist Summary Idempotency
The summary task fires **only when the shortlist transitions from 2 → 3 items** (the first time the threshold is crossed). Adding a 4th, 5th venue never re-triggers it. This is implemented by checking `count_before < 3 <= count_after` in the add view.

Why this rule vs. rate-limiting per day: the transition-based rule is simpler, stateless (no Redis key to manage), and maps to the natural product behaviour — "congratulations, you have your first comparison set." A daily rate limit makes more sense if we want to trigger on every shortlist addition but throttle the emails; that's a production enhancement.

---

## Running Tests

```bash
docker compose exec backend pytest tests/ -v
```

---

## What I'd Add for Production

- **Embeddings + pgvector** for the AI search pipeline once the catalogue grows beyond ~50 venues
- **httpOnly cookie storage** for JWT tokens (XSS protection)
- **Rate limiting** on the AI search endpoint (django-ratelimit or nginx)
- **Celery Beat** for scheduled tasks (e.g. weekly shortlist digest)
- **Real email backend** — swap the logger.info in `shortlists/tasks.py` for `django.core.mail.send_mail`. Works with any `EMAIL_BACKEND`: SendGrid (`sendgrid_backend.SendgridBackend`), SES (`django_ses.SESBackend`), Postmark (`postmark.django_backend.EmailBackend`)
- **Sentry** for error tracking
- **OpenTelemetry** traces for the Celery task pipeline
- **Flower** for Celery monitoring dashboard
- **pgvector** extension + embedding-based search pipeline for scale
- **Presigned S3 URLs** for venue photo uploads

## What I Cut for Time

- Venue photos / image upload
- Quote request flow
- Admin bulk-import of venues via CSV
- Email verification on register
- Comprehensive test coverage (frontend tests, integration tests for the full async search flow with a mocked OpenAI client)
- Production Dockerfile (multi-stage, non-root user, read-only filesystem)
