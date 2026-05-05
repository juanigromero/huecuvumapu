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

// Si un lugar tiene eventos de varias categorías, elige la más frecuente
function categoriasPrincipales(eventos) {
  const conteo = {};
  eventos.forEach(e => (e.categorias || []).forEach(c => { conteo[c] = (conteo[c] || 0) + 1; }));
  return Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a]);
}

function crearIcono(categorias, count) {
  const cat = categorias[0] || 'musica';
  const color = COLOR_CATEGORIA[cat] || '#e8e0d0';
  const multi = count > 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${multi ? 36 : 28}" height="${multi ? 44 : 36}" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#111" stroke-width="2"/>
    ${multi
      ? `<text x="14" y="17" text-anchor="middle" font-size="11" font-weight="700" font-family="Space Grotesk,sans-serif" fill="#111">${count}</text>`
      : `<circle cx="14" cy="14" r="5" fill="#111"/>`
    }
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [multi ? 36 : 28, multi ? 44 : 36],
    iconAnchor: [multi ? 18 : 14, multi ? 44 : 36],
    popupAnchor: [0, multi ? -44 : -36],
  });
}

// Agrupa eventos por espacio (lat/lng)
function agruparPorUbicacion(eventos) {
  const grupos = {};
  eventos.forEach(e => {
    if (!e.espacios?.lat || !e.espacios?.lng) return;
    const key = `${e.espacios.lat},${e.espacios.lng}`;
    if (!grupos[key]) {
      grupos[key] = {
        key,
        lat: e.espacios.lat,
        lng: e.espacios.lng,
        espacio: e.espacios,
        eventos: [],
      };
    }
    grupos[key].eventos.push(e);
  });
  return Object.values(grupos);
}

const CATEGORIAS = ['musica', 'visual', 'teatro', 'popular'];
const BAHIA_CENTER = [-38.7196, -62.2724];

function formatFecha(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function Mapa() {
  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [seleccionadoKey, setSeleccionadoKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    listarEventos({ fecha_desde: hoy })
      .then(setEventos)
      .finally(() => setLoading(false));
  }, []);

  const eventosFiltrados = eventos.filter(e =>
    !filtro || e.categorias?.includes(filtro)
  );

  const grupos = agruparPorUbicacion(eventosFiltrados);

  const sinUbicacion = eventosFiltrados.filter(e =>
    !e.espacios?.lat || !e.espacios?.lng
  );

  const totalConUbicacion = grupos.reduce((acc, g) => acc + g.eventos.length, 0);

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.filtros}>
        <button className={`${styles.filtroBtn} ${!filtro ? styles.filtroBtnActivo : ''}`} onClick={() => setFiltro('')}>todos</button>
        {CATEGORIAS.map(c => (
          <button key={c}
            className={`${styles.filtroBtn} ${filtro === c ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltro(filtro === c ? '' : c)}
          >{c}</button>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.mapaWrap}>
          <MapContainer center={BAHIA_CENTER} zoom={14} className={styles.mapa}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {grupos.map(grupo => {
              const cats = categoriasPrincipales(grupo.eventos);
              const activo = seleccionadoKey === grupo.key;
              return (
                <Marker
                  key={grupo.key}
                  position={[grupo.lat, grupo.lng]}
                  icon={crearIcono(cats, grupo.eventos.length)}
                  eventHandlers={{ click: () => setSeleccionadoKey(activo ? null : grupo.key) }}
                >
                  <Popup>
                    <div className={styles.popup}>
                      <span className={styles.popupLugar}>{grupo.espacio.nombre}</span>
                      {grupo.espacio.direccion && (
                        <span className={styles.popupDireccion}>{grupo.espacio.direccion}</span>
                      )}
                      <div className={styles.popupEventos}>
                        {grupo.eventos.map(e => (
                          <Link key={e.id} to={`/eventos/${e.id}`} className={styles.popupEvento}>
                            <span className={styles.popupEventoFecha}>{formatFecha(e.fecha)}</span>
                            <span className={styles.popupEventoTitulo}>{e.titulo}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className={styles.lista}>
          <SectionBar label={`${totalConUbicacion + sinUbicacion.length} eventos · ${grupos.length} lugares`} />

          {loading && <p className={styles.msg}>Cargando...</p>}
          {!loading && eventos.length === 0 && <p className={styles.msg}>No hay eventos próximos.</p>}

          {/* Agrupados por lugar */}
          {grupos.map(grupo => (
            <div
              key={grupo.key}
              className={`${styles.grupoItem} ${seleccionadoKey === grupo.key ? styles.grupoItemActivo : ''}`}
              onClick={() => setSeleccionadoKey(seleccionadoKey === grupo.key ? null : grupo.key)}
            >
              <div className={styles.grupoHeader}>
                <span className={styles.grupoNombre}>{grupo.espacio.nombre}</span>
                {grupo.eventos.length > 1 && (
                  <span className={styles.grupoCant}>{grupo.eventos.length} eventos</span>
                )}
              </div>
              <div className={styles.grupoEventos}>
                {grupo.eventos.map(e => (
                  <div key={e.id} className={styles.eventoItem}>
                    <div className={styles.eventoItemTop}>
                      <span className={styles.eventoFecha}>{formatFecha(e.fecha)}</span>
                      <div className={styles.eventoTags}>
                        {e.categorias?.map(c => <Tag key={c} label={c} />)}
                      </div>
                    </div>
                    <span className={styles.eventoTitulo}>{e.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sinUbicacion.length > 0 && (
            <>
              <SectionBar label="Sin ubicación en mapa" />
              {sinUbicacion.map(e => (
                <div key={e.id} className={styles.eventoItem} style={{ padding: '0.85rem 1.25rem' }}>
                  <div className={styles.eventoItemTop}>
                    <span className={styles.eventoFecha}>{formatFecha(e.fecha)}</span>
                    <div className={styles.eventoTags}>{e.categorias?.map(c => <Tag key={c} label={c} />)}</div>
                  </div>
                  <span className={styles.eventoTitulo}>{e.titulo}</span>
                  {(e.espacio_texto || e.espacios?.nombre) && (
                    <span className={styles.eventoLugar}>{e.espacio_texto || e.espacios?.nombre}</span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
