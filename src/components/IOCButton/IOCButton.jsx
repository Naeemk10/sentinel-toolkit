import { sendToIOCSentinel } from '../../utils/ioc-sentinel.js'
import styles from './IOCButton.module.css'

export default function IOCButton({ data, disabled }) {
  return (
    <button
      className={styles.btn}
      onClick={() => sendToIOCSentinel(data)}
      disabled={disabled || !data}
      title="Open in IOC Sentinel for threat intel lookup"
    >
      → Send to IOC Sentinel
    </button>
  )
}
