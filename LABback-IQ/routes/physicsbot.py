"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: routes/physicsbot.py
 ROLE: PhysicsBot AI endpoint — real Gemini-powered physics tutor
================================================================================
 This is Phase 3 of the dev plan.
 Receives a question + circuit context, sends to Gemini with a physics-tutor
 system prompt, and returns the AI answer.

 ROUTE:
    POST /api/physicsbot/ask

 REQUEST JSON:
    question       : str   — student's typed question
    experiment     : str   — active experiment key ('ohms' | 'lcr' | 'rc' | ...)
    circuit_state  : dict  — {placed_components, wires, params, readings}
                             All fields optional — send whatever the lab has.

 RESPONSE JSON (success):
    answer         : str   — AI response text (max ~120 words)

 RESPONSE JSON (error):
    error          : str   — error message
    answer         : str   — fallback message shown to student
================================================================================
"""

import os
import json
from flask import Blueprint, request, jsonify

physicsbot_bp = Blueprint("physicsbot", __name__, url_prefix="/api/physicsbot")

# ── System prompt template ───────────────────────────────────────────────────
SYSTEM_PROMPT = """You are PhysicsBot, an expert physics lab tutor for CircuitIQ — an interactive 3D virtual physics lab for college students.

Your role:
- Help students understand the physics concepts behind what they are observing in the lab
- Explain errors in their circuit clearly and specifically
- Use the student's actual circuit state (components placed, readings, parameters) to give personalised answers
- Keep every response under 120 words — students read on a small chat panel
- Use plain language with LaTeX-style formulas only when essential (e.g. V = I × R)
- Never give the full solution directly; guide the student to think it through

Current experiment context will be provided by the system. Always reference it."""

def _build_context_message(question: str, experiment: str, circuit_state: dict) -> str:
    """Formats the student question with circuit context into a single prompt."""

    components = circuit_state.get("placed_components", [])
    wires      = circuit_state.get("wires", [])
    params     = circuit_state.get("params", {})
    readings   = circuit_state.get("readings", {})

    comp_summary = ", ".join(
        f"{c.get('type', 'unknown')}#{c.get('id', '?')}"
        for c in components
    ) or "none placed"

    wire_count = len(wires)

    params_str = ", ".join(
        f"{k}={v}" for k, v in params.items()
    ) or "none"

    readings_str = ", ".join(
        f"{k}={v}" for k, v in readings.items()
    ) or "none"

    return (
        f"Current experiment: {experiment or 'unknown'}\n"
        f"Placed components: {comp_summary}\n"
        f"Wires connected: {wire_count}\n"
        f"Parameters: {params_str}\n"
        f"Current readings: {readings_str}\n\n"
        f"Student question: {question}"
    )


@physicsbot_bp.route("/ask", methods=["POST"])
def ask():
    """
    Accepts a student question + circuit context and returns a Gemini AI answer.
    Falls back to a helpful static message if the API key is missing.
    """
    try:
        data = request.get_json(force=True)

        question      = str(data.get("question", "")).strip()
        experiment    = str(data.get("experiment", "")).strip()
        circuit_state = data.get("circuit_state", {})

        if not question:
            return jsonify({"error": "No question provided", "answer": "Please type a question first!"}), 400

        api_key = os.getenv("GEMINI_API_KEY", "")

        # ── Fallback mode: no API key configured ──────────────────────────────
        if not api_key:
            fallback = (
                "PhysicsBot AI is not configured yet. "
                "Ask your team lead to add the GEMINI_API_KEY to the .env file. "
                "In the meantime, check the Theory tab for experiment guidance!"
            )
            return jsonify({"answer": fallback}), 200

        # ── Live mode: call Gemini ─────────────────────────────────────────────
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT,
        )

        user_message = _build_context_message(question, experiment, circuit_state)

        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(
                temperature=0.4,
                max_output_tokens=200,   # ~120 words comfortably
            ),
        )

        answer = response.text.strip()
        return jsonify({"answer": answer}), 200

    except Exception as exc:
        # Never crash the lab — return a friendly error
        return jsonify({
            "error":  str(exc),
            "answer": "PhysicsBot hit a snag. Check the server logs and try again shortly.",
        }), 500
