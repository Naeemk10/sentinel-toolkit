// PowerShell -EncodedCommand decoder
export function decodePowerShell(input) {
  try {
    const b64 = input.trim().replace(/^.*-[Ee]nc(?:odedCommand)?\s+/i, '')
    const bytes = atob(b64)
    // UTF-16LE: every other byte
    let out = ''
    for (let i = 0; i < bytes.length - 1; i += 2) {
      out += String.fromCharCode(bytes.charCodeAt(i) | (bytes.charCodeAt(i+1) << 8))
    }
    return out || '⚠️ Could not decode PowerShell command'
  } catch { return '⚠️ Invalid PowerShell encoded command' }
}

// XOR brute force (keys 1-255) — returns top 5 by printable %
export function xorBruteForce(input) {
  const bytes = input.trim().split(/\s+/).map(b => parseInt(b, 16)).filter(b => !isNaN(b))
  if (bytes.length === 0) return [{ key: 0, score: 0, result: '⚠️ Input must be hex bytes e.g: 41 42 43' }]

  const results = []
  for (let key = 1; key <= 255; key++) {
    const decoded = bytes.map(b => String.fromCharCode(b ^ key)).join('')
    const printable = decoded.split('').filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length
    const score = Math.round((printable / decoded.length) * 100)
    results.push({ key, score, result: decoded })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10)
}

// Char code array decoder  e.g. [72,101,108,108,111]
export function decodeCharCodes(input) {
  try {
    const nums = input.match(/\d+/g)
    if (!nums) return '⚠️ No numbers found'
    return nums.map(n => String.fromCharCode(parseInt(n))).join('')
  } catch { return '⚠️ Invalid char code input' }
}

// Hex string to ASCII
export function hexToAscii(input) {
  try {
    const hex = input.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '')
    if (!hex) return '⚠️ No valid hex found'
    return hex.match(/.{1,2}/g).map(b => String.fromCharCode(parseInt(b, 16))).join('')
  } catch { return '⚠️ Invalid hex string' }
}

// Reverse string
export function reverseString(input) {
  return [...input].reverse().join('')
}

// Multi-layer: base64 → url decode → hex → reverse
export function multiLayerDecode(input) {
  const steps = []
  let current = input.trim()

  // Step 1: Try base64
  try {
    const d = atob(current.replace(/-/g,'+').replace(/_/g,'/'))
    const readable = decodeURIComponent(escape(d))
    steps.push({ op: 'Base64 Decode', result: readable })
    current = readable
  } catch { /* not base64 */ }

  // Step 2: Try URL decode
  try {
    const d = decodeURIComponent(current)
    if (d !== current) { steps.push({ op: 'URL Decode', result: d }); current = d }
  } catch { /* not url encoded */ }

  // Step 3: Try hex
  const hexMatch = current.match(/(?:0x[0-9a-fA-F]{2},?\s*)+/i)
  if (hexMatch) {
    const ascii = hexToAscii(hexMatch[0])
    steps.push({ op: 'Hex → ASCII', result: ascii })
    current = ascii
  }

  if (steps.length === 0) steps.push({ op: 'No encoding detected', result: current })
  return steps
}
