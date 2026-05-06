import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import Tag from '../components/ui/Tag';
import { apiFetch } from '../services/api';
import styles from './Admin.module.css';

function formatFecha(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Admin() {
  const token = useSelector(s => s.auth.token);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState({});
  const [procesando, setProcesando] = useState({});

  useEffect(() => {
    apiFetch('/api/moderacion/pendientes', {}, token)
      .then(setEventos)
      .finally(() => setLoading(false));
  }, [token]);

  async function aprobar(id) {
    setProcesando(p => ({ ...p, [id]: true }));
    try {
      await apiFetch(`/api/moderacion/${id}/aprobar`, { method: 'PATCH' }, token);
      setEventos(ev => ev.filter(e => e.id !== id));
    } finally {
      setProcesando(p => ({ ...p, [id]: false }));
    }
  }

  async function rechazar(id) {
    setProcesando(p => ({ ...p, [id]: true }));
    try {
      await apiFetch(`/api/moderacion/${id}/rechazar`, {
        method: 'PATCH',
        body: JSON.stringify({ nota: notas[id] || '' }),
      }, token);
      setEventos(ev => ev.filter(e => e.id !== id));
    } finally {
      setProcesando(p => ({ ...p, [id]: false }));
    }
  }

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label={`Panel de moderación${eventos.length > 0 ? ` · ${eventos.length} pendientes` : ''}`} />

      <div className={styles.container}>
        {loading && <p className={styles.msg}>Cargando...</p>}

        {!loading && eventos.length === 0 && (
          <div className={styles.vacio}>
            <p>No hay eventos pendientes de moderación.</p>
            <Link to="/" className={styles.link}>Ir a la agenda</Link>
          </div>
        )}

        {eventos.map(e => (
          <div key={e.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <span className={styles.fecha}>{formatFecha(e.fecha)}{e.hora ? ` · ${e.hora.slice(0,5)}h` : ''}</span>
                <div className={styles.tags}>
                  {e.categorias?.map(c => <Tag key={c} label={c} />)}
                </div>
              </div>
              <span className={styles.iniciador}>{e.iniciador}</span>
            </div>

            <h2 className={styles.titulo}>{e.titulo}</h2>

            <div className={styles.meta}>
              {e.proyectos && <span className={styles.metaItem}>Proyecto: <strong>{e.proyectos.nombre}</strong></span>}
              {e.espacios && <span className={styles.metaItem}>Espacio: <strong>{e.espacios.nombre}</strong>{e.espacios.ciudad ? `, ${e.espacios.ciudad}` : ''}</span>}
              {e.espacio_texto && <span className={styles.metaItem}>Espacio (texto): <strong>{e.espacio_texto}</strong></span>}
              {e.proyecto_texto && <span className={styles.metaItem}>Proyecto (texto): <strong>{e.proyecto_texto}</strong></span>}
              <span className={styles.metaItem}>Entrada: <strong>{e.entrada === 'a_la_gorra' ? 'a la gorra' : e.entrada}{e.precio ? ` · $${e.precio}` : ''}</strong></span>
            </div>

            {e.descripcion && <p className={styles.descripcion}>{e.descripcion}</p>}

            <div className={styles.acciones}>
              <textarea
                className={styles.nota}
                placeholder="Nota opcional (solo para rechazar)..."
                value={notas[e.id] || ''}
                onChange={ev => setNotas(n => ({ ...n, [e.id]: ev.target.value }))}
                rows={2}
              />
              <div className={styles.botones}>
                <button
                  className={styles.btnAprobar}
                  onClick={() => aprobar(e.id)}
                  disabled={procesando[e.id]}
                >
                  {procesando[e.id] ? '...' : 'Aprobar'}
                </button>
                <button
                  className={styles.btnRechazar}
                  onClick={() => rechazar(e.id)}
                  disabled={procesando[e.id]}
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
