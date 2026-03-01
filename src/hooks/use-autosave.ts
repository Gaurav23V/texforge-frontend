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

  const save = useCallback(async (val: string) => {
    if (val === lastSavedRef.current) return
    
    setIsSaving(true)
    try {
      await onSave(val)
      lastSavedRef.current = val
    } catch (err) {
      console.error("Autosave failed:", err)
    } finally {
      setIsSaving(false)
    }
  }, [onSave])

  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      save(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, enabled, save])

  // Save immediately on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { isSaving }
}
