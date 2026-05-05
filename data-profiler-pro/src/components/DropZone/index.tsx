import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFile: (file: File) => void;
}

const ACCEPTED = ['.csv', '.xlsx', '.xls'];

export default function DropZone({ onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported file type "${ext}". Please use .csv, .xlsx, or .xls.`);
      return;
    }
    setError('');
    onFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div className={styles.icon}>📂</div>
      <p>Drop a CSV or Excel file here</p>
      <small>.csv · .xlsx · .xls — or click to browse</small>
      {error && <span className={styles.error}>{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
