import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import { misProyectos } from '../services/proyectosService';
import { misEspacios } from '../services/espaciosService';
import { misEventos } from '../services/eventosService';
import { apiFetch } from '../services/api';
import styles from './Dashboard.module.css';

function estadoBadge(estado) {
  const map = {
    publicado: styles.badgePublicado,
    pendiente_moderacion: styles.badgePendiente,
    cancelado: styles.badgeCancelado,
    postergado: styles.badgePostergado,
  };
  const labels = {
    publicado: 'publicado',
    pendiente_moderacion: 'pendiente',
    cancelado: 'cancelado',
    postergado: 'postergado',
  };
  return <span className={`${styles.badge} ${map[estado] || ''}`}>{labels[estado] || estado}</span>;
}

function formatFecha(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const token = useSelector(s => s.auth.token);
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [confirmaciones, setConfirmaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      misProyectos(token),
      misEspacios(token),
      misEventos(token),
      apiFetch('/api/confirmaciones/pendientes', {}, token),
    ])
      .then(([p, e, ev, c]) => {
        setProyectos(p);
        setEspacios(e);
        setEventos(ev);
        setConfirmaciones(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  async function responderConfirmacion(id, estado) {
    await apiFetch(`/api/confirmaciones/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) }, token);
    setConfirmaciones(cs => cs.filter(c => c.id !== id));
  }

  function handleLogout() {
    dispatch(logout());
    navigate('/');
  }

  if (loading) return <div className={styles.loading}>Cargando...</div>;

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Dashboard</h1>
          <p className={styles.subtitulo}>{user?.nombre || user?.email}</p>
        </div>
        <Link to="/nuevo-evento" className={styles.btnNuevo}>+ Nuevo evento</Link>
      </div>

      <div className={styles.body}>
        <div className={styles.main}>

          {/* CONFIRMACIONES PENDIENTES */}
          {confirmaciones.length > 0 && (
            <section className={styles.section}>
              <SectionBar label={`Confirmaciones pendientes (${confirmaciones.length})`} />
              <div className={styles.confirmaciones}>
                {confirmaciones.map(c => (
                  <div key={c.id} className={styles.confirmacion}>
                    <div className={styles.confInfo}>
                      <span className={styles.confTitulo}>{c.eventos?.titulo}</span>
                      <span className={styles.confFecha}>{c.eventos?.fecha ? formatFecha(c.eventos.fecha) : ''}</span>
                      <span className={styles.confDe}>
                        organizado por {c.eventos?.proyectos?.nombre || c.eventos?.espacios?.nombre || '—'}
                      </span>
                    </div>
                    <div className={styles.confAcciones}>
                      <button className={styles.btnConfirmar} onClick={() => responderConfirmacion(c.id, 'confirmado')}>Confirmar</button>
                      <button className={styles.btnRechazar} onClick={() => responderConfirmacion(c.id, 'rechazado')}>Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EVENTOS */}
          <section className={styles.section}>
            <SectionBar label="Mis eventos" action={<Link to="/nuevo-evento" className={styles.sectionAction}>+ nuevo</Link>} />
            {eventos.length === 0 ? (
              <div className={styles.vacio}>
                <p>No cargaste ningún evento todavía.</p>
                {(proyectos.length > 0 || espacios.length > 0) && (
                  <Link to="/nuevo-evento" className={styles.btnVacio}>Cargar primer evento</Link>
                )}
              </div>
            ) : (
              <div className={styles.eventosList}>
                {eventos.map(e => (
                  <Link key={e.id} to={`/eventos/${e.id}`} className={styles.eventoRow}>
                    <div className={styles.eventoInfo}>
                      <span className={styles.eventoFecha}>{formatFecha(e.fecha)}</span>
                      <span className={styles.eventoTitulo}>{e.titulo}</span>
                    </div>
                    {estadoBadge(e.estado_publicacion)}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <div className={styles.sidebar}>

          {/* PROYECTOS */}
          <section className={styles.section}>
            <SectionBar label="Proyectos" action={<Link to="/crear-proyecto" className={styles.sectionAction}>+ nuevo</Link>} />
            {proyectos.length === 0 ? (
              <div className={styles.vacio}>
                <p>No tenés proyectos.</p>
                <Link to="/crear-proyecto" className={styles.btnVacio}>Crear proyecto</Link>
              </div>
            ) : (
              <div className={styles.entidades}>
                {proyectos.map(p => (
                  <Link key={p.id} to={`/p/${p.handle}`} className={styles.entidad}>
                    <div className={styles.entidadAvatar}>{p.nombre[0]}</div>
                    <div>
                      <span className={styles.entidadNombre}>{p.nombre}</span>
                      <span className={styles.entidadRol}>{p.rol_interno}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ESPACIOS */}
          <section className={styles.section}>
            <SectionBar label="Espacios" action={<Link to="/crear-espacio" className={styles.sectionAction}>+ nuevo</Link>} />
            {espacios.length === 0 ? (
              <div className={styles.vacio}>
                <p>No tenés espacios.</p>
                <Link to="/crear-espacio" className={styles.btnVacio}>Registrar espacio</Link>
              </div>
            ) : (
              <div className={styles.entidades}>
                {espacios.map(e => (
                  <Link key={e.id} to={`/e/${e.handle}`} className={styles.entidad}>
                    <div className={styles.entidadAvatar}>{e.nombre[0]}</div>
                    <div>
                      <span className={styles.entidadNombre}>{e.nombre}</span>
                      <span className={styles.entidadRol}>{e.rol_interno}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
