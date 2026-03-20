import styles from './Sidebar.module.css'

const CORE = [
  { id:'triage',  label:'Quick Triage',   icon:'⚡' },
  { id:'defang',  label:'Defang / Fang',  icon:'🔗' },
  { id:'encode',  label:'Encode / Decode', icon:'🔒' },
  { id:'ioc',     label:'IOC Extract',    icon:'🔍' },
  { id:'string',  label:'String Decoder', icon:'🧬' },
  { id:'hash',    label:'Hash & IP Tools',icon:'🔢' },
]

const ADV = [
  { id:'notepad', label:'Analyst Notepad',  icon:'🕵️', isNew:true },
  { id:'dedup',   label:'IOC Deduplicator', icon:'🎯', isNew:true },
]

export default function Sidebar({ active, onChange }) {
  const item = (tab) => (
    <button
      key={tab.id}
      className={`${styles.item} ${active===tab.id ? styles.active : ''}`}
      onClick={() => onChange(tab.id)}
      title={tab.label}
    >
      <span className={styles.icon}>{tab.icon}</span>
      <span className={styles.label}>{tab.label}</span>
      {tab.isNew && <span className={styles.newBadge}>NEW</span>}
    </button>
  )

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>CORE TOOLS</div>
      {CORE.map(item)}
      <div className={styles.section}>ADVANCED</div>
      {ADV.map(item)}
      <div className={styles.footer}>
        <div className={styles.offlineBadge}>
          <span className={styles.offlineDot}/>
          Offline ready
        </div>
      </div>
    </aside>
  )
}
