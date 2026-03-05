"use client"

import { FileText, Loader2 } from "lucide-react"

interface PdfViewerProps {
  url: string | null
  isLoading?: boolean
}

export function PdfViewer({ url, isLoading = false }: PdfViewerProps) {
  if (isLoading && !url) {
    return (
      <div className="surface-elevated flex h-full flex-col items-center justify-center gap-3 rounded-2xl text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading latest PDF...</p>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="surface-elevated flex h-full flex-col items-center justify-center gap-3 rounded-2xl text-muted-foreground">
        <FileText className="h-16 w-16 text-primary/70" />
        <p className="text-lg font-medium">No PDF yet</p>
        <p className="text-sm">Click Compile to generate a PDF preview</p>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      className="h-full w-full rounded-2xl border border-border/70 bg-white shadow-soft"
      title="PDF Preview"
    />
  )
}
