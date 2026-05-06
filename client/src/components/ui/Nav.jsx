import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { logoutSupabase } from '../../services/authService';
import styles from './Nav.module.css';

export default function Nav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  async function handleLogout() {
    try { await logoutSupabase(); } catch (_) {}
    dispatch(logout());
    navigate('/');
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>huecuvumapu</Link>
      <div className={styles.links}>
        <Link to="/" className={styles.link}>agenda</Link>
        <Link to="/mapa" className={styles.link}>mapa</Link>
        {user ? (
          <>
            <Link to="/dashboard" className={styles.link}>dashboard</Link>
            {user?.es_admin && <Link to="/admin" className={styles.link}>admin</Link>}
            <button onClick={handleLogout} className={styles.btnLogout}>salir</button>
          </>
        ) : (
          <Link to="/login" className={styles.linkAccent}>entrá</Link>
        )}
      </div>
    </nav>
  );
}
