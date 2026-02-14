# 3D Components (React Three Fiber)

Create 3D components using React Three Fiber and Drei.

## Location
3D components go in `/web/src/components/three/`

## Basic 3D Component
```tsx
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MyObject() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
```

## Loading GLTF Models
```tsx
import { useGLTF } from "@react-three/drei"

export function Model() {
  const { scene } = useGLTF("/webgl/model.glb")
  return <primitive object={scene.clone()} />
}

useGLTF.preload("/webgl/model.glb")
```

## Scene Setup
```tsx
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"

export function Scene() {
  return (
    <Canvas gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
      <Environment files="/webgl/environment.hdr" />
      <OrbitControls autoRotate enableZoom={false} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      {/* 3D objects here */}
    </Canvas>
  )
}
```

## Using in Astro
```astro
---
import Scene from "@c/three/Scene"
---

<div class="h-screen w-full">
  <Scene client:only="react" />
</div>
```

## Assets
- Models: `/web/public/webgl/*.glb`
- Environment maps: `/web/public/webgl/*.hdr` or `.hdr.jpg`

## Useful Drei Helpers
- `Float` - Floating animation
- `useGLTF` - Load GLTF models
- `OrbitControls` - Camera controls
- `Environment` - HDR lighting
- `PerspectiveCamera` - Camera setup
