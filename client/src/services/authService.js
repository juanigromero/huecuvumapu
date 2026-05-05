import { supabase } from '../lib/supabase';

const API = import.meta.env.VITE_API_URL;

export async function register({ email, password, nombre }) {
  // 1. Crear usuario en Supabase Auth desde el cliente
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  // 2. Crear perfil en nuestra tabla via el backend (usa service key)
  const res = await fetch(`${API}/api/auth/setup-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({ nombre }),
  });
  const profile = await res.json();
  if (!res.ok) throw new Error(profile.error || 'Error al crear perfil');

  return { user: profile.usuario, session: data.session };
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Obtener perfil de nuestra tabla
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return { user: usuario || data.user, session: data.session };
}

export async function logoutSupabase() {
  await supabase.auth.signOut();
}
