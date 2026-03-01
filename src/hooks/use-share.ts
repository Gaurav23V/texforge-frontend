"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { nanoid } from "@/lib/nanoid"

export function useShare(projectId: string) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const generateShareLink = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const token = nanoid(16)

      const { error: insertError } = await supabase
        .from("shares")
        .insert({
          token,
          project_id: projectId,
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)
      return url
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate share link"
      setError(message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [supabase, projectId])

  const copyToClipboard = useCallback(async () => {
    if (!shareUrl) return false
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      return true
    } catch {
      return false
    }
  }, [shareUrl])

  return {
    shareUrl,
    isGenerating,
    error,
    generateShareLink,
    copyToClipboard,
  }
}
