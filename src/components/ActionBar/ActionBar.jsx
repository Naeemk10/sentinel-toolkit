import CopyButton from '../CopyButton/CopyButton.jsx'
import IOCButton from '../IOCButton/IOCButton.jsx'
import styles from './ActionBar.module.css'

export default function ActionBar({ onProcess, onClear, output, showIOC = true }) {
  return (
    <div className={styles.bar}>
      <button className={styles.btnProcess} onClick={onProcess}>
        ⚡ Process <span className={styles.hint}>Ctrl+Enter</span>
      </button>
      <CopyButton text={output} />
      <button className={styles.btnClear} onClick={onClear}>🗑 Clear</button>
      {showIOC && <IOCButton data={output} />}
    </div>
  )
}
