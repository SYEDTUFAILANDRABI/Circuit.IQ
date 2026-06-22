# ⚡ Circuit.IQ — 3D WebGL Simulator Subsystem

The 3D Simulator acts as the interactive breadboard prototyping environment for Circuit.IQ. It is built as a highly optimized **Vanilla ES6 JavaScript** application, bundled using **Vite 8**, and powered by the **Three.js (r184) WebGL rendering engine**.

---

## 🛠️ System Technology Stack
*   **3D Graphics Graphics Engine**: Three.js (r184 Perspective Renderer)
*   **Programming Language**: Vanilla JavaScript (ES6 Modules)
*   **Compilation & Bundling**: Vite 8
*   **Physics Integrations**: Local telemetry calculations + Flask REST API
*   **Asset Exporter**: `jsPDF` custom document builder
*   **Styling**: Vanilla CSS (glassmorphic panels, HUD metrics overlays, neon details)

---

## 📂 Source File Registry & Connectivity Map

Every source file inside the [LABfront-IQ-3D/](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-3D) folder coordinates specific graphics behaviors:

### 1. Main Project Entrypoints

*   **[index.html](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-3D/index.html)**
    *   *Duty*: Defines the HTML layout containing WebGL canvases, glassmorphic parameter adjustment panels, multimeters, step instruction cards, floating overlays (oscilloscope and graphs), and the AI mentor chat panel.
*   **[vite.config.js](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-3D/vite.config.js)**
    *   *Duty*: Manages Vite assets loading and reverse proxies all `/api/*` requests to the Flask server (port `5000`) during development.
*   **[src/style.css](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-3D/src/style.css)**
    *   *Duty*: Styling rules for HUD parameters, custom scrollbars, and neon glow effects.

### 2. Main Simulator Engine: [src/main.js](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-3D/src/main.js)
This file represents the core WebGL engine and is divided into logical code sections:

*   **STATE MANAGEMENT** (`state` object)
    *   Holds all simulator variables (placed component mesh references, coordinates, parameters, measurements, and active routing).
*   **3D SCENE SETUP** (`initScene()`)
    *   Spins up the Three.js `WebGLRenderer`, sets up perspective cameras, configures orbit controls, sets up shadows, and adjusts the fog parameters.
*   **BREADBOARD 3D** (`createBreadboard3D()`)
    *   Generates the breadboard chassis base procedurally using custom extrusion paths (`THREE.ExtrudeGeometry`). Renders contacts and draws labels onto a 2D canvas, mapping it as a `CanvasTexture` to reduce file sizes.
*   **SNAP POSITIONS** (`getSnapPos()`)
    *   Maps the breadboard holes to indices (`0` to `883`). Raycasts check mouse intersection vectors against target contact models and snap components to their coordinates:
        $$\text{pos}(x, z) = \left( (col - \frac{\text{cols} - 1}{2}) \times 0.1522, \; \text{offset}(row) \right)$$
*   **WIRE VISUALS** (`createWireVisuals()`, `updateWireVisuals()`)
    *   Draws jumper wire models dynamically along Bezier pathways. Manages a height offset stack counter for each pin connection to prevent wires from overlapping.
*   **COMPONENT VISUALS** (`createComponentVisuals()`)
    *   Handles loading GLTF models dynamically, drawing resistor band color layers, and controlling animations (e.g., switches, push buttons).
*   **GRAPH DRAW & OSCILLOSCOPE DRAW** (`drawGraph()`, `drawOscilloscope()`)
    *   Renders voltage-current curves and AC sine waves onto virtual screens using HTML5 2D canvas contexts.
*   **PDF LAB REPORT** (`generateLabReportPDF()`)
    *   Uses `jsPDF` to compile experiment configurations, observations, and telemetry logs into a PDF document for students to download.

---

## ⚡ WebGL Lifecycle & Memory Management

Repeatedly loading heavy WebGL renderers inside browser frames can trigger WebGL context losses. To prevent crashes, `main.js` disposes of meshes and releases contexts on unmount:
```javascript
window.addEventListener('unload', () => {
  if (renderer) {
    const gl = renderer.getContext();
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    renderer.dispose();
  }
});
```

---

## 🛠️ Local Execution & Commands
To run the simulator independently:
```bash
cd LABfront-IQ-3D
npm install
npm run dev
```
Access the application workspace at `http://localhost:5173`.
