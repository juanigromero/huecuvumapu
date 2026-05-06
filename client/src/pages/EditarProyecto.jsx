import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import ImageUpload from '../components/ui/ImageUpload';
import { obtenerProyecto, actualizarProyecto } from '../services/proyectosService';
import styles from './CrearEntidad.module.css';

const TIPOS = ['banda', 'colectivo', 'productora', 'fiesta', 'artista_individual', 'otro'];
const CATEGORIAS = ['musica', 'visual', 'teatro', 'popular'];

export default function EditarProyecto() {
  const { handle } = useParams();
  const token = useSelector(s => s.auth.token);
  const user = useSelector(s => s.auth.user);
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProyecto(handle).then(p => {
      setProyecto(p);
      setForm({
        nombre: p.nombre || '',
        bio: p.bio || '',
        tipo: p.tipo || 'banda',
        ciudad: p.ciudad || '',
        categorias: p.categorias || [],
        avatar_url: p.avatar_url || '',
        cover_url: p.cover_url || '',
      });
    }).catch(() => setError('Proyecto no encontrado'));
  }, [handle]);

  function toggleCategoria(c) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(c) ? f.categorias.filter(x => x !== c) : [...f.categorias, c],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await actualizarProyecto(proyecto.id, form, token);
      navigate(`/p/${handle}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!form) return <div style={{ padding: '2rem', color: '#999' }}>{error || 'Cargando...'}</div>;

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label={`Editar — ${proyecto.nombre}`} />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.imagenesRow}>
            <div className={styles.field}>
              <label className={styles.label}>Foto de perfil</label>
              <ImageUpload valor={form.avatar_url} onChange={url => setForm(f => ({ ...f, avatar_url: url }))} carpeta="avatars/proyectos" tipo="cuadrada" label="+ foto" />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Imagen de portada</label>
              <ImageUpload valor={form.cover_url} onChange={url => setForm(f => ({ ...f, cover_url: url }))} carpeta="covers/proyectos" tipo="cover" label="+ portada" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nombre *</label>
            <input className={styles.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Tipo</label>
              <select className={styles.select} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input className={styles.input} value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} placeholder="Bahía Blanca" />
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

          <div className={styles.field}>
            <label className={styles.label}>Bio</label>
            <textarea className={styles.textarea} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Contá quiénes son..." />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to={`/p/${handle}`} className={styles.btnCancel}>Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
