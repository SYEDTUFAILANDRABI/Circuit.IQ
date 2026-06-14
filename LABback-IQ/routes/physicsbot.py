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

physicsbot_bp = Blueprint("physicsbot", __name__, url_prefix="/api")

# ── System prompt templates ───────────────────────────────────────────────────
SYSTEM_PROMPT = """You are PhysicsBot, an expert physics lab tutor for CircuitIQ — an interactive 3D virtual physics lab for college students.

Your role:
- Help students understand the physics concepts behind what they are observing in the lab
- Explain errors in their circuit clearly and specifically
- Use the student's actual circuit state (components placed, readings, parameters) to give personalised answers
- Keep every response under 120 words — students read on a small chat panel
- Use plain language with LaTeX-style formulas only when essential (e.g. V = I × R)
- Never give the full solution directly; guide the student to think it through

Current experiment context will be provided by the system. Always reference it."""

LANDING_SYSTEM_PROMPT = """You are PhysicsBot, an expert physics tutor for college students.
Your task is to answer a student's general physics question.
You must respond with a JSON object containing the following keys:
- "explanation": A clear, concise explanation of the physics concepts, kept under 120 words.
- "formulas": A list of relevant formulas as objects, each containing:
    - "name": The name of the formula (e.g. "Ohm's Law")
    - "expr": The mathematical expression (e.g. "V = I × R")
- "recommendedExp": The exact key of a matching simulation module if relevant, or null. Available keys:
    - "ohms" (Ohm's Law Verification)
    - "kvl" (Kirchhoff's Voltage Law)
    - "kcl" (Kirchhoff's Current Law)
    - "rc_rl_rlc" (RC/RL/RLC AC Circuits)
    - "series_parallel" (Series & Parallel Loads)
    - "wheatstone" (Wheatstone Bridge)
    - "faraday" (Faraday's Induction Law)
    - "lenz" (Lenz's Law Demonstration)
    - "solenoid" (Solenoid Magnetic Field)
    - "transformer" (AC Transformer Ratio)
    - "snell" (Snell's Law of Refraction)
    - "lens_eq" (Thin Lens Equation)
    - "tir" (Total Internal Reflection)
    - "prism" (Prism Dispersion Spectrum)
    - "pendulum" (Simple Pendulum Motion)
    - "hooke" (Hooke's Law & Springs)
    - "projectile" (Projectile Firing Path)
    - "doppler" (Doppler Shift Simulation)
    - "ideal_gas" (Ideal Gas State Equation)
    - "boyle" (Boyle's Constant Temp Law)
    - "charles" (Charles's Constant Pres Law)
    - "specific_heat" (Specific Heat Capacity)
    - "photoelectric" (Photoelectric Effect)
    - "radioactive" (Radioactive Decay)
    - "de_broglie" (de Broglie Wavelength)
    - "bohr_model" (Bohr Hydrogen Atom)

Return ONLY a valid JSON object. Do not wrap it in markdown code blocks like ```json."""

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


def _get_fallback_answer(question: str, experiment: str, circuit_state: dict) -> str:
    """Provides a smart fallback response when Gemini is not configured or fails."""
    q_lower = question.lower()
    
    # 1. Check general keywords first (regardless of active experiment context)
    if 'ohm' in q_lower or 'resistor' in q_lower or 'voltage' in q_lower:
        if "formula" in q_lower or "equation" in q_lower:
            return "In Ohm's Law, the core formula is V = I × R (Voltage = Current × Resistance)."
        if "connect" in q_lower or "wire" in q_lower or "how to" in q_lower:
            return "To set up an Ohm's Law circuit, connect the positive terminal of a DC source to a resistor, and the other resistor terminal back to the negative terminal."
        return "Ohm's Law states that current (I) is directly proportional to voltage (V) and inversely proportional to resistance (R): I = V / R."
        
    elif 'lcr' in q_lower or 'resonance' in q_lower:
        if "formula" in q_lower or "equation" in q_lower:
            return "The resonant frequency for a series LCR circuit is f₀ = 1 / (2π√(LC)). Total impedance is Z = √[R² + (XL - XC)²]."
        return "In a series LCR circuit, resonance occurs when inductive reactance equals capacitive reactance (XL = XC), minimizing total impedance to R."
        
    elif 'rc' in q_lower or 'time constant' in q_lower or 'tau' in q_lower or 'capacitor' in q_lower:
        if "time constant" in q_lower or "tau" in q_lower:
            return "The RC time constant is τ = R × C. It represents the time needed for a capacitor to charge to 63.2% of its maximum voltage."
        if "phase" in q_lower:
            return "In an RC AC circuit, current leads the voltage by phase angle φ = -arctan(1 / (2πfCR))."
        return "An RC circuit contains a resistor and a capacitor. It displays transient charging/discharging curves governed by the time constant τ = RC."

    # 2. Fallback to experiment-specific defaults if no keyword matches
    if experiment == "ohms":
        return "You are in the Ohm's Law experiment. Try asking about the formula (V = I × R) or how to connect the components."
    elif experiment == "lcr":
        return "You are in the Series LCR Resonance experiment. Try asking about resonant frequency f₀ or impedance calculations."
    elif experiment == "rc":
        return "You are in the RC Time Constant experiment. Try asking about the time constant τ = RC or phase shift."

    if "help" in q_lower:
        return "To perform the experiment, select Ohm's Law, LCR, or RC, place the required components, wire them in a loop, and click 'Initialize System'."
        
    return (
        "Welcome to CircuitIQ Physics Tutor! You can ask me about physics concepts, "
        "formulas, and wiring guides for Ohm's Law, LCR resonance, or RC time constants. "
        "Try typing a question about formulas or how to connect components!"
    )


