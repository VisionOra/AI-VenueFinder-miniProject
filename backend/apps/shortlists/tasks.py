import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def send_shortlist_summary(self, user_id: int) -> None:
    """
    Generates and logs a shortlist summary "email" for the given user.

    Idempotency rule: this task is only dispatched when the shortlist count
    transitions from 2 → 3 (i.e. the first time the threshold is crossed).
    See ShortlistAddView for the dispatch logic. Subsequent additions (4th, 5th
    venue, etc.) do NOT re-trigger this task, preventing spam.

    In production, swap the logger.info call for a real email backend:
      - SendGrid: use sendgrid-django and EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
      - SES: use django-ses and EMAIL_BACKEND = 'django_ses.SESBackend'
      - Postmark: use django-postmark and EMAIL_BACKEND = 'postmark.django_backend.EmailBackend'
    All three are drop-in Django EMAIL_BACKEND replacements — no task code changes needed.
    """
    from django.contrib.auth import get_user_model

    from apps.shortlists.models import Shortlist

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("send_shortlist_summary: user %s not found", user_id)
        return

    shortlisted = Shortlist.objects.filter(user=user).select_related("venue").order_by("-created_at")

    lines = [
        f"Subject: Your Venuefinder Shortlist — {shortlisted.count()} venues saved",
        f"To: {user.email or user.username}",
        "",
        f"Hi {user.username},",
        "",
        "You have shortlisted the following venues:",
        "",
    ]
    for entry in shortlisted:
        v = entry.venue
        lines.append(f"  • {v.name} — {v.city} — £{v.price_per_day}/day")

    lines += [
        "",
        "Log in to Venuefinder to view full details and request quotes.",
        "",
        "— The Venuefinder Team",
    ]

    email_body = "\n".join(lines)
    logger.info("SHORTLIST SUMMARY EMAIL:\n%s", email_body)
