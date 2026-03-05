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
    <div className="bg-red-50 border-b border-red-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">
              Compilation failed: {formatErrorType(error.type)}
            </p>
            {error.log && (
              <pre className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap">
                {error.log}
              </pre>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
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
