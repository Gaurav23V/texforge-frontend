"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Project } from "@/lib/types"

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProject = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()

    if (fetchError) {
      setError(fetchError.message)
      setProject(null)
    } else {
      setProject(data)
    }

    setLoading(false)
  }, [supabase, projectId])

  const updateTex = useCallback(
    async (tex: string) => {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ tex })
        .eq("id", projectId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setProject((prev) => (prev ? { ...prev, tex, updated_at: new Date().toISOString() } : null))
    },
    [supabase, projectId]
  )

  const updateName = useCallback(
    async (name: string) => {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ name })
        .eq("id", projectId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setProject((prev) => (prev ? { ...prev, name } : null))
    },
    [supabase, projectId]
  )

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    updateTex,
    updateName,
    refresh: fetchProject,
  }
}
