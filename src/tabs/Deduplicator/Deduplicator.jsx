import { useState, useCallback } from 'react'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import IOCButton from '../../components/IOCButton/IOCButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './Deduplicator.module.css'

const TYPE_CHECKS = [
  { key:'IPv4',   re:/^(\d{1,3}\.){3}\d{1,3}$/,             norm:s=>s.trim(),          color:'#4a90d9' },
  { key:'Email',  re:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,           norm:s=>s.toLowerCase(),   color:'#f4a261' },
  { key:'SHA512', re:/^[a-fA-F0-9]{128}$/,                   norm:s=>s.toUpperCase(),   color:'#9b59f5' },
  { key:'SHA256', re:/^[a-fA-F0-9]{64}$/,                    norm:s=>s.toUpperCase(),   color:'#9b59f5' },
  { key:'SHA1',   re:/^[a-fA-F0-9]{40}$/,                    norm:s=>s.toUpperCase(),   color:'#9b59f5' },
  { key:'MD5',    re:/^[a-fA-F0-9]{32}$/,                    norm:s=>s.toUpperCase(),   color:'#9b59f5' },
  { key:'Domain', re:/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,  norm:s=>s.toLowerCase(),   color:'#06d6a0' },
  { key:'URL',    re:/^https?:\/\//i,                        norm:s=>s.toLowerCase(),   color:'#ef233c' },
]

function classify(line) {
  const s = line.trim()
  for (const t of TYPE_CHECKS) {
    if (t.re.test(s)) return { type:t.key, normalized:t.norm(s), color:t.color }
  }
  return { type:'Other', normalized:s, color:'#888' }
}

export default function Deduplicator({ log }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const process = useCallback(() => {
    if (!input.trim()) return
    const lines = input.split('\n').map(l=>l.trim()).filter(Boolean)
    const seen = new Map()
    const groups = {}
    let dupes = 0

    lines.forEach(line => {
      const { type, normalized, color } = classify(line)
      const key = normalized.toLowerCase()
      if (seen.has(key)) { dupes++; return }
      seen.set(key, true)
      if (!groups[type]) groups[type] = { color, items:[] }
      groups[type].items.push({ original:line, normalized, wasNormalized: normalized!==line })
    })

    const normCount = [...Object.values(groups)].flatMap(g=>g.items).filter(i=>i.wasNormalized).length
    setResult({ groups, totalIn:lines.length, unique:seen.size, dupes, normalized:normCount })
    if (log) log({ tab:'IOC Dedup', operation:'Deduplicate', input:input.slice(0,100), output:`${seen.size} unique` })
  }, [input, log])

  useCtrlEnter(process)

  const allUnique = result ? Object.values(result.groups).flatMap(g=>g.items.map(i=>i.normalized)).join('\n') : ''

  const downloadCSV = () => {
    if (!result) return
    const rows = [['type','normalized']]
    Object.entries(result.groups).forEach(([type,g]) => g.items.forEach(i=>rows.push([type,i.normalized])))
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='iocs-deduped.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.heroIcon}>🎯</span>
        <div>
          <div className={styles.heroTitle}>IOC Deduplicator</div>
          <div className={styles.heroSub}>Paste IOCs from multiple reports — auto-deduplicates, normalizes case, groups by type.</div>
        </div>
      </div>
      <div>
        <div className={styles.label}>PASTE IOCS — ONE PER LINE</div>
        <textarea className={styles.textarea} rows={10} value={input} onChange={e=>setInput(e.target.value)}
          placeholder={'8.8.8.8\nevil.com\n8.8.8.8\nEVIL.COM\n5d41402abc4b2a76b9719d911017c592\nattacker@evil.com\n5D41402ABC4B2A76B9719D911017C592'} />
      </div>
      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={process}>⚡ Deduplicate <span className={styles.hint}>Ctrl+Enter</span></button>
        <button className={styles.btnClear} onClick={()=>{setInput('');setResult(null)}}>🗑 Clear</button>
        {result && <><button className={styles.btnCSV} onClick={downloadCSV}>⬇ CSV</button><CopyButton text={allUnique} label="Copy All" /><IOCButton data={allUnique} /></>}
      </div>
      {result && (
        <div className={styles.results}>
          <div className={styles.stats}>
            {[{label:'Total Input',val:result.totalIn,color:'var(--ac)'},{label:'Unique',val:result.unique,color:'var(--grn)'},{label:'Duplicates',val:result.dupes,color:'var(--red)'},{label:'Normalized',val:result.normalized,color:'var(--ylw)'}].map(s=>(
              <div key={s.label} className={styles.stat}>
                <div className={styles.statNum} style={{color:s.color}}>{s.val}</div>
                <div className={styles.statLbl}>{s.label}</div>
              </div>
            ))}
          </div>
          {Object.entries(result.groups).map(([type,g])=>(
            <div key={type} className={styles.group}>
              <div className={styles.groupHead} style={{color:g.color}}>
                {type} <span className={styles.groupCount}>{g.items.length}</span>
                <CopyButton text={g.items.map(i=>i.normalized).join('\n')} label={`Copy ${type}`} />
              </div>
              {g.items.map((item,i)=>(
                <div key={i} className={styles.item}>
                  <span className={styles.itemVal}>{item.normalized}</span>
                  {item.wasNormalized && <span className={styles.normBadge}>normalized</span>}
                  <CopyButton text={item.normalized} label="Copy" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
