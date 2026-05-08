import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import MarqueeBar from '../components/ui/MarqueeBar';
import SectionBar from '../components/ui/SectionBar';
import EventoCard from '../components/eventos/EventoCard';
import Tag from '../components/ui/Tag';
import Typewriter from '../components/ui/Typewriter';
import { listarEventos } from '../services/eventosService';
import { generarSVG } from '../utils/svgAbstracto';
import styles from './Home.module.css';

function formatFechaHero(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const CATEGORIAS = [
  { key: 'musica', label: 'Música' },
  { key: 'visual', label: 'Artes visuales' },
  { key: 'teatro', label: 'Teatro' },
  { key: 'popular', label: 'Cultura popular' },
];

function getRangoFecha(periodo) {
  const hoy = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  if (periodo === 'hoy') return { desde: fmt(hoy), hasta: fmt(hoy) };
  if (periodo === 'semana') {
    const fin = new Date(hoy); fin.setDate(hoy.getDate() + 7);
    return { desde: fmt(hoy), hasta: fmt(fin) };
  }
  if (periodo === 'mes') {
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { desde: fmt(hoy), hasta: fmt(fin) };
  }
  return { desde: fmt(hoy), hasta: null };
}

const PERIODOS = [
  { key: 'todos', label: 'Próximos' },
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
];

export default function Home() {
  const [destacado, setDestacado] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [fechaCustom, setFechaCustom] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch inicial para el destacado — sin filtros
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    listarEventos({ fecha_desde: hoy }).then(evs => {
      setDestacado(evs.find(e => e.destacado) || evs[0] || null);
    });
  }, []);

  // Fetch filtrado para la grilla
  useEffect(() => {
    setLoading(true);
    const { desde, hasta } = getRangoFecha(filtroPeriodo);
    const params = { fecha_desde: fechaCustom || desde };
    if (fechaCustom) params.fecha_hasta = fechaCustom;
    else if (hasta) params.fecha_hasta = hasta;
    listarEventos(params).then(setEventos).finally(() => setLoading(false));
  }, [filtroPeriodo, fechaCustom]);

  const proximos = eventos.filter(e =>
    e.id !== destacado?.id &&
    (!filtroCategoria || e.categorias?.includes(filtroCategoria))
  ).slice(0, 9);

  return (
    <div className={styles.page}>
      <Nav />
      <MarqueeBar />

      {/* SECCIÓN TYPEWRITER — con video de fondo cuando esté disponible */}
      <section className={styles.heroTypewriter}>
        {/* Video de fondo — descomentar cuando haya video
        <video className={styles.videoBg} autoPlay muted loop playsInline>
          <source src="URL_DEL_VIDEO.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay} />
        */}
        <Typewriter />
      </section>

      {/* SECCIÓN DESTACADO */}
      {destacado && (
        <section className={styles.hero}>
          <div className={styles.heroTexto}>
            <span className={styles.heroLabel}>destacado</span>
            <div className={styles.heroTags}>
              {destacado.categorias?.map(c => <Tag key={c} label={c} />)}
            </div>
            <h2 className={styles.heroTituloEvento}>{destacado.titulo}</h2>
            <p className={styles.heroFecha}>{formatFechaHero(destacado.fecha)}{destacado.hora ? ` · ${destacado.hora.slice(0,5)}h` : ''}</p>
            {destacado.espacios && (
              <p className={styles.heroLugar}>{destacado.espacios.nombre}{destacado.espacios.ciudad ? `, ${destacado.espacios.ciudad}` : ''}</p>
            )}
            <Link to={`/eventos/${destacado.id}`} className={styles.heroBtn}>Ver evento</Link>
          </div>
          <div className={styles.heroImagen}>
            <img
              src={destacado.imagen_url || generarSVG(destacado.id, 800, 480)}
              alt={destacado.titulo}
              className={styles.heroImg}
            />
          </div>
        </section>
      )}

      {/* FILTROS */}
      <div className={styles.filtros}>
        {/* Categoría */}
        <div className={styles.filtrosGrupo}>
          <button
            className={`${styles.filtroBtn} ${!filtroCategoria ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltroCategoria('')}
          >todos</button>
          {CATEGORIAS.map(c => (
            <button key={c.key}
              className={`${styles.filtroBtn} ${filtroCategoria === c.key ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltroCategoria(filtroCategoria === c.key ? '' : c.key)}
            >{c.label}</button>
          ))}
        </div>

        {/* Separador */}
        <div className={styles.filtrosSep} />

        {/* Fecha */}
        <div className={styles.filtrosGrupo}>
          {PERIODOS.map(p => (
            <button key={p.key}
              className={`${styles.filtroBtn} ${filtroPeriodo === p.key && !fechaCustom ? styles.filtroBtnActivo : ''}`}
              onClick={() => { setFiltroPeriodo(p.key); setFechaCustom(''); }}
            >{p.label}</button>
          ))}
          <input
            type="date"
            className={`${styles.filtroFecha} ${fechaCustom ? styles.filtroBtnActivo : ''}`}
            value={fechaCustom}
            onChange={e => { setFechaCustom(e.target.value); setFiltroPeriodo(''); }}
            title="Elegir fecha"
          />
        </div>
      </div>

      {/* GRILLA */}
      <SectionBar label="Próximos eventos" action={`${proximos.length} eventos`} />
      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : proximos.length === 0 ? (
        <p className={styles.vacio}>No hay eventos en ese período.</p>
      ) : (
        <div className={styles.grilla}>
          {proximos.map((e, i) => <EventoCard key={e.id} evento={e} index={i} />)}
        </div>
      )}

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
