import { supabase } from '../../config/db.js';

export async function crear({ nombre, handle, bio, tipo, ciudad, categorias, links }, usuarioId) {
  const { data: proyecto, error } = await supabase
    .from('proyectos')
    .insert({ nombre, handle, bio, tipo, ciudad, categorias, links })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase.from('proyecto_miembros').insert({
    proyecto_id: proyecto.id,
    usuario_id: usuarioId,
    rol_interno: 'owner',
  });

  return proyecto;
}

export async function listar({ ciudad, tipo, categoria } = {}) {
  let query = supabase.from('proyectos').select('*').order('nombre');
  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`);
  if (tipo) query = query.eq('tipo', tipo);
  if (categoria) query = query.contains('categorias', [categoria]);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerPorHandle(handle) {
  const { data, error } = await supabase
    .from('proyectos')
    .select(`*, proyecto_miembros(rol_interno, usuario_id, usuarios(nombre, avatar_url))`)
    .eq('handle', handle)
    .single();
  if (error) throw new Error('Proyecto no encontrado');
  return data;
}

export async function actualizar(id, cambios) {
  const { data, error } = await supabase
    .from('proyectos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminar(id) {
  const { error } = await supabase.from('proyectos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function esMiembro(proyectoId, usuarioId) {
  const { data } = await supabase
    .from('proyecto_miembros')
    .select('rol_interno')
    .match({ proyecto_id: proyectoId, usuario_id: usuarioId })
    .single();
  return data || null;
}
