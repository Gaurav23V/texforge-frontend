export interface Project {
  id: string
  owner_id: string
  name: string
  tex: string
  updated_at: string
  created_at: string
}

export interface Compile {
  id: string
  project_id: string
  status: "success" | "error"
  log: string | null
  pdf_path: string | null
  compiled_at: string
}

export interface Share {
  token: string
  project_id: string
  created_at: string
  revoked_at: string | null
}

export type EditorState = "idle" | "saving" | "compiling" | "success" | "error"

export interface CompileResponse {
  status: "success" | "error"
  pdf_url?: string
  compiled_at: string
  error_type?: string
  log?: string
}

export interface LatestPdfResponse {
  pdf_url: string | null
  compiled_at: string | null
}
