import { useState, useCallback } from 'react'
import { runTriage } from './triage.utils.js'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import IOCButton from '../../components/IOCButton/IOCButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './Triage.module.css'

const EXAMPLES = [
  '192.168.1.105',
  'http://malicious-site.com/payload.exe',
  '5d41402abc4b2a76b9719d911017c592',
  'hxxp://evil[.]com/c2',
  'JABjACAAPQAgACcASABlAGwAbABvACcA',
  'powershell -enc JABjACAA',
]

export default function Triage({ log }) {
  const [input, setInput]   = useState('')
  const [result, setResult] = useState(null)

  const process = useCallback(() => {
    if (!input.trim()) return
    const triageResult = runTriage(input)
    setResult(triageResult)
    if (log) {
      log({
        tab: 'Quick Triage',
        operation: triageResult.types.join(', '),
        input: input.trim(),
        output: triageResult.cards.map(c => c.title).join(', '),
        suspicionScore: triageResult.scorer.score,
      })
    }
  }, [input, log])

  useCtrlEnter(process)

  const clear = () => { setInput(''); setResult(null) }

  const allOutput = result
    ? result.cards.flatMap(c => c.items.map(i => `${i.label}: ${i.value}`)).join('\n')
    : ''

  return (
    <div className={styles.wrap}>
      {/* Hero description */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>⚡</div>
        <div>
          <div className={styles.heroTitle}>Quick Triage Mode</div>
          <div className={styles.heroSub}>Paste anything — IP, hash, URL, encoded string, domain, email. Auto-detects and analyses everything instantly.</div>
        </div>
      </div>

      {/* Examples */}
      <div className={styles.examples}>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className={styles.exBtn} onClick={() => { setInput(ex); setResult(null) }}>
            {ex.length > 30 ? ex.slice(0, 30) + '…' : ex}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <div className={styles.label}>PASTE ANYTHING</div>
        <textarea
          className={styles.textarea}
          rows={5}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'Paste any IOC, encoded string, IP, hash, URL, domain, email...\n\nExamples:\n  192.168.1.1\n  5d41402abc4b2a76b9719d911017c592\n  hxxp://evil[.]com\n  JABjACAAPQAgACcA...'}
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={process}>
          ⚡ Analyse <span className={styles.hint}>Ctrl+Enter</span>
        </button>
        <button className={styles.btnClear} onClick={clear}>🗑 Clear</button>
        {result && <CopyButton text={allOutput} label="Copy All" />}
        {result && <IOCButton data={input} />}
      </div>

      {/* Results */}
      {result && (
        <div className={styles.results}>

          {/* Suspicion Score */}
          <div className={styles.scoreCard} style={{ borderColor: result.scorer.color + '44' }}>
            <div className={styles.scoreLeft}>
              <div className={styles.scoreNum} style={{ color: result.scorer.color }}>
                {result.scorer.score}
              </div>
              <div className={styles.scoreLabel}>/ 100</div>
            </div>
            <div className={styles.scoreRight}>
              <div className={styles.scoreBand} style={{ color: result.scorer.color }}>
                {result.scorer.band}
              </div>
              <div className={styles.scoreBar}>
                <div
                  className={styles.scoreBarFill}
                  style={{ width: result.scorer.score + '%', background: result.scorer.color }}
                />
              </div>
              <div className={styles.scoreReasons}>
                {result.scorer.reasons.map((r, i) => (
                  <span key={i} className={styles.reasonPill}>{r}</span>
                ))}
                {result.scorer.reasons.length === 0 && (
                  <span className={styles.reasonPill}>No suspicious patterns detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Detection cards */}
          <div className={styles.cards}>
            {result.cards.map((card, i) => (
              <div key={i} className={styles.card} style={{ borderTopColor: card.color }}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{card.icon}</span>
                  <span className={styles.cardTitle} style={{ color: card.color }}>{card.title}</span>
                  <CopyButton text={card.items.map(it => `${it.label}: ${it.value}`).join('\n')} label="Copy" />
                </div>
                <div className={styles.cardBody}>
                  {card.items.map((item, j) => (
                    <div key={j} className={styles.cardRow}>
                      <span className={styles.cardKey}>{item.label}</span>
                      <span className={styles.cardVal}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
