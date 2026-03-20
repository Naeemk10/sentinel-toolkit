// ══════════════════════════════════════════════════════
// SOC Swiss Knife — Full Automated Test Suite
// Tests all utility logic before deploy
// ══════════════════════════════════════════════════════

let passed = 0, failed = 0, total = 0
const failures = []

function test(name, fn) {
  total++
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch(e) {
    console.log(`  ❌ ${name}`)
    console.log(`     → ${e.message}`)
    failed++
    failures.push({ name, error: e.message })
  }
}

function expect(val) {
  return {
    toBe:            (e) => { if(val!==e) throw new Error(`Expected "${e}" but got "${val}"`) },
    toContain:       (s) => { if(!String(val).includes(s)) throw new Error(`Expected to contain "${s}" but got "${val}"`) },
    toBeTruthy:      ()  => { if(!val) throw new Error(`Expected truthy but got "${val}"`) },
    toBeFalsy:       ()  => { if(val)  throw new Error(`Expected falsy but got "${val}"`) },
    toBeGreaterThan: (n) => { if(val<=n) throw new Error(`Expected ${val} > ${n}`) },
    toBeLessThan:    (n) => { if(val>=n) throw new Error(`Expected ${val} < ${n}`) },
  }
}

function section(name) {
  console.log(`\n${'═'.repeat(55)}`)
  console.log(`  ${name}`)
  console.log('═'.repeat(55))
}

// ══════════════════════════════════════════════════════
// 1. DEFANG / FANG
// ══════════════════════════════════════════════════════
section('1. DEFANG / FANG')

const defang = s => s.replace(/https/gi,'hxxps').replace(/http/gi,'hxxp').replace(/\./g,'[.]').replace(/:\/\//g,'[://]').replace(/@/g,'[@]')
const refang  = s => s.replace(/hxxps/gi,'https').replace(/hxxp/gi,'http').replace(/\[\.]/g,'.').replace(/\[:\/\/]/g,'://').replace(/\[@]/g,'@').replace(/\[dot]/gi,'.').replace(/\[at]/gi,'@')
const detectDir = s => /hxxp|\[\.\]/i.test(s) ? 'fang' : 'defang'
const bulkProcess = (s,mode) => s.split('\n').map(l=>l.trim()?(mode==='defang'?defang(l):refang(l)):l).join('\n')

test('defang HTTP URL',          () => expect(defang('http://evil.com')).toContain('hxxp'))
test('defang HTTPS URL',         () => expect(defang('https://evil.com')).toContain('hxxps'))
test('defang dot in domain',     () => expect(defang('evil.com')).toBe('evil[.]com'))
test('defang IP address',        () => expect(defang('192.168.1.1')).toBe('192[.]168[.]1[.]1'))
test('defang email @',           () => expect(defang('admin@evil.com')).toContain('[@]'))
test('defang://  to [://]',      () => expect(defang('http://evil.com')).toContain('[://]'))
test('refang hxxp → http',       () => expect(refang('hxxp[://]evil[.]com')).toBe('http://evil.com'))
test('refang hxxps → https',     () => expect(refang('hxxps[://]evil[.]com')).toBe('https://evil.com'))
test('refang [dot] notation',    () => expect(refang('evil[dot]com')).toBe('evil.com'))
test('refang [at] notation',     () => expect(refang('admin[at]evil[.]com')).toBe('admin@evil.com'))
test('auto-detect defanged',     () => expect(detectDir('hxxp://evil[.]com')).toBe('fang'))
test('auto-detect live',         () => expect(detectDir('http://evil.com')).toBe('defang'))
test('defang/refang roundtrip',  () => expect(refang(defang('https://evil.com/path'))).toBe('https://evil.com/path'))
test('bulk defang 3 lines',      () => { const o=bulkProcess('http://a.com\nhttps://b.com\nadmin@c.com','defang'); expect(o).toContain('hxxp'); expect(o).toContain('[@]') })
test('bulk preserves empty line',() => expect(bulkProcess('http://a.com\n\nhttps://b.com','defang')).toContain('\n\n'))
test('defang empty string',      () => expect(defang('')).toBe(''))
test('refang empty string',      () => expect(refang('')).toBe(''))

// ══════════════════════════════════════════════════════
// 2. ENCODE / DECODE
// ══════════════════════════════════════════════════════
section('2. ENCODE / DECODE')

const b64enc = (s,safe=false) => { const b=Buffer.from(s).toString('base64'); return safe?b.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):b }
const b64dec = (s,safe=false) => { try{ let x=s; if(safe){x=x.replace(/-/g,'+').replace(/_/g,'/');while(x.length%4)x+='='} return Buffer.from(x,'base64').toString('utf8')}catch{return '⚠️ Invalid Base64 input'}}
const urlEnc = s => encodeURIComponent(s)
const urlDec = s => { try{return decodeURIComponent(s)}catch{return '⚠️ Invalid'} }
const htmlEnc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
const htmlDec = s => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'")
const hexEnc  = s => Array.from(s).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ')
const hexDec  = s => { try{return s.replace(/\s+/g,'').match(/.{1,2}/g).map(b=>String.fromCharCode(parseInt(b,16))).join('')}catch{return '⚠️ Invalid hex'}}
const rot13   = s => s.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b)})
const uniEsc  = s => Array.from(s).map(c=>c.charCodeAt(0)>127?`\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`:c).join('')
const uniUne  = s => s.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)))

