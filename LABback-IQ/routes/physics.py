"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: routes/physics.py
 ROLE: Flask blueprint for physics API routes
================================================================================
 PORTED FROM: server.py → handle_validate() and handle_calculate()
 Behaviour is identical to the original http.server implementation.

 ROUTES:
    POST /api/validate   → DFS circuit topology validation
    POST /api/calculate  → Physics calculations (V, I, Z, P, XL, XC, phi, f0)
================================================================================
"""

from flask import Blueprint, request, jsonify
from physics_engine import PhysicsEngine

physics_bp = Blueprint("physics", __name__, url_prefix="/api")


@physics_bp.route("/validate", methods=["POST"])
def validate():
    """
    Validates the circuit topology sent by the 3D lab frontend.

    Request JSON:
        placed_components  : list of component dicts {type, id, terminals}
        wires              : list of [[comp1_idx, term1_idx], [comp2_idx, term2_idx]]
        required_types     : list of required component type strings

    Response JSON:
        status  : 'success' | 'fail' | 'error'
        message : human-readable result string
    """
    try:
        data = request.get_json(force=True)

        placed_components = data.get("placed_components", [])
        wires             = data.get("wires", [])
        required_types    = data.get("required_types", [])

        # Convert wire format from list-of-lists to list-of-tuples (engine expects tuples)
        wires_tuples = []
        for w in wires:
            wires_tuples.append((
                (int(w[0][0]), int(w[0][1])),
                (int(w[1][0]), int(w[1][1])),
            ))

        engine = PhysicsEngine()
        is_valid, msg = engine.validate_circuit(placed_components, wires_tuples, required_types)

        return jsonify({
            "status":  "success" if is_valid else "fail",
            "message": msg,
        }), 200

    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 500


@physics_bp.route("/calculate", methods=["POST"])
def calculate():
    """
    Runs physics calculations for the active experiment.

    Request JSON:
        params             : {R, L (mH), C (uF), V, f, T}
        active_experiment  : 'ohms' | 'lcr' | 'rc'
        button_pressed     : bool

    Response JSON:
        V, I, Z, P, XL, XC, phi, f0, R_eff, R_nominal, f
    """
    try:
        data = request.get_json(force=True)

        params            = data.get("params", {})
        active_experiment = data.get("active_experiment", "ohms")
        button_pressed    = data.get("button_pressed", True)

        engine = PhysicsEngine()

        # Map UI units → physical units (same as original server.py)
        if "R" in params:
            engine.set_param("R", float(params["R"]))
        if "L" in params:
            engine.set_param("L", float(params["L"]) * 1e-3)   # mH → H
        if "C" in params:
            engine.set_param("C", float(params["C"]) * 1e-6)   # µF → F
        if "V" in params:
            engine.set_param("V", float(params["V"]))
        if "f" in params:
            engine.set_param("f", float(params["f"]))
        if "T" in params:
            engine.set_param("T", float(params["T"]))
        if "is_parallel" in params:
            engine.set_param("is_parallel", bool(params["is_parallel"]))

        results = engine.calculate(active_experiment, button_pressed)

        return jsonify(results), 200

    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 500
