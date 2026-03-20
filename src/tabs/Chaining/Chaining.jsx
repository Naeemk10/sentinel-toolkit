import { useState, useCallback } from 'react'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import IOCButton from '../../components/IOCButton/IOCButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './Chaining.module.css'

const ALL_OPS = [
  { id: 'defang',    label: '🔗 Defang',         fn: v => v.replace(/https/gi,'hxxps').replace(/http/gi,'hxxp').replace(/\./g,'[.]').replace(/:\/\//g,'[://]').replace(/@/g,'[@]') },
  { id: 'refang',    label: '🔓 Re-Fang',         fn: v => v.replace(/hxxps/gi,'https').replace(/hxxp/gi,'http').replace(/\[\.]/g,'.').replace(/\[:\/\/]/g,'://').replace(/\[@]/g,'@') },
  { id: 'b64enc',    label: '🔒 Base64 Encode',   fn: v => btoa(unescape(encodeURIComponent(v))) },
  { id: 'b64dec',    label: '🔓 Base64 Decode',   fn: v => { try { return decodeURIComponent(escape(atob(v))) } catch { return '⚠️ Invalid Base64' } } },
  { id: 'urlenc',    label: '🌐 URL Encode',      fn: v => encodeURIComponent(v) },
  { id: 'urldec',    label: '🌐 URL Decode',      fn: v => { try { return decodeURIComponent(v) } catch { return '⚠️ Invalid' } } },
  { id: 'rot13',     label: '🔄 ROT13',           fn: v => v.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b) }) },
  { id: 'reverse',   label: '↩ Reverse',          fn: v => [...v].reverse().join('') },
  { id: 'uppercase', label: '🔠 Uppercase',       fn: v => v.toUpperCase() },
  { id: 'lowercase', label: '🔡 Lowercase',       fn: v => v.toLowerCase() },
  { id: 'hexenc',    label: '🔢 Hex Encode',      fn: v => Array.from(v).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ') },
  { id: 'hexdec',    label: '🔢 Hex Decode',      fn: v => { try { return v.replace(/\s+/g,'').match(/.{2}/g).map(b=>String.fromCharCode(parseInt(b,16))).join('') } catch { return '⚠️ Invalid hex' } } },
]

export default function Chaining({ log }) {
  const [input, setInput]     = useState('')
  const [pipeline, setPipeline] = useState([])
  const [results, setResults] = useState([])

  const addOp = (op) => {
    if (pipeline.find(p => p.id === op.id)) return
    setPipeline(prev => [...prev, op])
    setResults([])
  }

  const removeOp = (id) => {
    setPipeline(prev => prev.filter(p => p.id !== id))
    setResults([])
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    setPipeline(prev => { const a = [...prev]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; return a })
    setResults([])
  }

  const moveDown = (idx) => {
    setPipeline(prev => { if(idx===prev.length-1) return prev; const a=[...prev]; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; return a })
    setResults([])
  }

  const run = useCallback(() => {
    if (!input.trim() || !pipeline.length) return
    let current = input
    const steps = []
    pipeline.forEach(op => {
      const out = op.fn(current)
      steps.push({ label: op.label, input: current, output: out })
      current = out
    })
    setResults(steps)
    if (log) log({ tab: 'Op Chaining', operation: pipeline.map(p=>p.label).join(' → '), input, output: current })
  }, [input, pipeline, log])

  useCtrlEnter(run)

  const finalOutput = results.length ? results[results.length-1].output : ''

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.heroIcon}>🔁</span>
        <div>
          <div className={styles.heroTitle}>Operation Chaining</div>
          <div className={styles.heroSub}>Chain multiple operations together — output of each step feeds into the next. Build your own transform pipeline.</div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={styles.label}>AVAILABLE OPERATIONS</div>
          <div className={styles.opGrid}>
            {ALL_OPS.map(op => (
              <button key={op.id}
                className={`${styles.opBtn} ${pipeline.find(p=>p.id===op.id) ? styles.opAdded : ''}`}
                onClick={() => addOp(op)}>
                {op.label}
                {pipeline.find(p=>p.id===op.id) && <span className={styles.addedTick}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.label}>YOUR PIPELINE {pipeline.length > 0 && `(${pipeline.length} steps)`}</div>
          {pipeline.length === 0 ? (
            <div className={styles.emptyPipeline}>Click operations on the left to add steps →</div>
          ) : (
            <div className={styles.pipeline}>
              {pipeline.map((op, idx) => (
                <div key={op.id} className={styles.pipeStep}>
                  <span className={styles.stepNum}>{idx + 1}</span>
                  <span className={styles.stepLabel}>{op.label}</span>
                  <div className={styles.stepActions}>
                    <button className={styles.stepBtn} onClick={() => moveUp(idx)} disabled={idx===0}>↑</button>
                    <button className={styles.stepBtn} onClick={() => moveDown(idx)} disabled={idx===pipeline.length-1}>↓</button>
                    <button className={styles.stepBtnRed} onClick={() => removeOp(op.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className={styles.label}>INPUT</div>
        <textarea className={styles.textarea} rows={3} value={input} onChange={e=>setInput(e.target.value)}
          placeholder="Paste your input here..." />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={run} disabled={!pipeline.length || !input.trim()}>
          ⚡ Run Pipeline <span className={styles.hint}>Ctrl+Enter</span>
        </button>
        <button className={styles.btnClear} onClick={() => { setInput(''); setResults([]); setPipeline([]) }}>🗑 Reset All</button>
        {finalOutput && <><CopyButton text={finalOutput} label="Copy Final" /><IOCButton data={finalOutput} /></>}
      </div>

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((step, i) => (
            <div key={i} className={styles.stepResult}>
              <div className={styles.stepResultHead}>
                <span className={styles.stepResultNum}>Step {i+1}</span>
                <span className={styles.stepResultLabel}>{step.label}</span>
                <CopyButton text={step.output} label="Copy" />
              </div>
              <div className={styles.stepResultBody}>{step.output.slice(0,300)}{step.output.length>300?'…':''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