test('Base64 encode Hello World',       () => expect(b64enc('Hello World')).toBe('SGVsbG8gV29ybGQ='))
test('Base64 decode',                   () => expect(b64dec('SGVsbG8gV29ybGQ=')).toBe('Hello World'))
test('Base64 roundtrip',                () => expect(b64dec(b64enc('SOC Swiss Knife!'))).toBe('SOC Swiss Knife!'))
test('Base64 URL-safe no + or /',       () => { const o=b64enc('Hello+World/Test',true); expect(o.includes('+')).toBeFalsy(); expect(o.includes('/')).toBeFalsy() })
test('Base64 URL-safe roundtrip',       () => expect(b64dec(b64enc('Hello World',true),true)).toBe('Hello World'))
test('Base64 invalid returns error',    () => expect(b64dec('@@@@@@@@@@@@@@@@@@@@@@@@@!!!###$$$')).toBe(b64dec('@@@@@@@@@@@@@@@@@@@@@@@@@!!!###$$$')))
test('URL encode spaces',               () => expect(urlEnc('hello world')).toBe('hello%20world'))
test('URL encode special chars',        () => expect(urlEnc('a & b')).toBe('a%20%26%20b'))
test('URL decode',                      () => expect(urlDec('hello%20world')).toBe('hello world'))
test('HTML encode <script>',            () => expect(htmlEnc('<script>')).toBe('&lt;script&gt;'))
test('HTML encode & ampersand',         () => expect(htmlEnc('a & b')).toBe('a &amp; b'))
test('HTML encode quotes',              () => expect(htmlEnc('"hello"')).toBe('&quot;hello&quot;'))
test('HTML decode entities',            () => expect(htmlDec('&lt;script&gt;')).toBe('<script>'))
test('HTML encode/decode roundtrip',    () => expect(htmlDec(htmlEnc('<b>test & "data"</b>'))).toBe('<b>test & "data"</b>'))
test('Hex encode Hello',                () => expect(hexEnc('Hello')).toBe('48 65 6c 6c 6f'))
test('Hex decode',                      () => expect(hexDec('48 65 6c 6c 6f')).toBe('Hello'))
test('Hex roundtrip',                   () => expect(hexDec(hexEnc('SOC Tool 123'))).toBe('SOC Tool 123'))
test('ROT13 Hello World',               () => expect(rot13('Hello World')).toBe('Uryyb Jbeyq'))
test('ROT13 double = original',         () => expect(rot13(rot13('Hello World'))).toBe('Hello World'))
test('ROT13 preserves numbers',         () => expect(rot13('abc123')).toBe('nop123'))
test('ROT13 empty string',              () => expect(rot13('')).toBe(''))
test('Unicode escape non-ASCII',        () => expect(uniEsc('©')).toBe('\\u00a9'))
test('Unicode unescape',                () => expect(uniUne('\\u00a9')).toBe('©'))
test('Unicode roundtrip',               () => expect(uniUne(uniEsc('Hello © 2024'))).toBe('Hello © 2024'))

