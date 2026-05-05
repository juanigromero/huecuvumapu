import { supabase } from '../../config/db.js';

export async function listarPendientes(usuarioId) {
  const [{ data: proyectos }, { data: espacios }] = await Promise.all([
    supabase.from('proyecto_miembros').select('proyecto_id').eq('usuario_id', usuarioId),
    supabase.from('espacio_miembros').select('espacio_id').eq('usuario_id', usuarioId),
  ]);

  const proyectoIds = proyectos?.map(p => p.proyecto_id) || [];
  const espacioIds = espacios?.map(e => e.espacio_id) || [];

  const filtros = [];
  if (proyectoIds.length) filtros.push(`and(confirmador_tipo.eq.proyecto,confirmador_id.in.(${proyectoIds.join(',')}))`);
  if (espacioIds.length) filtros.push(`and(confirmador_tipo.eq.espacio,confirmador_id.in.(${espacioIds.join(',')}))`);
  if (!filtros.length) return [];

  const { data, error } = await supabase
    .from('confirmaciones')
    .select(`
      *,
      eventos(titulo, fecha, hora, iniciador,
        proyectos(nombre, handle),
        espacios(nombre, handle)
      )
    `)
    .or(filtros.join(','))
    .eq('estado', 'pendiente')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function responder(confirmacionId, usuarioId, estado, nota) {
  const { data: conf, error: err } = await supabase
    .from('confirmaciones')
    .select('*')
    .eq('id', confirmacionId)
    .single();
  if (err) throw new Error('Confirmación no encontrada');

  const tabla = conf.confirmador_tipo === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
  const col = conf.confirmador_tipo === 'proyecto' ? 'proyecto_id' : 'espacio_id';
  const { data: membresia } = await supabase
    .from(tabla)
    .select('rol_interno')
    .match({ [col]: conf.confirmador_id, usuario_id: usuarioId })
    .single();

  if (!membresia) throw new Error('No tenés permiso para responder esta confirmación');

  const { data, error } = await supabase
    .from('confirmaciones')
    .update({ estado, nota, updated_at: new Date().toISOString() })
    .eq('id', confirmacionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
