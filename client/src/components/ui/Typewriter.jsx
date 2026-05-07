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

  useEffect(() => {
    const palabra = PALABRAS[indice];
    let t;

    if (escribiendo) {
      if (texto.length < palabra.length) {
        t = setTimeout(() => setTexto(palabra.slice(0, texto.length + 1)), VELOCIDAD_ESCRIBIR);
      } else {
        // Palabra completa — esperar y empezar a borrar
        t = setTimeout(() => setEscribiendo(false), PAUSA_COMPLETA);
      }
    } else {
      if (texto.length > 0) {
        t = setTimeout(() => setTexto(t => t.slice(0, -1)), VELOCIDAD_BORRAR);
      } else {
        // Texto borrado — esperar y pasar a la siguiente palabra
        t = setTimeout(() => {
          setIndice(i => (i + 1) % PALABRAS.length);
          setEscribiendo(true);
        }, PAUSA_BORRADA);
      }
    }

    return () => clearTimeout(t);
  }, [texto, indice, escribiendo]);

  return (
    <div className={styles.wrap}>
      <span className={styles.estatico}>Interconectando</span>
      <span className={styles.animado}>
        {texto}
        <span className={styles.cursor} />
      </span>
    </div>
  );
}
