import { useState } from 'react'
import { generateMarkdown, generateHTML, downloadFile } from './session.utils.js'
import { useClipboard } from '../../hooks/useClipboard.js'
import styles from './SessionReport.module.css'

export default function SessionReport({ sessions, onClear }) {
  const [open, setOpen] = useState(false)
  const { copied, copy } = useClipboard()

  if (sessions.length === 0) return null

  const handleMarkdown = () => downloadFile(generateMarkdown(sessions), 'soc-session-report.md', 'text/markdown')
  const handleHTML     = () => downloadFile(generateHTML(sessions), 'soc-session-report.html', 'text/html')
  const handleCopy     = () => copy(generateMarkdown(sessions))

  const scored = sessions.filter(s => s.suspicionScore !== null)
  const maxScore = scored.length ? Math.max(...scored.map(s => s.suspicionScore)) : null

  return (
    <>
      {/* Floating button */}
      <button className={styles.fab} onClick={() => setOpen(true)} title="View Session Report">
        📼 <span className={styles.fabCount}>{sessions.length}</span>
      </button>

      {/* Modal */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>📼 Session Report</div>
                <div className={styles.modalSub}>{sessions.length} operations logged{maxScore !== null ? ` · Max score: ${maxScore}/100` : ''}</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className={styles.exportRow}>
              <button className={styles.exportBtn} onClick={handleMarkdown}>⬇ Markdown</button>
              <button className={styles.exportBtn} onClick={handleHTML}>⬇ HTML Report</button>
              <button className={`${styles.exportBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button className={styles.clearBtn} onClick={() => { onClear(); setOpen(false) }}>🗑 Clear Session</button>
            </div>

            <div className={styles.log}>
              {sessions.map((s, i) => (
                <div key={i} className={styles.logEntry}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTime}>{s.timestamp}</span>
                    <span className={styles.logTab}>{s.tab}</span>
                    <span className={styles.logOp}>{s.operation}</span>
                    {s.suspicionScore !== null && (
                      <span className={styles.logScore} style={{
                        color: s.suspicionScore > 75 ? '#ef233c' : s.suspicionScore > 50 ? '#ef7c00' : s.suspicionScore > 25 ? '#f4a261' : '#06d6a0'
                      }}>
                        {s.suspicionScore}/100
                      </span>
                    )}
                  </div>
                  {s.input && <div className={styles.logInput}>{s.input.slice(0, 120)}{s.input.length > 120 ? '…' : ''}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
