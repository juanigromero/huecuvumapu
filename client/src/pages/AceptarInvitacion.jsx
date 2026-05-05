import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import { apiFetch } from '../services/api';
import styles from './Auth.module.css';

export default function AceptarInvitacion() {
  const { token } = useParams();
  const navigate = useNavigate();
  const authToken = useSelector(s => s.auth.token);
  const user = useSelector(s => s.auth.user);

  const [invitacion, setInvitacion] = useState(null);
  const [error, setError] = useState(null);
  const [aceptando, setAceptando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    apiFetch(`/api/invitaciones/${token}`)
      .then(setInvitacion)
      .catch(err => setError(err.message));
  }, [token]);

  async function handleAceptar() {
    setAceptando(true);
    try {
      const res = await apiFetch(`/api/invitaciones/${token}/aceptar`, { method: 'POST' }, authToken);
      setExito(true);
      setTimeout(() => {
        navigate(res.entidad_tipo === 'proyecto' ? '/dashboard' : '/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAceptando(false);
    }
  }

  if (error) return (
    <div>
      <Nav />
      <div className={styles.page}>
        <div className={styles.card}>
          <p style={{ color: '#c00', fontSize: '14px' }}>{error}</p>
          <Link to="/" className={styles.link}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );

  if (!invitacion) return <div style={{ padding: '2rem', color: '#999' }}>Cargando...</div>;

  const entidadNombre = invitacion.proyectos?.nombre || invitacion.espacios?.nombre || '—';

  if (exito) return (
    <div>
      <Nav />
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>¡Listo!</h1>
          <p style={{ color: '#555', fontSize: '14px', marginTop: '0.5rem' }}>
            Ya sos parte de <strong>{entidadNombre}</strong>. Redirigiendo...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Nav />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}>huecuvumapu</span>
            <h1 className={styles.title}>Invitación</h1>
          </div>

          <p style={{ fontSize: '15px', color: '#333', marginBottom: '1.5rem' }}>
            Te invitaron a sumarte a <strong>{entidadNombre}</strong> como <strong>{invitacion.rol_interno}</strong>.
          </p>

          {!user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '13px', color: '#777' }}>Necesitás una cuenta para aceptar.</p>
              <Link to={`/register?invitacion=${token}`} className={styles.btnPrimary} style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                Crear cuenta
              </Link>
              <Link to={`/login?invitacion=${token}`} style={{ fontSize: '13px', color: '#555', textAlign: 'center' }}>
                Ya tengo cuenta — iniciar sesión
              </Link>
            </div>
          ) : (
            <button className={styles.btnPrimary} onClick={handleAceptar} disabled={aceptando}>
              {aceptando ? 'Aceptando...' : 'Aceptar invitación'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
