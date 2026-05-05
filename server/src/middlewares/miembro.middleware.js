import { supabase } from '../config/db.js';

export function requireMiembro(tabla, idParam = 'id') {
  return async (req, res, next) => {
    const entidadId = req.params[idParam];
    const usuarioId = req.user.id;

    const { data } = await supabase
      .from(tabla)
      .select('rol_interno')
      .match({ [`${tabla === 'proyecto_miembros' ? 'proyecto' : 'espacio'}_id`]: entidadId, usuario_id: usuarioId })
      .single();

    if (!data) return res.status(403).json({ error: 'No sos miembro' });
    req.rolInterno = data.rol_interno;
    next();
  };
}
