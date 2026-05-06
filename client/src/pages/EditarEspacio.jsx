import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import ImageUpload from '../components/ui/ImageUpload';
import { obtenerEspacio, actualizarEspacio } from '../services/espaciosService';
import styles from './CrearEntidad.module.css';

export default function EditarEspacio() {
  const { handle } = useParams();
  const token = useSelector(s => s.auth.token);
  const navigate = useNavigate();

  const [espacio, setEspacio] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerEspacio(handle).then(e => {
      setEspacio(e);
      setForm({
        nombre: e.nombre || '',
        descripcion: e.descripcion || '',
        direccion: e.direccion || '',
        ciudad: e.ciudad || '',
        avatar_url: e.avatar_url || '',
        cover_url: e.cover_url || '',
      });
    }).catch(() => setError('Espacio no encontrado'));
  }, [handle]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await actualizarEspacio(espacio.id, form, token);
      navigate(`/e/${handle}`);
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
      <SectionBar label={`Editar — ${espacio.nombre}`} />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.imagenesRow}>
            <div className={styles.field}>
              <label className={styles.label}>Foto de perfil</label>
              <ImageUpload valor={form.avatar_url} onChange={url => setForm(f => ({ ...f, avatar_url: url }))} carpeta="avatars/espacios" tipo="cuadrada" label="+ foto" />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Imagen de portada</label>
              <ImageUpload valor={form.cover_url} onChange={url => setForm(f => ({ ...f, cover_url: url }))} carpeta="covers/espacios" tipo="cover" label="+ portada" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nombre *</label>
            <input className={styles.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input className={styles.input} value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} placeholder="Bahía Blanca" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Dirección</label>
              <input className={styles.input} value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Av. Colón 123" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descripción</label>
            <textarea className={styles.textarea} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} placeholder="Contá qué es el espacio..." />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to={`/e/${handle}`} className={styles.btnCancel}>Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
