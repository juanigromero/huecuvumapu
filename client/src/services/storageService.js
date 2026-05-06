import { supabase } from '../lib/supabase';

export async function subirImagen(archivo, carpeta) {
  const ext = archivo.name.split('.').pop();
  const nombre = `${carpeta}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('imagenes')
    .upload(nombre, archivo, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('imagenes').getPublicUrl(nombre);
  return data.publicUrl;
}
