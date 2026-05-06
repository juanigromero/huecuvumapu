import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import ImageUpload from '../components/ui/ImageUpload';
import { apiFetch } from '../services/api';
import styles from './CrearEntidad.module.css';

export default function EditarPerfil() {
  const token = useSelector(s => s.auth.token);
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    avatar_url: user?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await apiFetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      }, token);
      dispatch(setCredentials({ token, user: updated }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label="Editar mi perfil" />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label className={styles.label}>Foto de perfil</label>
            <ImageUpload
              valor={form.avatar_url}
              onChange={url => setForm(f => ({ ...f, avatar_url: url }))}
              carpeta="avatars/usuarios"
              tipo="cuadrada"
              label="+ foto"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nombre</label>
            <input className={styles.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre" />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to="/dashboard" className={styles.btnCancel}>Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
