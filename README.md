# VYUHA v1.0

A tactical field operations dashboard built with React and Leaflet. Displays geo-tagged field markers (Hazard zones, Relief Camps, Health stations) on an inverted dark-themed map with a military terminal aesthetic.

![UI Theme](https://img.shields.io/badge/theme-military%20terminal-ffb000?style=flat-square&labelColor=000000)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&labelColor=000000)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&labelColor=000000)

## Features

- **Inverted dark map** — OpenStreetMap tiles filtered with CSS (`invert + hue-rotate + sepia`) for a tactical night-mode look
- **Live UTC clock** — updates every second in the header
- **Tracking telemetry panel** — sidebar lists all field targets; clicking selects and highlights them
- **Marker ↔ sidebar sync** — clicking a map marker updates the sidebar selection, and vice versa
- **Track Vector Inspector** — shows target ref, objective class, and interface status for the selected marker
- **Sector integrity alert** — persistent warning panel for pathfinder route conflicts
- **Styled popups** — each marker popup shows type, ID code, and lat/lng coordinates
- **Military terminal UI** — amber (`#ffb000`) and green (`#00ff00`) on black, monospace font throughout, powered by Tailwind CSS
- **Custom Leaflet theme** — zoom controls, popup wrappers, and container all restyled to match the dark terminal palette

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Map Library | Leaflet 1.9 + React-Leaflet 5 |
| Styling | Tailwind CSS + custom Leaflet CSS overrides |
| Icons | lucide-react (`Radio`, `Terminal`, `AlertTriangle`, `Layers`, `Crosshair`, `MapPin`) |
| Bundler | Vite 8 |
| Linting | ESLint 10 |

## Getting Started

### Prerequisites

- Node.js `>=20.19.0` or `>=22.12.0`

### Installation

```bash
git clone https://github.com/Akshayx07/vyuha.git
cd vyuha/frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
vyuha/
└── frontend/
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src/
    │   ├── assets/
    │   │   └── marker-icon.png     # Custom marker image (falls back to unpkg CDN)
    │   ├── App.jsx                 # Main dashboard — map, sidebar, header, footer
    │   ├── index.css               # Tailwind import + Leaflet dark theme overrides
    │   └── main.jsx                # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Field Data

Markers are defined in the `data` array inside `App.jsx`:

```js
const data = [
  { id: "TRK-01", latlng: [34.0915, 74.8062], type: "Hazard" },
  { id: "TRK-02", latlng: [34.0752, 74.7855], type: "Camp"   },
  { id: "TRK-03", latlng: [34.0721, 74.8114], type: "Health" },
];
```

Each type renders a different status badge in the sidebar:

| Type | Badge |
|---|---|
| Hazard | `CRITICAL ALERT` (red) |
| Camp | `SECURE BASE` (green) |
| Health | `MEDIC STATION` (cyan) |

The map is centered at `[34.083656, 74.797371]` (Srinagar, Kashmir) at zoom level `13`.

## License

MIT
