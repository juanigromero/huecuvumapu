import { supabase } from '../../config/db.js';

export async function register({ email, password, nombre }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  await supabase.from('usuarios').insert({
    id: data.user.id,
    email,
    nombre: nombre || null,
  });

  return { user: data.user };
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return { session: data.session, user: data.user };
}
