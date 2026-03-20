// ── Detectors ─────────────────────────────────────────────────────────────────

const IPv4_RE    = /^(\d{1,3}\.){3}\d{1,3}$/
const HASH_RE    = /^[a-fA-F0-9]+$/
const URL_RE     = /^https?:\/\//i
const DEFANG_RE  = /hxxp|\[at\]|\[dot\]/i
const B64_RE     = /^[A-Za-z0-9+/_-]+=*$/
const HEX_RE     = /^(?:(?:0x)?[0-9a-fA-F]{2}\s*)+$/
const DOMAIN_RE  = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CIDR_RE    = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/
const CHARCODE_RE = /^[\d\s,[\]]+$/

export function detectType(input) {
  const s = input.trim()
  const results = []

  if (IPv4_RE.test(s))    results.push('ipv4')
  if (CIDR_RE.test(s))    results.push('cidr')
  if (EMAIL_RE.test(s))   results.push('email')
  if (URL_RE.test(s))     results.push('url')
  if (DEFANG_RE.test(s))  results.push('defanged')
  if (DOMAIN_RE.test(s) && !IPv4_RE.test(s)) results.push('domain')
  if (HASH_RE.test(s) && [32,40,64,128].includes(s.length)) results.push('hash')
  if (isLikelyBase64(s))  results.push('base64')
  if (HEX_RE.test(s) && s.includes(' ')) results.push('hex')
  if (isPowerShell(s))    results.push('powershell')
  if (CHARCODE_RE.test(s) && /\d{2,3}/.test(s)) results.push('charcode')

  if (results.length === 0) results.push('text')
  return results
}

function isLikelyBase64(s) {
  if (s.length < 8) return false
  if (!B64_RE.test(s)) return false
  try { const d = atob(s.replace(/-/g,'+').replace(/_/g,'/')); return d.length > 0 } catch { return false }
}

function isPowerShell(s) {
  return /powershell|\.exe|invoke-|iex|downloadstring|-enc|-encoded/i.test(s)
}

// ── Hash identification ────────────────────────────────────────────────────────

function identifyHashType(s) {
  switch(s.trim().length) {
    case 32:  return 'MD5'
    case 40:  return 'SHA-1'
    case 64:  return 'SHA-256'
    case 128: return 'SHA-512'
    default:  return 'Unknown'
  }
}

// ── Defang / Refang ───────────────────────────────────────────────────────────

