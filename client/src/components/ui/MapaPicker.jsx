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

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await res.json();
    const a = data.address;
    const partes = [a.road, a.house_number].filter(Boolean).join(' ');
    return partes || data.display_name.split(',')[0];
  } catch {
    return null;
  }
}

function ClickHandler({ onPick }) {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapaPicker({ lat, lng, onChange }) {
  const [pin, setPin] = useState(lat && lng ? [lat, lng] : null);
  const [direccion, setDireccion] = useState(null);
  const [buscando, setBuscando] = useState(false);

  async function handlePick(lat, lng) {
    setPin([lat, lng]);
    setDireccion(null);
    setBuscando(true);
    const dir = await reverseGeocode(lat, lng);
    setDireccion(dir);
    setBuscando(false);
    onChange(lat, lng, dir);
  }

  function handleLimpiar() {
    setPin(null);
    setDireccion(null);
    onChange(null, null, null);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.instruccion}>
        Hacé click en el mapa para marcar la ubicación exacta del lugar.
      </p>
      <MapContainer center={pin || BAHIA_CENTER} zoom={14} className={styles.mapa}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        {pin && <Marker position={pin} />}
      </MapContainer>

      {buscando && <p className={styles.buscando}>Buscando dirección...</p>}

      {pin && !buscando && (
        <div className={styles.resultado}>
          <div className={styles.resultadoInfo}>
            <span className={styles.resultadoDireccion}>
              {direccion || `${pin[0].toFixed(5)}, ${pin[1].toFixed(5)}`}
            </span>
            {direccion && (
              <span className={styles.resultadoCoords}>{pin[0].toFixed(5)}, {pin[1].toFixed(5)}</span>
            )}
          </div>
          <button type="button" className={styles.btnLimpiar} onClick={handleLimpiar}>
            quitar
          </button>
        </div>
      )}
    </div>
  );
}