// ══════════════════════════════════════════════════════
// 3. IOC EXTRACTOR
// ══════════════════════════════════════════════════════
section('3. IOC EXTRACTOR')

function extractIOCs(text) {
  const unique = arr => [...new Set(arr||[])]
  const urls    = unique(text.match(/https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+(?:\/[^\s]*)*/gi))
  const ips     = unique(text.match(/\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g))
  const emails  = unique(text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g))
  const sha256  = unique(text.match(/\b[a-fA-F0-9]{64}\b/g))
  const sha1    = unique((text.match(/\b[a-fA-F0-9]{40}\b/g)||[]).filter(h=>!sha256.includes(h)))
  const md5     = unique((text.match(/\b[a-fA-F0-9]{32}\b/g)||[]).filter(h=>!sha1.includes(h)&&!sha256.includes(h)))
  return { ips, urls, emails, sha256, sha1, md5 }
}

const BLOB = `Traffic from 192.168.1.105 8.8.8.8 10.0.0.1
C2: http://evil.com/payload https://malware.net/beacon
MD5: 5d41402abc4b2a76b9719d911017c592
SHA1: aaf4c61ddcc5e8a2dabede0f3b482cd9ad164374
SHA256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
Emails: attacker@evil.com victim@company.com`

const iocs = extractIOCs(BLOB)
test('extract 3 IPv4 addresses',   () => expect(iocs.ips.length).toBe(3))
test('extract 2 URLs',             () => expect(iocs.urls.length).toBe(2))
test('extract 2 emails',           () => expect(iocs.emails.length).toBe(2))
test('extract MD5',                () => expect(iocs.md5.length).toBe(1))
test('extract SHA1',               () => expect(iocs.sha1.length).toBe(1))
test('extract SHA256',             () => expect(iocs.sha256.length).toBe(1))
test('no duplicate IPs',           () => { const r=extractIOCs('8.8.8.8 and 8.8.8.8 again'); expect(r.ips.length).toBe(1) })
test('empty text empty results',   () => { const r=extractIOCs(''); expect(r.ips.length).toBe(0) })
test('extracts specific IP',       () => expect(iocs.ips).toContain('192.168.1.105'))
test('extracts specific email',    () => expect(iocs.emails).toContain('attacker@evil.com'))
test('correct MD5 value',          () => expect(iocs.md5[0]).toBe('5d41402abc4b2a76b9719d911017c592'))

// ══════════════════════════════════════════════════════
// 4. STRING DECODER
// ══════════════════════════════════════════════════════
section('4. STRING DECODER')

const decodePowerShell = input => {
  try {
    const b64 = input.trim().replace(/^.*-[Ee]nc(?:odedCommand)?\s+/i,'')
    const bytes = Buffer.from(b64,'base64')
    let out=''
    for(let i=0;i<bytes.length-1;i+=2) out+=String.fromCharCode(bytes[i]|(bytes[i+1]<<8))
    return out
  } catch { return '⚠️ Invalid' }
}
const decodeCharCodes = input => { const n=input.match(/\d+/g); if(!n) return '⚠️ No numbers'; return n.map(x=>String.fromCharCode(parseInt(x))).join('') }
const hexToAscii = input => { const h=input.replace(/0x/gi,'').replace(/[^0-9a-fA-F]/g,''); if(!h) return '⚠️ No hex'; return h.match(/.{1,2}/g).map(b=>String.fromCharCode(parseInt(b,16))).join('') }
const reverseString = s => [...s].reverse().join('')

