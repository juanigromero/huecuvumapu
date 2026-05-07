import { useEffect, useState } from 'react';
import styles from './Typewriter.module.css';

const PALABRAS = ['Personas', 'Artistas', 'Productores', 'Actores', 'Espacios', 'Eventos'];

const VELOCIDAD_ESCRIBIR = 85;
const VELOCIDAD_BORRAR   = 45;
const PAUSA_COMPLETA     = 1600;
const PAUSA_BORRADA      = 400;

export default function Typewriter() {
  const [texto, setTexto] = useState('');
  const [indice, setIndice] = useState(0);
  const [escribiendo, setEscribiendo] = useState(true);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    if (pausa) return;

    const palabra = PALABRAS[indice];

    if (escribiendo) {
      if (texto.length < palabra.length) {
        const t = setTimeout(() => setTexto(palabra.slice(0, texto.length + 1)), VELOCIDAD_ESCRIBIR);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => { setPausa(false); setEscribiendo(false); }, PAUSA_COMPLETA);
        setPausa(true);
        return () => clearTimeout(t);
      }
    } else {
      if (texto.length > 0) {
        const t = setTimeout(() => setTexto(texto.slice(0, -1)), VELOCIDAD_BORRAR);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setIndice(i => (i + 1) % PALABRAS.length);
          setEscribiendo(true);
          setPausa(false);
        }, PAUSA_BORRADA);
        setPausa(true);
        return () => clearTimeout(t);
      }
    }
  }, [texto, indice, escribiendo, pausa]);

  return (
    <div className={styles.wrap}>
      <span className={styles.estatico}>Conectamos</span>
      <span className={styles.animado}>
        {texto}
        <span className={styles.cursor} />
      </span>
    </div>
  );
}
