import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import markerIconImg from "./assets/marker-icon.png";
import "leaflet/dist/leaflet.css";

export default function App() {
  const markers = [
    {
      geocode: [34.0915, 74.8062],
      popup: "Hazard",
    },
    {
      geocode: [34.0752, 74.7855],
      popup: "Camp",
    },
    {
      geocode: [34.0721, 74.8114],
      popup: "Health",
    },
  ];

  const customIcon = new Icon({
    iconUrl: markerIconImg,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
    shadowUrl: null,
  });

  return (
    <MapContainer center={[34.083656, 74.797371]} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {...markers.map((marker) => (
        <Marker position={marker.geocode} icon={customIcon}>
          <Popup>
            <h2>{marker.popup}</h2>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
