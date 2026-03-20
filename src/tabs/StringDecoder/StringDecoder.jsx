import { useState, useCallback } from 'react'
import { decodePowerShell, xorBruteForce, decodeCharCodes, hexToAscii, reverseString, multiLayerDecode } from './string.utils.js'
import PillSelector from '../../components/PillSelector/PillSelector.jsx'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import IOCButton from '../../components/IOCButton/IOCButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './StringDecoder.module.css'

const OPS = [
  { value: 'powershell', label: '💻 PowerShell' },
  { value: 'xor',        label: '⊕ XOR Brute'  },
  { value: 'charcode',   label: '🔢 Char Codes'  },
  { value: 'hexstr',     label: '🔠 Hex→ASCII'   },
  { value: 'reverse',    label: '↩ Reverse'      },
  { value: 'multilayer', label: '🧅 Multi-Layer'  },
]

export default function StringDecoder() {
  const [input, setInput]   = useState('')
  const [output, setOutput] = useState('')
  const [op, setOp]         = useState('powershell')
  const [xorResults, setXorResults] = useState(null)
  const [multiSteps, setMultiSteps] = useState(null)

  const process = useCallback(() => {
    if (!input.trim()) return
    setXorResults(null); setMultiSteps(null); setOutput('')

    switch (op) {
      case 'powershell': setOutput(decodePowerShell(input)); break
      case 'xor':        setXorResults(xorBruteForce(input)); break
      case 'charcode':   setOutput(decodeCharCodes(input)); break
      case 'hexstr':     setOutput(hexToAscii(input)); break
      case 'reverse':    setOutput(reverseString(input)); break
      case 'multilayer': setMultiSteps(multiLayerDecode(input)); break
    }
  }, [input, op])

  useCtrlEnter(process)

  const clear = () => { setInput(''); setOutput(''); setXorResults(null); setMultiSteps(null) }

  const placeholders = {
    powershell: 'Paste full PowerShell command with -EncodedCommand flag\n\ne.g. powershell.exe -Enc JABjACAAPQAgACcA...',
    xor:        'Paste hex bytes separated by spaces\n\ne.g. 41 42 43 44 or 0x41 0x42 0x43',
    charcode:   'Paste char code array\n\ne.g. [72,101,108,108,111] or 72 101 108 108 111',
    hexstr:     'Paste hex string\n\ne.g. 48656c6c6f or 0x48 0x65 0x6c',
    reverse:    'Paste any string to reverse...',
    multilayer: 'Paste encoded string — auto-detects and strips layers\n\ne.g. double base64, base64+url, etc.',
  }

  return (
    <div className={styles.wrap}>
      <PillSelector options={OPS} value={op} onChange={v => { setOp(v); setOutput(''); setXorResults(null); setMultiSteps(null) }} />

      <div className={styles.inputArea}>
        <div className={styles.label}>INPUT</div>
        <textarea
          className={styles.textarea}
          rows={8}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholders[op]}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={process}>⚡ Decode <span className={styles.hint}>Ctrl+Enter</span></button>
        <button className={styles.btnClear} onClick={clear}>🗑 Clear</button>
        {output && <><CopyButton text={output} /><IOCButton data={output} /></>}
      </div>

      {/* Standard output */}
      {output && !xorResults && !multiSteps && (
        <div className={styles.outputArea}>
          <div className={styles.label}>OUTPUT</div>
          <textarea className={styles.outputTA} rows={8} value={output} readOnly />
        </div>
      )}

      {/* XOR results */}
      {xorResults && (
        <div className={styles.xorResults}>
          <div className={styles.label}>XOR BRUTE FORCE — TOP 10 BY PRINTABLE %</div>
          {xorResults.map((r, i) => (
            <div key={i} className={styles.xorRow}>
              <span className={styles.xorKey}>Key 0x{r.key.toString(16).padStart(2,'0').toUpperCase()}</span>
              <span className={styles.xorScore} style={{color: r.score > 80 ? 'var(--grn)' : r.score > 50 ? 'var(--ylw)' : 'var(--tx)'}}>
                {r.score}%
              </span>
              <span className={styles.xorVal}>{r.result.slice(0, 80)}{r.result.length > 80 ? '…' : ''}</span>
              <CopyButton text={r.result} label="Copy" />
            </div>
          ))}
        </div>
      )}

      {/* Multi-layer steps */}
      {multiSteps && (
        <div className={styles.multiSteps}>
          <div className={styles.label}>DECODE LAYERS</div>
          {multiSteps.map((step, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>Layer {i + 1}</span>
                <span className={styles.stepOp}>{step.op}</span>
                <CopyButton text={step.result} label="Copy" />
              </div>
              <div className={styles.stepResult}>{step.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
