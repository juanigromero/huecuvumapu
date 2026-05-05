import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Space Grotesk, sans-serif', background: '#f5f0e8', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Dashboard</h1>
      <p style={{ color: '#555' }}>Bienvenido, {user?.nombre || user?.email}</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '1rem',
          background: '#111',
          color: '#f5f0e8',
          border: 'none',
          padding: '0.6rem 1.2rem',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
