import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import Tag from '../components/ui/Tag';
import { listarEventos } from '../services/eventosService';
import styles from './Mapa.module.css';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COLOR_CATEGORIA = {
  musica:  '#c8f0d8',
  visual:  '#f5d0e8',
  teatro:  '#d0e8f5',
  popular: '#f5e8d0',
};

function crearIcono(categoria) {
  const color = COLOR_CATEGORIA[categoria] || '#e8e0d0';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#111" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="#111"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const CATEGORIAS = ['musica', 'visual', 'teatro', 'popular'];
const BAHIA_CENTER = [-38.7196, -62.2724];

function formatFecha(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function Mapa() {
  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    listarEventos({ fecha_desde: hoy })
      .then(setEventos)
      .finally(() => setLoading(false));
  }, []);

  const conUbicacion = eventos.filter(e =>
    e.espacios?.lat && e.espacios?.lng &&
    (!filtro || e.categorias?.includes(filtro))
  );

  const sinUbicacion = eventos.filter(e =>
    (!e.espacios?.lat || !e.espacios?.lng) &&
    (!filtro || e.categorias?.includes(filtro))
  );

  const categoriaEvento = (e) => e.categorias?.[0] || 'musica';

  return (
    <div className={styles.page}>
      <Nav />

      {/* FILTROS */}
      <div className={styles.filtros}>
        <button
          className={`${styles.filtroBtn} ${!filtro ? styles.filtroBtnActivo : ''}`}
          onClick={() => setFiltro('')}
        >todos</button>
        {CATEGORIAS.map(c => (
          <button
            key={c}
            className={`${styles.filtroBtn} ${filtro === c ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltro(filtro === c ? '' : c)}
          >{c}</button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* MAPA */}
        <div className={styles.mapaWrap}>
          <MapContainer
            center={BAHIA_CENTER}
            zoom={14}
            className={styles.mapa}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {conUbicacion.map(e => (
              <Marker
                key={e.id}
                position={[e.espacios.lat, e.espacios.lng]}
                icon={crearIcono(categoriaEvento(e))}
                eventHandlers={{ click: () => setSeleccionado(e) }}
              >
                <Popup>
                  <div className={styles.popup}>
                    <span className={styles.popupFecha}>{formatFecha(e.fecha)}</span>
                    <strong className={styles.popupTitulo}>{e.titulo}</strong>
                    <span className={styles.popupLugar}>{e.espacios.nombre}</span>
                    <Link to={`/eventos/${e.id}`} className={styles.popupLink}>Ver evento →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* LISTA */}
        <div className={styles.lista}>
          <SectionBar label={`${conUbicacion.length + sinUbicacion.length} eventos`} />

          {loading && <p className={styles.msg}>Cargando...</p>}
          {!loading && eventos.length === 0 && <p className={styles.msg}>No hay eventos próximos.</p>}

          {conUbicacion.map(e => (
            <div
              key={e.id}
              className={`${styles.eventoItem} ${seleccionado?.id === e.id ? styles.eventoItemActivo : ''}`}
              onClick={() => setSeleccionado(e)}
            >
              <div className={styles.eventoItemTop}>
                <span className={styles.eventoFecha}>{formatFecha(e.fecha)}</span>
                <div className={styles.eventoTags}>
                  {e.categorias?.map(c => <Tag key={c} label={c} />)}
                </div>
              </div>
              <span className={styles.eventoTitulo}>{e.titulo}</span>
              <span className={styles.eventoLugar}>{e.espacios?.nombre}</span>
            </div>
          ))}

          {sinUbicacion.length > 0 && (
            <>
              <SectionBar label="Sin ubicación en mapa" />
              {sinUbicacion.map(e => (
                <div key={e.id} className={styles.eventoItem}>
                  <div className={styles.eventoItemTop}>
                    <span className={styles.eventoFecha}>{formatFecha(e.fecha)}</span>
                    <div className={styles.eventoTags}>
                      {e.categorias?.map(c => <Tag key={c} label={c} />)}
                    </div>
                  </div>
                  <span className={styles.eventoTitulo}>{e.titulo}</span>
                  {e.espacio_texto && <span className={styles.eventoLugar}>{e.espacio_texto}</span>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
