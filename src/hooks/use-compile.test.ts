import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCompile } from "@/hooks/use-compile"

describe("useCompile", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_COMPILER_URL", "http://compiler.example")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("sets preview and download URLs on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: "success",
        pdf_url: "https://storage.example/latest.pdf?token=abc",
        compiled_at: "2026-03-04T10:00:00Z",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    let compileResult: Awaited<ReturnType<typeof result.current.compile>> | undefined
    await act(async () => {
      compileResult = await result.current.compile({ tex: "hello" })
    })

    expect(compileResult?.success).toBe(true)
    const fetchBody = fetchMock.mock.calls[0][1].body as string
    expect(JSON.parse(fetchBody)).toMatchObject({
      project_id: "project-1",
      tex: "hello",
    })
    expect(result.current.downloadUrl).toBe("https://storage.example/latest.pdf?token=abc")
    expect(result.current.pdfUrl).toContain("https://storage.example/latest.pdf?token=abc")
    expect(result.current.pdfUrl).toContain("&v=2026-03-04T10%3A00%3A00Z")
    expect(result.current.compileError).toBeNull()
  })

  it("sets compileError when compiler returns error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: "error",
        error_type: "latex_compile_error",
        log: "Undefined control sequence",
        compiled_at: "2026-03-04T10:00:00Z",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    await act(async () => {
      await result.current.compile({ tex: "bad tex" })
    })

    expect(result.current.compileError).toEqual({
      type: "latex_compile_error",
      log: "Undefined control sequence",
    })
    expect(result.current.downloadUrl).toBeNull()
  })

  it("coalesces duplicate requests with the same payload", async () => {
    let resolveResponse: ((value: unknown) => void) | null = null
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve
        })
    )
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    let p1: Promise<unknown> | null = null
    let p2: Promise<unknown> | null = null
    act(() => {
      p1 = result.current.compile({ tex: "same-tex" })
      p2 = result.current.compile({ tex: "same-tex" })
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveResponse?.({
      json: async () => ({
        status: "success",
        pdf_url: "https://storage.example/latest.pdf?token=abc",
        compiled_at: "2026-03-04T10:00:00Z",
      }),
    })

    await act(async () => {
      await Promise.all([p1, p2])
    })
  })

  it("aborts stale request when a newer payload is compiled", async () => {
    let firstRequestSignal: AbortSignal | null = null
    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url: string, init?: RequestInit) => {
        firstRequestSignal = init?.signal ?? null
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"))
          })
        })
      })
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: async () => ({
            status: "success",
            pdf_url: "https://storage.example/latest.pdf?token=def",
            compiled_at: "2026-03-04T10:01:00Z",
          }),
        })
      )
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    let oldRequest: Awaited<ReturnType<typeof result.current.compile>> | undefined
    let newRequest: Awaited<ReturnType<typeof result.current.compile>> | undefined
    await act(async () => {
      const oldPromise = result.current.compile({ tex: "old-tex" })
      const newPromise = result.current.compile({ tex: "new-tex" })
      oldRequest = await oldPromise
      newRequest = await newPromise
    })

    expect(firstRequestSignal?.aborted).toBe(true)
    expect(oldRequest?.success).toBe(false)
    expect(oldRequest?.error?.type).toBe("cancelled")
    expect(newRequest?.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("loads latest compiled PDF for project when available", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        pdf_url: "https://storage.example/project-1/latest.pdf?token=xyz",
        compiled_at: "2026-03-04T10:02:00Z",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    let loaded = false
    await act(async () => {
      loaded = await result.current.loadLatestCompiledPdf()
    })

    expect(loaded).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "http://compiler.example/projects/project-1/latest-pdf"
    )
    expect(result.current.downloadUrl).toBe("https://storage.example/project-1/latest.pdf?token=xyz")
    expect(result.current.pdfUrl).toContain("&v=2026-03-04T10%3A02%3A00Z")
  })

  it("toggles loading state while fetching latest compiled PDF", async () => {
    let resolveFetch: ((value: unknown) => void) | null = null
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    let loadPromise: Promise<boolean> | null = null
    act(() => {
      loadPromise = result.current.loadLatestCompiledPdf()
    })

    expect(result.current.isLoadingLatestPdf).toBe(true)

    resolveFetch?.({
      ok: true,
      json: async () => ({
        pdf_url: null,
        compiled_at: null,
      }),
    })

    await act(async () => {
      await loadPromise
    })

    expect(result.current.isLoadingLatestPdf).toBe(false)
  })

  it("does not set PDF URLs when no previous compile exists", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        pdf_url: null,
        compiled_at: null,
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useCompile("project-1"))

    let loaded = true
    await act(async () => {
      loaded = await result.current.loadLatestCompiledPdf()
    })

    expect(loaded).toBe(false)
    expect(result.current.downloadUrl).toBeNull()
    expect(result.current.pdfUrl).toBeNull()
  })
})
