import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface ParticlesProps {
  baseCount?: number
  radius?: number
}

// Animation parameters
const ROTATION_SPEED_Y = 0.02 // Y-axis rotation speed
const ROTATION_SPEED_X = 0.01 // X-axis rotation speed
const DRIFT_AMPLITUDE = 0.1 // How far particles drift
const DRIFT_SPEED = 0.5 // How fast particles drift

export function Particles({ baseCount = 100, radius = 4 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  // Responsive particle count - fewer on mobile for performance
  const count = useMemo(() => {
    const viewportArea = viewport.width * viewport.height
    // Scale between 50 and baseCount based on viewport
    return Math.floor(Math.max(50, Math.min(baseCount, viewportArea * 10)))
  }, [viewport.width, viewport.height, baseCount])

  // Store original positions for drift animation
  const { positions, colors, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const originalPositions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Random spherical distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.5 + Math.random() * 0.5)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Store original positions for drift
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z

      // Subtle warm colors (gold/amber tones)
      colors[i * 3] = 0.9 + Math.random() * 0.1
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.15
      colors[i * 3 + 2] = 0.6 + Math.random() * 0.2
    }

    return { positions, colors, originalPositions }
  }, [count, radius])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    // Overall rotation
    pointsRef.current.rotation.y += delta * ROTATION_SPEED_Y
    pointsRef.current.rotation.x += delta * ROTATION_SPEED_X

    // Subtle drift animation
    const geometry = pointsRef.current.geometry
    const positionAttr = geometry.getAttribute("position")
    const time = state.clock.elapsedTime * DRIFT_SPEED

    for (let i = 0; i < count; i++) {
      const ox = originalPositions[i * 3]
      const oy = originalPositions[i * 3 + 1]
      const oz = originalPositions[i * 3 + 2]

      // Each particle drifts with a unique phase
      const phase = i * 0.1
      const driftX = Math.sin(time + phase) * DRIFT_AMPLITUDE
      const driftY = Math.cos(time * 0.7 + phase) * DRIFT_AMPLITUDE
      const driftZ = Math.sin(time * 0.5 + phase) * DRIFT_AMPLITUDE

      positionAttr.setXYZ(i, ox + driftX, oy + driftY, oz + driftZ)
    }

    positionAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
