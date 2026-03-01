"use client"

import { useState, useCallback } from "react"
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
import { 
  ArrowLeft, 
  Play, 
  Download, 
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import type { EditorState } from "@/lib/types"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { project, loading, error, updateTex } = useProject(projectId)
  const [tex, setTex] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<EditorState>("idle")
  
  const { compile, pdfUrl, compileError, isCompiling } = useCompile(projectId)

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
    const result = await compile()
    setEditorState(result.success ? "success" : "error")
    
    // Reset to idle after a delay if successful
    if (result.success) {
      setTimeout(() => setEditorState("idle"), 2000)
    }
  }

  // Initialize tex from project when loaded
  if (project && tex === null) {
    setTex(project.tex)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg">{error || "Project not found"}</p>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="font-semibold truncate max-w-xs">{project.name}</h1>
          <StatusIndicator state={editorState} isSaving={isSaving} />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCompile} 
            disabled={isCompiling}
            size="sm"
          >
            {isCompiling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Compile
          </Button>
          {pdfUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} download={`${project.name}.pdf`} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
          <ShareDialog projectId={projectId} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        <div className="w-1/2 h-full p-4 overflow-hidden">
          <LatexEditor
            value={tex ?? ""}
            onChange={handleTexChange}
          />
        </div>

        {/* PDF panel */}
        <div className="w-1/2 h-full border-l flex flex-col">
          {compileError ? (
            <ErrorLog error={compileError} onDismiss={() => {}} />
          ) : null}
          <div className="flex-1">
            <PdfViewer url={pdfUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusIndicator({ state, isSaving }: { state: EditorState; isSaving: boolean }) {
  if (isSaving || state === "saving") {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    )
  }

  if (state === "compiling") {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Compiling...
      </span>
    )
  }

  if (state === "success") {
    return (
      <span className="text-xs text-green-600 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Compiled
      </span>
    )
  }

  if (state === "error") {
    return (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Error
      </span>
    )
  }

  return (
    <span className="text-xs text-muted-foreground">
      Saved
    </span>
  )
}
