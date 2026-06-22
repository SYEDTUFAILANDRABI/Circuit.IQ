# 🌐 Circuit.IQ — System Architecture & Iframe Communication

This document details the central communication architectures, integration protocols, and configuration options that connect the React portal frontend, 3D WebGL simulator, and Python Flask API backend.

---

## 🎨 System Architectural Overview

Circuit.IQ leverages a decoupled layout structure designed to guarantee high graphics performance while maintaining secure user state backups:

```
                  ┌──────────────────────────────────────────────┐
                  │                 USER BROWSER                 │
                  ├──────────────────────┬───────────────────────┤
                  │ React Portal (React) │ 3D Simulator (WebGL)  │
                  │ [Port 3000 / 3001]   │ [Embedded Iframe]     │
                  └──────────┬───────────┴───────────▲───────────┘
                             │                       │
                       REST /api Requests            │ postMessage Handshake
                             │                       │
                  ┌──────────▼───────────────────────▼───────────┐
                  │              FLASK BACKEND SERVER            │
                  │                  [Port 5000]                 │
                  ├──────────────────────────────────────────────┤
                  │     Physics Engine & Adjacency Solvers       │
                  └──────────┬───────────────────────┬───────────┘
                             │                       │
                             ▼                       ▼
                     [Local SQLite]         [Supabase Cloud DB]
                    (circuit_iq.db)         (Postgres + RLS)
```

---

## 🔗 The same-origin postMessage Handshake

Because the 3D Virtual Physics Lab runs within a sandboxed `iframe` to prevent memory leaks and graphics stalls in the main React render tree, direct JavaScript references across contexts are restricted. Instead, the application coordinates states via a secure event-driven `postMessage` protocol:

### 1. Close Simulator Trigger
When a student finishes an experiment and clicks the close toolbar button inside the 3D lab simulator, the iframe dispatches an exit instruction to the parent wrapper:
```javascript
window.parent.postMessage('close-lab', '*');
```
The React portal listens to this trigger in [LabStudio.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/pages/LabStudio.tsx):
```typescript
window.addEventListener('message', (event) => {
  if (event.data === 'close-lab') {
    setLabOpen(false); // Closes modal state in Zustand
  }
});
```

### 2. Live Theme Synchronization
Toggling the dark/light mode toggle in the React portal header propagates the layout state into the iframe:
```typescript
iframeRef.current.contentWindow.postMessage({ type: 'theme-change', theme }, '*');
```
The 3D simulator's listener inside [main.js](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-3D/src/main.js) updates WebGL fog parameters, scene backgrounds, and inverts telemetry overlay colors:
```javascript
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'theme-change') {
    state.theme = e.data.theme;
    updateSceneTheme(e.data.theme);
  }
});
```

### 3. Load Progress Telemetry
The Three.js `LoadingManager` tracks file loads (meshes, textures) and communicates ratios to the parent window:
```javascript
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const pct = Math.round((itemsLoaded / itemsTotal) * 100);
  window.parent.postMessage({ type: 'lab-loading', progress: pct }, '*');
};
```
React intercepts this to update the glassmorphic loading screen percentage dynamically.

### 4. Classroom Attendance Presence Lock
If the client-side webcam face tracker determines that a student has walked away, the React portal sends a pause signal:
```typescript
iframeRef.current.contentWindow.postMessage({ type: 'session-presence', status: 'paused' }, '*');
```
This halts the requestAnimationFrame loop, shows a dark lock screen, and stops telemetry polling.

---

## 🔌 API Core Integration & CORS Management

The communication between the client browser components and the Flask server uses two strategies depending on the deployment stage:

### 1. Local Development Reverse-Proxy
During active coding, the React developer server runs on port `3000` (or `3001`). Because web browsers enforce the Same-Origin Policy, direct API requests to port `5000` would fail.
*   **Vite configuration**: [vite.config.ts](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/vite.config.ts) defines a proxy rule forwarding all requests starting with `/api` to the Flask backend:
    ```typescript
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
    ```
*   **CORS policy**: Flask has Cross-Origin Resource Sharing (CORS) enabled using `Flask-CORS` so that if developers test endpoints across different local addresses, requests are not rejected.

### 2. Compiled Single-Server Production
Running `python build_all.py` compiles the application into a single deployable service:
1.  **3D Build**: Compiles the 3D lab code via Vite and copies the static assets to the React public directory.
2.  **React Compilation**: Runs `npm run build` inside the portal folder, bundling React into static HTML/CSS/JS files under `LABfront-IQ-Portal/dist`.
3.  **Flask Placement**: Copies the compiled React files to the Flask server's `dist/` directory.
4.  **Static Serving**: Flask uses an app factory ([app.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/app.py)) that catches all non-API paths and serves the static production files.

---

## 💾 Database State Synchronization

To handle user circuit layouts, database persistence uses a dual synchronization loop:

```
[Component Placed / Wire Snapped] ──► [debouncedSaveCircuit() 1000ms]
                                                │
                                                ▼
                                    [POST /api/db/save-circuit]
                                                │
                                                ▼
                                    [Flask database.py Adapter]
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
             [SQLite Local Storage]                            [Supabase Cloud DB]
            Writes to circuit_iq.db                           Writes to PostgreSQL
```

### Layout Restoration Logic
On opening an experiment (e.g. `/lab.html?exp=ohms`), the simulator queries `GET /api/db/load-circuit`.
*   If a saved state exists, a confirmation modal `#modal-load-confirm` displays.
*   **Applying Progress**: Rebuilds the WebGL components and wires.
*   **Snapping Bypass**: Restoring wires from the database uses the bypass flag `create3DWire(w.fromHole, w.toHole, false)`. This keeps wires in their saved positions instead of auto-snapping to nearby components.
