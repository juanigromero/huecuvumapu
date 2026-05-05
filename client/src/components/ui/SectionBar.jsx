import styles from './SectionBar.module.css';

export default function SectionBar({ label, action }) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>{label}</span>
      {action && <span className={styles.action}>{action}</span>}
    </div>
  );
}
