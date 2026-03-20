import { IOC_SENTINEL_URL } from './constants.js'

export function sendToIOCSentinel(data) {
  if (!data || !data.trim()) return
  const encoded = encodeURIComponent(data.trim())
  const url = `${IOC_SENTINEL_URL}?ioc=${encoded}`
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) window.location.href = url
}

export function formatIOCsForSentinel(iocMap) {
  return Object.values(iocMap).flat().filter(Boolean).join('\n')
}
