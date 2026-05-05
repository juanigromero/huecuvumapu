import styles from './Tag.module.css';

const categoriaClass = {
  musica: 'musica',
  visual: 'visual',
  teatro: 'teatro',
  popular: 'popular',
};

export default function Tag({ label }) {
  const cls = categoriaClass[label] || 'default';
  return <span className={`${styles.tag} ${styles[cls]}`}>{label}</span>;
}
