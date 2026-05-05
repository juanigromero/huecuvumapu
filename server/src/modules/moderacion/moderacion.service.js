import { supabase } from '../../config/db.js';

export async function listarPendientes() {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      *,
      eventos_categorias(categoria),
      proyectos(nombre, handle),
      espacios(nombre, handle, ciudad)
    `)
    .eq('estado_publicacion', 'pendiente_moderacion')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(e => ({ ...e, categorias: e.eventos_categorias.map(c => c.categoria) }));
}

export async function aprobar(eventoId) {
  const { data: evento, error: err } = await supabase
    .from('eventos')
    .update({ estado_publicacion: 'publicado' })
    .eq('id', eventoId)
    .select()
    .single();
  if (err) throw new Error(err.message);

  // Incrementar eventos_aprobados del iniciador
  const tabla = evento.iniciador === 'proyecto' ? 'proyectos' : 'espacios';
  const entidadId = evento.iniciador === 'proyecto' ? evento.proyecto_id : evento.espacio_id;
  const { data: entidad } = await supabase.from(tabla).select('eventos_aprobados').eq('id', entidadId).single();
  await supabase.from(tabla).update({ eventos_aprobados: (entidad.eventos_aprobados || 0) + 1 }).eq('id', entidadId);

  return evento;
}

export async function rechazar(eventoId, nota) {
  const { data, error } = await supabase
    .from('eventos')
    .update({ estado_publicacion: 'cancelado' })
    .eq('id', eventoId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
