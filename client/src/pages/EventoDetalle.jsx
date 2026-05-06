import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import Nav from '../components/ui/Nav';
import Tag from '../components/ui/Tag';
import { obtenerEvento } from '../services/eventosService';
import { misProyectos } from '../services/proyectosService';
import { misEspacios } from '../services/espaciosService';
import styles from './EventoDetalle.module.css';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function formatFecha(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function EntradaBadge({ entrada }) {
  if (entrada === 'gratuita') return <span className={styles.entradaGratis}>entrada libre</span>;
  if (entrada === 'a_la_gorra') return <span className={styles.entradaGorra}>a la gorra</span>;
  return <span className={styles.entradaPago}>con entrada</span>;
}

function ConfirmacionBadge({ confirmaciones = [], iniciador }) {
  const contraparte = iniciador === 'proyecto' ? 'espacio' : 'proyecto';
  const conf = confirmaciones.find(c => c.confirmador_tipo === contraparte);
  if (!conf) return null;
  const map = {
    confirmado: { texto: 'confirmado por el espacio', cls: styles.confConfirmado },
    pendiente:  { texto: 'pendiente de confirmación', cls: styles.confPendiente },
    rechazado:  { texto: 'no confirmado', cls: styles.confRechazado },
  };
  const { texto, cls } = map[conf.estado] || map.pendiente;
  return <span className={`${styles.confBadge} ${cls}`}>{texto}</span>;
}

export default function EventoDetalle() {
  const { id } = useParams();
  const token = useSelector(s => s.auth.token);
  const [evento, setEvento] = useState(null);
  const [puedeEditar, setPuedeEditar] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerEvento(id).then(async e => {
      setEvento(e);
      if (token) {
        const [proyectos, espacios] = await Promise.all([misProyectos(token), misEspacios(token)]);
        const misIds = {
          proyectos: proyectos.map(p => p.id),
          espacios: espacios.map(s => s.id),
        };
        const puede = (e.iniciador === 'proyecto' && misIds.proyectos.includes(e.proyecto_id)) ||
                      (e.iniciador === 'espacio' && misIds.espacios.includes(e.espacio_id));
        setPuedeEditar(puede);
      }
    }).catch(() => setError('Evento no encontrado'));
  }, [id, token]);

  if (error) return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.error}>{error}</div>
    </div>
  );

  if (!evento) return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.loading}>Cargando...</div>
    </div>
  );

  const espacio = evento.espacios;
  const proyecto = evento.proyectos;
  const lat = espacio?.lat || evento.lat;
  const lng = espacio?.lng || evento.lng;

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.layout}>
        {/* COLUMNA PRINCIPAL */}
        <main className={styles.main}>

          {/* HEADER */}
          <div className={styles.header}>
            <div className={styles.headerMeta}>
              <div className={styles.tags}>
                {evento.categorias?.map(c => <Tag key={c} label={c} />)}
                {evento.agotado && <span className={styles.agotado}>agotado</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ConfirmacionBadge confirmaciones={evento.confirmaciones} iniciador={evento.iniciador} />
                {puedeEditar && (
                  <Link to={`/eventos/${id}/editar`} className={styles.btnEditar}>Editar</Link>
                )}
              </div>
            </div>
            <h1 className={styles.titulo}>{evento.titulo}</h1>
          </div>

          {/* IMAGEN si tiene */}
          {evento.imagen_url && (
            <img src={evento.imagen_url} alt={evento.titulo} className={styles.imagen} />
          )}

          {/* DESCRIPCIÓN */}
          {evento.descripcion && (
            <div className={styles.descripcion}>
              <p>{evento.descripcion}</p>
            </div>
          )}

          {/* LINK EXTERNO */}
          {evento.link_externo && (
            <a href={evento.link_externo} target="_blank" rel="noopener noreferrer" className={styles.linkExterno}>
              Conseguir entradas →
            </a>
          )}

          {/* MAPA si tiene ubicación */}
          {lat && lng && (
            <div className={styles.mapaWrap}>
              <MapContainer center={[lat, lng]} zoom={15} className={styles.mapa} zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} />
              </MapContainer>
              {(espacio?.direccion || espacio?.nombre) && (
                <p className={styles.mapaDireccion}>
                  {espacio.nombre}{espacio.direccion ? ` — ${espacio.direccion}` : ''}
                </p>
              )}
            </div>
          )}
        </main>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>

          {/* FECHA Y HORA */}
          <div className={styles.sideBlock}>
            <span className={styles.sideLabel}>Cuándo</span>
            <span className={styles.sideFecha}>{formatFecha(evento.fecha)}</span>
            {evento.hora && <span className={styles.sideHora}>{evento.hora.slice(0, 5)}h</span>}
          </div>

          {/* LUGAR */}
          <div className={styles.sideBlock}>
            <span className={styles.sideLabel}>Dónde</span>
            {espacio ? (
              <Link to={`/e/${espacio.handle}`} className={styles.sideLugar}>
                {espacio.nombre}
                {espacio.ciudad && <span className={styles.sideCiudad}>{espacio.ciudad}</span>}
              </Link>
            ) : (
              <span className={styles.sideLugar}>
                {evento.espacio_texto || '—'}
              </span>
            )}
          </div>

          {/* ENTRADA */}
          <div className={styles.sideBlock}>
            <span className={styles.sideLabel}>Entrada</span>
            <EntradaBadge entrada={evento.entrada} />
          </div>

          {/* PROYECTO */}
          {(proyecto || evento.proyecto_texto) && (
            <div className={styles.sideBlock}>
              <span className={styles.sideLabel}>Organiza</span>
              {proyecto ? (
                <Link to={`/p/${proyecto.handle}`} className={styles.sideProyecto}>
                  {proyecto.nombre}
                </Link>
              ) : (
                <span className={styles.sideProyecto}>{evento.proyecto_texto}</span>
              )}
            </div>
          )}

          {/* ESTADO */}
          {evento.estado_publicacion !== 'publicado' && (
            <div className={styles.sideBlock}>
              <span className={styles.sideLabel}>Estado</span>
              <span className={styles.estadoBadge}>{evento.estado_publicacion.replace('_', ' ')}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
