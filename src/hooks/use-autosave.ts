"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseAutosaveOptions {
  value: string
  onSave: (value: string) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutosave({
  value,
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutosaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef(value)
  const inFlightRef = useRef(false)
  const pendingRef = useRef<string | null>(null)

  const flushQueue = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true

    while (pendingRef.current !== null) {
      const nextValue = pendingRef.current
      pendingRef.current = null

      if (nextValue === lastSavedRef.current) {
        continue
      }

      setIsSaving(true)
      try {
        await onSave(nextValue)
        lastSavedRef.current = nextValue
      } catch (err) {
        console.error("Autosave failed:", err)
      } finally {
        setIsSaving(false)
      }
    }

    inFlightRef.current = false
  }, [onSave])

  const queueSave = useCallback(
    (val: string) => {
      pendingRef.current = val
      void flushQueue()
    },
    [flushQueue]
  )

  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      queueSave(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, enabled, queueSave])

  // Save immediately on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (value !== lastSavedRef.current) {
        pendingRef.current = value
      }
    }
  }, [value])

  return { isSaving }
}
