import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import Tag from '../components/ui/Tag';
import EventoCard from '../components/eventos/EventoCard';
import InvitarMiembro from '../components/ui/InvitarMiembro';
import { obtenerProyecto } from '../services/proyectosService';
import { listarEventos } from '../services/eventosService';
import styles from './Perfil.module.css';

export default function ProyectoPerfil() {
  const { handle } = useParams();
  const user = useSelector(s => s.auth.user);
  const [proyecto, setProyecto] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProyecto(handle).then(p => {
      setProyecto(p);
      const hoy = new Date().toISOString().split('T')[0];
      listarEventos({ proyecto_id: p.id, fecha_desde: hoy }).then(setEventos);
    }).catch(() => setError('Proyecto no encontrado'));
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
        <div className={styles.identity}>
          {proyecto.avatar_url && (
            <img src={proyecto.avatar_url} alt={proyecto.nombre} className={styles.avatar} />
          )}
          <div className={styles.identityTexto}>
            <h1 className={styles.nombre}>{proyecto.nombre}</h1>
            <span className={styles.handleCiudad}>
              @{proyecto.handle}{proyecto.ciudad ? ` · ${proyecto.ciudad}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          {proyecto.bio && <p className={styles.bio}>{proyecto.bio}</p>}

          <div className={styles.tags}>
            {proyecto.tipo && <Tag label={proyecto.tipo.replace('_', ' ')} />}
            {(proyecto.categorias || []).map(c => <Tag key={c} label={c} />)}
          </div>

          {eventos.length > 0 && (
            <div className={styles.eventosSection}>
              <SectionBar label="Próximos eventos" />
              <div className={styles.eventosGrid}>
                {eventos.map((e, i) => <EventoCard key={e.id} evento={e} index={i} />)}
              </div>
            </div>
          )}
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
            <InvitarMiembro entidad_tipo="proyecto" entidad_id={proyecto.id} />
          )}
        </div>
      </div>
    </div>
  );
}
