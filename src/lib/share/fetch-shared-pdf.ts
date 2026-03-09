interface SharedPdfApiResponse {
  project_name: string
  pdf_url: string | null
  compiled_at: string | null
}

export interface SharedPdfData {
  projectName: string
  pdfUrl: string | null
  compiledAt: string | null
}

export async function fetchSharedPdf(token: string): Promise<SharedPdfData | null> {
  const compilerUrl = process.env.NEXT_PUBLIC_COMPILER_URL || "http://localhost:8000"
  const response = await fetch(`${compilerUrl}/shares/${encodeURIComponent(token)}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch shared PDF (${response.status})`)
  }

  const data = (await response.json()) as SharedPdfApiResponse

  return {
    projectName: data.project_name,
    pdfUrl: data.pdf_url,
    compiledAt: data.compiled_at,
  }
}
