import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import { obtenerEspacio } from '../services/espaciosService';
import styles from './Perfil.module.css';

export default function EspacioPerfil() {
  const { handle } = useParams();
  const [espacio, setEspacio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerEspacio(handle).then(setEspacio).catch(() => setError('Espacio no encontrado'));
  }, [handle]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!espacio) return <div className={styles.loading}>Cargando...</div>;

  const miembros = espacio.espacio_miembros || [];

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.cover} style={espacio.cover_url ? { backgroundImage: `url(${espacio.cover_url})` } : {}}>
        <div className={styles.coverOverlay} />
        <div className={styles.coverContent}>
          {espacio.avatar_url && <img src={espacio.avatar_url} alt={espacio.nombre} className={styles.avatar} />}
          <div>
            <h1 className={styles.nombre}>{espacio.nombre}</h1>
            {espacio.handle && <span className={styles.handle}>@{espacio.handle}</span>}
            {espacio.ciudad && <span className={styles.ciudad}> · {espacio.ciudad}</span>}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          {espacio.descripcion && <p className={styles.bio}>{espacio.descripcion}</p>}
          {espacio.direccion && <p className={styles.direccion}>📍 {espacio.direccion}</p>}
          {espacio.verificado && <span className={styles.verificado}>espacio verificado</span>}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{espacio.eventos_aprobados}</span>
              <span className={styles.statLabel}>eventos</span>
            </div>
          </div>
        </div>

        {miembros.length > 0 && (
          <div className={styles.sidebar}>
            <SectionBar label="Responsables" />
            <div className={styles.miembros}>
              {miembros.map(m => (
                <div key={m.usuario_id} className={styles.miembro}>
                  {m.usuarios?.avatar_url
                    ? <img src={m.usuarios.avatar_url} className={styles.miembroAvatar} alt="" />
                    : <div className={styles.miembroAvatarPlaceholder}>{m.usuarios?.nombre?.[0] || '?'}</div>
                  }
                  <div>
                    <span className={styles.miembroNombre}>{m.usuarios?.nombre || 'Usuario'}</span>
                    <span className={styles.miembroRol}>{m.rol_interno}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
