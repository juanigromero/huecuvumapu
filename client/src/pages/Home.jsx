import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import MarqueeBar from '../components/ui/MarqueeBar';
import SectionBar from '../components/ui/SectionBar';
import EventoCard from '../components/eventos/EventoCard';
import Tag from '../components/ui/Tag';
import { listarEventos } from '../services/eventosService';
import styles from './Home.module.css';

function formatFechaHero(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const CATEGORIAS = [
  { key: 'musica', label: 'Música', desc: 'Bandas, solistas, electrónica, folklore y más.' },
  { key: 'visual', label: 'Artes visuales', desc: 'Exposiciones, intervenciones, fotografía.' },
  { key: 'teatro', label: 'Teatro', desc: 'Teatro independiente, danza, performance.' },
  { key: 'popular', label: 'Cultura popular', desc: 'Fiestas, feria, circo, carnaval.' },
];

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarEventos().then(setEventos).finally(() => setLoading(false));
  }, []);

  const hoy = new Date().toISOString().split('T')[0];
  const proximos = eventos
    .filter(e => e.fecha >= hoy)
    .filter(e => !filtro || e.categorias?.includes(filtro));

  const destacado = eventos.find(e => e.destacado && e.fecha >= hoy) || proximos[0];
  const grilla = proximos.filter(e => e.id !== destacado?.id).slice(0, 9);

  return (
    <div className={styles.page}>
      <Nav />
      <MarqueeBar />

      {/* HERO */}
      {destacado && (
        <section className={styles.hero}>
          <div className={styles.heroTexto}>
            <span className={styles.heroLabel}>destacado</span>
            <div className={styles.heroTags}>
              {destacado.categorias?.map(c => <Tag key={c} label={c} />)}
            </div>
            <h1 className={styles.heroTitulo}>{destacado.titulo}</h1>
            <p className={styles.heroFecha}>{formatFechaHero(destacado.fecha)}{destacado.hora ? ` · ${destacado.hora.slice(0,5)}h` : ''}</p>
            {destacado.espacios && (
              <p className={styles.heroLugar}>{destacado.espacios.nombre}{destacado.espacios.ciudad ? `, ${destacado.espacios.ciudad}` : ''}</p>
            )}
            <Link to={`/eventos/${destacado.id}`} className={styles.heroBtn}>Ver evento</Link>
          </div>
          <div className={styles.heroImagen}>
            {destacado.imagen_url
              ? <img src={destacado.imagen_url} alt={destacado.titulo} className={styles.heroImg} />
              : <div className={styles.heroPlaceholder}><span>{destacado.titulo}</span></div>
            }
          </div>
        </section>
      )}

      {/* FILTROS DE CATEGORÍA */}
      <div className={styles.filtros}>
        <button
          className={`${styles.filtroBtn} ${!filtro ? styles.filtroBtnActivo : ''}`}
          onClick={() => setFiltro('')}
        >todos</button>
        {CATEGORIAS.map(c => (
          <button
            key={c.key}
            className={`${styles.filtroBtn} ${filtro === c.key ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltro(filtro === c.key ? '' : c.key)}
          >{c.label}</button>
        ))}
      </div>

      {/* GRILLA */}
      <SectionBar label="Próximos eventos" action={`${proximos.length} eventos`} />
      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : proximos.length === 0 ? (
        <p className={styles.vacio}>No hay eventos próximos.</p>
      ) : (
        <div className={styles.grilla}>
          {grilla.map((e, i) => <EventoCard key={e.id} evento={e} index={i} />)}
        </div>
      )}

      {/* STRIP CATEGORÍAS */}
      <div className={styles.stripCategorias}>
        {CATEGORIAS.map(c => (
          <button key={c.key} className={styles.stripCell} onClick={() => setFiltro(c.key)}>
            <span className={styles.stripLabel}>{c.label}</span>
            <span className={styles.stripDesc}>{c.desc}</span>
          </button>
        ))}
      </div>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaTexto}>
          <h2 className={styles.ctaTitulo}>¿Tenés un proyecto cultural?</h2>
          <p className={styles.ctaDesc}>Publicá tus eventos, conectá con espacios y encontrá tu público en Bahía Blanca.</p>
          <Link to="/register" className={styles.ctaBtn}>Crear cuenta gratis</Link>
        </div>
        <div className={styles.ctaTipos}>
          {['banda', 'colectivo', 'productora', 'espacio cultural', 'artista', 'feria'].map(t => (
            <span key={t} className={styles.ctaTipo}>{t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
