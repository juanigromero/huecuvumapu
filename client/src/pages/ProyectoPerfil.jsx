import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import Tag from '../components/ui/Tag';
import InvitarMiembro from '../components/ui/InvitarMiembro';
import { obtenerProyecto } from '../services/proyectosService';
import styles from './Perfil.module.css';

export default function ProyectoPerfil() {
  const { handle } = useParams();
  const user = useSelector(s => s.auth.user);
  const [proyecto, setProyecto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProyecto(handle).then(setProyecto).catch(() => setError('Proyecto no encontrado'));
  }, [handle]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!proyecto) return <div className={styles.loading}>Cargando...</div>;

  const miembros = proyecto.proyecto_miembros || [];
  const miembroActual = miembros.find(m => m.usuario_id === user?.id);
  const esOwner = miembroActual?.rol_interno === 'owner';
  const esMiembro = !!miembroActual;

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.cover} style={proyecto.cover_url ? { backgroundImage: `url(${proyecto.cover_url})` } : {}}>
        <div className={styles.coverOverlay} />
        {esMiembro && (
          <div className={styles.coverActions}>
            <Link to={`/p/${proyecto.handle}/editar`} className={styles.btnEditar}>Editar perfil</Link>
          </div>
        )}
      </div>

      <div className={styles.identity}>
        {proyecto.avatar_url
          ? <img src={proyecto.avatar_url} alt={proyecto.nombre} className={styles.avatar} />
          : <div className={styles.avatarPlaceholder}>{proyecto.nombre[0].toUpperCase()}</div>
        }
        <div className={styles.identityTexto}>
          <h1 className={styles.nombre}>{proyecto.nombre}</h1>
          <span className={styles.handleCiudad}>
            @{proyecto.handle}{proyecto.ciudad ? ` · ${proyecto.ciudad}` : ''}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          {proyecto.bio && <p className={styles.bio}>{proyecto.bio}</p>}
          <div className={styles.tags}>
            {proyecto.tipo && <Tag label={proyecto.tipo.replace('_', ' ')} />}
            {(proyecto.categorias || []).map(c => <Tag key={c} label={c} />)}
          </div>
        </div>

        <div className={styles.sidebar}>
          <SectionBar label="Integrantes" />
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
            <>
              <SectionBar label="Invitar miembro" />
              <InvitarMiembro entidad_tipo="proyecto" entidad_id={proyecto.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
