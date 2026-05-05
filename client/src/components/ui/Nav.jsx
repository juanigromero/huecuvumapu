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
    await logoutSupabase(); // Supabase limpia la sesión → dispara onAuthStateChange → Redux se actualiza
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
            <button onClick={handleLogout} className={styles.btnLogout}>salir</button>
          </>
        ) : (
          <Link to="/login" className={styles.linkAccent}>sumate</Link>
        )}
      </div>
    </nav>
  );
}
