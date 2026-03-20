import { useState, useCallback } from 'react'
import { identifyHash, generateHashes, ipToHex, hexToIP, ipToBinary, isPrivateIP, expandCIDR } from './haship.utils.js'
import PillSelector from '../../components/PillSelector/PillSelector.jsx'
import CopyButton from '../../components/CopyButton/CopyButton.jsx'
import { useCtrlEnter } from '../../hooks/useKeyboard.js'
import styles from './HashIP.module.css'

const OPS = [
  { value: 'identify',  label: '🔎 Hash Identify' },
  { value: 'generate',  label: '⚙️ Hash Generate'  },
  { value: 'ip2hex',    label: '🔢 IP ↔ Hex'       },
  { value: 'cidr',      label: '🌐 CIDR Expand'    },
  { value: 'ipcheck',   label: '🏠 Private IP'     },
  { value: 'ip2bin',    label: '💾 IP → Binary'    },
]

export default function HashIP() {
  const [op, setOp]         = useState('identify')
  const [input, setInput]   = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const clear = () => { setInput(''); setResult(null); setError('') }
  const handleOpChange = (v) => { setOp(v); clear() }

  const process = useCallback(async () => {
    if (!input.trim()) return
    setError(''); setResult(null)

    try {
      switch (op) {
        case 'identify': {
          const lines = input.trim().split('\n').filter(Boolean)
          setResult({ type: 'identify', items: lines.map(h => ({ hash: h.trim(), ...identifyHash(h.trim()) })) })
          break
        }
        case 'generate': {
          setLoading(true)
          const hashes = await generateHashes(input)
          setResult({ type: 'generate', hashes })
          setLoading(false)
          break
        }
        case 'ip2hex': {
          const line = input.trim()
          if (line.startsWith('0x') || /^[0-9a-fA-F]{8}$/i.test(line)) {
            setResult({ type: 'ip2hex', direction: 'hex→ip', value: hexToIP(line) })
          } else {
            setResult({ type: 'ip2hex', direction: 'ip→hex', value: ipToHex(line) })
          }
          break
        }
        case 'cidr': {
          const cidrResult = expandCIDR(input.trim())
          if (cidrResult.error) { setError(cidrResult.error); return }
          setResult({ type: 'cidr', ...cidrResult })
          break
        }
        case 'ipcheck': {
          const lines = input.trim().split('\n').filter(Boolean)
          setResult({ type: 'ipcheck', items: lines.map(ip => ({ ip: ip.trim(), ...isPrivateIP(ip.trim()) })) })
          break
        }
        case 'ip2bin': {
          const lines = input.trim().split('\n').filter(Boolean)
          setResult({ type: 'ip2bin', items: lines.map(ip => ({ ip: ip.trim(), binary: ipToBinary(ip.trim()) })) })
          break
        }
      }
    } catch (e) { setError('⚠️ ' + e.message) }
  }, [input, op])

  useCtrlEnter(process)

  const placeholders = {
    identify:  'Paste one or more hashes — one per line\n\ne.g.\n5d41402abc4b2a76b9719d911017c592\naaf4c61ddcc5e8a2dabede0f3b482cd9ad...',
    generate:  'Type or paste any text to generate all hashes...\n\ne.g. malware.exe',
    ip2hex:    'Paste an IPv4 address OR hex value\n\ne.g. 192.168.1.1  or  0xC0A80101',
    cidr:      'Paste a CIDR range\n\ne.g. 192.168.1.0/24',
    ipcheck:   'Paste IPs to check — one per line\n\ne.g.\n10.0.0.1\n8.8.8.8\n192.168.0.1',
    ip2bin:    'Paste IPs to convert — one per line\n\ne.g. 192.168.1.1',
  }

  return (
    <div className={styles.wrap}>
      <PillSelector options={OPS} value={op} onChange={handleOpChange} />

      <div>
        <div className={styles.label}>INPUT</div>
        <textarea
          className={styles.textarea}
          rows={6}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholders[op]}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnProcess} onClick={process} disabled={loading}>
          {loading ? '⏳ Computing...' : '⚡ Process'} <span className={styles.hint}>Ctrl+Enter</span>
        </button>
        <button className={styles.btnClear} onClick={clear}>🗑 Clear</button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* ── Hash Identify Results ── */}
      {result?.type === 'identify' && (
        <div className={styles.results}>
          {result.items.map((item, i) => (
            <div key={i} className={styles.hashRow}>
              <div className={styles.hashVal}>{item.hash}</div>
              <div className={styles.hashMeta}>
                <span className={`${styles.badge} ${item.confidence === 'high' ? styles.badgeGrn : styles.badgeYlw}`}>
                  {item.type}
                </span>
                {item.bits && <span className={styles.bits}>{item.bits}-bit</span>}
                <CopyButton text={item.hash} label="Copy" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Hash Generate Results ── */}
      {result?.type === 'generate' && (
        <div className={styles.results}>
          {Object.entries(result.hashes).map(([algo, hash]) => (
            <div key={algo} className={styles.genRow}>
              <span className={styles.algo}>{algo}</span>
              <span className={styles.genHash}>{hash}</span>
              <CopyButton text={hash} label="Copy" />
            </div>
          ))}
        </div>
      )}

      {/* ── IP ↔ Hex Result ── */}
      {result?.type === 'ip2hex' && (
        <div className={styles.singleResult}>
          <div className={styles.label}>{result.direction === 'ip→hex' ? 'HEX' : 'IPv4'}</div>
          <div className={styles.singleVal}>{result.value}</div>
          <CopyButton text={result.value} />
        </div>
      )}

      {/* ── CIDR Result ── */}
      {result?.type === 'cidr' && (
        <div className={styles.cidrResult}>
          <div className={styles.cidrGrid}>
            {[
              ['Network',   result.network],
              ['Broadcast', result.broadcast],
              ['Subnet Mask', result.mask],
              ['First Host', result.first],
              ['Last Host',  result.last],
              ['Total IPs',  result.total.toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className={styles.cidrCell}>
                <div className={styles.cidrKey}>{k}</div>
                <div className={styles.cidrVal}>{v} <CopyButton text={String(v)} label="" /></div>
              </div>
            ))}
          </div>
          {result.ips.length > 0 && (
            <div className={styles.ipListWrap}>
              <div className={styles.ipListHeader}>
                <span className={styles.label}>ALL IPs {result.truncated && `(first 256 of ${result.total.toLocaleString()})`}</span>
                <CopyButton text={result.ips.join('\n')} label="Copy All" />
              </div>
              <div className={styles.ipList}>
                {result.ips.map((ip, i) => <span key={i} className={styles.ipChip}>{ip}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Private IP Check ── */}
      {result?.type === 'ipcheck' && (
        <div className={styles.results}>
          {result.items.map((item, i) => (
            <div key={i} className={styles.ipCheckRow}>
              <span className={styles.ipCheckAddr}>{item.ip}</span>
              <span className={`${styles.badge} ${item.isPrivate ? styles.badgeYlw : styles.badgeGrn}`}>
                {item.isPrivate ? '🏠 Private' : '🌐 Public'}
              </span>
              <span className={styles.ipRange}>{item.range}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── IP → Binary ── */}
      {result?.type === 'ip2bin' && (
        <div className={styles.results}>
          {result.items.map((item, i) => (
            <div key={i} className={styles.binRow}>
              <span className={styles.binIP}>{item.ip}</span>
              <span className={styles.binArrow}>→</span>
              <span className={styles.binVal}>{item.binary}</span>
              <CopyButton text={item.binary} label="Copy" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