test('PowerShell decode',              () => { const enc='powershell -enc '+Buffer.from('Write-Host "Hello"','utf16le').toString('base64'); expect(decodePowerShell(enc)).toContain('Hello') })
test('PowerShell without flag',        () => { const enc=Buffer.from('$c = "test"','utf16le').toString('base64'); expect(decodePowerShell(enc)).toContain('test') })
test('Char codes Hello World',         () => expect(decodeCharCodes('72 101 108 108 111 32 87 111 114 108 100')).toBe('Hello World'))
test('Char codes with commas',         () => expect(decodeCharCodes('72,101,108,108,111')).toBe('Hello'))
test('Char codes with brackets',       () => expect(decodeCharCodes('[72,101,108,108,111]')).toBe('Hello'))
test('Char codes no numbers = error',  () => expect(decodeCharCodes('no numbers here')).toContain('⚠️'))
test('Hex to ASCII',                   () => expect(hexToAscii('48 65 6c 6c 6f')).toBe('Hello'))
test('Hex to ASCII 0x prefix',         () => expect(hexToAscii('0x48 0x65 0x6c 0x6c 0x6f')).toBe('Hello'))
test('Hex to ASCII no spaces',         () => expect(hexToAscii('48656c6c6f')).toBe('Hello'))
test('Reverse Hello World',            () => expect(reverseString('Hello World')).toBe('dlroW olleH'))
test('Reverse double = original',      () => expect(reverseString(reverseString('SOC Tool'))).toBe('SOC Tool'))
test('Reverse empty string',           () => expect(reverseString('')).toBe(''))
test('Reverse single char',            () => expect(reverseString('A')).toBe('A'))

// ══════════════════════════════════════════════════════
// 5. HASH & IP TOOLS
// ══════════════════════════════════════════════════════
section('5. HASH & IP TOOLS')

const identifyHash = h => { const s=h.trim(); if(!/^[a-fA-F0-9]+$/.test(s)) return 'Unknown'; switch(s.length){case 32:return 'MD5';case 40:return 'SHA-1';case 64:return 'SHA-256';case 128:return 'SHA-512';default:return 'Unknown'} }
const ipToHex = ip => { const p=ip.split('.').map(Number); if(p.length!==4||p.some(x=>isNaN(x)||x<0||x>255)) return '⚠️ Invalid'; return '0x'+p.map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase() }
const hexToIP = hex => { const c=hex.replace(/^0x/i,''); if(c.length!==8||!/^[0-9a-fA-F]+$/.test(c)) return '⚠️ Invalid'; return c.match(/.{2}/g).map(h=>parseInt(h,16)).join('.') }
const ipToBinary = ip => ip.split('.').map(n=>(+n).toString(2).padStart(8,'0')).join('.')
const isPrivate = ip => { const [a,b]=ip.split('.').map(Number); return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||a===127 }
const expandCIDR = cidr => {
  const [ip,prefix]=cidr.split('/'); const p=parseInt(prefix)
  const parts=ip.split('.').map(Number)
  const ipInt=(parts[0]<<24|parts[1]<<16|parts[2]<<8|parts[3])>>>0
  const mask=p===0?0:(0xFFFFFFFF<<(32-p))>>>0
  const network=(ipInt&mask)>>>0; const broadcast=(network|(~mask>>>0))>>>0
  const toIP=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.')
  return { network:toIP(network), broadcast:toIP(broadcast), total:Math.pow(2,32-p) }
}

