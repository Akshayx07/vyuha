# vyuha

An interactive disaster response map built with React and Leaflet, designed to visualize real-time field data — including hazard zones, relief camps, and health posts — on an OpenStreetMap base layer.

## Features

- Interactive map centered on a configurable geographic area
- Custom markers for different site types (Hazard, Camp, Health)
- Popup info on marker click
- Marker clustering support via `react-leaflet-cluster`
- Lightweight and fast, powered by Vite

## Tech Stack

| Layer             | Technology                    |
| ----------------- | ----------------------------- |
| UI Framework      | React 19                      |
| Map Library       | Leaflet 1.9 + React-Leaflet 5 |
| Marker Clustering | react-leaflet-cluster         |
| Bundler           | Vite 8                        |
| Linting           | ESLint 10                     |

## Getting Started

### Prerequisites

- Node.js `>=20.19.0` or `>=22.12.0`
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Akshayx07/vyuha.git
cd vyuha/frontend

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
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
    │   │   └── marker-icon.png
    │   ├── App.jsx        # Main map component
    │   ├── index.css      # Global styles
    │   └── main.jsx       # App entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Adding Markers

Markers are defined in `src/App.jsx`. Each marker has a geocode (lat/lng), and a popup label:

```js
const markers = [
  { geocode: [34.0915, 74.8062], popup: "Hazard" },
  { geocode: [34.0752, 74.7855], popup: "Camp" },
  { geocode: [34.0721, 74.8114], popup: "Health" },
];
```

To add a new marker, append an object to this array with the appropriate coordinates and label.

## License

MIT
