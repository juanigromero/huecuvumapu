import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import ImageUpload from '../components/ui/ImageUpload';
import MapaPicker from '../components/ui/MapaPicker';
import { obtenerEspacio, actualizarEspacio } from '../services/espaciosService';
import styles from './CrearEntidad.module.css';

async function geocodificar(direccion, ciudad) {
  const q = encodeURIComponent(`${direccion}, ${ciudad || 'Bahía Blanca'}, Argentina`);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { 'Accept-Language': 'es' },
  });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default function EditarEspacio() {
  const { handle } = useParams();
  const token = useSelector(s => s.auth.token);
  const navigate = useNavigate();

  const [espacio, setEspacio] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geocodingStatus, setGeocodingStatus] = useState(null);

  useEffect(() => {
    obtenerEspacio(handle).then(e => {
      setEspacio(e);
      setForm({
        nombre: e.nombre || '',
        descripcion: e.descripcion || '',
        direccion: e.direccion || '',
        ciudad: e.ciudad || '',
        lat: e.lat || null,
        lng: e.lng || null,
        avatar_url: e.avatar_url || '',
        cover_url: e.cover_url || '',
      });
    }).catch(() => setError('Espacio no encontrado'));
  }, [handle]);

  async function handleDireccionBlur() {
    if (!form.direccion.trim()) return;
    setGeocodingStatus('buscando');
    const coords = await geocodificar(form.direccion, form.ciudad);
    if (coords) {
      setForm(f => ({ ...f, lat: coords.lat, lng: coords.lng }));
      setGeocodingStatus('ok');
    } else {
      setGeocodingStatus('no_encontrado');
    }
  }

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
              <input
                className={styles.input}
                value={form.direccion}
                onChange={e => { setForm(f => ({ ...f, direccion: e.target.value, lat: null, lng: null })); setGeocodingStatus(null); }}
                onBlur={handleDireccionBlur}
                placeholder="Av. Colón 123"
              />
              {geocodingStatus === 'buscando' && <span className={styles.hint}>Buscando ubicación...</span>}
              {geocodingStatus === 'ok' && <span className={styles.hintOk}>✓ Ubicación encontrada</span>}
              {geocodingStatus === 'no_encontrado' && <span className={styles.hintWarn}>No se encontró. Marcá en el mapa.</span>}
            </div>
          </div>

          {/* MAPA DE UBICACIÓN */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ubicación en el mapa
              {!form.lat && !form.lng && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#999' }}> — sin coordenadas, no aparece en el mapa</span>}
            </label>
            <MapaPicker
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))}
            />
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
