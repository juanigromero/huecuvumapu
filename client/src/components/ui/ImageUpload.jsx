import { useRef, useState } from 'react';
import { subirImagen } from '../../services/storageService';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ valor, onChange, carpeta, tipo = 'cuadrada', label = 'Subir imagen' }) {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setSubiendo(true);
    setError(null);
    try {
      const url = await subirImagen(archivo, carpeta);
      onChange(url);
    } catch (err) {
      setError('Error al subir la imagen');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className={`${styles.wrap} ${tipo === 'cover' ? styles.wrapCover : styles.wrapCuadrada}`}>
      {valor ? (
        <div className={styles.preview} onClick={() => inputRef.current.click()}>
          <img src={valor} alt="preview" className={styles.img} />
          <div className={styles.overlay}>
            <span>{subiendo ? 'Subiendo...' : 'Cambiar'}</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.placeholder}
          onClick={() => inputRef.current.click()}
          disabled={subiendo}
        >
          {subiendo ? 'Subiendo...' : label}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.inputHidden}
        onChange={handleFile}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
