import { supabase } from '../config/db.js';

export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  const token = auth.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  req.user = usuario;
  next();
}
