import { useRef, useState, useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF, Float } from "@react-three/drei"
import * as THREE from "three"

interface MateTokenProps {
  position?: [number, number, number]
}

// Rotation sensitivity multipliers
const MOUSE_ROTATION_Y = 0.3 // Horizontal mouse movement -> Y rotation
const MOUSE_ROTATION_X = 0.15 // Vertical mouse movement -> X rotation
const ROTATION_LERP = 0.05 // Smoothing factor for rotation interpolation

// Hover effect multipliers
const HOVER_SCALE = 1.08 // Scale increase on hover
const SCALE_LERP = 0.1 // Smoothing factor for scale interpolation

export function MateToken({ position = [0, 0, 0] }: MateTokenProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const currentScale = useRef(1)
  const { viewport, pointer } = useThree()

  const { scene } = useGLTF("/webgl/model.000.glb")

  // Clone the scene to avoid shared state issues
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Responsive scale based on viewport size
  const baseScale = useMemo(() => {
    const viewportScale = Math.min(viewport.width, viewport.height)
    // Scale between 1.2 and 1.8 based on viewport
    return Math.max(1.2, Math.min(1.8, viewportScale / 3))
  }, [viewport.width, viewport.height])

  // Cleanup cloned scene on unmount
  useEffect(() => {
    return () => {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }
  }, [clonedScene])

  useFrame(() => {
    if (!meshRef.current) return

    // Mouse-reactive rotation with smooth interpolation
    const targetRotationY = pointer.x * MOUSE_ROTATION_Y
    const targetRotationX = pointer.y * MOUSE_ROTATION_X

    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotationY,
      ROTATION_LERP
    )
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotationX,
      ROTATION_LERP
    )

    // Hover scale effect with smooth interpolation
    const targetScale = hovered ? baseScale * HOVER_SCALE : baseScale
    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetScale,
      SCALE_LERP
    )
    meshRef.current.scale.setScalar(currentScale.current)
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <group
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={clonedScene} />
      </group>
    </Float>
  )
}

useGLTF.preload("/webgl/model.000.glb")
