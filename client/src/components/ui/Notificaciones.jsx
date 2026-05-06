import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import styles from './Notificaciones.module.css';

const LABELS = {
  evento_vinculado:     'Te vincularon a un evento',
  confirmacion_recibida: 'Confirmación respondida',
  evento_aprobado:      'Evento aprobado',
  nuevo_evento_seguido:  'Nuevo evento de alguien que seguís',
  invitacion_recibida:  'Recibiste una invitación',
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

export default function Notificaciones() {
  const token = useSelector(s => s.auth.token);
  const [notifs, setNotifs] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/notificaciones', {}, token).then(setNotifs).catch(() => {});
    const intervalo = setInterval(() => {
      apiFetch('/api/notificaciones', {}, token).then(setNotifs).catch(() => {});
    }, 60000);
    return () => clearInterval(intervalo);
  }, [token]);

  useEffect(() => {
    function clickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  const noLeidas = notifs.filter(n => !n.leida).length;

  async function handleAbrir() {
    setAbierto(v => !v);
  }

  async function marcarLeida(id) {
    await apiFetch(`/api/notificaciones/${id}/leer`, { method: 'PATCH' }, token);
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, leida: true } : n));
  }

  async function marcarTodas() {
    await apiFetch('/api/notificaciones/leer-todas', { method: 'PATCH' }, token);
    setNotifs(ns => ns.map(n => ({ ...n, leida: true })));
  }

  if (!token) return null;

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.campana} onClick={handleAbrir} title="Notificaciones">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {noLeidas > 0 && <span className={styles.badge}>{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {abierto && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitulo}>Notificaciones</span>
            {noLeidas > 0 && (
              <button className={styles.btnMarcar} onClick={marcarTodas}>marcar todas</button>
            )}
          </div>

          {notifs.length === 0 && (
            <p className={styles.vacio}>Sin notificaciones.</p>
          )}

          {notifs.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.leida ? styles.itemNoLeida : ''}`}
              onClick={() => !n.leida && marcarLeida(n.id)}
            >
              {!n.leida && <span className={styles.punto} />}
              <div className={styles.itemTexto}>
                <span className={styles.itemLabel}>{LABELS[n.tipo] || n.tipo}</span>
                <span className={styles.itemTime}>{timeAgo(n.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
