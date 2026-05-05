import { supabase } from '../../config/db.js';
import { env } from '../../config/env.js';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

async function enviarMailInvitacion({ email, token, entidad_tipo, entidadNombre }) {
  if (!env.SMTP_HOST) return; // Sin SMTP configurado, omitir silenciosamente

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  const link = `${env.CLIENT_URL}/invitacion/${token}`;

  await transporter.sendMail({
    from: env.SMTP_USER,
    to: email,
    subject: `Te invitaron a sumarte a ${entidadNombre} en Huecuvumapu`,
    text: `Fuiste invitado/a a formar parte de "${entidadNombre}" en Huecuvumapu.\n\nAceptá la invitación acá: ${link}\n\nEl link expira en 7 días.`,
  });
}

export async function invitar({ email, entidad_tipo, entidad_id, rol_interno = 'editor' }, usuarioId) {
  // Verificar que quien invita es owner
  const tabla = entidad_tipo === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
  const col = entidad_tipo === 'proyecto' ? 'proyecto_id' : 'espacio_id';

  const { data: membresia } = await supabase
    .from(tabla)
    .select('rol_interno')
    .match({ [col]: entidad_id, usuario_id: usuarioId })
    .single();

  if (membresia?.rol_interno !== 'owner') throw new Error('Solo el owner puede invitar miembros');

  // Obtener nombre de la entidad
  const tablaEntidad = entidad_tipo === 'proyecto' ? 'proyectos' : 'espacios';
  const { data: entidad } = await supabase.from(tablaEntidad).select('nombre').eq('id', entidad_id).single();

  // ¿El usuario ya existe?
  const { data: usuarioExistente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single();

  if (usuarioExistente) {
    // Agregar directo como miembro
    const { error } = await supabase.from(tabla).upsert({
      [col]: entidad_id,
      usuario_id: usuarioExistente.id,
      rol_interno,
    });
    if (error) throw new Error(error.message);
    return { resultado: 'agregado_directo' };
  }

  // Crear invitación pendiente con token
  const token = randomBytes(32).toString('hex');
  const expira_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('invitaciones_pendientes').insert({
    email,
    token,
    entidad_tipo,
    entidad_id,
    rol_interno,
    expira_at,
  });
  if (error) throw new Error(error.message);

  await enviarMailInvitacion({ email, token, entidad_tipo, entidadNombre: entidad?.nombre });

  return { resultado: 'invitacion_enviada', token };
}

export async function aceptar(token, usuarioId) {
  const { data: inv, error } = await supabase
    .from('invitaciones_pendientes')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();

  if (error || !inv) throw new Error('Invitación inválida o ya usada');
  if (new Date(inv.expira_at) < new Date()) throw new Error('La invitación expiró');

  const tabla = inv.entidad_tipo === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
  const col = inv.entidad_tipo === 'proyecto' ? 'proyecto_id' : 'espacio_id';

  await supabase.from(tabla).upsert({
    [col]: inv.entidad_id,
    usuario_id: usuarioId,
    rol_interno: inv.rol_interno,
  });

  await supabase.from('invitaciones_pendientes').update({ used: true }).eq('id', inv.id);

  return { entidad_tipo: inv.entidad_tipo, entidad_id: inv.entidad_id };
}

export async function obtenerPorToken(token) {
  const { data, error } = await supabase
    .from('invitaciones_pendientes')
    .select(`*, proyectos:entidad_id(nombre, handle), espacios:entidad_id(nombre, handle)`)
    .eq('token', token)
    .eq('used', false)
    .single();

  if (error || !data) throw new Error('Invitación inválida o ya usada');
  if (new Date(data.expira_at) < new Date()) throw new Error('La invitación expiró');
  return data;
}

// Llamado al registrarse: vincula invitaciones pendientes con ese email
export async function vincularInvitacionesPendientes(email, usuarioId) {
  const { data: pendientes } = await supabase
    .from('invitaciones_pendientes')
    .select('*')
    .eq('email', email)
    .eq('used', false);

  if (!pendientes?.length) return;

  for (const inv of pendientes) {
    if (new Date(inv.expira_at) < new Date()) continue;
    const tabla = inv.entidad_tipo === 'proyecto' ? 'proyecto_miembros' : 'espacio_miembros';
    const col = inv.entidad_tipo === 'proyecto' ? 'proyecto_id' : 'espacio_id';
    await supabase.from(tabla).upsert({ [col]: inv.entidad_id, usuario_id: usuarioId, rol_interno: inv.rol_interno });
    await supabase.from('invitaciones_pendientes').update({ used: true }).eq('id', inv.id);
  }
}
