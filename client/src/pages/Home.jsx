import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Space Grotesk, sans-serif', background: '#f5f0e8', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700 }}>huecuvumapu</h1>
      <p style={{ color: '#555' }}>Agenda cultural — próximamente</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <Link to="/login" style={{ color: '#111', fontWeight: 700 }}>Iniciar sesión</Link>
        <Link to="/register" style={{ color: '#111', fontWeight: 700 }}>Registrarse</Link>
      </div>
    </div>
  );
}
