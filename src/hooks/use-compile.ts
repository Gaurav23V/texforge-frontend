"use client"

import { useState, useCallback } from "react"
import type { CompileResponse } from "@/lib/types"

interface CompileError {
  type: string
  log: string | null
}

interface CompileResult {
  success: boolean
  pdfUrl?: string
  error?: CompileError
}

export function useCompile(projectId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [compileError, setCompileError] = useState<CompileError | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)

  const compile = useCallback(async (): Promise<CompileResult> => {
    setIsCompiling(true)
    setCompileError(null)

    try {
      const compilerUrl = process.env.NEXT_PUBLIC_COMPILER_URL || "http://localhost:8000"
      
      const response = await fetch(`${compilerUrl}/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: projectId }),
      })

      const data: CompileResponse = await response.json()

      if (data.status === "success" && data.pdf_url) {
        setPdfUrl(data.pdf_url)
        return { success: true, pdfUrl: data.pdf_url }
      } else {
        const error = {
          type: data.error_type || "unknown_error",
          log: data.log || null,
        }
        setCompileError(error)
        return { success: false, error }
      }
    } catch (err) {
      const error = {
        type: "network_error",
        log: err instanceof Error ? err.message : "Failed to connect to compiler",
      }
      setCompileError(error)
      return { success: false, error }
    } finally {
      setIsCompiling(false)
    }
  }, [projectId])

  const clearError = useCallback(() => {
    setCompileError(null)
  }, [])

  return {
    compile,
    pdfUrl,
    compileError,
    isCompiling,
    clearError,
  }
}
