"use client"

import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorLogProps {
  error: {
    type: string
    log: string | null
  }
  onDismiss: () => void
}

export function ErrorLog({ error, onDismiss }: ErrorLogProps) {
  return (
    <div className="mx-4 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">
              Compilation failed: {formatErrorType(error.type)}
            </p>
            {error.log && (
              <pre className="pretty-scrollbar mt-2 max-h-48 overflow-auto rounded-lg border border-destructive/25 bg-destructive/10 p-3 font-mono text-xs text-destructive/90 whitespace-pre-wrap">
                {error.log}
              </pre>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-destructive hover:bg-destructive/15 hover:text-destructive"
          aria-label="Dismiss compile error"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function formatErrorType(type: string): string {
  switch (type) {
    case "latex_compile_error":
      return "LaTeX syntax error"
    case "timeout":
      return "Compilation timed out"
    case "validation_error":
      return "Validation error"
    case "dangerous_content":
      return "Dangerous content detected"
    case "storage_error":
      return "Storage error"
    case "compiler_unavailable":
      return "Compiler toolchain unavailable"
    case "cancelled":
      return "Compilation superseded by a newer request"
    default:
      return type
  }
}
