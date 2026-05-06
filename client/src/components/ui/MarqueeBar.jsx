import styles from './MarqueeBar.module.css';

const BASE = ['agenda cultural', 'música', 'artes visuales', 'teatro', 'cultura popular', 'bahía blanca'];

export default function MarqueeBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        {/* Dos copias idénticas — la animación mueve exactamente el ancho de una copia */}
        {[0, 1].map(copy => (
          <div key={copy} className={styles.group} aria-hidden={copy === 1}>
            {BASE.map((item, i) => (
              <span key={i} className={styles.item}>
                {item} <span className={styles.sep}>·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
