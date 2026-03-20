// ── Hash Identification ────────────────────────────────────────────────────────

export function identifyHash(hash) {
  const h = hash.trim()
  const hexOnly = /^[a-fA-F0-9]+$/.test(h)
  if (!hexOnly) return { type: 'Unknown', confidence: 'low', bits: null }

  switch (h.length) {
    case 32:  return { type: 'MD5',    confidence: 'high', bits: 128 }
    case 40:  return { type: 'SHA-1',  confidence: 'high', bits: 160 }
    case 56:  return { type: 'SHA-224',confidence: 'high', bits: 224 }
    case 64:  return { type: 'SHA-256',confidence: 'high', bits: 256 }
    case 96:  return { type: 'SHA-384',confidence: 'high', bits: 384 }
    case 128: return { type: 'SHA-512',confidence: 'high', bits: 512 }
    default:  return { type: `Unknown (${h.length} chars)`, confidence: 'low', bits: null }
  }
}

// ── Hash Generation (using SubtleCrypto) ───────────────────────────────────────

async function digest(algo, text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('')
}

export async function generateHashes(text) {
  const [md5result, sha1, sha256, sha512] = await Promise.all([
    // MD5 not available in SubtleCrypto — use a pure-JS implementation
    md5(text),
    digest('SHA-1',   text),
    digest('SHA-256', text),
    digest('SHA-512', text),
  ])
  return { MD5: md5result, 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-512': sha512 }
}

// Pure-JS MD5 (RFC 1321)
function md5(str) {
  function safeAdd(x, y) { const lsw=(x&0xFFFF)+(y&0xFFFF); return (((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xFFFF) }
  function bitRotateLeft(num,cnt) { return (num<<cnt)|(num>>>(32-cnt)) }
  function md5cmn(q,a,b,x,s,t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b) }
  function md5ff(a,b,c,d,x,s,t) { return md5cmn((b&c)|((~b)&d),a,b,x,s,t) }
  function md5gg(a,b,c,d,x,s,t) { return md5cmn((b&d)|(c&(~d)),a,b,x,s,t) }
  function md5hh(a,b,c,d,x,s,t) { return md5cmn(b^c^d,a,b,x,s,t) }
  function md5ii(a,b,c,d,x,s,t) { return md5cmn(c^(b|(~d)),a,b,x,s,t) }

  const utf8str = unescape(encodeURIComponent(str))
  const bArr = []
  for(let i=0;i<utf8str.length;i++) bArr.push(utf8str.charCodeAt(i))
  bArr.push(128)
  while(bArr.length%64!==56) bArr.push(0)
  const bitLen = utf8str.length * 8
  bArr.push(bitLen&0xFF,(bitLen>>8)&0xFF,(bitLen>>16)&0xFF,(bitLen>>24)&0xFF,0,0,0,0)

  const M = []
  for(let i=0;i<bArr.length;i+=4) M.push(bArr[i]|(bArr[i+1]<<8)|(bArr[i+2]<<16)|(bArr[i+3]<<24))

  let a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476

  for(let i=0;i<M.length;i+=16) {
    const [aa,bb,cc,dd]=[a,b,c,d]
    a=md5ff(a,b,c,d,M[i],7,-680876936);d=md5ff(d,a,b,c,M[i+1],12,-389564586);c=md5ff(c,d,a,b,M[i+2],17,606105819);b=md5ff(b,c,d,a,M[i+3],22,-1044525330)
    a=md5ff(a,b,c,d,M[i+4],7,-176418897);d=md5ff(d,a,b,c,M[i+5],12,1200080426);c=md5ff(c,d,a,b,M[i+6],17,-1473231341);b=md5ff(b,c,d,a,M[i+7],22,-45705983)
    a=md5ff(a,b,c,d,M[i+8],7,1770035416);d=md5ff(d,a,b,c,M[i+9],12,-1958414417);c=md5ff(c,d,a,b,M[i+10],17,-42063);b=md5ff(b,c,d,a,M[i+11],22,-1990404162)
    a=md5ff(a,b,c,d,M[i+12],7,1804603682);d=md5ff(d,a,b,c,M[i+13],12,-40341101);c=md5ff(c,d,a,b,M[i+14],17,-1502002290);b=md5ff(b,c,d,a,M[i+15],22,1236535329)
    a=md5gg(a,b,c,d,M[i+1],5,-165796510);d=md5gg(d,a,b,c,M[i+6],9,-1069501632);c=md5gg(c,d,a,b,M[i+11],14,643717713);b=md5gg(b,c,d,a,M[i],20,-373897302)
    a=md5gg(a,b,c,d,M[i+5],5,-701558691);d=md5gg(d,a,b,c,M[i+10],9,38016083);c=md5gg(c,d,a,b,M[i+15],14,-660478335);b=md5gg(b,c,d,a,M[i+4],20,-405537848)
    a=md5gg(a,b,c,d,M[i+9],5,568446438);d=md5gg(d,a,b,c,M[i+14],9,-1019803690);c=md5gg(c,d,a,b,M[i+3],14,-187363961);b=md5gg(b,c,d,a,M[i+8],20,1163531501)
    a=md5gg(a,b,c,d,M[i+13],5,-1444681467);d=md5gg(d,a,b,c,M[i+2],9,-51403784);c=md5gg(c,d,a,b,M[i+7],14,1735328473);b=md5gg(b,c,d,a,M[i+12],20,-1926607734)
    a=md5hh(a,b,c,d,M[i+5],4,-378558);d=md5hh(d,a,b,c,M[i+8],11,-2022574463);c=md5hh(c,d,a,b,M[i+11],16,1839030562);b=md5hh(b,c,d,a,M[i+14],23,-35309556)
    a=md5hh(a,b,c,d,M[i+1],4,-1530992060);d=md5hh(d,a,b,c,M[i+4],11,1272893353);c=md5hh(c,d,a,b,M[i+7],16,-155497632);b=md5hh(b,c,d,a,M[i+10],23,-1094730640)
    a=md5hh(a,b,c,d,M[i+13],4,681279174);d=md5hh(d,a,b,c,M[i],11,-358537222);c=md5hh(c,d,a,b,M[i+3],16,-722521979);b=md5hh(b,c,d,a,M[i+6],23,76029189)
    a=md5hh(a,b,c,d,M[i+9],4,-640364487);d=md5hh(d,a,b,c,M[i+12],11,-421815835);c=md5hh(c,d,a,b,M[i+15],16,530742520);b=md5hh(b,c,d,a,M[i+2],23,-995338651)
    a=md5ii(a,b,c,d,M[i],6,-198630844);d=md5ii(d,a,b,c,M[i+7],10,1126891415);c=md5ii(c,d,a,b,M[i+14],15,-1416354905);b=md5ii(b,c,d,a,M[i+5],21,-57434055)
    a=md5ii(a,b,c,d,M[i+12],6,1700485571);d=md5ii(d,a,b,c,M[i+3],10,-1894986606);c=md5ii(c,d,a,b,M[i+10],15,-1051523);b=md5ii(b,c,d,a,M[i+1],21,-2054922799)
    a=md5ii(a,b,c,d,M[i+8],6,1873313359);d=md5ii(d,a,b,c,M[i+15],10,-30611744);c=md5ii(c,d,a,b,M[i+6],15,-1560198380);b=md5ii(b,c,d,a,M[i+13],21,1309151649)
    a=md5ii(a,b,c,d,M[i+4],6,-145523070);d=md5ii(d,a,b,c,M[i+11],10,-1120210379);c=md5ii(c,d,a,b,M[i+2],15,718787259);b=md5ii(b,c,d,a,M[i+9],21,-343485551)
    a=safeAdd(a,aa);b=safeAdd(b,bb);c=safeAdd(c,cc);d=safeAdd(d,dd)
  }

  return [a,b,c,d].map(n=>(n<0?n+0x100000000:n).toString(16).padStart(8,'0').match(/../g).reverse().join('')).join('')
}

// ── IP Tools ──────────────────────────────────────────────────────────────────

export function ipToHex(ip) {
  const parts = ip.trim().split('.')
  if (parts.length !== 4 || parts.some(p => isNaN(p) || +p < 0 || +p > 255))
    return '⚠️ Invalid IPv4 address'
  return '0x' + parts.map(p => (+p).toString(16).padStart(2,'0')).join('').toUpperCase()
}

export function hexToIP(hex) {
  try {
    const clean = hex.trim().replace(/^0x/i,'')
    if (clean.length !== 8 || !/^[0-9a-fA-F]+$/.test(clean)) return '⚠️ Must be 8 hex chars (e.g. C0A80101)'
    const parts = clean.match(/.{2}/g).map(h => parseInt(h,16))
    return parts.join('.')
  } catch { return '⚠️ Invalid hex IP' }
}

export function ipToBinary(ip) {
  const parts = ip.trim().split('.')
  if (parts.length !== 4 || parts.some(p => isNaN(p) || +p < 0 || +p > 255))
    return '⚠️ Invalid IPv4 address'
  return parts.map(p => (+p).toString(2).padStart(8,'0')).join('.')
}

export function isPrivateIP(ip) {
  const parts = ip.trim().split('.').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return null
  const [a,b] = parts
  if (a===10) return { isPrivate:true, range:'10.0.0.0/8 (Class A Private)' }
  if (a===172 && b>=16 && b<=31) return { isPrivate:true, range:'172.16.0.0/12 (Class B Private)' }
  if (a===192 && b===168) return { isPrivate:true, range:'192.168.0.0/16 (Class C Private)' }
  if (a===127) return { isPrivate:true, range:'127.0.0.0/8 (Loopback)' }
  if (a===169 && b===254) return { isPrivate:true, range:'169.254.0.0/16 (Link-Local)' }
  if (a===0) return { isPrivate:true, range:'0.0.0.0/8 (This Network)' }
  if (a===255) return { isPrivate:true, range:'255.255.255.255 (Broadcast)' }
  return { isPrivate:false, range:'Public IP' }
}

export function expandCIDR(cidr) {
  try {
    const [ip, prefix] = cidr.trim().split('/')
    const prefixLen = parseInt(prefix)
    if (!prefix || isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32)
      return { error: '⚠️ Invalid CIDR notation (e.g. 192.168.1.0/24)' }

    const parts = ip.split('.').map(Number)
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255))
      return { error: '⚠️ Invalid IP address' }

    const ipInt = (parts[0]<<24|parts[1]<<16|parts[2]<<8|parts[3]) >>> 0
    const mask  = prefixLen === 0 ? 0 : (0xFFFFFFFF << (32-prefixLen)) >>> 0
    const network = (ipInt & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0
    const total = Math.pow(2, 32 - prefixLen)

    const intToIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.')

    const MAX_EXPAND = 256
    const ips = []
    if (total <= MAX_EXPAND) {
      for (let i = network; i <= broadcast; i++) ips.push(intToIP(i >>> 0))
    }

    return {
      network:   intToIP(network),
      broadcast: intToIP(broadcast),
      mask:      intToIP(mask),
      first:     intToIP((network+1)>>>0),
      last:      intToIP((broadcast-1)>>>0),
      total,
      ips,
      truncated: total > MAX_EXPAND
    }
  } catch { return { error: '⚠️ Invalid CIDR input' } }
}
