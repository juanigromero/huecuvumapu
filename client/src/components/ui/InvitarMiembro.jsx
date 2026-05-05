import { useState } from 'react';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../services/api';
import styles from './InvitarMiembro.module.css';

export default function InvitarMiembro({ entidad_tipo, entidad_id }) {
  const token = useSelector(s => s.auth.token);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResultado(null);
    setError(null);
    try {
      const res = await apiFetch('/api/invitaciones', {
        method: 'POST',
        body: JSON.stringify({ email, entidad_tipo, entidad_id }),
      }, token);
      setResultado(res.resultado);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          type="email"
          placeholder="email del miembro"
          value={email}
          onChange={e => { setEmail(e.target.value); setResultado(null); setError(null); }}
          required
        />
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? '...' : 'invitar'}
        </button>
      </form>

      {resultado === 'agregado_directo' && (
        <p className={styles.ok}>✓ Agregado como miembro.</p>
      )}
      {resultado === 'invitacion_enviada' && (
        <p className={styles.ok}>✓ Invitación enviada. El link expira en 7 días.</p>
      )}
      {error && <p className={styles.err}>{error}</p>}
    </div>
  );
}
