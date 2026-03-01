# TrustBox — AI Transparency Infrastructure

## Project Structure

```
trustbox/
├── index.html                   # HTML shell (Tailwind CDN)
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # React entry point
    ├── App.jsx                  # Root router (landing ↔ dashboard)
    │
    ├── styles/
    │   ├── global.css           # Reset · CSS vars · keyframes · .grid-bg
    │   └── components.css       # .nav-link · .btn-p · .btn-g · .tb-input · .tb-label
    │
    ├── constants/
    │   └── index.js             # All data: entity types, action meta, mock data, snippets
    │
    ├── components/
    │   ├── LogoMark.jsx         # SVG logo mark
    │   ├── Nav.jsx              # Fixed top navigation bar
    │   ├── Ticker.jsx           # Live event ticker strip
    │   ├── TrustBoxCanvas.jsx   # 3D wireframe box (canvas) + floating code lines + score
    │   ├── AddEntityModal.jsx   # 2-step modal: pick type → fill form
    │   └── ResultsDrawer.jsx    # Slide-in drawer: processing log → findings + score
    │
    └── pages/
        ├── Landing.jsx          # Marketing page (hero, how it works, entity types, CTA)
        └── Dashboard.jsx        # Dashboard (entity list + 3D box stage)
```

## Data Flow

```
App (route state)
├── Nav              ← route, setRoute
├── Landing          ← setRoute
│   └── Ticker
└── Dashboard        ← setRoute
    ├── TrustBoxCanvas  ← boxState, processingAction, score, entityAccentVar
    ├── AddEntityModal  ← onClose, onCommit
    └── ResultsDrawer   ← action, entityLabel, onClose, onScored
```

## Box State Machine

```
idle → opening → open → closing → spinning → processing → scored
                                                  ↑_____________________|
                                         (new action resets score & restarts)
```

## Quick Start

```bash
npm install
npm run dev
```

Requires Node 18+. Uses Vite + React 18. Tailwind loaded via CDN in `index.html`.
