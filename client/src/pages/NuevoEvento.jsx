import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/ui/Nav';
import SectionBar from '../components/ui/SectionBar';
import { misProyectos } from '../services/proyectosService';
import { misEspacios, buscarEspacios } from '../services/espaciosService';
import { crearEvento } from '../services/eventosService';
import { useNominatim } from '../hooks/useNominatim';
import MapaPicker from '../components/ui/MapaPicker';
import ImageUpload from '../components/ui/ImageUpload';
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

  const [busqueda, setBusqueda] = useState('');
  const [espaciosRegistrados, setEspaciosRegistrados] = useState([]);
  const [seleccion, setSeleccion] = useState(null);

  const { resultados: sugerenciasNominatim, buscando: buscandoNominatim, terminado: busquedaTerminada } = useNominatim(
    seleccion ? '' : busqueda
  );

  const [form, setForm] = useState({
    titulo: '', descripcion: '', fecha: '', hora: '',
    entrada: 'gratuita', precio: '', link_externo: '',
    iniciador: 'proyecto',
    proyecto_id: '', proyecto_texto: '',
    espacio_id: '', espacio_texto: '',
    lat: null, lng: null,
    imagen_url: '',
    categorias: [],
  });

  useEffect(() => {
    Promise.all([misProyectos(token), misEspacios(token)])
      .then(([p, e]) => { setProyectos(p); setEspacios(e); })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (form.iniciador === 'proyecto' && proyectos.length > 0)
      setForm(f => ({ ...f, proyecto_id: proyectos[0].id }));
    if (form.iniciador === 'espacio' && espacios.length > 0)
      setForm(f => ({ ...f, espacio_id: espacios[0].id }));
  }, [form.iniciador, proyectos, espacios]);

  // Buscar en espacios registrados mientras se escribe
  useEffect(() => {
    if (!busqueda || busqueda.length < 2 || seleccion) { setEspaciosRegistrados([]); return; }
    buscarEspacios(busqueda).then(setEspaciosRegistrados);
  }, [busqueda, seleccion]);

  const hayResultados = espaciosRegistrados.length > 0 || sugerenciasNominatim.length > 0;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function toggleCategoria(c) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(c) ? f.categorias.filter(x => x !== c) : [...f.categorias, c],
    }));
  }

  function elegirEspacioRegistrado(esp) {
    setSeleccion({ tipo: 'registrado', ...esp });
    setBusqueda(esp.nombre);
    setEspaciosRegistrados([]);
    setForm(f => ({ ...f, espacio_id: esp.id, espacio_texto: '', lat: null, lng: null }));
  }

  function elegirLugarNominatim(lugar) {
    setSeleccion({ tipo: 'lugar', ...lugar });
    setBusqueda(lugar.nombre);
    setEspaciosRegistrados([]);
    setForm(f => ({ ...f, espacio_id: '', espacio_texto: lugar.nombre, lat: lugar.lat, lng: lugar.lng }));
  }

  function limpiarSeleccion() {
    setSeleccion(null);
    setBusqueda('');
    setForm(f => ({ ...f, espacio_id: '', espacio_texto: '', lat: null, lng: null }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    // Validar que tenga ubicación
    const tieneUbicacion =
      seleccion?.tipo === 'registrado' || // espacio registrado con lat/lng propio
      (seleccion?.lat && seleccion?.lng) || // lugar de Nominatim/Photon
      (form.lat && form.lng); // dirección manual o pin en el mapa

    if (!tieneUbicacion) {
      setError('El evento necesita una ubicación. Usá el mapa para marcar el lugar.');
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      const body = {
        ...form,
        precio: form.precio ? parseFloat(form.precio) : null,
        // Si no eligió nada del dropdown, guardar lo que escribió como texto
        espacio_texto: form.espacio_id ? '' : (form.espacio_texto || busqueda),
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
            {form.iniciador === 'proyecto' && (
              proyectos.length === 1
                ? <span className={styles.entidadNombre}>{proyectos[0].nombre}</span>
                : <select name="proyecto_id" value={form.proyecto_id} onChange={handleChange} className={styles.selectSutil}>
                    {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
            )}
            {form.iniciador === 'espacio' && (
              espacios.length === 1
                ? <span className={styles.entidadNombre}>{espacios[0].nombre}</span>
                : <select name="espacio_id" value={form.espacio_id} onChange={handleChange} className={styles.selectSutil}>
                    {espacios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
            )}
          </fieldset>

          {/* TÍTULO Y FECHA */}
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
                <button key={c} type="button"
                  className={`${styles.catBtn} ${form.categorias.includes(c) ? styles.catBtnActivo : ''}`}
                  onClick={() => toggleCategoria(c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* ESPACIO — autocomplete combinado */}
          {form.iniciador === 'proyecto' && (
            <div className={styles.field}>
              <label className={styles.label}>Espacio donde se realiza</label>

              {seleccion ? (
                <>
                  <div className={seleccion.tipo === 'registrado' ? styles.seleccionRegistrado : styles.seleccionLugar}>
                    <div className={styles.seleccionInfo}>
                      {seleccion.tipo === 'registrado' && <span className={styles.seleccionBadge}>en huecuvumapu</span>}
                      {seleccion.tipo === 'lugar' && <span className={styles.seleccionBadgeLugar}>ubicación</span>}
                      <strong className={styles.seleccionNombre}>{seleccion.nombre}</strong>
                      {seleccion.tipo === 'lugar' && seleccion.direccion && (
                        <span className={styles.seleccionDireccion}>{seleccion.direccion}</span>
                      )}
                      {seleccion.tipo === 'registrado' && (
                        <span className={styles.seleccionHint}>recibirá una solicitud de confirmación</span>
                      )}
                    </div>
                    <button type="button" className={styles.seleccionCambiar} onClick={limpiarSeleccion}>cambiar</button>
                  </div>
                  {seleccion.tipo === 'lugar' && form.lat && form.lng && (
                    <MapaPicker
                      lat={form.lat}
                      lng={form.lng}
                      onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))}
                    />
                  )}
                </>
              ) : (
                <>
                  <div className={styles.buscador}>
                    <input
                      className={styles.input}
                      placeholder="Escribí el nombre del lugar..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      autoComplete="off"
                    />
                    {busqueda.length >= 2 && buscandoNominatim && (
                      <span className={styles.buscandoIndicador}>buscando...</span>
                    )}
                    {hayResultados && (
                      <div className={styles.dropdown}>
                        {espaciosRegistrados.length > 0 && (
                          <>
                            <div className={styles.dropdownSeccion}>en huecuvumapu</div>
                            {espaciosRegistrados.map(e => (
                              <button key={e.id} type="button" className={`${styles.dropdownItem} ${styles.dropdownItemRegistrado}`}
                                onClick={() => elegirEspacioRegistrado(e)}>
                                <strong>{e.nombre}</strong>
                                {e.ciudad && <span> · {e.ciudad}</span>}
                              </button>
                            ))}
                          </>
                        )}
                        {sugerenciasNominatim.length > 0 && (
                          <>
                            <div className={styles.dropdownSeccion}>lugares</div>
                            {sugerenciasNominatim.map((l, i) => (
                              <button key={i} type="button" className={styles.dropdownItem}
                                onClick={() => elegirLugarNominatim(l)}>
                                <strong>{l.nombre}</strong>
                                {l.direccion && <span className={styles.dropdownDireccion}> · {l.direccion}</span>}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {busquedaTerminada && sugerenciasNominatim.length === 0 && espaciosRegistrados.length === 0 && (
                    <div className={styles.sinResultados}>
                      <p className={styles.sinResultadosTexto}>
                        No encontramos ese lugar. Marcá la ubicación en el mapa o buscá por dirección.
                      </p>
                      <MapaPicker
                        lat={form.lat}
                        lng={form.lng}
                        onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng, espacio_texto: busqueda }))}
                      />
                    </div>
                  )}
                </>
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
            <label className={styles.label}>Imagen del evento</label>
            <ImageUpload
              valor={form.imagen_url}
              onChange={url => setForm(f => ({ ...f, imagen_url: url }))}
              carpeta="eventos"
              tipo="cover"
              label="+ imagen"
            />
          </div>

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
