"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Project } from "@/lib/types"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProjects(data || [])
    }

    setLoading(false)
  }, [supabase])

  const createProject = useCallback(
    async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      const { data, error: createError } = await supabase
        .from("projects")
        .insert({
          name,
          owner_id: user.id,
          tex: getDefaultTex(name),
        })
        .select()
        .single()

      if (createError) {
        throw new Error(createError.message)
      }

      setProjects((prev) => [data, ...prev])
      return data as Project
    },
    [supabase]
  )

  const deleteProject = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      setProjects((prev) => prev.filter((p) => p.id !== id))
    },
    [supabase]
  )

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refresh: fetchProjects,
  }
}

function getDefaultTex(name: string): string {
  return `\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\title{${name}}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Start writing your document here.

\\end{document}
`
}
