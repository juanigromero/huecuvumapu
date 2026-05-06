import { useState, useEffect } from 'react';

const BAHIA_LAT = -38.7196;
const BAHIA_LNG = -62.2724;

function mapearPhoton(r) {
  const p = r.properties;
  return {
    nombre: p.name || p.city || '',
    direccion: [p.street, p.housenumber].filter(Boolean).join(' ') || p.district || '',
    lat: r.geometry.coordinates[1],
    lng: r.geometry.coordinates[0],
    osm_id: r.properties.osm_id,
  };
}

export function useNominatim(query) {
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [terminado, setTerminado] = useState(false); // true cuando la búsqueda completó al menos una vez

  useEffect(() => {
    if (!query || query.length < 2) {
      setResultados([]);
      setTerminado(false);
      return;
    }

    setBuscando(true);
    setTerminado(false);

    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          lat: BAHIA_LAT,
          lon: BAHIA_LNG,
          limit: 6,
          lang: 'es',
        });
        const res = await fetch(`https://photon.komoot.io/api/?${params}`);
        const data = await res.json();

        const vistos = new Set();
        const unicos = data.features
          .filter(r => r.properties.name)
          .map(mapearPhoton)
          .filter(r => {
            if (vistos.has(r.osm_id)) return false;
            vistos.add(r.osm_id);
            return true;
          });

        setResultados(unicos);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
        setTerminado(true);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [query]);

  return { resultados, buscando, terminado };
}
