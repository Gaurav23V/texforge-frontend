"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useProject } from "@/hooks/use-project"
import { useAutosave } from "@/hooks/use-autosave"
import { useCompile } from "@/hooks/use-compile"
import { LatexEditor } from "@/components/editor/latex-editor"
import { PdfViewer } from "@/components/pdf-viewer"
import { ErrorLog } from "@/components/error-log"
import { Button } from "@/components/ui/button"
import { ShareDialog } from "@/components/share-dialog"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCode2,
  FileText,
  Loader2,
  Play,
} from "lucide-react"
import type { EditorState } from "@/lib/types"

export default function EditorPage() {
  const reduceMotion = useReducedMotion()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { project, loading, error, updateTex } = useProject(projectId)
  const [tex, setTex] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<EditorState>("idle")
  
  const {
    compile,
    loadLatestCompiledPdf,
    pdfUrl,
    downloadUrl,
    isLoadingLatestPdf,
    compileError,
    isCompiling,
    clearError,
  } = useCompile(projectId)

  const handleTexChange = useCallback((value: string) => {
    setTex(value)
  }, [])

  const { isSaving } = useAutosave({
    value: tex ?? "",
    onSave: async (value) => {
      if (project && value !== project.tex) {
        setEditorState("saving")
        await updateTex(value)
        setEditorState("idle")
      }
    },
    delay: 1000,
    enabled: tex !== null && tex !== project?.tex,
  })

  const handleCompile = async () => {
    setEditorState("compiling")
    const result = await compile({ tex: tex ?? project?.tex ?? "" })
    setEditorState(result.success ? "success" : "error")
    
    // Reset to idle after a delay if successful
    if (result.success) {
      setTimeout(() => setEditorState("idle"), 2000)
    }
  }

  useEffect(() => {
    if (project && tex === null) {
      setTex(project.tex)
    }
  }, [project, tex])

  useEffect(() => {
    if (!project?.id) return
    void loadLatestCompiledPdf()
  }, [project?.id, loadLatestCompiledPdf])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg">{error || "Project not found"}</p>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-hero-gradient opacity-60"
      />
      <div className="relative z-10 flex h-screen flex-col gap-3 p-3 md:p-4">
        <header className="surface-glass flex shrink-0 flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center md:justify-between md:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">{project.name}</p>
              <p className="text-xs text-muted-foreground">Live LaTeX workspace</p>
            </div>
            <StatusIndicator state={editorState} isSaving={isSaving} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleCompile} disabled={isCompiling} size="sm" variant="brand">
              {isCompiling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Compile
            </Button>
            {downloadUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={downloadUrl}
                  download={`${project.name}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            ) : null}
            <ShareDialog projectId={projectId} />
          </div>
        </header>

        <main className="grid min-h-0 flex-1 gap-3 [grid-template-rows:minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-2 lg:[grid-template-rows:minmax(0,1fr)]">
          <motion.section
            className="surface-elevated flex min-h-0 flex-col p-3 md:p-4"
            initial={reduceMotion ? undefined : { opacity: 0, x: -14 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.25, ease: "easeOut" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <FileCode2 className="h-4 w-4 text-primary" />
                Source
              </div>
              <span className="text-xs text-muted-foreground">Autosave enabled</span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl">
              <LatexEditor value={tex ?? ""} onChange={handleTexChange} />
            </div>
          </motion.section>

          <motion.section
            className="surface-elevated flex min-h-0 flex-col p-3 md:p-4"
            initial={reduceMotion ? undefined : { opacity: 0, x: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.25, ease: "easeOut", delay: 0.05 }}
            aria-busy={isCompiling || isLoadingLatestPdf}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                PDF Preview
              </div>
              <span className="text-xs text-muted-foreground">
                {isLoadingLatestPdf ? "Restoring latest compile..." : "Live output"}
              </span>
            </div>
            {compileError ? <ErrorLog error={compileError} onDismiss={clearError} /> : null}
            <div className="min-h-0 flex-1">
              <PdfViewer url={pdfUrl} isLoading={isLoadingLatestPdf} />
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  )
}

function StatusIndicator({ state, isSaving }: { state: EditorState; isSaving: boolean }) {
  if (isSaving || state === "saving") {
    return (
      <span className="status-pill status-pill-warning" aria-live="polite">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving
      </span>
    )
  }

  if (state === "compiling") {
    return (
      <span className="status-pill status-pill-info" aria-live="polite">
        <Loader2 className="h-3 w-3 animate-spin" />
        Compiling
      </span>
    )
  }

  if (state === "success") {
    return (
      <span className="status-pill status-pill-success" aria-live="polite">
        <CheckCircle2 className="h-3 w-3" />
        Compiled
      </span>
    )
  }

  if (state === "error") {
    return (
      <span className="status-pill status-pill-error" aria-live="polite">
        <AlertCircle className="h-3 w-3" />
        Error
      </span>
    )
  }

  return (
    <span className="status-pill status-pill-info" aria-live="polite">
      <CheckCircle2 className="h-3 w-3" />
      Saved
    </span>
  )
}
