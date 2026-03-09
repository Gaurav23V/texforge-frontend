import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchSharedPdf } from "@/lib/share/fetch-shared-pdf"

describe("fetchSharedPdf", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("maps a successful backend response", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMPILER_URL", "https://compiler.example")
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValue({
        project_name: "Shared Resume",
        pdf_url: "https://signed.example/shared.pdf",
        compiled_at: "2026-03-04T10:00:00Z",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchSharedPdf("token with space")

    expect(fetchMock).toHaveBeenCalledWith(
      "https://compiler.example/shares/token%20with%20space",
      { cache: "no-store" }
    )
    expect(result).toEqual({
      projectName: "Shared Resume",
      pdfUrl: "https://signed.example/shared.pdf",
      compiledAt: "2026-03-04T10:00:00Z",
    })
  })

  it("returns null for a missing share", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchSharedPdf("missing-token")

    expect(result).toBeNull()
  })

  it("throws for unexpected backend failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(fetchSharedPdf("bad-token")).rejects.toThrow(
      "Failed to fetch shared PDF (500)"
    )
  })
})
