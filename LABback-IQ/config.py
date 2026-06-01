"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: config.py
 ROLE: Environment configuration — loads .env and validates required keys
================================================================================
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    # Frontend dist directory (served as static files)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DIST_DIR = os.path.join(BASE_DIR, "circuit.iq (1)final", "dist")

    # Gemini AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Supabase (for Phase 2 — auth & DB)
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Contact form via Resend (Phase 6)
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
    CONTACT_TO_EMAIL = os.getenv("CONTACT_TO_EMAIL", "team@circuitiq.dev")
