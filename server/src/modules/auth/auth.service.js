import { supabase } from '../../config/db.js';

export async function register({ email, password, nombre }) {
  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  // Crear perfil en tabla usuarios
  const { error: insertError } = await supabase.from('usuarios').insert({
    id: data.user.id,
    email,
    nombre: nombre || null,
  });
  if (insertError) throw new Error(insertError.message);

  // Iniciar sesión para obtener el token
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) throw new Error(loginError.message);

  return { user: loginData.user, session: loginData.session };
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return { session: data.session, user: data.user };
}

export async function crearPerfil(id, email, nombre) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ id, email, nombre: nombre || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { usuario: data };
}