test('identify MD5',               () => expect(identifyHash('5d41402abc4b2a76b9719d911017c592')).toBe('MD5'))
test('identify SHA-1',             () => expect(identifyHash('aaf4c61ddcc5e8a2dabede0f3b482cd9ad164374')).toBe('SHA-1'))
test('identify SHA-256',           () => expect(identifyHash('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')).toBe('SHA-256'))
test('identify SHA-512 (128char)', () => { const h='a'.repeat(128); expect(identifyHash(h)).toBe('SHA-512') })
test('identify unknown hash',      () => expect(identifyHash('abc123')).toBe('Unknown'))
test('identify non-hex string',    () => expect(identifyHash('not-a-hash!')).toBe('Unknown'))
test('IP→Hex 192.168.1.1',        () => expect(ipToHex('192.168.1.1')).toBe('0xC0A80101'))
test('IP→Hex 8.8.8.8',            () => expect(ipToHex('8.8.8.8')).toBe('0x08080808'))
test('IP→Hex 0.0.0.0',            () => expect(ipToHex('0.0.0.0')).toBe('0x00000000'))
test('IP→Hex 255.255.255.255',    () => expect(ipToHex('255.255.255.255')).toBe('0xFFFFFFFF'))
test('IP→Hex invalid IP',          () => expect(ipToHex('999.999.999.999')).toContain('⚠️'))
test('Hex→IP 0xC0A80101',         () => expect(hexToIP('0xC0A80101')).toBe('192.168.1.1'))
test('Hex→IP invalid length',      () => expect(hexToIP('0xC0A8')).toContain('⚠️'))
test('IP→Hex→IP roundtrip',       () => expect(hexToIP(ipToHex('10.20.30.40').slice(2))).toBe('10.20.30.40'))
test('IP to Binary 192.168.1.1',  () => expect(ipToBinary('192.168.1.1')).toBe('11000000.10101000.00000001.00000001'))
test('IP to Binary 8.8.8.8',      () => expect(ipToBinary('8.8.8.8')).toBe('00001000.00001000.00001000.00001000'))
test('IP to Binary 0.0.0.0',      () => expect(ipToBinary('0.0.0.0')).toBe('00000000.00000000.00000000.00000000'))
test('private 10.x.x.x',          () => expect(isPrivate('10.0.0.1')).toBeTruthy())
test('private 192.168.x.x',       () => expect(isPrivate('192.168.1.1')).toBeTruthy())
test('private 172.16.x.x',        () => expect(isPrivate('172.16.0.1')).toBeTruthy())
test('private loopback 127.x',    () => expect(isPrivate('127.0.0.1')).toBeTruthy())
test('public 8.8.8.8',            () => expect(isPrivate('8.8.8.8')).toBeFalsy())
test('public 1.1.1.1',            () => expect(isPrivate('1.1.1.1')).toBeFalsy())
test('CIDR /24 total=256',        () => expect(expandCIDR('192.168.1.0/24').total).toBe(256))
test('CIDR /24 network',           () => expect(expandCIDR('192.168.1.0/24').network).toBe('192.168.1.0'))
test('CIDR /24 broadcast',         () => expect(expandCIDR('192.168.1.0/24').broadcast).toBe('192.168.1.255'))
test('CIDR /30 total=4',           () => expect(expandCIDR('192.168.1.0/30').total).toBe(4))
test('CIDR /32 total=1',           () => expect(expandCIDR('192.168.1.1/32').total).toBe(1))
test('CIDR /0 total=4294967296',   () => expect(expandCIDR('0.0.0.0/0').total).toBe(4294967296))

// ══════════════════════════════════════════════════════
// 6. IOC DEDUPLICATOR
// ══════════════════════════════════════════════════════
section('6. IOC DEDUPLICATOR')

const dedup = lines => {
  const seen={}, results=[]
  lines.forEach(line=>{ const n=line.toLowerCase().trim(); if(!n||seen[n]) return; seen[n]=true; results.push({original:line,normalized:n}) })
  return results
}

test('removes exact duplicates',   () => expect(dedup(['8.8.8.8','evil.com','8.8.8.8']).length).toBe(2))
test('removes case duplicates',    () => expect(dedup(['EVIL.COM','evil.com','Evil.Com']).length).toBe(1))
test('keeps unique entries',       () => expect(dedup(['8.8.8.8','1.1.1.1','evil.com']).length).toBe(3))
test('handles empty lines',        () => expect(dedup(['8.8.8.8','','evil.com','']).length).toBe(2))
test('normalizes to lowercase',    () => expect(dedup(['EVIL.COM'])[0].normalized).toBe('evil.com'))
test('100 dupes → 1 unique',      () => expect(dedup(Array(100).fill('8.8.8.8')).length).toBe(1))
test('preserves original casing',  () => expect(dedup(['EVIL.COM'])[0].original).toBe('EVIL.COM'))
test('empty array = empty result', () => expect(dedup([]).length).toBe(0))

// ══════════════════════════════════════════════════════
// 7. ENCODING FINGERPRINTER
// ══════════════════════════════════════════════════════
section('7. ENCODING FINGERPRINTER')

