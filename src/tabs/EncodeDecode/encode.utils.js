// Base64
export function base64Encode(str, urlSafe = false) {
  const encoded = btoa(unescape(encodeURIComponent(str)))
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded
}

export function base64Decode(str, urlSafe = false) {
  try {
    let s = str
    if (urlSafe) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=' }
    return decodeURIComponent(escape(atob(s)))
  } catch { return '⚠️ Invalid Base64 input' }
}

// URL
export function urlEncode(str) { return encodeURIComponent(str) }
export function urlDecode(str) {
  try { return decodeURIComponent(str) } catch { return '⚠️ Invalid URL-encoded input' }
}

// HTML Entities
export function htmlEncode(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}
export function htmlDecode(str) {
  return str
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

// Hex
export function hexEncode(str) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ')
}
export function hexDecode(str) {
  try {
    const hex = str.replace(/\s+/g, '')
    if (!/^[0-9a-fA-F]+$/.test(hex)) return '⚠️ Invalid hex input'
    return hex.match(/.{1,2}/g).map(b => String.fromCharCode(parseInt(b, 16))).join('')
  } catch { return '⚠️ Invalid hex input' }
}

// ROT13
export function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

// Unicode
export function unicodeEscape(str) {
  return Array.from(str).map(c => c.charCodeAt(0) > 127 ? `\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}` : c).join('')
}
export function unicodeUnescape(str) {
  try { return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))) }
  catch { return '⚠️ Invalid unicode escape sequence' }
}
