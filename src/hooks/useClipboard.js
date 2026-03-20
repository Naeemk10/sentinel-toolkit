import { useState, useCallback } from 'react'

export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), resetMs)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), resetMs)
    }
  }, [resetMs])

  return { copied, copy }
}
