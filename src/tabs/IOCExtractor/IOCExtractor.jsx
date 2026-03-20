import { useState, useCallback } from 'react'
import { extractIOCs, toCSV, countTotal } from './ioc.utils.js'
import { formatIOCsForSentinel } from '../../utils/ioc-sentinel.js'
import IOCButton from '../../components/IOCButton/IOCButton.jsx'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './IOCExtractor.module.css'

const TYPE_META = {
  urls:    { label: 'URLs',    color: '#4a90d9' },
  ips:     { label: 'IPv4',    color: '#06d6a0' },
  ipv6:    { label: 'IPv6',    color: '#00d4ff' },
  domains: { label: 'Domains', color: '#9b59f5' },
  emails:  { label: 'Emails',  color: '#f4a261' },
  md5:     { label: 'MD5',     color: '#ef233c' },
  sha1:    { label: 'SHA1',    color: '#ef233c' },
  sha256:  { label: 'SHA256',  color: '#ef233c' },
  sha512:  { label: 'SHA512',  color: '#ef233c' },
}

export default function IOCExtractor() {
  const [input, setInput]   = useState('')
  const [results, setResults] = useState(null)
  const [filter, setFilter] = useState('all')

  const process = useCallback(() => {
    if (!input.trim()) return
    setResults(extractIOCs(input))
  }, [input])

  useCtrlEnter(process)

  const clear = () => { setInput(''); setResults(null); setFilter('all') }

  const downloadCSV = () => {
    if (!results) return
    const csv = toCSV(results)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'iocs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const allIOCs = results ? formatIOCsForSentinel(results) : ''
  const total   = results ? countTotal(results) : 0

  const activeTypes = results
    ? Object.entries(results).filter(([, v]) => v.length > 0)
    : []

  const visibleTypes = filter === 'all' ? activeTypes : activeTypes.filter(([k]) => k === filter)

  return (
    <div className={styles.wrap}>
      <div className={styles.inputArea}>
        <div className={styles.label}>PASTE ANY TEXT BLOB — EMAILS, LOGS, REPORTS</div>
        <textarea
          className={styles.textarea}
          rows={10}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'Paste any blob of text — emails, logs, threat reports, pastes...\n\nThe extractor will auto-find all IOCs.'}
        />
      </div>

      <div className={styles.actionRow}>
        <button className={styles.btnProcess} onClick={process}>⚡ Extract IOCs <span className={styles.hint}>Ctrl+Enter</span></button>
        <button className={styles.btnClear} onClick={clear}>🗑 Clear</button>
        {results && <button className={styles.btnCSV} onClick={downloadCSV}>⬇ Export CSV</button>}
        {results && <IOCButton data={allIOCs} />}
      </div>

      {results && (
        <div className={styles.results}>
          <div className={styles.summary}>
            <span className={styles.totalBadge}>{total} IOC{total !== 1 ? 's' : ''} found</span>
            <div className={styles.filterPills}>
              <button className={`${styles.fpill} ${filter === 'all' ? styles.factive : ''}`} onClick={() => setFilter('all')}>All</button>
              {activeTypes.map(([key, vals]) => (
                <button key={key} className={`${styles.fpill} ${filter === key ? styles.factive : ''}`} onClick={() => setFilter(key)}
                  style={filter === key ? {color: TYPE_META[key]?.color, borderColor: TYPE_META[key]?.color + '66'} : {}}>
                  {TYPE_META[key]?.label} <span className={styles.count}>{vals.length}</span>
                </button>
              ))}
            </div>
          </div>

          {visibleTypes.length === 0 && (
            <div className={styles.empty}>No IOCs found in this text</div>
          )}

          {visibleTypes.map(([key, vals]) => (
            <div key={key} className={styles.group}>
              <div className={styles.groupHeader} style={{color: TYPE_META[key]?.color}}>
                {TYPE_META[key]?.label} <span className={styles.groupCount}>{vals.length}</span>
                <CopyButton text={vals.join('\n')} label={`Copy ${TYPE_META[key]?.label}`} />
              </div>
              <div className={styles.iocList}>
                {vals.map((v, i) => (
                  <div key={i} className={styles.iocItem}>
                    <span className={styles.iocVal}>{v}</span>
                    <CopyButton text={v} label="Copy" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
