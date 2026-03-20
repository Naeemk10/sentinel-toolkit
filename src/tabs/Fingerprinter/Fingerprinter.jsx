import { useState, useCallback } from 'react'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './Fingerprinter.module.css'

const EXAMPLES = [
  { label:'Base64',      val:'SGVsbG8gV29ybGQ=' },
  { label:'Double B64',  val:'U0dWc2JHOF9WMjlzYkdRPQ==' },
  { label:'URL Encoded', val:'Hello%20World%21' },
  { label:'Hex',         val:'48 65 6c 6c 6f 20 57 6f 72 6c 64' },
  { label:'HTML Entity', val:'&lt;script&gt;alert(1)&lt;/script&gt;' },
]

function detectLayers(input) {
  const s = input.trim()
  const layers = []
  const b64re = /^[A-Za-z0-9+/=_-]+$/
  if (b64re.test(s) && s.length >= 4) {
    try {
      const d = decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))
      layers.push({ name:'Base64', icon:'🔤', color:'#9b59f5', conf:92, decoded:d })
    } catch(_e) { /* ignore */ }
  }
  if (/%[0-9a-fA-F]{2}/.test(s)) {
    try { layers.push({ name:'URL Encoded', icon:'🌐', color:'#4a90d9', conf:95, decoded:decodeURIComponent(s) }) } catch(_e) { /* ignore */ }
  }
  if (/&(?:#\d+|[a-z]+);/i.test(s)) {
    const d = s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#(\d+);/g,(_,c)=>String.fromCharCode(+c))
    layers.push({ name:'HTML Entities', icon:'🏷', color:'#f4a261', conf:94, decoded:d })
  }
  if (/^(?:[0-9a-fA-F]{2}\s*)+$/.test(s)) {
    try {
      const d = s.replace(/\s/g,'').match(/.{2}/g).map(b=>String.fromCharCode(parseInt(b,16))).join('')
      layers.push({ name:'Hex Bytes', icon:'🔢', color:'#00d4ff', conf:90, decoded:d })
    } catch(_e) { /* ignore */ }
  }
  if (/\\u[0-9a-fA-F]{4}/.test(s)) {
    const d = s.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)))
    layers.push({ name:'Unicode Escape', icon:'✨', color:'#06d6a0', conf:96, decoded:d })
  }
  if (/powershell|invoke-|iex|-enc/i.test(s)) {
    layers.push({ name:'PowerShell Pattern', icon:'💻', color:'#ef233c', conf:88, decoded:'Possible encoded PS command' })
  }
  if (!layers.length) layers.push({ name:'Plain text / No encoding', icon:'📄', color:'#888', conf:5, decoded:s })
  return layers.sort((a,b)=>b.conf-a.conf)
}

export default function Fingerprinter({ log }) {
  const [input, setInput] = useState('')
  const [layers, setLayers] = useState(null)

  const process = useCallback(() => {
    if (!input.trim()) return
    const detected = detectLayers(input.trim())
    setLayers(detected)
    if (log) log({ tab:'Enc Fingerprint', operation:'Fingerprint', input:input.trim(), output:detected.map(l=>l.name).join(', ') })
  }, [input, log])

  useCtrlEnter(process)
  const clear = () => { setInput(''); setLayers(null) }
  const chain = layers ? layers.filter(l=>l.conf>50).map(l=>l.name).join(' → ') : ''

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>📊</div>
        <div>
          <div className={styles.heroTitle}>Encoding Fingerprinter</div>
          <div className={styles.heroSub}>Paste any string — detects ALL encoding layers with confidence scores. Shows the full decode chain.</div>
        </div>
      </div>
      <div className={styles.examples}>
        {EXAMPLES.map((ex,i)=>(
          <button key={i} className={styles.exBtn} onClick={()=>{setInput(ex.val);setLayers(null)}}>{ex.label}</button>
        ))}
      </div>
      <div>
        <div className={styles.label}>INPUT</div>
        <textarea className={styles.textarea} rows={4} value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste any encoded string..." />
      </div>
      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={process}>⚡ Fingerprint <span className={styles.hint}>Ctrl+Enter</span></button>
        <button className={styles.btnClear} onClick={clear}>🗑 Clear</button>
        {layers && <CopyButton text={layers.map(l=>`${l.name} (${l.conf}%): ${l.decoded}`).join('\n')} label="Copy Results" />}
      </div>
      {layers && (
        <div className={styles.results}>
          {chain && (
            <div className={styles.chainRow}>
              <span className={styles.chainLabel}>DECODE CHAIN</span>
              {chain.split(' → ').map((c,i,arr)=>(
                <span key={i} style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={styles.chainPill}>{c}</span>
                  {i<arr.length-1 && <span className={styles.chainArr}>→</span>}
                </span>
              ))}
            </div>
          )}
          <div className={styles.layers}>
            {layers.map((l,i)=>(
              <div key={i} className={styles.layer}>
                <div className={styles.layerHead}>
                  <span style={{fontSize:16}}>{l.icon}</span>
                  <span className={styles.layerName} style={{color:l.color}}>{l.name}</span>
                  <div className={styles.barWrap}>
                    <div className={styles.bar}><div className={styles.barFill} style={{width:l.conf+'%',background:l.color}}/></div>
                  </div>
                  <span className={styles.pct}>{l.conf}%</span>
                  <CopyButton text={l.decoded} label="Copy" />
                </div>
                <div className={styles.decoded}>
                  <span className={styles.decodedLabel}>Decoded:</span>
                  <span style={{color:l.color}}>{l.decoded.slice(0,150)}{l.decoded.length>150?'…':''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
