import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EmptyState } from "@/components/empty-state"
import { PageShell } from "@/components/page-shell"
import { PdfViewer } from "@/components/pdf-viewer"
import { Button } from "@/components/ui/button"
import { Download, Eye, FileText, Link2 } from "lucide-react"

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
    <PageShell withGrid contentClassName="space-y-4 md:space-y-6">
      <header className="surface-glass flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h1 className="line-clamp-1 font-semibold">{project.name}</h1>
            <span className="status-pill status-pill-info">
              <Eye className="h-3 w-3" />
              View only
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared PDF link with read-only access.
          </p>
        </div>
        {pdfUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={pdfUrl} download={`${project.name}.pdf`} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        ) : null}
      </header>

      <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="surface-elevated min-h-[65vh] p-3">
          {pdfUrl ? (
            <PdfViewer url={pdfUrl} />
          ) : (
            <EmptyState
              icon={FileText}
              title="No PDF available"
              description="This document has not been compiled yet."
            />
          )}
        </section>

        <aside className="surface-elevated space-y-4 p-4 md:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Share details
          </h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Project" value={project.name} />
            <InfoRow label="Access" value="Read only" />
            <InfoRow
              label="Last compile"
              value={
                compile?.compiled_at
                  ? new Date(compile.compiled_at).toLocaleString()
                  : "Not compiled yet"
              }
            />
            <InfoRow label="Share token" value={token.slice(0, 10)} mono />
          </div>
          <div className="rounded-xl border border-border/70 bg-secondary/45 p-3 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1 font-medium text-foreground">
              <Link2 className="h-3.5 w-3.5 text-primary" />
              Maintainer note
            </p>
            <p className="mt-1">
              This link exposes only the rendered PDF output and never allows editing source files.
            </p>
          </div>
        </aside>
      </main>
    </PageShell>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-1 line-clamp-1 text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  )
}
