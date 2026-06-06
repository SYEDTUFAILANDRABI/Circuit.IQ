"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: routes/database_routes.py
 ROLE: Flask routes for database queries and updates
================================================================================
"""

from flask import Blueprint, request, jsonify
import database

db_bp = Blueprint("database_routes", __name__, url_prefix="/api/db")

@db_bp.route("/save-circuit", methods=["POST"])
def save_circuit_route():
    """
    Saves a circuit diagram.
    Request body JSON:
        user_id (str)
        experiment_type (str)
        name (str)
        description (str)
        circuit_data (dict): placedComponents and wires
        params (dict): Voltage, Resistance, etc.
    """
    try:
        data = request.get_json(force=True)
        user_id = data.get("user_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
        experiment_type = data.get("experiment_type", "ohms")
        name = data.get("name", "Saved Circuit")
        description = data.get("description", "")
        circuit_data = data.get("circuit_data", {})
        params = data.get("params", {})
        
        cid = database.save_circuit(
            experiment_type=experiment_type,
            user_id=user_id,
            name=name,
            description=description,
            circuit_data=circuit_data,
            params=params
        )
        
        return jsonify({
            "status": "success",
            "message": "Circuit diagram saved successfully.",
            "circuit_id": cid,
            "db_type": database.get_db_type()
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@db_bp.route("/load-circuit", methods=["GET"])
def load_circuit_route():
    """
    Loads a circuit diagram.
    Query parameters:
        user_id (str)
        experiment_type (str)
    """
    try:
        user_id = request.args.get("user_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
        experiment_type = request.args.get("experiment_type", "ohms")
        
        circuit = database.load_circuit(experiment_type, user_id)
        if circuit:
            return jsonify({
                "status": "success",
                "circuit": circuit
            }), 200
        else:
            return jsonify({
                "status": "not_found",
                "message": f"No saved circuit found for experiment '{experiment_type}'."
            }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@db_bp.route("/save-log", methods=["POST"])
def save_log_route():
    """
    Saves an experiment completion log.
    Request body JSON:
        user_id (str)
        circuit_id (str, optional)
        experiment_type (str)
        results (dict)
        duration_seconds (int)
        score (float)
        notes (str)
        feedback (str)
        attempt_number (int)
    """
    try:
        data = request.get_json(force=True)
        user_id = data.get("user_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
        circuit_id = data.get("circuit_id", None)
        experiment_type = data.get("experiment_type", "ohms")
        results = data.get("results", {})
        duration_seconds = data.get("duration_seconds", 0)
        score = data.get("score", None)
        notes = data.get("notes", "")
        feedback = data.get("feedback", "")
        attempt_number = data.get("attempt_number", 1)
        
        log_id = database.save_experiment_log(
            user_id=user_id,
            circuit_id=circuit_id,
            experiment_type=experiment_type,
            results=results,
            duration_seconds=duration_seconds,
            score=score,
            notes=notes,
            feedback=feedback,
            attempt_number=attempt_number
        )
        
        return jsonify({
            "status": "success",
            "message": "Experiment log saved successfully.",
            "log_id": log_id
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@db_bp.route("/get-logs", methods=["GET"])
def get_logs_route():
    """
    Retrieves history logs for a user.
    Query parameters:
        user_id (str)
        experiment_type (str, optional)
    """
    try:
        user_id = request.args.get("user_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
        experiment_type = request.args.get("experiment_type", None)
        
        logs = database.get_experiment_logs(user_id, experiment_type)
        return jsonify({
            "status": "success",
            "logs": logs
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@db_bp.route("/profile", methods=["GET", "POST"])
def profile_route():
    """
    GET: Retrieves the user's profile.
    POST: Upserts the user's profile.
    """
    try:
        if request.method == "GET":
            user_id = request.args.get("user_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            profile = database.get_profile(user_id)
            if profile:
                return jsonify({"status": "success", "profile": profile}), 200
            else:
                return jsonify({"status": "not_found", "message": "Profile not found."}), 404
        else:
            data = request.get_json(force=True)
            user_id = data.get("user_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            full_name = data.get("full_name", "")
            university = data.get("university", "")
            semester = data.get("semester", "")
            graduation_year = data.get("graduation_year", None)
            role = data.get("role", "student")
            phone = data.get("phone", None)
            is_active = data.get("is_active", True)
            
            success = database.upsert_profile(
                user_id=user_id,
                full_name=full_name,
                university=university,
                semester=semester,
                graduation_year=graduation_year,
                role=role,
                phone=phone,
                is_active=is_active
            )
            
            if success:
                return jsonify({"status": "success", "message": "Profile updated successfully."}), 200
            else:
                return jsonify({"status": "error", "message": "Failed to update profile."}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
