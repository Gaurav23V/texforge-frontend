"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import type { Mesh } from "three"

import { cn } from "@/lib/utils"

interface ThreeOrbSceneProps {
  className?: string
  orbColor?: string
  ringColor?: string
}

function Orb({ color }: { color: string }) {
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.2
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
  })

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={ref} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </Float>
  )
}

function Ring({ color }: { color: string }) {
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.elapsedTime * 0.13
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2.8, 0, 0]} position={[0, -0.15, -0.2]}>
      <torusGeometry args={[1.7, 0.025, 16, 160]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export function ThreeOrbScene({
  className,
  orbColor = "#8b5cf6",
  ringColor = "#22d3ee",
}: ThreeOrbSceneProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(!document.hidden)
    onVisibilityChange()
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [])

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={isVisible ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 4], fov: 52 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 3, 3]} intensity={1.1} color={ringColor} />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color="#ffffff" />
        <Orb color={orbColor} />
        <Ring color={ringColor} />
      </Canvas>
    </div>
  )
}
