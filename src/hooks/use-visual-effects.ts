"use client"

import { useEffect, useState } from "react"

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: {
    saveData?: boolean
  }
}

export function useVisualEffects() {
  const [hydrated, setHydrated] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false)
  const [supportsWebgl, setSupportsWebgl] = useState(false)
  const [isSmallViewport, setIsSmallViewport] = useState(false)

  useEffect(() => {
    setHydrated(true)

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotionPreference = () => setPrefersReducedMotion(media.matches)
    updateMotionPreference()

    if (media.addEventListener) {
      media.addEventListener("change", updateMotionPreference)
    } else {
      media.addListener(updateMotionPreference)
    }

    const nav = navigator as NavigatorWithHints
    const updateDeviceHints = () => {
      const lowPower =
        Boolean(nav.connection?.saveData) ||
        (nav.deviceMemory ?? 8) <= 4 ||
        (navigator.hardwareConcurrency ?? 8) <= 4
      setIsLowPowerDevice(lowPower)
      setIsSmallViewport(window.innerWidth < 1024)
    }
    updateDeviceHints()
    window.addEventListener("resize", updateDeviceHints)

    const canvas = document.createElement("canvas")
    const hasWebgl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
    setSupportsWebgl(hasWebgl)

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", updateMotionPreference)
      } else {
        media.removeListener(updateMotionPreference)
      }
      window.removeEventListener("resize", updateDeviceHints)
    }
  }, [])

  const allowMotion = hydrated && !prefersReducedMotion
  const allow3d = allowMotion && !isLowPowerDevice && !isSmallViewport && supportsWebgl

  return {
    hydrated,
    prefersReducedMotion,
    allowMotion,
    allow3d,
  }
}
