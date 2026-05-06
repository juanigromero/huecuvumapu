import { useState, useEffect } from 'react';

// Photon (komoot) — OSM con Elasticsearch, mejor búsqueda fuzzy que Nominatim
// Completamente gratis, sin API key, sin cuenta
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

  useEffect(() => {
    if (!query || query.length < 2) { setResultados([]); return; }

    setBuscando(true);
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

        const resultados = data.features
          .filter(r => r.properties.name) // solo resultados con nombre
          .map(mapearPhoton);

        // Deduplicar por osm_id
        const vistos = new Set();
        const unicos = resultados.filter(r => {
          if (vistos.has(r.osm_id)) return false;
          vistos.add(r.osm_id);
          return true;
        });

        setResultados(unicos);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  return { resultados, buscando };
}
