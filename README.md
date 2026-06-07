<div align="center">

# ⚡ Circuit.IQ

### AI-Powered 3D Virtual Physics Laboratory

A full-stack 3D physics simulation platform where students build circuits on virtual breadboards, run experiments, and get AI-powered guidance — all in the browser.

[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](#-prerequisites)
[![Flask 3.1](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)](#overview)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#overview)
[![Three.js r184](https://img.shields.io/badge/Three.js-r184-000000?logo=threedotjs&logoColor=white)](#overview)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](#-database)

</div>

---

## Overview

Circuit.IQ is a premium, interactive WebGL-based physics sandbox. Students can drag components onto a virtual 3D breadboard, draw wires to build circuits, and run simulations. An AI Mentor is embedded to provide real-time guidance.

### Architecture At A Glance

| Component | Directory | Tech Stack | Role | Port |
| :--- | :--- | :--- | :--- | :--- |
| **React Website** | `circuit.iq (1)final/` | React 19, TypeScript, Zustand, Tailwind | Portal, Landing Page, AI Mentor | `3000` |
| **3D Simulator** | `LABfront-IQ-3D/` | Three.js (r184), HTML5 Canvas, Vite | WebGL Breadboard, Oscilloscope, Graph | Iframe |
| **Python Server** | `LABback-IQ/` | Flask 3.1, Gemini API, SQLite, Supabase | Calculations, AI endpoints, DB persistence | `5000` |

---

## Key Features

*   **26 Interactive Experiments**: Spanning Electricity, Semiconductors, Electromagnetism, Modern Physics, and Thermodynamics.
*   **3D Breadboard Simulator**: Full drag-and-drop workflow for resistors, capacitors, LEDs, diodes, and switches.
*   **Intelligent AI Assistant**: Ask questions directly to an AI PhysicsBot connected to Gemini (with offline fallback formulas).
*   **Rich Measurements**: Integrated digital meters (V, I, Z, P), a functional dual-channel oscilloscope, and live V-I graphs.
*   **Automated Lab Reports**: Click to download a comprehensive PDF report with your observation tables, graph screenshot, Viva Q&A, and auto-generated grade.
*   **Auto-Save & Persistence**: Restores your exact component placements and wire routes upon refresh (backed by local SQLite or cloud Supabase).

---

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
Ensure you have [Node.js (18+)](https://nodejs.org/) and [Python (3.8+)](https://www.python.org/) installed.

```bash
# Clone the repository
git clone https://github.com/SYEDTUFAILANDRABI/Circuit.IQ.git
cd Circuit.IQ

# Install Python requirements
pip install -r LABback-IQ/requirements.txt

# Install 3D Simulator packages
cd LABfront-IQ-3D && npm install && cd ..

# Install React Website packages
cd "circuit.iq (1)final" && npm install && cd ..
```

### 2. Configure Environment (Optional)
Copy the example environment file:
```bash
cp LABback-IQ/.env.example LABback-IQ/.env
```
Open `LABback-IQ/.env` and optionally add your `GEMINI_API_KEY` for AI tutoring. If left blank, the app will gracefully fall back to local rule-based physics formulas.

### 3. Run in Development Mode
Start both frontend and backend servers simultaneously:
```bash
python start_dev.py
```
This automatically opens **http://localhost:3000** in your browser. Choose an experiment and click **Launch Lab** to start!

---

## 📁 Project Directory Structure

```
Circuit.IQ/
├── start_dev.py              # Startup dev script (runs Flask + React)
├── build_all.py              # Production build pipeline compiler
├── schema.sql                # Supabase database table definitions
├── customise.sql             # DB extensions and customization columns
├── circuit_iq.db             # Local SQLite database file (auto-created)
│
├── LABback-IQ/               # 🐍 Python Flask Backend
│   ├── main.py               # Main production entrypoint
│   ├── app.py                # Server configuration, static files, blueprints
│   ├── physics_engine.py     # Rigorous math solver for all 26 experiments
│   ├── database.py           # SQLite/Supabase abstraction layer
│   ├── routes/               # API endpoint blueprints (physics, db, AI)
│   └── experiments/          # Modular physics calculation plugins
│
├── LABfront-IQ-3D/           # ⚡ 3D Simulator (Three.js)
│   ├── index.html            # Lab UI structure, meters, panels
│   ├── src/main.js           # Main WebGL rendering, wire-drawing, and logic
│   └── public/models/        # GLTF 3D electronic components
│
└── circuit.iq (1)final/      # ⚛️ React Web Portal
    ├── src/pages/            # Landing page, contact page, iframe wrapper
    ├── src/components/        # UI components (Hero, AI panel, showcases)
    └── public/                # Built 3D Lab assets copied during build
```

---

## 🔬 Physics Experiments (26 Total)

### ⚡ Electricity & Circuits (Breadboard Interactive)
1. **Ohm's Law Verification** – Find the linear relationship between voltage and current (`V = I × R`).
2. **Kirchhoff's Voltage Law (KVL)** – Verify that the sum of voltages around any closed loop is zero (`ΣV = 0`).
3. **Kirchhoff's Current Law (KCL)** – Prove that current entering a junction equals current leaving it (`ΣI_in = ΣI_out`).
4. **LCR AC Impedance** – Analyze impedance `Z` under alternating current (`Z = √[R² + (XL−XC)²]`).
5. **Series LCR Resonance** – Find the frequency where inductive and capacitive reactances cancel (`f₀ = 1/(2π√LC)`).
6. **RC Time Constant** – Charge and discharge a capacitor to observe transient response (`τ = R × C`).
7. **Series & Parallel Loads** – Observe how equivalent resistance changes based on circuit topology.
8. **Wheatstone Bridge** – Determine an unknown resistance by balancing bridge branches (`Rx = R3 × R2 / R1`).

### 🔌 Semiconductor & Components (Breadboard Interactive)
9. **Diode I-V Characteristics** – Graph the exponential forward bias current and reverse block behavior.
10. **Voltage & Current Divider** – Learn how series and parallel resistor networks divide electric energy.
11. **Arduino LED Control** – Interactive push-button LED switcher simulating microcontroller logic.

### 🧲 Electromagnetism (Visualizer Widget)
12. **Faraday's Induction Law** – Induce voltage pulses by moving a magnet through a multi-turn coil.
13. **Lenz's Law Demonstration** – Observe how the direction of induced current opposes the magnetic change.
14. **Solenoid Magnetic Field** – Calculate field strength inside a current-carrying coil (`B = μ₀nI`).
15. **AC Transformer Ratio** – Change primary/secondary turns to step-up or step-down voltage.
16. **Biot-Savart's Law** – Plot magnetic flux density at varying distances from a straight wire.

### ⚛️ Modern & Quantum Physics (Visualizer Widget)
17. **Planck's Constant (LEDs)** – Determine `h` by finding the threshold voltage of different color LEDs.
18. **Planck's Constant (Photocell)** – Measure stopping potential under different monochromatic light wavelengths.
19. **Photoelectric Effect** – Eject electrons from metal targets by varying light intensity and frequency.
20. **Radioactive Decay** – Watch unstable nuclei decay exponentially over time (`N(t) = N₀e^(−λt)`).
21. **de Broglie Matter Wave** – Study wave-particle duality by calculating particle wavelengths (`λ = h/p`).
22. **Bohr Hydrogen Atom** – Simulate energy level transitions and emission spectral lines.

### 🔥 Thermodynamics (Visualizer Widget)
23. **Stefan-Boltzmann Law** – Verify radiated energy scales with the fourth power of temperature (`P = σϵAT⁴`).
24. **Ideal Gas Equation** – Interlink Pressure, Volume, and Temperature variables (`PV = nRT`).
25. **Boyle's Law** – Compress a gas at a constant temperature to see pressure change (`P₁V₁ = P₂V₂`).
26. **Charles's Law** – Heat a gas at constant pressure to watch it expand (`V₁/T₁ = V₂/T₂`).

---

## 🏗️ Production Build & Deploy

To build the entire project for production deployment, run the automated build script:
```bash
python build_all.py
```
This builds the 3D Simulator, copies the bundles to the React public assets folder, compiles the React portal into `circuit.iq (1)final/dist/`, and primes the backend server to serve it directly.

Once built, launch the production server:
```bash
cd LABback-IQ
python main.py
```
Go to **http://localhost:5000** to access the production build.

---

## 📖 Sub-Project Guides

For deeper code details, configuration recipes, and backend routes, consult these specific guides:
*   🐍 **Backend Guide**: [LABback-IQ/README.md](LABback-IQ/README.md)
*   ⚡ **3D Simulator Guide**: [LABfront-IQ-3D/README.md](LABfront-IQ-3D/README.md)
*   ⚛️ **React Portal Guide**: [circuit.iq (1)final/README.md](circuit.iq%20(1)final/README.md)
*   🛠️ **Developer Integration Guide**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

<div align="center">

**Circuit.IQ Team**
*Interactive Virtual Laboratories for Modern Physics Education*

</div>
