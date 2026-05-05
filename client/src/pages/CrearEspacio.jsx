import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import { crearEspacio } from '../services/espaciosService';
import styles from './CrearEntidad.module.css';

export default function CrearEspacio() {
  const token = useSelector(s => s.auth.token);
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', handle: '', descripcion: '', direccion: '', ciudad: 'Bahía Blanca' });
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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const espacio = await crearEspacio(form, token);
      navigate(`/e/${espacio.handle}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label="Nuevo espacio" />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label className={styles.label}>Nombre *</label>
            <input className={styles.input} name="nombre" value={form.nombre} onChange={autoHandle} required placeholder="Nombre del espacio" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Handle (URL)</label>
            <div className={styles.handleWrap}>
              <span className={styles.handlePrefix}>huecuvumapu.ar/e/</span>
              <input className={styles.input} name="handle" value={form.handle} onChange={handleChange} placeholder="mi-espacio" pattern="[a-z0-9\-]*" />
            </div>
            <span className={styles.hint}>Solo letras minúsculas, números y guiones.</span>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input className={styles.input} name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Bahía Blanca" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Dirección</label>
              <input className={styles.input} name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. Colón 123" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descripción</label>
            <textarea className={styles.textarea} name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Contá qué es el espacio..." />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'Creando...' : 'Crear espacio'}
            </button>
            <Link to="/dashboard" className={styles.btnCancel}>Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
