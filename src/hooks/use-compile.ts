"use client"

import { useState, useCallback, useRef } from "react"
import type { CompileResponse, LatestPdfResponse } from "@/lib/types"

interface CompileError {
  type: string
  log: string | null
}

interface CompileResult {
  success: boolean
  pdfUrl?: string
  downloadUrl?: string
  error?: CompileError
}

interface CompileOptions {
  tex?: string
}

function addCacheBust(url: string, compiledAt: string): string {
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}v=${encodeURIComponent(compiledAt)}`
}

export function useCompile(projectId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [compileError, setCompileError] = useState<CompileError | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isLoadingLatestPdf, setIsLoadingLatestPdf] = useState(false)
  const activeControllerRef = useRef<AbortController | null>(null)
  const activePromiseRef = useRef<Promise<CompileResult> | null>(null)
  const activeFingerprintRef = useRef<string | null>(null)
  const requestSeqRef = useRef(0)

  const compile = useCallback(async (options: CompileOptions = {}): Promise<CompileResult> => {
    const fingerprint = options.tex ?? "__db_source__"

    if (
      activePromiseRef.current &&
      activeFingerprintRef.current === fingerprint
    ) {
      return activePromiseRef.current
    }

    if (
      activeControllerRef.current &&
      activeFingerprintRef.current !== fingerprint
    ) {
      activeControllerRef.current.abort()
    }

    const seq = requestSeqRef.current + 1
    requestSeqRef.current = seq
    setIsCompiling(true)
    setCompileError(null)
    activeFingerprintRef.current = fingerprint
    const controller = new AbortController()
    activeControllerRef.current = controller

    let runPromise: Promise<CompileResult> | null = null
    runPromise = (async () => {
      try {
        const compilerUrl = process.env.NEXT_PUBLIC_COMPILER_URL || "http://localhost:8000"
        const payload: { project_id: string; tex?: string } = { project_id: projectId }
        if (options.tex !== undefined) {
          payload.tex = options.tex
        }

        const response = await fetch(`${compilerUrl}/compile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        const data: CompileResponse = await response.json()
        if (seq !== requestSeqRef.current) {
          return {
            success: false,
            error: { type: "cancelled", log: "Superseded by a newer compile request" },
          }
        }

        if (data.status === "success" && data.pdf_url) {
          const previewUrl = addCacheBust(data.pdf_url, data.compiled_at)
          setPdfUrl(previewUrl)
          setDownloadUrl(data.pdf_url)
          return { success: true, pdfUrl: previewUrl, downloadUrl: data.pdf_url }
        }

        const error = {
          type: data.error_type || "unknown_error",
          log: data.log || null,
        }
        setCompileError(error)
        return { success: false, error }
      } catch (err) {
        const isAbort =
          (err instanceof Error && err.name === "AbortError") ||
          (typeof err === "object" && err !== null && "name" in err && (err as { name: string }).name === "AbortError")
        if (isAbort) {
          return {
            success: false,
            error: { type: "cancelled", log: "Superseded by a newer compile request" },
          }
        }

        const error = {
          type: "network_error",
          log: err instanceof Error ? err.message : "Failed to connect to compiler",
        }
        if (seq === requestSeqRef.current) {
          setCompileError(error)
        }
        return { success: false, error }
      } finally {
        if (runPromise && activePromiseRef.current === runPromise) {
          activePromiseRef.current = null
        }
        if (activeControllerRef.current === controller) {
          activeControllerRef.current = null
        }
        if (seq === requestSeqRef.current) {
          setIsCompiling(false)
        }
      }
    })()
    activePromiseRef.current = runPromise
    return runPromise
  }, [projectId])

  const loadLatestCompiledPdf = useCallback(async (): Promise<boolean> => {
    setIsLoadingLatestPdf(true)
    try {
      const compilerUrl = process.env.NEXT_PUBLIC_COMPILER_URL || "http://localhost:8000"
      const response = await fetch(
        `${compilerUrl}/projects/${encodeURIComponent(projectId)}/latest-pdf`
      )
      if (!response.ok) {
        return false
      }

      const data: LatestPdfResponse = await response.json()

      if (!data?.pdf_url) {
        return false
      }

      const compiledAt = data.compiled_at || new Date().toISOString()
      const previewUrl = addCacheBust(data.pdf_url, compiledAt)
      setDownloadUrl(data.pdf_url)
      setPdfUrl(previewUrl)
      return true
    } catch {
      return false
    } finally {
      setIsLoadingLatestPdf(false)
    }
  }, [projectId])

  const clearError = useCallback(() => {
    setCompileError(null)
  }, [])

  return {
    compile,
    loadLatestCompiledPdf,
    pdfUrl,
    downloadUrl,
    isLoadingLatestPdf,
    compileError,
    isCompiling,
    clearError,
  }
}
