import styles from './TabBar.module.css'

export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className={styles.bar}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${tab.id === active ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
