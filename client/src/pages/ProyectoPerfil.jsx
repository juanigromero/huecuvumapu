import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import EventoCard from '../components/eventos/EventoCard';
import Tag from '../components/ui/Tag';
import { obtenerProyecto } from '../services/proyectosService';
import styles from './Perfil.module.css';

export default function ProyectoPerfil() {
  const { handle } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProyecto(handle).then(setProyecto).catch(() => setError('Proyecto no encontrado'));
  }, [handle]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!proyecto) return <div className={styles.loading}>Cargando...</div>;

  const miembros = proyecto.proyecto_miembros || [];
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <Nav />

      <div className={styles.cover} style={proyecto.cover_url ? { backgroundImage: `url(${proyecto.cover_url})` } : {}}>
        <div className={styles.coverOverlay} />
        <div className={styles.coverContent}>
          {proyecto.avatar_url && <img src={proyecto.avatar_url} alt={proyecto.nombre} className={styles.avatar} />}
          <div>
            <h1 className={styles.nombre}>{proyecto.nombre}</h1>
            <span className={styles.handle}>@{proyecto.handle}</span>
            {proyecto.ciudad && <span className={styles.ciudad}> · {proyecto.ciudad}</span>}
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

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{proyecto.eventos_aprobados}</span>
              <span className={styles.statLabel}>eventos</span>
            </div>
          </div>
        </div>

        {miembros.length > 0 && (
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
          </div>
        )}
      </div>
    </div>
  );
}
