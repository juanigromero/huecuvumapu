import { supabase } from '../../config/db.js';

async function determinarEstado(iniciador, entidadId) {
  const tabla = iniciador === 'proyecto' ? 'proyectos' : 'espacios';
  const { data } = await supabase
    .from(tabla)
    .select('eventos_aprobados')
    .eq('id', entidadId)
    .single();
  return (data?.eventos_aprobados ?? 0) >= 3 ? 'publicado' : 'pendiente_moderacion';
}

async function crearConfirmacion(eventoId, iniciador, proyectoId, espacioId) {
  // Solo si la contraparte tiene perfil (ID real, no solo texto)
  if (iniciador === 'proyecto' && espacioId) {
    await supabase.from('confirmaciones').insert({
      evento_id: eventoId,
      confirmador_tipo: 'espacio',
      confirmador_id: espacioId,
    });
  } else if (iniciador === 'espacio' && proyectoId) {
    await supabase.from('confirmaciones').insert({
      evento_id: eventoId,
      confirmador_tipo: 'proyecto',
      confirmador_id: proyectoId,
    });
  }
}

export async function crear(body, usuarioId) {
  const {
    titulo, descripcion, fecha, hora,
    entrada, precio, imagen_url, link_externo,
    iniciador, proyecto_id, proyecto_texto,
    espacio_id, espacio_texto, lat, lng, categorias = [],
  } = body;

  // Verificar que el usuario es miembro de la entidad iniciadora
  const tablaMembers = iniciador === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
  const colId = iniciador === 'proyecto' ? 'proyecto_id' : 'espacio_id';
  const entidadId = iniciador === 'proyecto' ? proyecto_id : espacio_id;

  const { data: membresia } = await supabase
    .from(tablaMembers)
    .select('rol_interno')
    .match({ [colId]: entidadId, usuario_id: usuarioId })
    .single();

  if (!membresia) throw new Error('No sos miembro de esta entidad');

  const estado_publicacion = await determinarEstado(iniciador, entidadId);

  const { data: evento, error } = await supabase
    .from('eventos')
    .insert({
      titulo, descripcion, fecha, hora,
      entrada, precio, imagen_url, link_externo,
      estado_publicacion, iniciador,
      proyecto_id, proyecto_texto,
      espacio_id, espacio_texto, lat, lng,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categorias.length > 0) {
    await supabase.from('eventos_categorias').insert(
      categorias.map(c => ({ evento_id: evento.id, categoria: c }))
    );
  }

  await crearConfirmacion(evento.id, iniciador, proyecto_id, espacio_id);

  return { ...evento, categorias };
}

export async function listar({ ciudad, categoria, fecha_desde, fecha_hasta, iniciador } = {}) {
  let query = supabase
    .from('eventos')
    .select(`
      *,
      eventos_categorias(categoria),
      proyectos(id, nombre, handle, avatar_url),
      espacios(id, nombre, handle, avatar_url, ciudad, lat, lng)
    `)
    .eq('estado_publicacion', 'publicado')
    .order('fecha', { ascending: true });

  if (fecha_desde) query = query.gte('fecha', fecha_desde);
  if (fecha_hasta) query = query.lte('fecha', fecha_hasta);
  if (iniciador) query = query.eq('iniciador', iniciador);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let resultados = data.map(e => ({
    ...e,
    categorias: e.eventos_categorias.map(c => c.categoria),
  }));

  if (ciudad) {
    resultados = resultados.filter(e =>
      e.espacios?.ciudad?.toLowerCase().includes(ciudad.toLowerCase())
    );
  }

  if (categoria) {
    resultados = resultados.filter(e => e.categorias.includes(categoria));
  }

  return resultados;
}

export async function obtener(id) {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      *,
      eventos_categorias(categoria),
      proyectos(id, nombre, handle, avatar_url),
      espacios(id, nombre, handle, avatar_url, ciudad, direccion, lat, lng),
      confirmaciones(id, confirmador_tipo, confirmador_id, estado, nota)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error('Evento no encontrado');
  return { ...data, categorias: data.eventos_categorias.map(c => c.categoria) };
}

export async function actualizar(id, cambios, usuarioId) {
  const evento = await obtener(id);
  await verificarPertenencia(evento, usuarioId);

  const { categorias, ...resto } = cambios;

  const { data, error } = await supabase
    .from('eventos')
    .update(resto)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categorias) {
    await supabase.from('eventos_categorias').delete().eq('evento_id', id);
    if (categorias.length > 0) {
      await supabase.from('eventos_categorias').insert(
        categorias.map(c => ({ evento_id: id, categoria: c }))
      );
    }
  }

  return data;
}

export async function toggleAgotado(id, usuarioId) {
  const evento = await obtener(id);
  await verificarPertenencia(evento, usuarioId);
  const { data, error } = await supabase
    .from('eventos')
    .update({ agotado: !evento.agotado })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function cancelar(id, usuarioId) {
  const evento = await obtener(id);
  await verificarPertenencia(evento, usuarioId);
  const { data, error } = await supabase
    .from('eventos')
    .update({ estado_publicacion: 'cancelado' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function misEventos(usuarioId) {
  // Proyectos del usuario
  const { data: proyectosMiembro } = await supabase
    .from('proyecto_miembros')
    .select('proyecto_id')
    .eq('usuario_id', usuarioId);

  // Espacios del usuario
  const { data: espaciosMiembro } = await supabase
    .from('espacio_miembros')
    .select('espacio_id')
    .eq('usuario_id', usuarioId);

  const proyectoIds = proyectosMiembro?.map(p => p.proyecto_id) || [];
  const espacioIds = espaciosMiembro?.map(e => e.espacio_id) || [];

  const { data, error } = await supabase
    .from('eventos')
    .select(`*, eventos_categorias(categoria)`)
    .or(
      [
        proyectoIds.length ? `proyecto_id.in.(${proyectoIds.join(',')})` : null,
        espacioIds.length ? `espacio_id.in.(${espacioIds.join(',')})` : null,
      ].filter(Boolean).join(',')
    )
    .order('fecha', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(e => ({ ...e, categorias: e.eventos_categorias.map(c => c.categoria) }));
}

async function verificarPertenencia(evento, usuarioId) {
  const tabla = evento.iniciador === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
  const col = evento.iniciador === 'proyecto' ? 'proyecto_id' : 'espacio_id';
  const id = evento.iniciador === 'proyecto' ? evento.proyecto_id : evento.espacio_id;

  const { data } = await supabase
    .from(tabla)
    .select('rol_interno')
    .match({ [col]: id, usuario_id: usuarioId })
    .single();

  if (!data) throw new Error('No tenés permiso sobre este evento');
}
