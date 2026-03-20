import styles from './IOPanel.module.css'

export default function IOPanel({ input, onInput, output, inputPlaceholder, outputPlaceholder, inputRows = 12, outputRows = 12 }) {
  return (
    <div className={styles.panels}>
      <div className={styles.panel}>
        <div className={styles.label}>INPUT</div>
        <textarea
          className={styles.textarea}
          rows={inputRows}
          value={input}
          onChange={e => onInput(e.target.value)}
          placeholder={inputPlaceholder}
        />
      </div>
      <div className={styles.panel}>
        <div className={styles.label}>OUTPUT</div>
        <textarea
          className={`${styles.textarea} ${styles.output}`}
          rows={outputRows}
          value={output}
          readOnly
          placeholder={outputPlaceholder || 'Output appears here...'}
        />
      </div>
    </div>
  )
}
