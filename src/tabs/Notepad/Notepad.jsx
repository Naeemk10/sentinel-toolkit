import { useState, useCallback } from 'react'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import IOCButton from '../../components/IOCButton/IOCButton.jsx'
import styles from './Notepad.module.css'

const PATTERNS = [
  { re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,           label: 'IPv4',   color: '#4a90d9' },
  { re: /\b[a-fA-F0-9]{128}\b/g,                   label: 'SHA512', color: '#9b59f5' },
  { re: /\b[a-fA-F0-9]{64}\b/g,                    label: 'SHA256', color: '#9b59f5' },
  { re: /\b[a-fA-F0-9]{40}\b/g,                    label: 'SHA1',   color: '#9b59f5' },
  { re: /\b[a-fA-F0-9]{32}\b/g,                    label: 'MD5',    color: '#9b59f5' },
  { re: /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g,           label: 'Email',  color: '#f4a261' },
  { re: /https?:\/\/\S+/gi,                         label: 'URL',    color: '#ef233c' },
  { re: /\b(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|co|uk|ru|cn|de|fr)\b/gi, label: 'Domain', color: '#06d6a0' },
]

function buildTagCounts(text) {
  const counts = {}
  PATTERNS.forEach(({ re, label }) => {
    const matches = text.match(new RegExp(re.source, re.flags)) || []
    if (matches.length) counts[label] = (counts[label] || 0) + matches.length
  })
  return counts
}

function buildHighlighted(text) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  let html = esc(text)
  PATTERNS.forEach(({ re, color }) => {
    const matches = [...new Set((text.match(new RegExp(re.source, re.flags)) || []))]
    matches.forEach(m => {
      const safe = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      html = html.replace(new RegExp(safe, 'g'),
        `<mark style="background:${color}22;color:${color};padding:1px 4px;border-radius:3px;font-weight:600;font-style:normal;">${esc(m)}</mark>`)
    })
  })
  return html.replace(/\n/g, '<br>')
}

function extractAll(text) {
  const all = []
  PATTERNS.forEach(({ re }) => {
    const matches = text.match(new RegExp(re.source, re.flags)) || []
    all.push(...matches)
  })
  return [...new Set(all)].join('\n')
}

export default function Notepad() {
  const [text, setText] = useState('')
  const counts = buildTagCounts(text)
  const highlighted = buildHighlighted(text)
  const allIOCs = extractAll(text)
  const totalFound = Object.values(counts).reduce((s, v) => s + v, 0)

  const handleChange = useCallback((e) => setText(e.target.value), [])

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.heroIcon}>🕵️</span>
        <div>
          <div className={styles.heroTitle}>Analyst Notepad</div>
          <div className={styles.heroSub}>Type investigation notes — IPs, hashes, domains, URLs and emails auto-highlight in real time.</div>
        </div>
      </div>

      <div className={styles.panels}>
        <div>
          <div className={styles.label}>INVESTIGATION NOTES</div>
          <textarea className={styles.textarea} rows={16} value={text} onChange={handleChange}
            placeholder={'Start typing your notes...\n\nSuspicious traffic from 192.168.1.105\nConnecting to evil.com and 8.8.8.8\nHash: 5d41402abc4b2a76b9719d911017c592\nEmail: attacker@evil.com'} />
        </div>
        <div>
          <div className={styles.label}>HIGHLIGHTED OUTPUT</div>
          <div className={styles.preview}
            dangerouslySetInnerHTML={{ __html: highlighted || '<span style="color:var(--dim)">IOCs highlight as you type...</span>' }} />
        </div>
      </div>

      {totalFound > 0 && (
        <div className={styles.tagRow}>
          {Object.entries(counts).map(([label, count]) => {
            const p = PATTERNS.find(x => x.label === label)
            return <span key={label} className={styles.tag} style={{ color: p?.color, borderColor: p?.color + '44', background: p?.color + '11' }}>{label}: {count}</span>
          })}
          <span className={styles.total}>{totalFound} IOC{totalFound !== 1 ? 's' : ''} found</span>
        </div>
      )}

      <div className={styles.actions}>
        <CopyButton text={text} label="Copy Notes" />
        <CopyButton text={allIOCs} label="Copy IOCs Only" />
        <IOCButton data={allIOCs} disabled={!allIOCs} />
        <button className={styles.btnClear} onClick={() => setText('')}>🗑 Clear</button>
      </div>
    </div>
  )
}
