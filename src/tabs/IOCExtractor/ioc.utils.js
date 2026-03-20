// IPv4
const IPv4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g

// IPv6
const IPv6_RE = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\b/g

// Domains (excludes pure IPs)
const DOMAIN_RE = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|edu|gov|mil|io|co|uk|de|fr|ru|cn|jp|br|au|in|it|nl|se|no|es|info|biz|xyz|online|site|tech|app|dev|cloud|ai|sh|cc|me|tv|us|ca|mx)\b/gi

// URLs
const URL_RE = /https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+(?:\/[^\s]*)*/gi

// Hashes
const MD5_RE    = /\b[a-fA-F0-9]{32}\b/g
const SHA1_RE   = /\b[a-fA-F0-9]{40}\b/g
const SHA256_RE = /\b[a-fA-F0-9]{64}\b/g
const SHA512_RE = /\b[a-fA-F0-9]{128}\b/g

// Emails
const EMAIL_RE = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g

function unique(arr) { return [...new Set(arr)] }
function matchAll(text, re) { return unique(Array.from(text.matchAll(new RegExp(re.source, re.flags))) .map(m => m[0])) }

export function extractIOCs(text) {
  const urls    = matchAll(text, URL_RE)
  const ips     = matchAll(text, IPv4_RE).filter(ip => !['0.0.0.0','255.255.255.255'].includes(ip))
  const ipv6    = matchAll(text, IPv6_RE)
  const emails  = matchAll(text, EMAIL_RE)
  const domains = matchAll(text, DOMAIN_RE).filter(d =>
    !urls.some(u => u.includes(d)) && !emails.some(e => e.includes(d))
  )
  const sha512  = matchAll(text, SHA512_RE)
  const sha256  = matchAll(text, SHA256_RE).filter(h => !sha512.includes(h))
  const sha1    = matchAll(text, SHA1_RE).filter(h => !sha256.includes(h) && !sha512.includes(h))
  const md5     = matchAll(text, MD5_RE).filter(h => !sha1.includes(h) && !sha256.includes(h) && !sha512.includes(h))

  return { urls, ips, ipv6, domains, emails, md5, sha1, sha256, sha512 }
}

export function toCSV(iocMap) {
  const rows = [['type','value']]
  const types = { urls:'URL', ips:'IPv4', ipv6:'IPv6', domains:'Domain', emails:'Email', md5:'MD5', sha1:'SHA1', sha256:'SHA256', sha512:'SHA512' }
  Object.entries(iocMap).forEach(([key, values]) => {
    values.forEach(v => rows.push([types[key] || key, v]))
  })
  return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
}

export function countTotal(iocMap) {
  return Object.values(iocMap).reduce((sum, arr) => sum + arr.length, 0)
}
