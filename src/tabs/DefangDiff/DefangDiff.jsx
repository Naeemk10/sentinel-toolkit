import { useState, useCallback } from 'react'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './DefangDiff.module.css'

const EXAMPLES = [
  { label:'URL',   val:'http://malicious-site.com/payload.exe' },
  { label:'HTTPS', val:'https://evil.example.com/c2/beacon' },
  { label:'Email', val:'admin@evil-domain.com' },
  { label:'IP',    val:'192.168.1.105' },
  { label:'Bulk',  val:'http://evil.com\nhttps://malware.net/pay\nadmin@threat.io\n10.0.0.1' },
]

const RULES = [
  { from:'https', to:'hxxps', desc:'Protocol' },
  { from:'http',  to:'hxxp',  desc:'Protocol' },
  { from:'.',     to:'[.]',   desc:'Dot'      },
  { from:'://',   to:'[://]', desc:'Scheme'   },
  { from:'@',     to:'[@]',   desc:'At sign'  },
]

function applyDefang(line) {
  let out = line
  const changes = []
  RULES.forEach(r => {
    const re = new RegExp(r.from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi')
    if (re.test(out)) { out = out.replace(re, r.to); changes.push(r) }
  })
  return { defanged:out, changes }
}

function highlightOrig(line) {
  let h = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  RULES.forEach(r => {
    const safe = r.from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
    h = h.replace(new RegExp(safe,'gi'), m=>`<span style="background:rgba(239,35,60,.2);color:#ef233c;padding:1px 2px;border-radius:2px;text-decoration:line-through">${m}</span>`)
  })
  return h
}

function highlightDef(line) {
  let h = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  ;['hxxps','hxxp','[.]','[://]','[@]'].forEach(r => {
    const safe = r.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
    h = h.replace(new RegExp(safe,'gi'), m=>`<span style="background:rgba(6,214,160,.15);color:#06d6a0;padding:1px 2px;border-radius:2px;font-weight:600">${m}</span>`)
  })
  return h
}

export default function DefangDiff({ log }) {
  const [input, setInput]   = useState('')
  const [result, setResult] = useState(null)

  const process = useCallback(() => {
    if (!input.trim()) return
    const diffs = input.split('\n').filter(l=>l.trim()).map(line => {
      const { defanged, changes } = applyDefang(line)
      return { original:line, defanged, changes }
    })
    setResult(diffs)
    if (log) log({ tab:'Defang Diff', operation:'Defang with Diff', input:input.trim(), output:diffs.map(d=>d.defanged).join('\n') })
  }, [input, log])

  useCtrlEnter(process)
  const clear = () => { setInput(''); setResult(null) }
  const allDefanged = result ? result.map(r=>r.defanged).join('\n') : ''
  const totalChanges = result ? result.reduce((s,r)=>s+r.changes.length,0) : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🌍</div>
        <div>
          <div className={styles.heroTitle}>Defang Diff View</div>
          <div className={styles.heroSub}>Side-by-side diff showing exactly what changed — every dot, protocol, at-sign. Never miss a transformation.</div>
        </div>
      </div>
      <div className={styles.examples}>
        {EXAMPLES.map((ex,i)=>(
          <button key={i} className={styles.exBtn} onClick={()=>{setInput(ex.val);setResult(null)}}>{ex.label}</button>
        ))}
      </div>
      <div>
        <div className={styles.label}>INPUT — ONE PER LINE</div>
        <textarea className={styles.textarea} rows={5} value={input} onChange={e=>setInput(e.target.value)}
          placeholder={'http://malicious-site.com/payload.exe\nhttps://evil.com/c2\nadmin@evil.com\n192.168.1.1'} />
      </div>
      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={process}>⚡ Show Diff <span className={styles.hint}>Ctrl+Enter</span></button>
        <button className={styles.btnClear} onClick={clear}>🗑 Clear</button>
        {result && <CopyButton text={allDefanged} label="Copy Defanged" />}
        {result && <span className={styles.changeCount}>{totalChanges} change{totalChanges!==1?'s':''} made</span>}
      </div>
      {result && (
        <div className={styles.results}>
          <div className={styles.legend}>
            <span className={styles.legItem}><span className={styles.legDot} style={{background:'rgba(239,35,60,.4)'}}/>Original (removed)</span>
            <span className={styles.legItem}><span className={styles.legDot} style={{background:'rgba(6,214,160,.4)'}}/>Defanged (added)</span>
          </div>
          {result.map((r,i)=>(
            <div key={i} className={styles.diffCard}>
              <div className={styles.diffGrid}>
                <div className={styles.diffPanel}>
                  <div className={styles.panelLabel}>ORIGINAL</div>
                  <div className={styles.diffLine} dangerouslySetInnerHTML={{__html:highlightOrig(r.original)}} />
                </div>
                <div className={styles.diffPanel}>
                  <div className={styles.panelLabel}>DEFANGED</div>
                  <div className={styles.diffLine} dangerouslySetInnerHTML={{__html:highlightDef(r.defanged)}} />
                </div>
              </div>
              {r.changes.length>0 && (
                <div className={styles.changeRow}>
                  {r.changes.map((c,j)=>(
                    <span key={j} className={styles.changePill}>
                      {c.desc}: <span style={{color:'#ef233c'}}>{c.from}</span> → <span style={{color:'#06d6a0'}}>{c.to}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
