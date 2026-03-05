"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"

import { useVisualEffects } from "@/hooks/use-visual-effects"

const ThreeOrbScene = dynamic(
  () => import("@/components/visual-effects/three-orb-scene").then((mod) => mod.ThreeOrbScene),
  { ssr: false }
)

export function LoginAccent() {
  const { allow3d, allowMotion } = useVisualEffects()

  if (!allow3d) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_25%,hsl(var(--brand-violet)/0.35),transparent_40%),radial-gradient(circle_at_80%_75%,hsl(var(--brand-cyan)/0.28),transparent_40%)]"
      />
    )
  }

  return (
    <>
      {allowMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[11] opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ) : null}
      <ThreeOrbScene orbColor="#8b5cf6" ringColor="#22d3ee" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[9] bg-[radial-gradient(circle_at_20%_25%,hsl(var(--brand-violet)/0.3),transparent_35%),radial-gradient(circle_at_80%_75%,hsl(var(--brand-cyan)/0.24),transparent_40%)]"
      />
    </>
  )
}
