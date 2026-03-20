export function generateMarkdown(sessions) {
  const now = new Date().toLocaleString('en-GB')
  const total = sessions.length
  const scored = sessions.filter(s => s.suspicionScore !== null)
  const maxScore = scored.length ? Math.max(...scored.map(s => s.suspicionScore)) : null

  let md = `# 🔪 SOC Swiss Knife — Session Report\n`
  md += `**Generated:** ${now}  \n`
  md += `**Total Operations:** ${total}  \n`
  if (maxScore !== null) md += `**Highest Suspicion Score:** ${maxScore}/100  \n`
  md += `\n---\n\n`
  md += `## Operations Log\n\n`

  sessions.slice().reverse().forEach((s) => {
    md += `### [${s.timestamp}] ${s.tab} — ${s.operation}\n`
    if (s.input)  md += `**Input:** \`${s.input.slice(0, 200)}\`  \n`
    if (s.output) md += `**Output:** \`${s.output.slice(0, 200)}\`  \n`
    if (s.suspicionScore !== null) md += `**Suspicion Score:** ${s.suspicionScore}/100  \n`
    md += `\n`
  })

  return md
}

export function generateHTML(sessions) {
  const md = generateMarkdown(sessions)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SOC Swiss Knife — Session Report</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #06090f; color: #fff; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { color: #4a90d9; }
  h2 { color: #4a90d9; border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 8px; }
  h3 { color: #06d6a0; font-family: monospace; }
  code { background: rgba(255,255,255,.08); padding: 2px 6px; border-radius: 4px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; }
  strong { color: rgba(255,255,255,.55); font-size: 12px; }
  hr { border-color: rgba(255,255,255,.07); }
</style>
</head>
<body>
<pre style="white-space:pre-wrap;font-family:inherit">${md.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/^# (.+)/gm, '<h1>$1</h1>').replace(/^## (.+)/gm, '<h2>$1</h2>').replace(/^### (.+)/gm, '<h3>$1</h3>').replace(/^---$/gm, '<hr>')}</pre>
</body>
</html>`
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
