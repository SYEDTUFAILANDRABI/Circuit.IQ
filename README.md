<![CDATA[<div align="center">

# ⚡ Circuit.IQ

### AI-Powered 3D Virtual Physics Laboratory

A full-stack 3D physics simulation platform where students build circuits on virtual breadboards,
run experiments, and get AI-powered guidance — all in the browser.

[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](#-prerequisites)
[![Flask 3.1](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)](#overview)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#overview)
[![Three.js r184](https://img.shields.io/badge/Three.js-r184-000000?logo=threedotjs&logoColor=white)](#overview)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](#-database)

</div>

---

## What is Circuit.IQ?

Circuit.IQ lets students **drag-and-drop** electronic components onto a 3D breadboard, **wire them together**, and **simulate real physics** — all inside a web browser. An AI tutor guides them through each experiment step by step.

### Three Main Parts

| Part | What it does | Tech | Port |
|------|-------------|------|------|
| 🌐 **Website** | Homepage, experiment catalog, AI chat | React + TypeScript | `3000` |
| 🔬 **3D Lab** | Interactive breadboard simulator | Three.js + Vite | iframe |
| 🐍 **Server** | Physics calculations, database, AI | Flask + Python | `5000` |

### What Students Can Do

- 🧪 Run **26 physics experiments** (Ohm's Law, LCR circuits, Faraday's Law, etc.)
- 🔌 Drag resistors, capacitors, LEDs, and wires onto a 3D breadboard
- 📊 See live voltage/current meters, oscilloscope waveforms, and V-I graphs
- 🤖 Ask an **AI mentor** questions about physics (powered by Google Gemini)
- 📄 Download a complete **PDF lab report** with theory, data, and grading
- 💾 Circuits **auto-save** — come back later and pick up where you left off

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Everything

```bash
git clone https://github.com/SYEDTUFAILANDRABI/Circuit.IQ.git
cd Circuit.IQ

# Python packages
pip install -r LABback-IQ/requirements.txt

# 3D Lab packages
cd LABfront-IQ-3D && npm install && cd ..

# Website packages
cd "circuit.iq (1)final" && npm install && cd ..
```

### Step 2: Add Your API Key (Optional)

```bash
cp LABback-IQ/.env.example LABback-IQ/.env
```

Open `LABback-IQ/.env` and paste your [Google Gemini API key](https://aistudio.google.com/).
Without it, the app still works — it just uses built-in formulas instead of AI.

### Step 3: Start the App

```bash
python start_dev.py
```

Opens **http://localhost:3000** automatically. Pick an experiment and click **"Launch Lab"**.

> Press `Ctrl+C` to stop.

---

## 📋 Prerequisites

| Tool | Minimum Version | Check with |
|------|----------------|------------|
| Python | 3.8+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

---

## 📁 Project Structure

```
Circuit.IQ/
│
├── start_dev.py              ← Run this to start everything
├── build_all.py              ← Run this to build for production
├── schema.sql                ← Database tables (for Supabase)
├── customise.sql             ← Extra database columns
├── circuit_iq.db             ← Local database (auto-created)
│
├── LABback-IQ/               ← 🐍 Python Server
│   ├── main.py               ←   Start here
│   ├── app.py                ←   Flask setup + routes
│   ├── config.py             ←   Reads .env settings
│   ├── physics_engine.py     ←   Math calculations
│   ├── ai_guide.py           ←   Built-in tutoring logic
│   ├── database.py           ←   Save/load circuits
│   ├── .env                  ←   Your API keys (private!)
│   ├── requirements.txt      ←   Python packages
│   ├── experiments/           ←   Experiment plugins (ohms, lcr, rc)
│   └── routes/                ←   API endpoints
│       ├── physics.py         ←     /api/calculate, /api/validate
│       ├── physicsbot.py      ←     /api/physicsbot/ask
│       ├── contact.py         ←     /api/contact
│       ├── database_routes.py ←     /api/db/* (save/load)
│       └── attendance.py      ←     /api/attendance/*
│
├── LABfront-IQ-3D/           ← ⚡ 3D Lab Simulator
│   ├── index.html            ←   UI layout (panels, meters, chat)
│   ├── src/main.js           ←   ⭐ All lab logic (11,000 lines)
│   ├── src/style.css         ←   Visual styling
│   ├── public/models/        ←   3D models (breadboard, resistor)
│   └── dist/                 ←   Built files (auto-generated)
│
└── circuit.iq (1)final/      ← ⚛️ React Website
    ├── src/App.tsx            ←   Page router
    ├── src/pages/
    │   ├── LandingPage.tsx    ←   Homepage + experiment catalog
    │   ├── LabStudio.tsx      ←   Loads 3D lab in iframe
    │   └── ContactPage.tsx    ←   Support form
    ├── src/components/        ←   Navbar, Hero, AI Panel, etc.
    ├── src/store/             ←   Zustand state management
    └── public/lab.html        ←   Built 3D lab (from build_all.py)
```

---

## 🔑 Environment Variables

All settings go in `LABback-IQ/.env` (copy from `.env.example`):

| Variable | What it does | Required? |
|----------|-------------|-----------|
| `GEMINI_API_KEY` | Enables AI mentor and PhysicsBot | Recommended |
| `SUPABASE_URL` | Cloud database URL | No — uses local SQLite |
| `SUPABASE_ANON_KEY` | Cloud database key | No — uses local SQLite |
| `RESEND_API_KEY` | Sends contact form emails | No — logs to console |
| `FLASK_DEBUG` | Shows detailed errors | No — defaults to `false` |
| `PORT` | Server port | No — defaults to `5000` |

> **Everything works without API keys.** The app falls back to local alternatives automatically.

---

## 🔬 All 26 Experiments

### ⚡ Electricity & Circuits

| # | Experiment | What Students Learn | Key Formula |
|---|-----------|-------------------|-------------|
| 1 | **Ohm's Law** | Voltage, current, resistance relationship | V = IR |
| 2 | **Kirchhoff's Voltage Law** | Voltage drops in a loop sum to zero | ΣV = 0 |
| 3 | **Kirchhoff's Current Law** | Current at a junction is conserved | ΣI_in = ΣI_out |
| 4 | **LCR AC Impedance** | How R, L, C affect AC circuits | Z = √(R² + (XL−XC)²) |
| 5 | **Series LCR Resonance** | Finding resonant frequency | f₀ = 1/(2π√LC) |
| 6 | **RC Time Constant** | How capacitors charge over time | τ = RC |
| 7 | **Series & Parallel** | Combining resistors | 1/R = 1/R₁ + 1/R₂ |
| 8 | **Wheatstone Bridge** | Measuring unknown resistance | Rx = R₃(R₂/R₁) |

### 🔌 Semiconductors

| # | Experiment | What Students Learn | Key Formula |
|---|-----------|-------------------|-------------|
| 9 | **Diode I-V Curve** | How diodes conduct in one direction | I = Is·e^(V/nVt) |
| 10 | **Voltage Divider** | Splitting voltage between resistors | Vout = Vin·R₂/(R₁+R₂) |
| 11 | **Arduino LED** | Controlling LEDs with switches | I = (V−Vled)/R |

### 🧲 Electromagnetism

| # | Experiment | What Students Learn | Key Formula |
|---|-----------|-------------------|-------------|
| 12 | **Faraday's Law** | Moving magnets create voltage | E = −N(ΔΦ/Δt) |
| 13 | **Lenz's Law** | Induced current opposes change | Opposes dΦ/dt |
| 14 | **Solenoid Field** | Magnetic field in a coil | B = μ₀nI |
| 15 | **Transformer** | Voltage conversion with coils | Vs/Vp = Ns/Np |
| 16 | **Biot-Savart** | Field around a wire | B = μ₀I/(2πr) |

### ⚛️ Modern Physics

| # | Experiment | What Students Learn | Key Formula |
|---|-----------|-------------------|-------------|
| 17 | **Planck (LEDs)** | Finding Planck's constant with LEDs | h = eVλ/c |
| 18 | **Planck (Photocell)** | Photoelectric stopping voltage | eVs = hf − Φ |
| 19 | **Photoelectric Effect** | Light ejects electrons from metals | Kmax = hν − Φ |
| 20 | **Radioactive Decay** | Half-life and exponential decay | N = N₀e^(−λt) |
| 21 | **de Broglie Wave** | Matter has wave properties | λ = h/(mv) |
| 22 | **Bohr Atom** | Electron energy levels in hydrogen | ΔE = 13.6(1/nf²−1/ni²) |

### 🔥 Thermodynamics

| # | Experiment | What Students Learn | Key Formula |
|---|-----------|-------------------|-------------|
| 23 | **Stefan's Law** | Radiation scales with T⁴ | P = σεAT⁴ |
| 24 | **Ideal Gas** | Pressure, volume, temperature | PV = nRT |
| 25 | **Boyle's Law** | Pressure × Volume = constant | P₁V₁ = P₂V₂ |
| 26 | **Charles's Law** | Volume grows with temperature | V₁/T₁ = V₂/T₂ |

> **Experiments 1–11** use the interactive 3D breadboard with drag-and-drop components.
> **Experiments 12–26** use parameter sliders and visualization widgets.

---

## 🏗️ How It Works (Architecture)

```
  Student's Browser
  ─────────────────
  ┌──────────────┐        ┌───────────────────┐
  │  React       │        │  3D Lab            │
  │  Website     │───────►│  (iframe)          │
  │  :3000       │        │  Three.js          │
  └──────┬───────┘        └────────┬───────────┘
         │                         │
         │   /api/* requests       │
         ▼                         ▼
  ┌────────────────────────────────────────────┐
  │         Flask Server (:5000)               │
  │                                            │
  │  /api/calculate   → Physics Engine         │
  │  /api/validate    → Circuit Checker        │
  │  /api/physicsbot  → Gemini AI / Fallback   │
  │  /api/db/*        → SQLite or Supabase     │
  │  /api/contact     → Email via Resend       │
  └────────────────────────────────────────────┘
```

**How a typical session works:**

1. Student opens **localhost:3000** → sees the experiment catalog
2. Clicks **"Launch Lab"** → React loads the 3D simulator in an iframe
3. Drags components onto the breadboard → connects them with wires
4. Clicks **"Initialize"** → server validates the circuit and calculates V, I, Z, P
5. Meters, oscilloscope, and graphs update in real time
6. Circuit **auto-saves** to the database after every change
7. On reload → saved circuit is restored exactly as it was

---

## 🌐 API Endpoints

### Physics

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/calculate` | POST | Returns V, I, Z, P, XL, XC, φ, f₀ for given parameters |
| `/api/validate` | POST | Checks if the circuit forms a valid closed loop |

### AI

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/physicsbot/ask` | POST | Answers physics questions using Gemini AI |

### Database

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/db/save-circuit` | POST | Saves circuit layout (components + wires + params) |
| `/api/db/load-circuit` | GET | Loads a previously saved circuit |
| `/api/db/experiment-log` | POST | Records an experiment attempt with score |
| `/api/db/experiment-logs` | GET | Gets history of past attempts |
| `/api/db/profile` | GET/POST | Read or update user profile |

### Other

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/contact` | POST | Sends a support email via Resend |
| `/api/attendance/*` | GET/POST | Student attendance tracking |

---

## 💾 Database

The app stores data in **two ways** (automatically chosen):

| Mode | When | Storage |
|------|------|---------|
| **SQLite** (default) | No Supabase keys in `.env` | Local file: `circuit_iq.db` |
| **Supabase** (cloud) | Supabase keys configured | PostgreSQL on Supabase |

### What Gets Saved

| Table | Stores |
|-------|--------|
| `profiles` | Student name, university, semester, graduation year |
| `circuits` | Component positions, wire connections, slider values (as JSON) |
| `experiment_logs` | Experiment results, scores, duration, attempt count |

### Example Circuit Data (JSON)

```json
{
  "placedComponents": [
    { "type": "source", "snap1": 14, "snap2": 15 },
    { "type": "resistor", "snap1": 130, "snap2": 200 }
  ],
  "wires": [
    { "fromHole": 14, "toHole": 130 },
    { "fromHole": 200, "toHole": 15 }
  ],
  "params": { "V": 12, "R": 100, "L": 50, "C": 100, "f": 50, "T": 25 }
}
```

---

## 🏗️ Building for Production

```bash
# One command does everything:
python build_all.py
```

This runs three steps automatically:

```
1. Build 3D Lab        →  LABfront-IQ-3D/dist/
2. Copy to website     →  circuit.iq (1)final/public/lab.html
3. Build website       →  circuit.iq (1)final/dist/
```

Then serve with Flask:
```bash
cd LABback-IQ && python main.py
# → Opens http://localhost:5000 with everything bundled
```

---

## ❓ Common Problems

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError: flask` | `pip install -r LABback-IQ/requirements.txt` |
| `npm ERR! missing script: dev` | `npm install` in the right folder first |
| 3D lab shows white screen | Open browser console (F12) → check for JS errors |
| API calls fail (404) | Make sure `python start_dev.py` is running |
| AI mentor doesn't respond | Add `GEMINI_API_KEY` to `LABback-IQ/.env` |
| Circuit doesn't save | Check that `circuit_iq.db` exists in project root |
| Port already in use | Kill processes on ports 3000/5000, then restart |
| Build fails | Run `npm install` in both frontend folders, then `python build_all.py` |

---

## 📖 More Documentation

| Document | What it covers |
|----------|---------------|
| [LABback-IQ/README.md](LABback-IQ/README.md) | Server setup, all API details, physics engine docs |
| [LABfront-IQ-3D/README.md](LABfront-IQ-3D/README.md) | 3D lab code map, wire system, breadboard internals |
| [circuit.iq (1)final/README.md](circuit.iq%20(1)final/README.md) | React pages, components, state management |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | How to add experiments, components, routes |

---

<div align="center">

**Built with ❤️ by the Circuit.IQ Team**

Python · Flask · React · Three.js · Gemini AI · Supabase

</div>
]]>
