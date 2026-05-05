import { useState, useEffect } from 'react';

export function useNominatim(query, ciudad = 'Bahía Blanca') {
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResultados([]); return; }

    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const q = encodeURIComponent(`${query}, ${ciudad}, Argentina`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await res.json();
        setResultados(data.map(r => ({
          nombre: r.namedetails?.name || r.name || query,
          direccion: [r.address?.road, r.address?.house_number].filter(Boolean).join(' ') || r.display_name.split(',')[0],
          display: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        })));
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