function defang(s) {
  return s.replace(/https/gi,'hxxps').replace(/http/gi,'hxxp').replace(/\./g,'[.]').replace(/:\/\//g,'[://]').replace(/@/g,'[@]')
}
function refang(s) {
  return s.replace(/hxxps/gi,'https').replace(/hxxp/gi,'http').replace(/\[\.]/g,'.').replace(/\[:\/\/]/g,'://').replace(/\[@]/g,'@').replace(/\[dot]/gi,'.').replace(/\[at]/gi,'@')
}

// ── Base64 decode ─────────────────────────────────────────────────────────────

function tryBase64(s) {
  try {
    let x = s.replace(/-/g,'+').replace(/_/g,'/')
    while (x.length % 4) x += '='
    return decodeURIComponent(escape(atob(x)))
  } catch { return null }
}

// ── Hex decode ────────────────────────────────────────────────────────────────

function tryHex(s) {
  try {
    const hex = s.replace(/0x/gi,'').replace(/\s+/g,'')
    return hex.match(/.{1,2}/g).map(b => String.fromCharCode(parseInt(b,16))).join('')
  } catch { return null }
}

// ── IP utils ──────────────────────────────────────────────────────────────────

function ipToHex(ip) {
  const parts = ip.split('.').map(Number)
  return '0x' + parts.map(p => p.toString(16).padStart(2,'0')).join('').toUpperCase()
}

function isPrivate(ip) {
  const [a,b] = ip.split('.').map(Number)
  if (a===10) return '10.0.0.0/8 — Private'
  if (a===172 && b>=16 && b<=31) return '172.16.0.0/12 — Private'
  if (a===192 && b===168) return '192.168.0.0/16 — Private'
  if (a===127) return 'Loopback'
  return 'Public IP'
}

function ipToBinary(ip) {
  return ip.split('.').map(n => (+n).toString(2).padStart(8,'0')).join('.')
}

// ── Suspicion Scorer ──────────────────────────────────────────────────────────

export function suspicionScore(input, types) {
  let score = 0
  const reasons = []
  const s = input.trim()

  // Entropy
  const entropy = shannonEntropy(s)
  if (entropy > 4.5) { score += 25; reasons.push('High entropy (' + entropy.toFixed(1) + ')') }
  else if (entropy > 3.5) { score += 10; reasons.push('Medium entropy') }

  // Encoding layers
  if (types.includes('base64')) { score += 20; reasons.push('Base64 encoded') }
  if (types.includes('hex'))    { score += 15; reasons.push('Hex encoded') }
  if (types.includes('powershell')) { score += 25; reasons.push('PowerShell pattern') }

  // Known bad patterns
  if (/powershell|invoke-expression|iex\(|downloadstring/i.test(s)) { score += 20; reasons.push('Known malicious PowerShell') }
  if (/TVQAAA|TVpA|TVoA/.test(s)) { score += 25; reasons.push('PE/MZ header in Base64') }
  if (/\/bin\/sh|\/bin\/bash|cmd\.exe|whoami|net user/i.test(s)) { score += 20; reasons.push('Shell command pattern') }
  if (/\.exe|\.dll|\.ps1|\.vbs|\.bat/i.test(s)) { score += 10; reasons.push('Executable extension') }

  // Obfuscation signals
  const specialRatio = (s.match(/[^a-zA-Z0-9\s]/g) || []).length / s.length
  if (specialRatio > 0.4) { score += 15; reasons.push('Heavy obfuscation') }

  // Multiple encoding
  if (types.includes('base64') && types.includes('hex')) { score += 10; reasons.push('Multiple encodings') }

  score = Math.min(100, score)

  let band, color
  if (score <= 25)      { band = 'Clean';              color = '#06d6a0' }
  else if (score <= 50) { band = 'Suspicious';         color = '#f4a261' }
  else if (score <= 75) { band = 'Likely Malicious';   color = '#ef7c00' }
  else                  { band = 'High Confidence Malicious'; color = '#ef233c' }

  return { score, band, color, reasons }
}

function shannonEntropy(str) {
  const freq = {}
  for (const c of str) freq[c] = (freq[c] || 0) + 1
  const len = str.length
  return -Object.values(freq).reduce((sum, f) => {
    const p = f / len
    return sum + p * Math.log2(p)
  }, 0)
}

// ── Main triage engine ────────────────────────────────────────────────────────

export function runTriage(input) {
  const s = input.trim()
  const types = detectType(s)
  const scorer = suspicionScore(s, types)
  const cards = []

  // IPv4
  if (types.includes('ipv4')) {
    cards.push({
      title: 'IPv4 Address',
      icon: '🌐',
      color: '#4a90d9',
      items: [
        { label: 'Address',  value: s },
        { label: 'Hex',      value: ipToHex(s) },
        { label: 'Binary',   value: ipToBinary(s) },
        { label: 'Type',     value: isPrivate(s) },
      ]
    })
  }

  // CIDR
  if (types.includes('cidr')) {
    cards.push({ title: 'CIDR Range', icon: '🌐', color: '#4a90d9', items: [{ label: 'Range', value: s }] })
  }

  // Hash
  if (types.includes('hash')) {
    cards.push({
      title: 'Hash Detected',
      icon: '🔑',
      color: '#9b59f5',
      items: [
        { label: 'Type',  value: identifyHashType(s) },
        { label: 'Hash',  value: s },
        { label: 'Length', value: s.length + ' chars' },
      ]
    })
  }

  // URL
  if (types.includes('url')) {
    cards.push({
      title: 'URL Detected',
      icon: '🔗',
      color: '#f4a261',
      items: [
        { label: 'Original', value: s },
        { label: 'Defanged', value: defang(s) },
        { label: 'Domain',   value: new URL(s).hostname },
      ]
    })
  }

  // Defanged
  if (types.includes('defanged')) {
    const fanged = refang(s)
    cards.push({
      title: 'Defanged IOC',
      icon: '🔓',
      color: '#06d6a0',
      items: [
        { label: 'Defanged', value: s },
        { label: 'Live',     value: fanged },
      ]
    })
  }

  // Domain
  if (types.includes('domain')) {
    cards.push({
      title: 'Domain',
      icon: '🌍',
      color: '#00d4ff',
      items: [
        { label: 'Domain',   value: s },
        { label: 'Defanged', value: defang(s) },
        { label: 'TLD',      value: '.' + s.split('.').pop() },
      ]
    })
  }

  // Email
  if (types.includes('email')) {
    const [user, domain] = s.split('@')
    cards.push({
      title: 'Email Address',
      icon: '📧',
      color: '#f4a261',
      items: [
        { label: 'Email',    value: s },
        { label: 'User',     value: user },
        { label: 'Domain',   value: domain },
        { label: 'Defanged', value: defang(s) },
      ]
    })
  }

  // Base64
  if (types.includes('base64')) {
    const decoded = tryBase64(s)
    cards.push({
      title: 'Base64 Encoded',
      icon: '🔒',
      color: '#9b59f5',
      items: [
        { label: 'Encoded', value: s.slice(0, 80) + (s.length > 80 ? '…' : '') },
        { label: 'Decoded', value: decoded ? decoded.slice(0, 200) : '⚠️ Failed' },
      ]
    })
  }

  // Hex
  if (types.includes('hex')) {
    const decoded = tryHex(s)
    cards.push({
      title: 'Hex Encoded',
      icon: '🔢',
      color: '#00d4ff',
      items: [
        { label: 'Hex',     value: s.slice(0, 60) },
        { label: 'ASCII',   value: decoded ? decoded.slice(0, 100) : '⚠️ Failed' },
      ]
    })
  }

  // PowerShell
  if (types.includes('powershell')) {
    cards.push({
      title: 'PowerShell Detected',
      icon: '💻',
      color: '#ef233c',
      items: [
        { label: 'Pattern', value: s.slice(0, 100) },
        { label: 'Risk',    value: 'Possible encoded command — decode with String Decoder tab' },
      ]
    })
  }

  // Plain text fallback
  if (types.includes('text') && cards.length === 0) {
    cards.push({
      title: 'Plain Text',
      icon: '📄',
      color: '#4a90d9',
      items: [
        { label: 'Length',  value: s.length + ' characters' },
        { label: 'Entropy', value: shannonEntropy(s).toFixed(2) },
      ]
    })
  }

  return { cards, scorer, types }
}
