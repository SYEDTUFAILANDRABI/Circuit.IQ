"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: server.py
 ROLE: HTTP Server — Serves frontend static files + REST API endpoints
================================================================================
 ARCHITECTURE:
    • Uses Python's built-in http.server (no external framework needed)
    • Extends SimpleHTTPRequestHandler to serve from Circuit-IQ-3D/dist/
    • Handles two POST API routes for frontend-backend communication

 API ROUTES:
    POST /api/validate   → Validates circuit topology (closed loop check)
                           Called by: frontend when user clicks "Simulate"
                           Handler: handle_validate() → PhysicsEngine.validate_circuit()

    POST /api/calculate  → Computes V, I, Z, P, XL, XC, phi, f0 for experiment
                           Called by: frontend polling every 250ms while running
                           Handler: handle_calculate() → PhysicsEngine.calculate()

    GET  /*              → Serves static files from Circuit-IQ-3D/dist/
                           (index.html, JS bundles, CSS, assets, models)

 DEPENDENCIES:
    → physics_engine.py  (PhysicsEngine class for all calculations)
    → Circuit-IQ-3D/dist/ (built frontend — run 'npm run build' first)

 USAGE:
    Called from main.py: start_server(port=5000)
================================================================================
"""

import os
import json
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
from physics_engine import PhysicsEngine

# Base directory paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "circuitiq-frontend", "dist")

class CircuitIQRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Initialize SimpleHTTPRequestHandler serving from target dist directory
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/api/validate':
            self.handle_validate()
        elif self.path == '/api/calculate':
            self.handle_calculate()
        else:
            self.send_error(404, "API endpoint not found")

    def handle_validate(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            placed_components = data.get('placed_components', [])
            wires = data.get('wires', [])
            required_types = data.get('required_types', [])

            # Convert wire format from list-of-lists to list-of-tuples for engine
            wires_tuples = []
            for w in wires:
                # w is: [[c1, t1], [c2, t2]]
                wires_tuples.append((
                    (int(w[0][0]), int(w[0][1])),
                    (int(w[1][0]), int(w[1][1]))
                ))

            engine = PhysicsEngine()
            is_valid, msg = engine.validate_circuit(placed_components, wires_tuples, required_types)

            response = {
                'status': 'success' if is_valid else 'fail',
                'message': msg
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))

    def handle_calculate(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            params = data.get('params', {})
            active_experiment = data.get('active_experiment', 'ohms')

            engine = PhysicsEngine()
            
            # Map parameters to physical standard values
            if 'R' in params:
                engine.set_param('R', float(params['R']))
            if 'L' in params:
                # UI is mH, physical is H
                engine.set_param('L', float(params['L']) * 1e-3)
            if 'C' in params:
                # UI is uF, physical is F
                engine.set_param('C', float(params['C']) * 1e-6)
            if 'V' in params:
                engine.set_param('V', float(params['V']))
            if 'f' in params:
                engine.set_param('f', float(params['f']))
            if 'T' in params:
                engine.set_param('T', float(params['T']))

            button_pressed = data.get('button_pressed', True)
            results = engine.calculate(active_experiment, button_pressed)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))

def start_server(port=5000):
    # Ensure dist folder exists
    if not os.path.exists(DIST_DIR):
        print(f"[ERROR] Production dist folder not found at: {DIST_DIR}")
        print("Please build the frontend project using 'npm run build' inside 'Circuit-IQ-3D' first.")
        return

    server_address = ('', port)
    httpd = HTTPServer(server_address, CircuitIQRequestHandler)
    print(f"\n========================================================")
    print(f"   [Circuit.IQ 3D Virtual Lab Python Backend Server]")
    print(f"========================================================")
    print(f"Serving frontend from: {DIST_DIR}")
    print(f"API Endpoints active: /api/validate, /api/calculate")
    print(f"Listening on: http://localhost:{port}")
    print(f"Press Ctrl+C to stop the server.")
    print(f"========================================================\n")
    
    # Automatically launch browser window
    webbrowser.open(f"http://localhost:{port}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Python backend server...")
        httpd.server_close()

if __name__ == '__main__':
    start_server()
