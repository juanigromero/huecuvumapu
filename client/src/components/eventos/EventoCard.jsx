import { Link } from 'react-router-dom';
import Tag from '../ui/Tag';
import { generarSVG } from '../../utils/svgAbstracto';
import styles from './EventoCard.module.css';

function formatFecha(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function EventoCard({ evento, index }) {
  const espacio = evento.espacios;
  const proyecto = evento.proyectos;
  const categorias = evento.categorias || [];
  const bgUrl = evento.imagen_url || generarSVG(evento.id);

  return (
    <Link to={`/eventos/${evento.id}`} className={styles.card}>
      <div
        className={evento.imagen_url ? styles.bgImagen : styles.bgAbstracto}
        style={{ backgroundImage: `url("${bgUrl}")` }}
      />

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
