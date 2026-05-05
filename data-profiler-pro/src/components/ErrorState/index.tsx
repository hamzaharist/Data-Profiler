import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message: string;
  onReset: () => void;
}

export default function ErrorState({ message, onReset }: ErrorStateProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>⚠️</div>
      <p className={styles.message}>{message}</p>
      <button className={styles.btn} onClick={onReset}>↩ Try another file</button>
    </div>
  );
}
