"use client"

import { FileText, Loader2 } from "lucide-react"

interface PdfViewerProps {
  url: string | null
  isLoading?: boolean
}

export function PdfViewer({ url, isLoading = false }: PdfViewerProps) {
  if (isLoading && !url) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-muted-foreground">
        <Loader2 className="h-10 w-10 mb-4 animate-spin" />
        <p className="text-sm">Loading latest PDF...</p>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-muted-foreground">
        <FileText className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium">No PDF yet</p>
        <p className="text-sm">Click Compile to generate a PDF preview</p>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      className="w-full h-full border-0"
      title="PDF Preview"
    />
  )
}
