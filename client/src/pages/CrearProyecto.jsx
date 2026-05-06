import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import ImageUpload from '../components/ui/ImageUpload';
import { crearProyecto } from '../services/proyectosService';
import styles from './CrearEntidad.module.css';

const TIPOS = ['banda', 'colectivo', 'productora', 'fiesta', 'artista_individual', 'otro'];
const CATEGORIAS = ['musica', 'visual', 'teatro', 'popular'];

export default function CrearProyecto() {
  const token = useSelector(s => s.auth.token);
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', handle: '', bio: '', tipo: 'banda', ciudad: 'Bahía Blanca', categorias: [], avatar_url: '', cover_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function autoHandle(e) {
    setForm(f => ({
      ...f,
      nombre: e.target.value,
      handle: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  }

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
      const proyecto = await crearProyecto(form, token);
      navigate(`/p/${proyecto.handle}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label="Nuevo proyecto" />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label className={styles.label}>Nombre *</label>
            <input className={styles.input} name="nombre" value={form.nombre} onChange={autoHandle} required placeholder="Nombre del proyecto" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Handle (URL) *</label>
            <div className={styles.handleWrap}>
              <span className={styles.handlePrefix}>huecuvumapu.ar/p/</span>
              <input className={styles.input} name="handle" value={form.handle} onChange={handleChange} required placeholder="mi-proyecto" pattern="[a-z0-9\-]+" />
            </div>
            <span className={styles.hint}>Solo letras minúsculas, números y guiones.</span>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Tipo *</label>
              <select className={styles.select} name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input className={styles.input} name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Bahía Blanca" />
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
            <textarea className={styles.textarea} name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Contá quiénes son..." />
          </div>

          <div className={styles.imagenesRow}>
            <div className={styles.field}>
              <label className={styles.label}>Foto de perfil</label>
              <ImageUpload
                valor={form.avatar_url}
                onChange={url => setForm(f => ({ ...f, avatar_url: url }))}
                carpeta="avatars/proyectos"
                tipo="cuadrada"
                label="+ foto"
              />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Imagen de portada</label>
              <ImageUpload
                valor={form.cover_url}
                onChange={url => setForm(f => ({ ...f, cover_url: url }))}
                carpeta="covers/proyectos"
                tipo="cover"
                label="+ portada"
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'Creando...' : 'Crear proyecto'}
            </button>
            <Link to="/dashboard" className={styles.btnCancel}>Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
