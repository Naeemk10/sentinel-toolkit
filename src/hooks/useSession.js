import { useState, useCallback } from 'react'

export function useSession() {
  const [sessions, setSessions] = useState([])

  const log = useCallback((entry) => {
    const event = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      date: new Date().toLocaleDateString('en-GB'),
      tab: entry.tab || 'Unknown',
      operation: entry.operation || '',
      input: entry.input || '',
      output: entry.output || '',
      iocs: entry.iocs || [],
      suspicionScore: entry.suspicionScore ?? null,
    }
    setSessions(prev => [event, ...prev])
  }, [])

  const clearSessions = useCallback(() => setSessions([]), [])

  return { log, sessions, clearSessions }
}
