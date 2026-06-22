# 🐍 Circuit.IQ — Python Backend Subsystem

The backend server processes calculations, performs topological circuit validation, acts as the database adapter, and handles API integrations for classroom analytics and AI tutoring. It is built using **Python 3** and **Flask**, with routes organized using Flask Blueprints.

---

## 🛠️ System Technology Stack
*   **Web framework**: Flask 3.1.0 (with Flask-CORS 5.0.0)
*   **Google Generative AI SDK**: `google-generativeai==0.8.3`
*   **Database clients**: Native `sqlite3` + `supabase==2.10.0`
*   **Testing frameworks**: Unit testing using `unittest` and `pytest`
*   **Emailing service client**: `resend` integration client

---

## 📂 Source File Registry & Connectivity Map

Every source file inside the [LABback-IQ/](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ) folder coordinates specific backend operations:

### 1. Main Application Engine & Configuration

*   **[main.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/main.py)**
    *   *Duty*: Server execution entrypoint. Instantiates and runs the Flask app.
*   **[app.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/app.py)**
    *   *Duty*: App factory. Sets up CORS, configures error handlers, and registers blueprint routes.
*   **[config.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/config.py)**
    *   *Duty*: Manages environment configurations (port mappings, Supabase keys, Gemini/Resend keys).
*   **[physics_engine.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/physics_engine.py)**
    *   *Duty*: Core solver director. Dispatches variables to experiment plugins to solve equations.
*   **[ai_guide.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/ai_guide.py)**
    *   *Duty*: Processes student queries locally using keyword matching if the Gemini API key is unavailable.
*   **[database.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/database.py)**
    *   *Duty*: Database sync adapter. Evaluates availability of Supabase keys; if present, it routes transactions to Supabase PostgreSQL, otherwise it falls back to a local SQLite database (`circuit_iq.db`).
*   **[test_physics.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/test_physics.py)**
    *   *Duty*: Contains backend unit tests for physics calculation solvers.

### 2. Route Blueprint Controllers (`routes/`)

*   **[physics.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/routes/physics.py)**
    *   *Duty*: Exposes `/api/calculate` and `/api/validate` endpoints.
*   **[physicsbot.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/routes/physicsbot.py)**
    *   *Duty*: Exposes `/api/physicsbot/ask`. Sends breadboard telemetry to the Gemini Pro/Flash API for AI tutoring.
*   **[database_routes.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/routes/database_routes.py)**
    *   *Duty*: Handles loading and saving layouts, updating user profiles, and fetching logs (`/api/db/*`).
*   **[attendance.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/routes/attendance.py)**
    *   *Duty*: Manages classroom presence tracking and session code creation (`/api/session/*`).
*   **[contact.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/routes/contact.py)**
    *   *Duty*: Binds support contact forms to the Resend API.

### 3. Modular Physics Solvers (`experiments/`)

*   **[base_experiment.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/experiments/base_experiment.py)**
    *   *Duty*: Abstract base class defining `calculate()` and `validate()` contracts.
*   **[ohms.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/experiments/ohms.py)**
    *   *Duty*: Solves $I = V / R_{eff}$ and $P = V \times I$. Incorporates resistance shifts due to thermal drift:
        $$R_{eff} = R_{nominal} \times [1 + \alpha(T - 25)]$$
*   **[lcr.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/experiments/lcr.py)**
    *   *Duty*: Solves series RLC resonance, reactances ($X_L = 2\pi f L$, $X_C = \frac{1}{2\pi f C}$), impedance ($Z = \sqrt{R^2 + (X_L - X_C)^2}$), phase ($\phi = \arctan\frac{X_L-X_C}{R}$), and resonant frequency ($f_0 = \frac{1}{2\pi\sqrt{LC}}$).
*   **[rc.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/experiments/rc.py)**
    *   *Duty*: Solves charging and discharging curves over time constants ($\tau = R \times C$):
        $$V_c(t) = V_s \times (1 - e^{-t/RC})$$
*   **[wheatstone.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/experiments/wheatstone.py)**
    *   *Duty*: Computes balance conditions for Wheatstone Bridge circuits:
        $$R_x = R_3 \times \frac{R_2}{R_1}$$

---

## 🔬 Core Physics & Validation Flow

### 1. Topology Validation Engine (`POST /api/validate`)
Before performing calculations, the backend validates the connection layout using a graph-based search algorithm:
1.  **Node Mapping**: Converts component placement coordinates and wire connections into an adjacency list representation of a graph.
2.  **Internal Paths**: Adds connection edges between the internal pins of passive components (resistors, inductors, capacitors).
3.  **Short-Circuit Detection**: Rejects the circuit if a direct wire path exists between the source's positive and negative terminals without passing through a load.
4.  **DFS Connectivity Verification**: Traverses the adjacency list from the positive terminal of the power supply using a Depth-First Search (DFS) traversal. The path is valid if the search reaches the negative terminal of the supply and visits all required series components.
5.  **Parallel Component Verification**: Confirms that parallel monitoring devices (like voltmeters) are wired to the correct component nodes.

### 2. Physics Calculator (`POST /api/calculate`)
Converts slider variables to standard values (e.g. converting capacitance from $\mu\text{F}$ to Farads), adjusts resistance values for temperature shifts, and runs the active experiment solver to compute voltages, currents, and phase angles.

---

## 🛠️ Standalone Backend Execution
To run the Flask server independently:
```bash
cd LABback-IQ
pip install -r requirements.txt
cp .env.example .env     # Define your Gemini/Supabase keys
python main.py
```
Open `http://localhost:5000` to access the API server.
