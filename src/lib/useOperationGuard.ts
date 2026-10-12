import { useEffect, useRef } from 'react'

/** Prevent duplicate clicks and continuing a multi-step operation after leaving its owner scope. */
export function useOperationGuard() {
  const active = useRef(true)
  const locked = useRef(false)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  return {
    active,
    start() { if (locked.current || !active.current) return false; locked.current = true; return true },
    finish() { locked.current = false },
    check() { if (!active.current) throw new Error('Operation stopped because this screen was closed.') },
  }
}