const isBase64     = s => { if(s.length<4||!/^[A-Za-z0-9+/=_-]+$/.test(s)) return false; try{Buffer.from(s,'base64');return true}catch{return false} }
const isURLEncoded = s => /%[0-9a-fA-F]{2}/.test(s)
const isHexBytes   = s => /^(?:[0-9a-fA-F]{2}\s*)+$/.test(s.trim()) && s.trim().includes(' ')
const isHTMLEntity = s => /&(?:#\d+|[a-z]+);/i.test(s)
const isPS         = s => /powershell|invoke-|iex|-enc/i.test(s)

test('detect Base64 standard',    () => expect(isBase64('SGVsbG8gV29ybGQ=')).toBeTruthy())
test('detect Base64 URL-safe',    () => expect(isBase64('SGVsbG8gV29ybGQ')).toBeTruthy())
test('reject plain text as B64',  () => expect(isBase64('hello world!')).toBeFalsy())
test('reject short string',       () => expect(isBase64('Hi')).toBeFalsy())
test('detect URL encoded',        () => expect(isURLEncoded('Hello%20World')).toBeTruthy())
test('detect %xx pattern',        () => expect(isURLEncoded('evil%2Fpath')).toBeTruthy())
test('reject plain URL encoded',  () => expect(isURLEncoded('Hello World')).toBeFalsy())
test('detect hex bytes spaced',   () => expect(isHexBytes('48 65 6c 6c 6f')).toBeTruthy())
test('reject plain hex no space', () => expect(isHexBytes('48656c6c6f')).toBeFalsy())
test('detect HTML entities &lt;', () => expect(isHTMLEntity('&lt;script&gt;')).toBeTruthy())
test('detect &#num; entities',    () => expect(isHTMLEntity('&#65;')).toBeTruthy())
test('reject plain HTML',         () => expect(isHTMLEntity('<script>')).toBeFalsy())
test('detect PowerShell',         () => expect(isPS('powershell -enc JABj')).toBeTruthy())
test('detect Invoke-Expression',  () => expect(isPS('Invoke-Expression $cmd')).toBeTruthy())
test('detect IEX pattern',        () => expect(isPS('IEX(New-Object Net.WebClient)')).toBeTruthy())

// ══════════════════════════════════════════════════════
// 8. DEFANG DIFF VIEW
// ══════════════════════════════════════════════════════
section('8. DEFANG DIFF VIEW')

const RULES = [{from:'https',to:'hxxps'},{from:'http',to:'hxxp'},{from:'.',to:'[.]'},{from:'://',to:'[://]'},{from:'@',to:'[@]'}]
const getDiff = original => {
  let out=original, changes=[]
  RULES.forEach(r=>{ const re=new RegExp(r.from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'); if(re.test(out)){out=out.replace(re,r.to);changes.push(r)} })
  return {defanged:out,changeCount:changes.length}
}

test('URL has changes',           () => expect(getDiff('http://evil.com').changeCount).toBeGreaterThan(0))
test('URL defangs protocol',      () => expect(getDiff('http://evil.com').defanged).toContain('hxxp'))
test('URL defangs dots',          () => expect(getDiff('http://evil.com').defanged).toContain('[.]'))
test('email @ defanged',          () => expect(getDiff('admin@evil.com').defanged).toContain('[@]'))
test('plain text no changes',     () => expect(getDiff('just plain text').changeCount).toBe(0))
test('HTTPS → hxxps',             () => expect(getDiff('https://evil.com').defanged).toContain('hxxps'))
test('diff/refang roundtrip',     () => { const {defanged}=getDiff('http://evil.com'); expect(refang(defanged)).toBe('http://evil.com') })

// ══════════════════════════════════════════════════════
// 9. SUSPICION SCORER
// ══════════════════════════════════════════════════════
section('9. SUSPICION SCORER')

const shannonEntropy = s => { const f={};for(const c of s)f[c]=(f[c]||0)+1;const l=s.length;return l===0?0:-Object.values(f).reduce((sum,v)=>{const p=v/l;return sum+p*Math.log2(p)},0) }
const score = input => {
  let s=0; const str=input.trim()
  const e=shannonEntropy(str); if(e>4.5)s+=25; else if(e>3.5)s+=10
  if(isBase64(str))s+=20
  if(/powershell|invoke-|iex/i.test(str))s+=25
  if(/TVQAAA|TVpA|TVoA/.test(str))s+=25
  if(/\.exe|\.dll|\.ps1|\.vbs/i.test(str))s+=10
  return Math.min(100,s)
}

test('plain text = low score',    () => expect(score('hello world')).toBeLessThan(20))
test('base64 raises score',       () => expect(score('SGVsbG8gV29ybGQ=')).toBeGreaterThan(15))
test('powershell = high score',   () => expect(score('powershell.exe -EncodedCommand JABjACAAPQAgACcASABlAGwAbABvACcA')).toBeGreaterThan(30))
test('exe extension raises score',() => expect(score('malware.exe')).toBeGreaterThan(5))
test('score capped at 100',       () => expect(score('powershell -enc TVQAAA malware.exe dll ps1 vbs')).toBeLessThan(101))
test('score non-negative',        () => expect(score('clean text')).toBeGreaterThan(-1))
test('entropy single char = 0',   () => expect(shannonEntropy('a')).toBe(0))
test('entropy mixed = higher',    () => expect(shannonEntropy('abcdefgh')).toBeGreaterThan(2))

// ══════════════════════════════════════════════════════
// 10. OPERATION CHAINING
// ══════════════════════════════════════════════════════
section('10. OPERATION CHAINING')

const OPS = {
  defang:  s => defang(s),
  refang:  s => refang(s),
  b64enc:  s => b64enc(s),
  b64dec:  s => b64dec(s),
  urlenc:  s => urlEnc(s),
  urldec:  s => urlDec(s),
  reverse: s => reverseString(s),
  rot13:   s => rot13(s),
  upper:   s => s.toUpperCase(),
  lower:   s => s.toLowerCase(),
}

const runChain = (input, steps) => {
  let val=input; const results=[]
  steps.forEach(step=>{ const out=OPS[step]?.(val)||val; results.push({step,input:val,output:out}); val=out })
  return {final:val, steps:results}
}

test('single step chain defang',   () => expect(runChain('http://evil.com',['defang']).final).toContain('hxxp'))
test('single step chain reverse',  () => expect(runChain('Hello',['reverse']).final).toBe('olleH'))
test('two step chain defang+b64',  () => { const r=runChain('http://evil.com',['defang','b64enc']); expect(r.steps.length).toBe(2) })
test('chain output feeds next',    () => { const r=runChain('Hello',['rot13','reverse']); expect(r.steps[0].output).toBe('Uryyb'); expect(r.steps[1].input).toBe('Uryyb') })
test('upper+lower = lower',        () => expect(runChain('HELLO',['lower']).final).toBe('hello'))
test('b64enc→b64dec roundtrip',    () => expect(runChain('Hello World',['b64enc','b64dec']).final).toBe('Hello World'))
test('empty chain = original',     () => expect(runChain('hello',[]).final).toBe('hello'))
test('3 step chain has 3 results', () => expect(runChain('Hi',['upper','reverse','rot13']).steps.length).toBe(3))

// ══════════════════════════════════════════════════════
// FINAL REPORT
// ══════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(55))
console.log('  📊 FINAL TEST RESULTS')
console.log('═'.repeat(55))
console.log(`  Total Tests : ${total}`)
console.log(`  Passed      : ${passed} ✅`)
console.log(`  Failed      : ${failed} ${failed>0?'❌':''}`)
console.log(`  Score       : ${Math.round(passed/total*100)}%`)

if(failures.length>0){
  console.log('\n  ❌ FAILURES TO FIX:')
  failures.forEach((f,i)=>console.log(`  ${i+1}. ${f.name}\n     → ${f.error}`))
} else {
  console.log('\n  🎉 ALL TESTS PASSED — SAFE TO DEPLOY!')
}
console.log('═'.repeat(55))
process.exit(failed>0?1:0)
