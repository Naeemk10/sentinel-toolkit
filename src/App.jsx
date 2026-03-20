import { useState, useEffect, useCallback } from 'react'
import Nav from './components/Nav/Nav.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import SessionReport from './components/SessionReport/SessionReport.jsx'
import KeyboardShortcuts from './components/KeyboardShortcuts/KeyboardShortcuts.jsx'
import DefangFang from './tabs/DefangFang/DefangFang.jsx'
import EncodeDecode from './tabs/EncodeDecode/EncodeDecode.jsx'
import IOCExtractor from './tabs/IOCExtractor/IOCExtractor.jsx'
import StringDecoder from './tabs/StringDecoder/StringDecoder.jsx'
import HashIP from './tabs/HashIP/HashIP.jsx'
import Triage from './tabs/Triage/Triage.jsx'
import Notepad from './tabs/Notepad/Notepad.jsx'
import Deduplicator from './tabs/Deduplicator/Deduplicator.jsx'
import { useSession } from './hooks/useSession.js'
import styles from './App.module.css'

const TAB_META = {
  triage:  { icon:'⚡', title:'Quick Triage',   badge:'HERO FEATURE', badgeNew:false, desc:'Paste anything — IP, hash, URL, domain, encoded string. Auto-detects and analyses everything instantly.' },
  defang:  { icon:'🔗', title:'Defang / Fang',  badge:'CORE',         badgeNew:false, desc:'Auto-detect and defang URLs, IPs and domains — or re-fang them back. Bulk paste supported.' },
  encode:  { icon:'🔒', title:'Encode / Decode', badge:'CORE',        badgeNew:false, desc:'Base64, URL, HTML, Hex, ROT13, Unicode — encode or decode any string in one click.' },
  ioc:     { icon:'🔍', title:'IOC Extract',     badge:'CORE',        badgeNew:false, desc:'Paste any blob of text. Auto-extracts IPs, domains, URLs, hashes and emails. Export as CSV.' },
  string:  { icon:'🧬', title:'String Decoder',  badge:'CORE',        badgeNew:false, desc:'PowerShell -enc decoder, XOR brute force, char codes, hex→ASCII, reverse, multi-layer.' },
  hash:    { icon:'🔢', title:'Hash & IP Tools', badge:'CORE',        badgeNew:false, desc:'Hash identify and generate, IP↔Hex, CIDR expand, private IP check, IP→binary.' },
  notepad: { icon:'🕵️', title:'Analyst Notepad', badge:'NEW',         badgeNew:true,  desc:'Type investigation notes freely. IPs, hashes, URLs and domains auto-highlight in real time.' },
  dedup:   { icon:'🎯', title:'IOC Deduplicator',badge:'NEW',         badgeNew:true,  desc:'Paste IOCs from multiple reports. Removes duplicates, normalizes format, groups by type.' },
}

function renderTab(id, log) {
  switch (id) {
    case 'triage':  return <Triage log={log} />
    case 'defang':  return <DefangFang log={log} />
    case 'encode':  return <EncodeDecode log={log} />
    case 'ioc':     return <IOCExtractor log={log} />
    case 'string':  return <StringDecoder log={log} />
    case 'hash':    return <HashIP log={log} />
    case 'notepad': return <Notepad log={log} />
    case 'dedup':   return <Deduplicator log={log} />
    default:        return null
  }
}

export default function App() {
  const [activeTab, setActiveTab]         = useState('triage')
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const { log, sessions, clearSessions }  = useSession()
  const meta = TAB_META[activeTab]

  const handleKey = useCallback((e) => {
    if (e.key === '?' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      setShortcutsOpen(o => !o)
    }
    if (e.key === 'Escape') setShortcutsOpen(false)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      document.querySelector('textarea')?.focus()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div className={styles.app}>
      <Nav onShortcuts={() => setShortcutsOpen(true)} />
      <div className={styles.body}>
        <Sidebar active={activeTab} onChange={setActiveTab} />
        <main className={styles.main}>
          <div className={styles.contentHeader}>
            <div className={styles.chTop}>
              <span className={styles.chIcon}>{meta.icon}</span>
              <span className={styles.chTitle}>{meta.title}</span>
              <span className={`${styles.chBadge} ${meta.badgeNew ? styles.chBadgeNew : ''}`}>
                {meta.badge}
              </span>
            </div>
            <p className={styles.chDesc}>{meta.desc}</p>
          </div>
          <div className={styles.content}>
            {renderTab(activeTab, log)}
          </div>
        </main>
      </div>
      <SessionReport sessions={sessions} onClear={clearSessions} />
      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}
