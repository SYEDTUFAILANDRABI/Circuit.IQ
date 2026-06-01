"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: routes/contact.py
 ROLE: Contact form submission handler
================================================================================
 Accepts form submissions from ContactPage.tsx and either:
   1. Sends an email notification via Resend (if RESEND_API_KEY is set), OR
   2. Logs the submission to stdout (fallback — always works, no setup needed)

 ROUTE:
    POST /api/contact

 REQUEST JSON:
    name        : str  (required)
    email       : str  (required)
    subject     : str  (required)
    message     : str  (required, min 8 chars)
    requestType : str  (optional — Bug Report, Feature Request, etc.)

 RESPONSE JSON (success):
    status      : 'success'
    ticket_id   : str  — a random ticket reference for the student
    message     : str  — confirmation message

 RESPONSE JSON (error):
    status      : 'error'
    message     : str
================================================================================
"""

import os
import re
import uuid
from flask import Blueprint, request, jsonify

contact_bp = Blueprint("contact", __name__, url_prefix="/api")

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


def _validate_payload(data: dict) -> list[str]:
    errors = []
    if not str(data.get("name", "")).strip():
        errors.append("name is required")
    email = str(data.get("email", "")).strip()
    if not email:
        errors.append("email is required")
    elif not EMAIL_RE.match(email):
        errors.append("email is not valid")
    if not str(data.get("subject", "")).strip():
        errors.append("subject is required")
    if len(str(data.get("message", "")).strip()) < 8:
        errors.append("message must be at least 8 characters")
    return errors


def _send_via_resend(data: dict, ticket_id: str) -> bool:
    """
    Sends an email notification using the Resend API (https://resend.com).
    Returns True on success, False on failure.
    Free tier: 100 emails/day — more than enough for a college project.
    """
    try:
        import urllib.request, json as _json

        api_key  = os.getenv("RESEND_API_KEY", "")
        to_email = os.getenv("CONTACT_TO_EMAIL", "team@circuitiq.dev")

        payload = {
            "from": "CircuitIQ Contact <noreply@circuitiq.dev>",
            "to":   [to_email],
            "subject": f"[CircuitIQ] {data.get('requestType', 'Contact')} — {data.get('subject')} [#{ticket_id[:8].upper()}]",
            "html": (
                f"<h2>New Contact Submission</h2>"
                f"<p><b>Ticket:</b> #{ticket_id[:8].upper()}</p>"
                f"<p><b>From:</b> {data.get('name')} &lt;{data.get('email')}&gt;</p>"
                f"<p><b>Type:</b> {data.get('requestType', 'General')}</p>"
                f"<p><b>Subject:</b> {data.get('subject')}</p>"
                f"<hr>"
                f"<p>{data.get('message', '').replace(chr(10), '<br>')}</p>"
            ),
        }

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=_json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)

    except Exception as exc:
        print(f"[contact] Resend email failed: {exc}")
        return False


@contact_bp.route("/contact", methods=["POST"])
def contact():
    """Handles contact form submissions from ContactPage.tsx."""
    try:
        data = request.get_json(force=True)

        # Validate
        errors = _validate_payload(data)
        if errors:
            return jsonify({"status": "error", "message": "; ".join(errors)}), 400

        ticket_id = str(uuid.uuid4())

        # Always log to stdout (visible in Railway / Heroku / local logs)
        print(
            f"\n[CONTACT SUBMISSION]"
            f"\n  Ticket  : #{ticket_id[:8].upper()}"
            f"\n  Name    : {data.get('name')}"
            f"\n  Email   : {data.get('email')}"
            f"\n  Type    : {data.get('requestType', 'General')}"
            f"\n  Subject : {data.get('subject')}"
            f"\n  Message : {data.get('message')[:200]}...\n"
        )

        # Attempt Resend email if key configured
        resend_key = os.getenv("RESEND_API_KEY", "")
        if resend_key:
            sent = _send_via_resend(data, ticket_id)
            if sent:
                print(f"[contact] Email notification sent for ticket #{ticket_id[:8].upper()}")

        return jsonify({
            "status":    "success",
            "ticket_id": ticket_id,
            "message":   f"Transmission received. Ticket #{ticket_id[:8].upper()} has been logged.",
        }), 200

    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 500
