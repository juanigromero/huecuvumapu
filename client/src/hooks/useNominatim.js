import { useState, useEffect } from 'react';

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

function mapear(r) {
  const nombreCrudo = r.namedetails?.name || r.name || '';
  const esNumero = /^\d+$/.test(nombreCrudo.trim());
  const direccion = [r.address?.road, r.address?.house_number].filter(Boolean).join(' ')
    || r.address?.suburb
    || r.display_name.split(',').slice(0, 2).join(',').trim();

  // Si el "nombre" es solo un número (nro de casa), usamos la dirección como nombre
  const nombre = nombreCrudo && !esNumero ? nombreCrudo : direccion;

  return { nombre, direccion, lat: parseFloat(r.lat), lng: parseFloat(r.lon), place_id: r.place_id };
}

export function useNominatim(query, ciudad = 'Bahía Blanca') {
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [terminado, setTerminado] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResultados([]);
      setBuscando(false);
      setTerminado(false);
      return;
    }

    setBuscando(true);
    setTerminado(false);

    const t = setTimeout(async () => {
      try {
        const [r1, r2] = await Promise.all([
          buscarNominatim(`${query}, ${ciudad}`, { viewbox: BAHIA_VIEWBOX, bounded: 0 }),
          buscarNominatim(query, { viewbox: BAHIA_VIEWBOX, bounded: 1 }),
        ]);

        const vistos = new Set();
        const unicos = [...r1, ...r2].filter(r => {
          if (vistos.has(r.place_id)) return false;
          vistos.add(r.place_id);
          return true;
        });

        setResultados(unicos.slice(0, 6).map(mapear));
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
        setTerminado(true);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [query, ciudad]);

  return { resultados, buscando, terminado };
}