@physicsbot_bp.route("/physicsbot/ask", methods=["POST"])
def ask():
    """
    Accepts a student question + circuit context and returns a Gemini AI answer.
    Falls back to a helpful static message if the API key is missing or invalid.
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
            return jsonify({"answer": _get_fallback_answer(question, experiment, circuit_state)}), 200

        # ── Live mode: call Gemini ─────────────────────────────────────────────
        try:
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
        except Exception as api_err:
            print(f"[PhysicsBot API Error] Live mode failed: {api_err}")
            # Fallback to smart offline answer instead of crashing/erroring
            return jsonify({"answer": _get_fallback_answer(question, experiment, circuit_state)}), 200

    except Exception as exc:
        # Never crash the lab — return a friendly error
        return jsonify({
            "error":  str(exc),
            "answer": "PhysicsBot hit a snag. Check the server logs and try again shortly.",
        }), 500


def _get_landing_fallback(question: str) -> dict:
    """Helper to return structured fallback tutoring info."""
    q_lower = question.lower()
    explanation = "Welcome to the Circuit.IQ Physics Tutor! You can ask me about various physics concepts like Ohm's Law, LCR resonance, Snell's law, projectiles, or gas laws. Choose any simulation to begin experimenting!"
    formulas = [{"name": "Mass-Energy", "expr": "E = m c²"}]
    recommended_exp = None

    if 'ohm' in q_lower or 'resistor' in q_lower or 'voltage' in q_lower:
        explanation = "Ohm's Law governs electrical currents in resistive paths. Under constant temperature, current is directly proportional to voltage and inversely proportional to resistance."
        formulas = [{"name": "Ohm's Law", "expr": "V = I × R"}]
        recommended_exp = "ohms"
    elif 'lcr' in q_lower or 'resonance' in q_lower:
        explanation = "In series LCR resonance, inductive and capacitive reactances cancel out. Total impedance drops to equal the resistance R, generating maximum current flow."
        formulas = [{"name": "Resonance", "expr": "f₀ = 1 / (2π√(LC))"}]
        recommended_exp = "rc_rl_rlc"
    elif 'pendulum' in q_lower or 'gravity' in q_lower:
        explanation = "A simple pendulum swings in simple harmonic motion. Its period depends on length L and gravity g, not the bob mass."
        formulas = [{"name": "Period", "expr": "T = 2π √(L / g)"}]
        recommended_exp = "pendulum"
    elif 'snell' in q_lower or 'refraction' in q_lower:
        explanation = "Light bends when entering a new refractive medium. Snell's law relates the sine ratio of incident and refractive angles."
        formulas = [{"name": "Snell's Law", "expr": "n₁ sin(θ₁) = n₂ sin(θ₂)"}]
        recommended_exp = "snell"
    elif 'gas' in q_lower or 'boyle' in q_lower or 'charles' in q_lower:
        explanation = "Gases follow PV = nRT. Boyle's law describes inverse P-V pressure-volume states, and Charles's law describes linear volume-temperature expansion."
        formulas = [{"name": "Ideal Gas", "expr": "P V = n R T"}]
        recommended_exp = "ideal_gas"
    elif 'photoelectric' in q_lower or 'photon' in q_lower:
        explanation = "Photoelectric emission occurs when incident photon energy exceeds the metal work function Φ, ejecting electrons at speed proportional to stopping voltage."
        formulas = [{"name": "Einstein's Photoelectric", "expr": "Kmax = h ν - Φ"}]
        recommended_exp = "photoelectric"

    return {
        "explanation": explanation,
        "formulas": formulas,
        "recommendedExp": recommended_exp
    }


@physicsbot_bp.route("/physics-bot", methods=["POST"])
def physics_bot():
    """
    Accepts a general physics question and returns a structured AI explanation,
    relevant formulas, and recommended experiment.
    Falls back to keyword-based structured response if API key is missing or invalid.
    """
    try:
        data = request.get_json(force=True)
        question = str(data.get("question", "")).strip()

        if not question:
            return jsonify({"error": "No question provided"}), 400

        api_key = os.getenv("GEMINI_API_KEY", "")

        # ── Fallback mode: no API key configured ──────────────────────────────
        if not api_key:
            return jsonify(_get_landing_fallback(question)), 200

        # ── Live mode: call Gemini ─────────────────────────────────────────────
        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=LANDING_SYSTEM_PROMPT,
            )

            response = model.generate_content(
                question,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.4,
                    response_mime_type="application/json",
                ),
            )

            result_text = response.text.strip()
            try:
                result_json = json.loads(result_text)
                return jsonify(result_json), 200
            except Exception:
                # If Gemini didn't return valid JSON despite system prompt/config, fallback to direct text wrapping
                return jsonify({
                    "explanation": result_text,
                    "formulas": [],
                    "recommendedExp": None
                }), 200
        except Exception as api_err:
            print(f"[PhysicsBot API Error] Landing page live mode failed: {api_err}")
            return jsonify(_get_landing_fallback(question)), 200

    except Exception as exc:
        return jsonify({
            "error": str(exc),
            "explanation": "PhysicsBot hit a snag. Check the server logs and try again shortly.",
            "formulas": [],
            "recommendedExp": None
        }), 500

