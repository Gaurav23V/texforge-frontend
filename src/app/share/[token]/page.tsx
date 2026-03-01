import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PdfViewer } from "@/components/pdf-viewer"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch share and associated project
  const { data: share, error: shareError } = await supabase
    .from("shares")
    .select("*, projects(*)")
    .eq("token", token)
    .is("revoked_at", null)
    .single()

  if (shareError || !share || !share.projects) {
    notFound()
  }

  const project = share.projects as {
    id: string
    name: string
    tex: string
  }

  // Fetch the latest compile for this project
  const { data: compile } = await supabase
    .from("compiles")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "success")
    .order("compiled_at", { ascending: false })
    .limit(1)
    .single()

  // Generate signed URL for PDF if available
  let pdfUrl: string | null = null
  if (compile?.pdf_path) {
    const { data: signedData } = await supabase.storage
      .from("project-pdfs")
      .createSignedUrl(compile.pdf_path, 3600)
    
    pdfUrl = signedData?.signedUrl || null
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h1 className="font-semibold">{project.name}</h1>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            View only
          </span>
        </div>
        {pdfUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={pdfUrl} download={`${project.name}.pdf`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
        )}
      </header>
      <main className="flex-1">
        {pdfUrl ? (
          <PdfViewer url={pdfUrl} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No PDF available</p>
            <p className="text-sm">This document hasn&apos;t been compiled yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
