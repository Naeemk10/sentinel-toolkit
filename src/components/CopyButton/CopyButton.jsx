import { useClipboard } from '../../hooks/useClipboard.js'
import styles from './CopyButton.module.css'

export default function CopyButton({ text, label = 'Copy' }) {
  const { copied, copy } = useClipboard()
  return (
    <button
      className={`${styles.btn} ${copied ? styles.copied : ''}`}
      onClick={() => copy(text)}
      disabled={!text}
    >
      {copied ? '✓ Copied' : `📋 ${label}`}
    </button>
  )
}
