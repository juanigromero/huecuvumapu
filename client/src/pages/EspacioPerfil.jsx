import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import InvitarMiembro from '../components/ui/InvitarMiembro';
import { obtenerEspacio } from '../services/espaciosService';
import styles from './Perfil.module.css';

export default function EspacioPerfil() {
  const { handle } = useParams();
  const user = useSelector(s => s.auth.user);
  const [espacio, setEspacio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerEspacio(handle).then(setEspacio).catch(() => setError('Espacio no encontrado'));
  }, [handle]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!espacio) return <div className={styles.loading}>Cargando...</div>;

  const miembros = espacio.espacio_miembros || [];
  const miembroActual = miembros.find(m => m.usuario_id === user?.id);
  const esOwner = miembroActual?.rol_interno === 'owner';
  const esMiembro = !!miembroActual;

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.cover} style={espacio.cover_url ? { backgroundImage: `url(${espacio.cover_url})` } : {}}>
        <div className={styles.coverOverlay} />
        {esMiembro && (
          <div className={styles.coverActions}>
            <Link to={`/e/${espacio.handle}/editar`} className={styles.btnEditar}>Editar perfil</Link>
          </div>
        )}
        <div className={styles.identity}>
          {espacio.avatar_url && (
            <img src={espacio.avatar_url} alt={espacio.nombre} className={styles.avatar} />
          )}
          <div className={styles.identityTexto}>
            <h1 className={styles.nombre}>{espacio.nombre}</h1>
            <span className={styles.handleCiudad}>
              {espacio.handle ? `@${espacio.handle}` : ''}{espacio.ciudad ? ` · ${espacio.ciudad}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          {espacio.descripcion && <p className={styles.bio}>{espacio.descripcion}</p>}
          {espacio.direccion && <p className={styles.direccion}>📍 {espacio.direccion}</p>}
          {espacio.verificado && <span className={styles.verificado}>espacio verificado</span>}
        </div>

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
          {esOwner && (
            <InvitarMiembro entidad_tipo="espacio" entidad_id={espacio.id} />
          )}
        </div>
      </div>
    </div>
  );
}
