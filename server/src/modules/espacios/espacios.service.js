import { supabase } from '../../config/db.js';

export async function crear({ nombre, handle, descripcion, direccion, ciudad, lat, lng, links }, usuarioId) {
  const { data: espacio, error } = await supabase
    .from('espacios')
    .insert({ nombre, handle, descripcion, direccion, ciudad, lat, lng, links })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase.from('espacio_miembros').insert({
    espacio_id: espacio.id,
    usuario_id: usuarioId,
    rol_interno: 'owner',
  });

  return espacio;
}

export async function listar({ ciudad } = {}) {
  let query = supabase.from('espacios').select('*').order('nombre');
  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerPorHandle(handle) {
  const { data, error } = await supabase
    .from('espacios')
    .select(`*, espacio_miembros(rol_interno, usuario_id, usuarios(nombre, avatar_url))`)
    .eq('handle', handle)
    .single();
  if (error) throw new Error('Espacio no encontrado');
  return data;
}

export async function actualizar(id, cambios) {
  const { data, error } = await supabase
    .from('espacios')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminar(id) {
  const { error } = await supabase.from('espacios').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function esMiembro(espacioId, usuarioId) {
  const { data } = await supabase
    .from('espacio_miembros')
    .select('rol_interno')
    .match({ espacio_id: espacioId, usuario_id: usuarioId })
    .single();
  return data || null;
}

export async function buscar(q) {
  const { data, error } = await supabase
    .from('espacios')
    .select('id, nombre, handle, ciudad, avatar_url, lat, lng')
    .ilike('nombre', `%${q}%`)
    .limit(10);
  if (error) throw new Error(error.message);
  return data;
}
