import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAutosave } from "@/hooks/use-autosave"

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("does not call onSave when value matches last saved value", async () => {
    const onSave = vi.fn(async () => {})
    renderHook(() =>
      useAutosave({
        value: "same",
        onSave,
        delay: 1000,
      })
    )

    await act(async () => {
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()
    })

    expect(onSave).not.toHaveBeenCalled()
  })

  it("saves only latest value for rapid changes", async () => {
    const onSave = vi.fn(async () => {})
    const { rerender } = renderHook(
      ({ value }) =>
        useAutosave({
          value,
          onSave,
          delay: 300,
        }),
      {
        initialProps: { value: "one" },
      }
    )

    rerender({ value: "two" })
    rerender({ value: "three" })

    await act(async () => {
      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()
    })

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith("three")
  })

  it("serializes saves and preserves latest pending value", async () => {
    let releaseFirstSave: (() => void) | null = null
    const onSave = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            releaseFirstSave = resolve
          })
      )
      .mockImplementationOnce(async () => {})

    const { rerender } = renderHook(
      ({ value }) =>
        useAutosave({
          value,
          onSave,
          delay: 100,
        }),
      {
        initialProps: { value: "v1" },
      }
    )

    rerender({ value: "v2" })
    await act(async () => {
      vi.advanceTimersByTime(150)
      await vi.runAllTimersAsync()
    })

    rerender({ value: "v3" })
    await act(async () => {
      vi.advanceTimersByTime(150)
      await vi.runAllTimersAsync()
    })

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenLastCalledWith("v2")

    await act(async () => {
      releaseFirstSave?.()
      await Promise.resolve()
    })

    expect(onSave).toHaveBeenCalledTimes(2)
    expect(onSave).toHaveBeenLastCalledWith("v3")
  })
})
