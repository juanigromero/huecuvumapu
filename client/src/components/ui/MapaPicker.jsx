import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapaPicker.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BAHIA_CENTER = [-38.7196, -62.2724];

function ClickHandler({ onPick }) {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapaPicker({ lat, lng, onChange }) {
  const [pin, setPin] = useState(lat && lng ? [lat, lng] : null);

  function handlePick(lat, lng) {
    setPin([lat, lng]);
    onChange(lat, lng);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.instruccion}>
        Hacé click en el mapa para marcar la ubicación exacta del lugar.
      </p>
      <MapContainer
        center={pin || BAHIA_CENTER}
        zoom={14}
        className={styles.mapa}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        {pin && <Marker position={pin} />}
      </MapContainer>
      {pin && (
        <p className={styles.coords}>
          ✓ Ubicación marcada — {pin[0].toFixed(5)}, {pin[1].toFixed(5)}
          <button type="button" className={styles.btnLimpiar} onClick={() => { setPin(null); onChange(null, null); }}>
            quitar
          </button>
        </p>
      )}
    </div>
  );
}
