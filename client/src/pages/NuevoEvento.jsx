import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import { misProyectos } from '../services/proyectosService';
import { misEspacios, buscarEspacios } from '../services/espaciosService';
import { crearEvento } from '../services/eventosService';
import styles from './NuevoEvento.module.css';

const CATEGORIAS = ['musica', 'visual', 'teatro', 'popular'];

export default function NuevoEvento() {
  const token = useSelector(s => s.auth.token);
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // Búsqueda de contraparte
  const [busquedaEspacio, setBusquedaEspacio] = useState('');
  const [resultadosEspacio, setResultadosEspacio] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);

  const [form, setForm] = useState({
    titulo: '', descripcion: '', fecha: '', hora: '',
    entrada: 'gratuita', precio: '',
    link_externo: '',
    iniciador: 'proyecto',
    proyecto_id: '', proyecto_texto: '',
    espacio_id: '', espacio_texto: '',
    categorias: [],
  });

  useEffect(() => {
    Promise.all([misProyectos(token), misEspacios(token)])
      .then(([p, e]) => { setProyectos(p); setEspacios(e); })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (form.iniciador === 'proyecto' && proyectos.length > 0) {
      setForm(f => ({ ...f, proyecto_id: proyectos[0].id }));
    }
    if (form.iniciador === 'espacio' && espacios.length > 0) {
      setForm(f => ({ ...f, espacio_id: espacios[0].id }));
    }
  }, [form.iniciador, proyectos, espacios]);

  // Búsqueda de espacio contraparte (cuando iniciador = proyecto)
  useEffect(() => {
    if (form.iniciador !== 'proyecto') return;
    if (busquedaEspacio.length < 2) { setResultadosEspacio([]); return; }
    const t = setTimeout(() => {
      buscarEspacios(busquedaEspacio).then(setResultadosEspacio);
    }, 300);
    return () => clearTimeout(t);
  }, [busquedaEspacio, form.iniciador]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function toggleCategoria(c) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(c)
        ? f.categorias.filter(x => x !== c)
        : [...f.categorias, c],
    }));
  }

  function seleccionarEspacio(e) {
    setEspacioSeleccionado(e);
    setForm(f => ({ ...f, espacio_id: e.id, espacio_texto: '' }));
    setBusquedaEspacio(e.nombre);
    setResultadosEspacio([]);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const body = {
        ...form,
        precio: form.precio ? parseFloat(form.precio) : null,
        espacio_id: espacioSeleccionado?.id || null,
        espacio_texto: espacioSeleccionado ? '' : (form.iniciador === 'proyecto' ? busquedaEspacio : ''),
      };
      await crearEvento(body, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  const sinEntidades = proyectos.length === 0 && espacios.length === 0;

  return (
    <div className={styles.page}>
      <Nav />
      <SectionBar label="Nuevo evento" />

      <div className={styles.container}>
        {sinEntidades && (
          <div className={styles.aviso}>
            <p>Para cargar un evento necesitás tener al menos un proyecto o espacio. <a href="/dashboard">Creá uno desde el dashboard.</a></p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* INICIADOR */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>¿Quién organiza?</legend>
            <div className={styles.iniciadorOpciones}>
              {proyectos.length > 0 && (
                <label className={`${styles.iniciadorOpcion} ${form.iniciador === 'proyecto' ? styles.iniciadorActivo : ''}`}>
                  <input type="radio" name="iniciador" value="proyecto" checked={form.iniciador === 'proyecto'} onChange={handleChange} />
                  <span>Proyecto</span>
                </label>
              )}
              {espacios.length > 0 && (
                <label className={`${styles.iniciadorOpcion} ${form.iniciador === 'espacio' ? styles.iniciadorActivo : ''}`}>
                  <input type="radio" name="iniciador" value="espacio" checked={form.iniciador === 'espacio'} onChange={handleChange} />
                  <span>Espacio</span>
                </label>
              )}
            </div>

            {form.iniciador === 'proyecto' && proyectos.length > 1 && (
              <select name="proyecto_id" value={form.proyecto_id} onChange={handleChange} className={styles.select}>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            )}
            {form.iniciador === 'espacio' && espacios.length > 1 && (
              <select name="espacio_id" value={form.espacio_id} onChange={handleChange} className={styles.select}>
                {espacios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            )}
          </fieldset>

          {/* DATOS BÁSICOS */}
          <div className={styles.field}>
            <label className={styles.label}>Título del evento *</label>
            <input className={styles.input} name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Nombre del evento" />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha *</label>
              <input className={styles.input} name="fecha" type="date" value={form.fecha} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hora</label>
              <input className={styles.input} name="hora" type="time" value={form.hora} onChange={handleChange} />
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div className={styles.field}>
            <label className={styles.label}>Categorías</label>
            <div className={styles.categorias}>
              {CATEGORIAS.map(c => (
                <button
                  key={c} type="button"
                  className={`${styles.catBtn} ${form.categorias.includes(c) ? styles.catBtnActivo : ''}`}
                  onClick={() => toggleCategoria(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* CONTRAPARTE */}
          {form.iniciador === 'proyecto' && (
            <div className={styles.field}>
              <label className={styles.label}>Espacio donde se realiza</label>
              <div className={styles.buscador}>
                <input
                  className={styles.input}
                  placeholder="Buscar espacio por nombre..."
                  value={busquedaEspacio}
                  onChange={e => { setBusquedaEspacio(e.target.value); setEspacioSeleccionado(null); setForm(f => ({ ...f, espacio_id: '' })); }}
                />
                {resultadosEspacio.length > 0 && (
                  <div className={styles.dropdown}>
                    {resultadosEspacio.map(e => (
                      <button key={e.id} type="button" className={styles.dropdownItem} onClick={() => seleccionarEspacio(e)}>
                        <strong>{e.nombre}</strong>{e.ciudad ? ` · ${e.ciudad}` : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!espacioSeleccionado && busquedaEspacio.length > 0 && (
                <p className={styles.hint}>Si el espacio no está registrado, el nombre que escribas quedará guardado como texto.</p>
              )}
              {espacioSeleccionado && (
                <p className={styles.confirmado}>✓ {espacioSeleccionado.nombre} — recibirá una solicitud de confirmación.</p>
              )}
            </div>
          )}

          {/* ENTRADA */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Entrada</legend>
            <div className={styles.entradaOpciones}>
              {['gratuita', 'a_la_gorra', 'pago'].map(t => (
                <label key={t} className={`${styles.entradaOpcion} ${form.entrada === t ? styles.entradaActiva : ''}`}>
                  <input type="radio" name="entrada" value={t} checked={form.entrada === t} onChange={handleChange} />
                  <span>{t === 'a_la_gorra' ? 'a la gorra' : t}</span>
                </label>
              ))}
            </div>
            {form.entrada === 'pago' && (
              <div className={styles.field} style={{ marginTop: '0.75rem' }}>
                <label className={styles.label}>Precio ($)</label>
                <input className={styles.input} name="precio" type="number" min="0" value={form.precio} onChange={handleChange} placeholder="0" style={{ maxWidth: '160px' }} />
              </div>
            )}
          </fieldset>

          <div className={styles.field}>
            <label className={styles.label}>Descripción</label>
            <textarea className={styles.textarea} name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Contá de qué se trata el evento..." rows={4} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Link externo (Eventbrite, Passline, etc.)</label>
            <input className={styles.input} name="link_externo" value={form.link_externo} onChange={handleChange} placeholder="https://..." />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btnSubmit} disabled={enviando || sinEntidades}>
            {enviando ? 'Publicando...' : 'Publicar evento'}
          </button>
        </form>
      </div>
    </div>
  );
}
