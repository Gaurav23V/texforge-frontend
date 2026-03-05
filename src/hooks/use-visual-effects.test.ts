import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useVisualEffects } from "@/hooks/use-visual-effects"

const originalMatchMedia = window.matchMedia
const originalGetContext = HTMLCanvasElement.prototype.getContext
const originalHardwareConcurrency = navigator.hardwareConcurrency
const originalDeviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
const originalConnection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection

function mockMatchMedia(prefersReducedMotion: boolean) {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: prefersReducedMotion,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function mockNavigatorHints({
  hardwareConcurrency,
  deviceMemory,
  saveData,
}: {
  hardwareConcurrency: number
  deviceMemory: number
  saveData: boolean
}) {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    value: hardwareConcurrency,
  })
  Object.defineProperty(navigator, "deviceMemory", {
    configurable: true,
    value: deviceMemory,
  })
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: { saveData },
  })
}

describe("useVisualEffects", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1280,
    })
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === "webgl" || type === "webgl2") {
        return {} as RenderingContext
      }
      return null
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    HTMLCanvasElement.prototype.getContext = originalGetContext
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: originalHardwareConcurrency,
    })
    Object.defineProperty(navigator, "deviceMemory", {
      configurable: true,
      value: originalDeviceMemory,
    })
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: originalConnection,
    })
  })

  it("disables motion and 3d when reduced motion is preferred", async () => {
    mockMatchMedia(true)
    mockNavigatorHints({ hardwareConcurrency: 8, deviceMemory: 8, saveData: false })

    const { result } = renderHook(() => useVisualEffects())

    await waitFor(() => {
      expect(result.current.hydrated).toBe(true)
    })

    expect(result.current.allowMotion).toBe(false)
    expect(result.current.allow3d).toBe(false)
  })

  it("enables 3d for capable devices", async () => {
    mockMatchMedia(false)
    mockNavigatorHints({ hardwareConcurrency: 8, deviceMemory: 8, saveData: false })

    const { result } = renderHook(() => useVisualEffects())

    await waitFor(() => {
      expect(result.current.allow3d).toBe(true)
    })

    expect(result.current.allowMotion).toBe(true)
  })

  it("disables 3d on constrained devices while keeping motion", async () => {
    mockMatchMedia(false)
    mockNavigatorHints({ hardwareConcurrency: 2, deviceMemory: 2, saveData: true })

    const { result } = renderHook(() => useVisualEffects())

    await waitFor(() => {
      expect(result.current.hydrated).toBe(true)
    })

    expect(result.current.allowMotion).toBe(true)
    expect(result.current.allow3d).toBe(false)
  })
})
