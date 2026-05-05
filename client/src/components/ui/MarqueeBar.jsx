import styles from './MarqueeBar.module.css';

const items = ['música', 'artes visuales', 'teatro', 'cultura popular', 'bahía blanca', 'agenda cultural', 'música', 'artes visuales', 'teatro', 'cultura popular', 'bahía blanca', 'agenda cultural'];

export default function MarqueeBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {items.map((item, i) => (
          <span key={i} className={styles.item}>
            {item} <span className={styles.sep}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
