import { useState, useCallback } from 'react'
import { autoProcess, processBulk } from './defang.utils.js'
import PillSelector from '../../components/PillSelector/PillSelector.jsx'
import IOPanel from '../../components/IOPanel/IOPanel.jsx'
import ActionBar from '../../components/ActionBar/ActionBar.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './DefangFang.module.css'

const MODES = [
  { value: 'auto',   label: '⚡ Auto-Detect' },
  { value: 'defang', label: '🔗 Defang' },
  { value: 'fang',   label: '🔓 Re-Fang' },
]

export default function DefangFang() {
  const [input, setInput]     = useState('')
  const [output, setOutput]   = useState('')
  const [mode, setMode]       = useState('auto')
  const [detected, setDetected] = useState(null)

  const process = useCallback(() => {
    if (!input.trim()) return
    if (mode === 'auto') {
      const { direction, output: out } = autoProcess(input)
      setDetected(direction)
      setOutput(out)
    } else {
      setOutput(processBulk(input, mode === 'fang' ? 'fang' : 'defang'))
      setDetected(null)
    }
  }, [input, mode])

  useCtrlEnter(process)

  const clear = () => { setInput(''); setOutput(''); setDetected(null) }

  return (
    <div className={styles.wrap}>
      <PillSelector options={MODES} value={mode} onChange={setMode} />

      {detected && (
        <div className={styles.detected}>
          Auto-detected: <strong>{detected === 'defang' ? 'Live → Defanging' : 'Defanged → Re-Fanging'}</strong>
        </div>
      )}

      <IOPanel
        input={input}
        onInput={setInput}
        output={output}
        inputPlaceholder={'Paste URLs, IPs, or domains — one per line\n\ne.g. http://malicious.com\n192.168.1.1\nevil.example.com'}
      />

      <ActionBar onProcess={process} onClear={clear} output={output} />
    </div>
  )
}
