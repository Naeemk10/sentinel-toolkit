export function defang(input) {
  return input
    .replace(/https/gi, 'hxxps')
    .replace(/http/gi,  'hxxp')
    .replace(/\./g,     '[.]')
    .replace(/:\/\//g,  '[://]')
    .replace(/@/g,      '[@]')
}

export function refang(input) {
  return input
    .replace(/hxxps/gi,   'https')
    .replace(/hxxp/gi,    'http')
    .replace(/\[\.]/g,    '.')
    .replace(/\[:\/\/]/g, '://')
    .replace(/\[@]/g,     '@')
    .replace(/\[at]/gi,   '@')
    .replace(/\[dot]/gi,  '.')
}

export function detectDirection(input) {
  const defangedPatterns = [/hxxp/i, /\[\.\]/, /\[:\/\/\]/, /\[@\]/, /\[dot\]/i, /\[at\]/i]
  return defangedPatterns.some(p => p.test(input)) ? 'fang' : 'defang'
}

export function processBulk(input, mode) {
  const fn = mode === 'defang' ? defang : refang
  return input.split('\n').map(line => line.trim() ? fn(line) : line).join('\n')
}

export function autoProcess(input) {
  const direction = detectDirection(input)
  return { direction, output: processBulk(input, direction) }
}
