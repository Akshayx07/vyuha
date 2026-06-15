import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import {
  Radio,
  Terminal,
  AlertTriangle,
  Layers,
  Crosshair,
  MapPin,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import markerIconImg from "./assets/marker-icon.png";

const CENTER = [34.083656, 74.797371];

function MapTheme() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    el.style.filter =
      "invert(100%) hue-rotate(180deg) brightness(95%) contrast(120%) sepia(20%) saturate(140%)";
  }, [map]);
  return null;
}

export default function App() {
  const [time, setTime] = useState(new Date().toISOString());
  const [selected, setSelected] = useState({
    id: "SYS-OVERVIEW",
    label: "STANDBY CORE",
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, []);

  const data = [
    { id: "TRK-01", latlng: [34.0915, 74.8062], type: "Hazard" },
    { id: "TRK-02", latlng: [34.0752, 74.7855], type: "Camp" },
    { id: "TRK-03", latlng: [34.0721, 74.8114], type: "Health" },
  ];

  const icon = new Icon({
    iconUrl:
      markerIconImg ||
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
    shadowUrl: null,
  });

  return (
    <div className="h-screen w-screen bg-black text-[#ffb000] font-mono text-xs flex flex-col overflow-hidden p-2 antialiased select-none">
      <header className="border border-[#332200] bg-[#0d0a02] p-2 mb-2 flex justify-between items-center tracking-wider shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white font-black tracking-widest text-sm font-sans bg-[#332200] px-1.5 py-0.5 border border-[#ffb000]">
            VYUHA v1.0
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-[#00ff00] font-bold text-xs tracking-widest animate-pulse flex items-center gap-1">
            <Radio size={12} /> SYS_STATUS: ACTIVE
          </span>
          <span className="text-zinc-700">|</span>
          <span>GRID ZONE: 43R CJ</span>
        </div>
        <div className="text-[#00ff00]">
          {time.replace("T", " ").substring(0, 19)} UTC
        </div>
      </header>

      <div className="flex-1 flex gap-2 min-h-0 w-full">
        <section className="w-1/3 border border-[#332200] bg-[#050300] p-3 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="border-b border-[#332200] pb-1 text-[#00ff00] font-bold flex items-center gap-1">
              <Terminal size={14} /> TRACKING TELEMETRY
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-500 block text-[10px] tracking-widest">
                LIVE RADAR TARGET FEED
              </label>
              {data.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected({ id: item.id, label: item.type })}
                  className={`border p-2 bg-[#0c0802] flex justify-between items-center cursor-pointer transition-all ${
                    selected.id === item.id
                      ? "border-[#ffb000] bg-[#1a1100]"
                      : "border-[#221600] hover:border-zinc-700"
                  }`}
                >
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#ffb000]" /> {item.id} :{" "}
                    {item.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1 ${
                      item.type === "Hazard"
                        ? "text-red-500"
                        : item.type === "Camp"
                          ? "text-green-400"
                          : "text-cyan-400"
                    }`}
                  >
                    {item.type === "Hazard"
                      ? "CRITICAL ALERT"
                      : item.type === "Camp"
                        ? "SECURE BASE"
                        : "MEDIC STATION"}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2 bg-[#1a0000] border border-[#550000] text-red-500 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <div>
                <div className="font-bold">SECTOR INTEGRITY ALERT</div>
                <div className="text-[10px] text-red-400">
                  Pathfinder route checks intersecting tracking markers.
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#332200] pt-3">
            <div className="text-[#00ff00] font-bold mb-1.5 flex items-center gap-1">
              <Crosshair size={12} /> TRACK VECTOR INSPECTOR
            </div>
            <div className="bg-[#0f0a02] p-2 border border-[#443311] space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">TARGET REF:</span>{" "}
                <span className="text-white">{selected.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">OBJECTIVE CLASS:</span>{" "}
                <span className="text-[#ffb000] uppercase">
                  {selected.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">DATA INTERFACES:</span>{" "}
                <span className="text-cyan-400">NOMINAL ONLINE</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 border border-[#332200] relative flex flex-col min-h-0 bg-black">
          <div className="absolute top-2 left-2 z-[1000] bg-black/90 border border-[#332200] p-1.5 px-2 text-[10px] tracking-wider text-[#00ff00] flex items-center gap-1 pointer-events-none">
            <Layers size={10} /> LAYER // GEOSPATIAL_MAP
          </div>

          <div className="w-full h-full min-h-0 flex-1 z-0">
            <MapContainer
              center={CENTER}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapTheme />
              {data.map((item) => (
                <Marker
                  key={item.id}
                  position={item.latlng}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelected({ id: item.id, label: item.type }),
                  }}
                >
                  <Popup>
                    <div className="bg-black text-[#ffb000] font-mono text-xs p-1">
                      <h2 className="font-bold border-b border-zinc-800 pb-1 mb-1 text-white">
                        {item.type.toUpperCase()} POSITION
                      </h2>
                      <div>ID CODE: {item.id}</div>
                      <div>LAT COORD: {item.latlng[0]}</div>
                      <div>LNG COORD: {item.latlng[1]}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>
      </div>

      <footer className="border border-[#332200] bg-[#0d0a02] p-1 px-2 mt-2 flex items-center gap-2 text-[10px] text-zinc-500 shrink-0">
        <span className="text-[#ffb000] font-bold">OPERATIONAL FLOW:</span>
        <span className="text-[#00ff00] bg-[#001100] px-1 border border-[#004400]">
          [1. PARSED MAP TILES]
        </span>
        <span>&rarr;</span>
        <span className="text-[#00ff00] bg-[#001100] px-1 border border-[#004400]">
          [2. INJECTED VECTOR GEOMARKS]
        </span>
        <span>&rarr;</span>
        <span className="text-white border border-zinc-700 px-1 font-bold animate-pulse">
          [3. SYSTEM OPERATIONAL]
        </span>
      </footer>
    </div>
  );
}
