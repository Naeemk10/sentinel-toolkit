import styles from './PillSelector.module.css'

export default function PillSelector({ options, value, onChange }) {
  return (
    <div className={styles.pills}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={`${styles.pill} ${value === opt.value ? styles.active : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
