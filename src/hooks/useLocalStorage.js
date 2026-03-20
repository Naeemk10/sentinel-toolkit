import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStored(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      setStored(value)
    }
  }

  return [stored, setValue]
}
