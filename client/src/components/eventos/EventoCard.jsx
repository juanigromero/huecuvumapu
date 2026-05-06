import { Link } from 'react-router-dom';
import Tag from '../ui/Tag';
import styles from './EventoCard.module.css';

function formatFecha(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Genera un gradiente abstracto único basado en el id del evento
const PALETAS = [
  ['#c8f0d8', '#d0e8f5'],
  ['#f5d0e8', '#f5e8d0'],
  ['#d0e8f5', '#c8f0d8'],
  ['#f5e8d0', '#f5d0e8'],
  ['#e8d0f5', '#d0e8f5'],
  ['#f5f0c8', '#c8f0d8'],
];

function gradienteAbstracto(id) {
  const idx = id.charCodeAt(0) % PALETAS.length;
  const [c1, c2] = PALETAS[idx];
  const angulo = (id.charCodeAt(1) % 4) * 45;
  return `linear-gradient(${angulo}deg, ${c1} 0%, ${c2} 100%)`;
}

export default function EventoCard({ evento, index }) {
  const espacio = evento.espacios;
  const proyecto = evento.proyectos;
  const categorias = evento.categorias || [];

  return (
    <Link to={`/eventos/${evento.id}`} className={styles.card}>
      {evento.imagen_url ? (
        <div className={styles.bgImagen} style={{ backgroundImage: `url(${evento.imagen_url})` }} />
      ) : (
        <div className={styles.bgAbstracto} style={{ background: gradienteAbstracto(evento.id) }} />
      )}

      <div className={styles.tags}>
        {categorias.map(c => <Tag key={c} label={c} />)}
        {evento.agotado && <span className={styles.agotado}>agotado</span>}
      </div>

      <h3 className={styles.titulo}>{evento.titulo}</h3>

      <div className={styles.fechaHora}>
        <span className={styles.fecha}>{formatFecha(evento.fecha)}</span>
        {evento.hora && <span className={styles.hora}>{evento.hora.slice(0, 5)}h</span>}
      </div>

      <div className={styles.meta}>
        {espacio && <span className={styles.lugar}>{espacio.nombre}{espacio.ciudad ? `, ${espacio.ciudad}` : ''}</span>}
        {!espacio && evento.espacio_texto && <span className={styles.lugar}>{evento.espacio_texto}</span>}
      </div>

      <div className={styles.footer}>
        {proyecto && <span className={styles.proyecto}>{proyecto.nombre}</span>}
        {!proyecto && evento.proyecto_texto && <span className={styles.proyecto}>{evento.proyecto_texto}</span>}
        <span className={styles.entrada}>{evento.entrada === 'gratuita' ? 'gratis' : evento.entrada === 'a_la_gorra' ? 'a la gorra' : 'con entrada'}</span>
      </div>
    </Link>
  );
}
