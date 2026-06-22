# ⚛️ Circuit.IQ — React Portal & Dashboard Subsystem

The React Portal acts as the master administrative framework for Circuit.IQ. It is built using **React 19**, **TypeScript 5.8**, and **Vite 6**, and is styled with a custom dark-mode glassmorphic theme powered by **TailwindCSS 4**.

---

## 🛠️ System Technology Stack
*   **Core framework**: React 19 SPA (Single Page Application)
*   **Compilation**: TypeScript 5.8 + Vite 6 compiler
*   **State Management**: Zustand 5 store hooks
*   **Animations**: Framer Motion 12 + GSAP 3 (ScrollTrigger)
*   **Smooth Scrolling**: Lenis smooth-scroll core ticker
*   **Presence Tracking**: TensorFlow.js (COCO-SSD) webcam analysis CDN

---

## 📂 Source File Registry & Connectivity Map

Every source file inside the [src/](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src) folder has specific functional duties:

### 1. Main Core Application Hooks

*   **[main.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/main.tsx)**
    *   *Duty*: React application mount point. Binds the global rendering node to the `#root` DOM element.
*   **[App.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/App.tsx)**
    *   *Duty*: Primary SPA router and layout organizer. Uses React `Suspense` and dynamic chunk splitting (`React.lazy()`) to load heavy pages (like `LandingPage.tsx`) only when requested, keeping initial load sizes low.
*   **[index.css](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/index.css)**
    *   *Duty*: Imports TailwindCSS and defines CSS variables for dark/light themes (glassmorphic styling, neon borders, and animations).
*   **[store/useAppStore.ts](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/store/useAppStore.ts)**
    *   *Duty*: Zustand state storage syncing active settings across the app:
        *   `currentExperiment`: Tracks active lab configuration keys (`ohms`, `lcr`, `rc`, etc.).
        *   `isLabOpen`: Toggles the fullscreen iframe overlay visibility.
        *   `activeTab`: Sets target dashboard panels (`home`, `experiments`, `contact`, `attendance`).
        *   `theme`: Holds color scheme configurations (`dark` or `light`).

### 2. Portal Pages (`src/pages/`)

*   **[LandingPage.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/pages/LandingPage.tsx)**
    *   *Duty*: Homepage interface featuring hero headers, a search bar, categories, and experiment launch cards. Implements **GSAP ScrollTrigger** scroll sequences.
*   **[LabStudio.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/pages/LabStudio.tsx)**
    *   *Duty*: Hosts the sandboxed WebGL 3D simulator iframe. Manages the `postMessage` protocol:
        *   Sends layout parameters and theme configs.
        *   Reclaims WebGL memory and calls context disposal functions on exit to prevent browser memory leaks.
*   **[ContactPage.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/pages/ContactPage.tsx)**
    *   *Duty*: Handles support tickets and contact inputs. Uses **Framer Motion** for animations and connects to the `/api/contact` email dispatch route.

### 3. Layout & Interface Components (`src/components/`)

*   **[Navbar.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/Navbar.tsx)**
    *   *Duty*: Render top glassmorphic navigation bar, links tabs, and houses the system theme toggle.
*   **[AntigravityHero.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/AntigravityHero.tsx)**
    *   *Duty*: Renders a floating 3D physics laboratory scene using **React Three Fiber (R3F)** and **Drei**. It displays interactive floating resistors, capacitors, and breadboards responding to scroll offsets.
*   **[AttendanceSystem.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/AttendanceSystem.tsx)**
    *   *Duty*: Powers the webcam attendance presence verification loop. Runs a CDN-loaded **TensorFlow.js COCO-SSD** model to detect face presence:
        *   Runs checks every 1.5 seconds.
        *   If the face count drops below the group session threshold, it pauses the active simulation iframe, overlays a lock cover, and posts updates to `/api/session/<id>/presence`.
*   **[PhysicsBotPanel.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/PhysicsBotPanel.tsx)**
    *   *Duty*: Conversational glassmorphic chat overlay that bridges user questions directly to the backend AI mentor routes.
*   **[InteractiveBreadboard.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/InteractiveBreadboard.tsx)**
    *   *Duty*: High-performance 2D sandbox breadboard that models grid connectivity and calculates current flows locally using electrical graph traversal algorithms.
*   **[PhysicsShowcase.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/PhysicsShowcase.tsx)**
    *   *Duty*: Interactive 3D component carousel displaying preview cards for the 26 experiments.
*   **[CyberpunkLedMatrix.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/CyberpunkLedMatrix.tsx)**
    *   *Duty*: Renders an animated neon LED grid header that coordinates color shifts based on selected experiment items.
*   **[InteractiveCircuitLines.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/InteractiveCircuitLines.tsx)**
    *   *Duty*: Renders animated circuit line vector arrays in the landing page background.
*   **[TeamRolesSection.tsx](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABfront-IQ-Portal/src/components/TeamRolesSection.tsx)**
    *   *Duty*: Renders team bio profiles and showcases project contributions.

---

## ⚡ Performance & Loading Optimization Protocols

The React Portal implements several techniques to maximize speed and maintain a smooth user experience:

### 1. Dynamic Imports
```typescript
import { lazy, Suspense } from 'react';
const LandingPage = lazy(() => import('./pages/LandingPage'));
// Splits heavy libraries like Three.js into separate chunks loaded on demand
```

### 2. Shader Optimization
Replaces heavy `mipmapBlur` Bloom post-processing shaders with a standardized, lightweight bloom pass, reducing startup times by **3-4x** and preventing frame drops on low-end hardware.

### 3. Level of Detail (LOD) & Trigonometric Precalculation
*   Cuts 3D cylinder and sphere subdivisions for floating background elements in half (down to 6).
*   Precalculates orbital coordinates inside `useMemo` hooks, avoiding heavy mathematical operations (`Math.sqrt`, `Math.atan2`) inside the `useFrame` loop.

---

## 🛠️ Local Execution & Commands
To run the portal independently (Vite hot-reloading dev server):
```bash
cd LABfront-IQ-Portal
npm install
npm run dev
```
Access the application at `http://localhost:3000`.
