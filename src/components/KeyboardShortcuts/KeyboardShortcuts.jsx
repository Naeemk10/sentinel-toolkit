import styles from './KeyboardShortcuts.module.css'

const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], desc: 'Process / Analyse' },
  { keys: ['Ctrl', 'K'],     desc: 'Focus input field' },
  { keys: ['?'],             desc: 'Toggle shortcuts' },
  { keys: ['Esc'],           desc: 'Close modal' },
  { keys: ['Ctrl', 'C'],     desc: 'Copy output (when focused)' },
]

export default function KeyboardShortcuts({ open, onClose }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Keyboard Shortcuts</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>
        <div className={styles.list}>
          {SHORTCUTS.map((s, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.keys}>
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className={styles.key}>{k}</kbd>
                    {j < s.keys.length - 1 && <span className={styles.plus}>+</span>}
                  </span>
                ))}
              </div>
              <span className={styles.desc}>{s.desc}</span>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          Press <kbd className={styles.key}>?</kbd> anytime to toggle this panel
        </div>
      </div>
    </div>
  )
}
