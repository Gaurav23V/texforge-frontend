"use client"

import dynamic from "next/dynamic"

import { useVisualEffects } from "@/hooks/use-visual-effects"

const ThreeOrbScene = dynamic(
  () => import("@/components/visual-effects/three-orb-scene").then((mod) => mod.ThreeOrbScene),
  { ssr: false }
)

export function DashboardAccent() {
  const { allow3d } = useVisualEffects()

  if (!allow3d) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_5%,hsl(var(--brand-cyan)/0.22),transparent_38%),radial-gradient(circle_at_10%_85%,hsl(var(--brand-violet)/0.18),transparent_42%)]"
      />
    )
  }

  return (
    <>
      <ThreeOrbScene orbColor="#22d3ee" ringColor="#f472b6" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[9] bg-[radial-gradient(circle_at_80%_10%,hsl(var(--brand-cyan)/0.3),transparent_34%),radial-gradient(circle_at_15%_85%,hsl(var(--brand-violet)/0.22),transparent_42%)]"
      />
    </>
  )
}
