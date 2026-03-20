import { useState, useCallback } from 'react'
import * as enc from './encode.utils.js'
import PillSelector from '../../components/PillSelector/PillSelector.jsx'
import IOPanel from '../../components/IOPanel/IOPanel.jsx'
import ActionBar from '../../components/ActionBar/ActionBar.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './EncodeDecode.module.css'

const OPS = [
  { value: 'base64',  label: '🔤 Base64'  },
  { value: 'url',     label: '🌐 URL'     },
  { value: 'html',    label: '🏷 HTML'    },
  { value: 'hex',     label: '🔢 Hex'     },
  { value: 'rot13',   label: '🔄 ROT13'   },
  { value: 'unicode', label: '✨ Unicode'  },
]

const DIR_OPS = [
  { value: 'encode', label: '🔒 Encode' },
  { value: 'decode', label: '🔓 Decode' },
]

const ROT13_OPS = [{ value: 'encode', label: '🔄 Apply ROT13' }]

function runOp(op, dir, input, urlSafe) {
  switch (op) {
    case 'base64':  return dir === 'encode' ? enc.base64Encode(input, urlSafe)  : enc.base64Decode(input, urlSafe)
    case 'url':     return dir === 'encode' ? enc.urlEncode(input)    : enc.urlDecode(input)
    case 'html':    return dir === 'encode' ? enc.htmlEncode(input)   : enc.htmlDecode(input)
    case 'hex':     return dir === 'encode' ? enc.hexEncode(input)    : enc.hexDecode(input)
    case 'rot13':   return enc.rot13(input)
    case 'unicode': return dir === 'encode' ? enc.unicodeEscape(input): enc.unicodeUnescape(input)
    default: return ''
  }
}

export default function EncodeDecode() {
  const [input, setInput]     = useState('')
  const [output, setOutput]   = useState('')
  const [op, setOp]           = useState('base64')
  const [dir, setDir]         = useState('encode')
  const [urlSafe, setUrlSafe] = useState(false)

  const process = useCallback(() => {
    if (!input.trim()) return
    setOutput(runOp(op, dir, input, urlSafe))
  }, [input, op, dir, urlSafe])

  useCtrlEnter(process)

  const handleOpChange = (newOp) => { setOp(newOp); setOutput('') }
  const clear = () => { setInput(''); setOutput('') }

  return (
    <div className={styles.wrap}>
      <PillSelector options={OPS} value={op} onChange={handleOpChange} />

      <div className={styles.subrow}>
        <PillSelector options={op === 'rot13' ? ROT13_OPS : DIR_OPS} value={dir} onChange={setDir} />
        {op === 'base64' && (
          <label className={styles.toggle}>
            <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)} />
            URL-safe
          </label>
        )}
      </div>

      <IOPanel
        input={input}
        onInput={setInput}
        output={output}
        inputPlaceholder={`Paste text to ${op === 'rot13' ? 'ROT13' : dir}...`}
      />

      <ActionBar onProcess={process} onClear={clear} output={output} />
    </div>
  )
}
