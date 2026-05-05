import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
      <p className={styles.label}>Analysing file… {progress}%</p>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
