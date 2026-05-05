import { supabase } from '../config/db.js';

export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  const token = auth.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  // Siempre exponemos el auth user por si el perfil no existe aún
  req.authUserId = data.user.id;
  req.authEmail = data.user.email;

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado en el sistema' });

  req.user = usuario;
  next();
}

// Versión que permite pasar sin perfil (solo para setup-profile)
export async function authenticateOrSetup(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  const token = auth.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  req.authUserId = data.user.id;
  req.authEmail = data.user.email;

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  req.user = usuario || null;
  next();
}
