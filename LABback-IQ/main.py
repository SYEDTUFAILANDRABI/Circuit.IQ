"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: main.py
 ROLE: Entry Point — kept for backward compatibility
================================================================================
 The backend now uses Flask (app.py) instead of Python's http.server.
 Running either `python main.py` or `python app.py` starts the server.

 USAGE:
    python main.py          ← same as python app.py
    python app.py           ← preferred (Flask dev server)
    gunicorn app:app        ← production
================================================================================
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Delegate to the Flask app
from app import app

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
