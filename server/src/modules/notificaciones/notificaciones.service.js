import { supabase } from '../../config/db.js';

async function miembrosDeEntidad(tipo, id) {
  const tabla = tipo === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
  const col = tipo === 'proyecto' ? 'proyecto_id' : 'espacio_id';
  const { data } = await supabase.from(tabla).select('usuario_id').eq(col, id);
  return data?.map(m => m.usuario_id) || [];
}

async function crear(usuario_id, tipo, referencia_id) {
  await supabase.from('notificaciones').insert({ usuario_id, tipo, referencia_id });
}

async function crearParaMiembros(tipo_entidad, entidad_id, tipo_notif, referencia_id, excluir = []) {
  const miembros = await miembrosDeEntidad(tipo_entidad, entidad_id);
  const destinatarios = miembros.filter(id => !excluir.includes(id));
  if (!destinatarios.length) return;
  await supabase.from('notificaciones').insert(
    destinatarios.map(usuario_id => ({ usuario_id, tipo: tipo_notif, referencia_id }))
  );
}

// Llamado al crear un evento — notifica a los miembros de la contraparte
export async function notificarEventoVinculado(evento, usuarioId) {
  const { iniciador, proyecto_id, espacio_id, id: eventoId } = evento;
  if (iniciador === 'proyecto' && espacio_id) {
    await crearParaMiembros('espacio', espacio_id, 'evento_vinculado', eventoId, [usuarioId]);
  } else if (iniciador === 'espacio' && proyecto_id) {
    await crearParaMiembros('proyecto', proyecto_id, 'evento_vinculado', eventoId, [usuarioId]);
  }
}

// Llamado al responder una confirmación — notifica al iniciador
export async function notificarConfirmacionRecibida(confirmacion) {
  const { data: evento } = await supabase
    .from('eventos')
    .select('iniciador, proyecto_id, espacio_id')
    .eq('id', confirmacion.evento_id)
    .single();
  if (!evento) return;
  const tipo = evento.iniciador;
  const entidadId = tipo === 'proyecto' ? evento.proyecto_id : evento.espacio_id;
  await crearParaMiembros(tipo, entidadId, 'confirmacion_recibida', confirmacion.evento_id);
}

// Llamado al aprobar un evento — notifica al iniciador
export async function notificarEventoAprobado(evento) {
  const tipo = evento.iniciador;
  const entidadId = tipo === 'proyecto' ? evento.proyecto_id : evento.espacio_id;
  await crearParaMiembros(tipo, entidadId, 'evento_aprobado', evento.id);
}

// Llamado al invitar — notifica si el usuario ya existe
export async function notificarInvitacionRecibida(usuarioId, entidadId) {
  await crear(usuarioId, 'invitacion_recibida', entidadId);
}

export async function notificarAdminEventoPendiente(eventoId) {
  const { data: admins } = await supabase
    .from('usuarios')
    .select('id')
    .eq('es_admin', true);
  if (!admins?.length) return;
  await supabase.from('notificaciones').insert(
    admins.map(a => ({ usuario_id: a.id, tipo: 'evento_pendiente', referencia_id: eventoId }))
  );
}

export async function listar(usuarioId) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return data;
}

export async function marcarLeida(id, usuarioId) {
  await supabase.from('notificaciones').update({ leida: true }).match({ id, usuario_id: usuarioId });
}

export async function marcarTodasLeidas(usuarioId) {
  await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', usuarioId);
}
