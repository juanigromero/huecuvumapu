import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import ImageUpload from '../components/ui/ImageUpload';
import { obtenerEvento, actualizarEvento, cancelarEvento } from '../services/eventosService';
import styles from './NuevoEvento.module.css';

const CATEGORIAS = ['musica', 'visual', 'teatro', 'popular'];

export default function EditarEvento() {
  const { id } = useParams();
  const token = useSelector(s => s.auth.token);
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [form, setForm] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);

  useEffect(() => {
    obtenerEvento(id).then(e => {
      setEvento(e);
      setForm({
        titulo: e.titulo || '',
        descripcion: e.descripcion || '',
        fecha: e.fecha || '',
        hora: e.hora?.slice(0, 5) || '',
        entrada: e.entrada || 'gratuita',
        link_externo: e.link_externo || '',
        info_entradas: e.info_entradas || '',
        imagen_url: e.imagen_url || '',
        categorias: e.categorias || [],
      });
    }).catch(() => setError('Evento no encontrado'));
  }, [id]);

  function toggleCategoria(c) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(c) ? f.categorias.filter(x => x !== c) : [...f.categorias, c],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await actualizarEvento(id, form, token);
      navigate(`/eventos/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleCancelar() {
    try {
      await cancelarEvento(id, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !form) return <div style={{ padding: '2rem', color: '#999' }}>{error}</div>;
  if (!form) return <div style={{ padding: '2rem', color: '#999' }}>Cargando...</div>;

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label={`Editar — ${evento.titulo}`} />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label className={styles.label}>Imagen del evento</label>
            <ImageUpload
              valor={form.imagen_url}
              onChange={url => setForm(f => ({ ...f, imagen_url: url }))}
              carpeta="eventos"
              tipo="cover"
              label="+ imagen"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Título *</label>
            <input className={styles.input} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha *</label>
              <input className={styles.input} type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hora</label>
              <input className={styles.input} type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Categorías</label>
            <div className={styles.categorias}>
              {CATEGORIAS.map(c => (
                <button key={c} type="button"
                  className={`${styles.catBtn} ${form.categorias.includes(c) ? styles.catBtnActivo : ''}`}
                  onClick={() => toggleCategoria(c)}>{c}</button>
              ))}
            </div>
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Entrada</legend>
            <div className={styles.entradaOpciones}>
              {['gratuita', 'a_la_gorra', 'pago'].map(t => (
                <label key={t} className={`${styles.entradaOpcion} ${form.entrada === t ? styles.entradaActiva : ''}`}>
                  <input type="radio" name="entrada" value={t} checked={form.entrada === t} onChange={e => setForm(f => ({ ...f, entrada: e.target.value }))} />
                  <span>{t === 'a_la_gorra' ? 'a la gorra' : t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.field}>
            <label className={styles.label}>Descripción</label>
            <textarea className={styles.textarea} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={4} placeholder="Contá de qué se trata..." />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Link de entradas</label>
            <input className={styles.input} value={form.link_externo} onChange={e => setForm(f => ({ ...f, link_externo: e.target.value }))} placeholder="https://passline.com/..." />
          </div>

          {form.entrada === 'pago' && (
            <div className={styles.field}>
              <label className={styles.label}>¿Cómo conseguirlas? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(si no hay link)</span></label>
              <textarea className={styles.textarea} value={form.info_entradas} onChange={e => setForm(f => ({ ...f, info_entradas: e.target.value }))} rows={2} placeholder="Ej: Escribinos al 291 555-1234 o pasá por Av. Colón 123" />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button type="submit" className={styles.btnSubmit} disabled={enviando}>
                {enviando ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <Link to={`/eventos/${id}`} className={styles.hint}>Cancelar</Link>
            </div>

            {!confirmandoCancelar ? (
              <button type="button" className={styles.btnCancelarEvento} onClick={() => setConfirmandoCancelar(true)}>
                Cancelar evento
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '13px', color: '#555' }}>¿Seguro?</span>
                <button type="button" className={styles.btnCancelarEventoConfirm} onClick={handleCancelar}>Sí, cancelar</button>
                <button type="button" className={styles.hint} onClick={() => setConfirmandoCancelar(false)}>No</button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
