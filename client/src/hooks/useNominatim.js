import { useState, useEffect } from 'react';

// Bounding box de Bahía Blanca para priorizar resultados locales
const BAHIA_VIEWBOX = '-62.40,-38.85,-62.10,-38.60';

async function buscarNominatim(q, extraParams = {}) {
  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: 5,
    addressdetails: 1,
    namedetails: 1,
    countrycodes: 'ar',
    ...extraParams,
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'es' },
  });
  return res.json();
}

function mapearResultado(r) {
  return {
    nombre: r.namedetails?.name || r.name || r.display_name.split(',')[0],
    direccion: [r.address?.road, r.address?.house_number].filter(Boolean).join(' ')
      || r.address?.suburb
      || r.display_name.split(',').slice(0, 2).join(',').trim(),
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    place_id: r.place_id,
  };
}

export function useNominatim(query, ciudad = 'Bahía Blanca') {
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResultados([]); return; }

    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        // Búsqueda 1: con ciudad en el viewbox de Bahía Blanca
        const [r1, r2] = await Promise.all([
          buscarNominatim(`${query}, ${ciudad}`, { viewbox: BAHIA_VIEWBOX, bounded: 0 }),
          buscarNominatim(query, { viewbox: BAHIA_VIEWBOX, bounded: 1 }),
        ]);

        // Combinar y deduplicar por place_id
        const todos = [...r1, ...r2];
        const vistos = new Set();
        const unicos = todos.filter(r => {
          if (vistos.has(r.place_id)) return false;
          vistos.add(r.place_id);
          return true;
        });

        setResultados(unicos.slice(0, 6).map(mapearResultado));
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query, ciudad]);

  return { resultados, buscando };
}
