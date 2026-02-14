# Three.js 3D Development

Advanced Three.js and WebGL development patterns.

## Project Structure
```
/web/src/js/gl/           # Core WebGL system
  ├── index.ts            # GL singleton manager
  ├── scene/              # Scene implementations
  ├── shaders/            # GLSL shaders
  └── post/               # Post-processing effects

/web/src/components/three/ # React Three Fiber components
/web/public/webgl/         # 3D assets (GLB, HDR)
```

## Core GL System (`/src/js/gl/index.ts`)
```ts
import Gl from "@js/gl"

// Access singleton
Gl.scene    // Current scene
Gl.camera   // Main camera
Gl.renderer // WebGL renderer
```

## GLSL Shaders
Location: `/src/js/gl/shaders/`

Vertex shader:
```glsl
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Fragment shader:
```glsl
precision highp float;
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(uTexture, vUv);
  gl_FragColor = color;
}
```

## Shader Utilities (`/src/js/gl/shaders/utils/`)
```glsl
#include "./utils/rand.glsl"      // Random functions
#include "./utils/imageUV.glsl"   // UV calculations
#include "./utils/rotate3D.glsl"  // Rotation matrices
#include "./utils/constants.glsl" // PI, TAU, etc.
```

## React Three Fiber Scene
```tsx
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, Float } from "@react-three/drei"

function Scene() {
  return (
    <Canvas gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />

      <Environment files="/webgl/spruit_sunrise_2k.hdr.jpg" />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Model />
      </Float>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
      />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
    </Canvas>
  )
}
```

## Loading Models
```tsx
import { useGLTF } from "@react-three/drei"

function Model({ url = "/webgl/model.000.glb" }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene.clone()} />
}

useGLTF.preload("/webgl/model.000.glb")
```

## Mouse Interaction
```tsx
import { useFrame, useThree } from "@react-three/fiber"

function InteractiveObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (!meshRef.current) return
    // Subtle mouse-reactive rotation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      pointer.x * 0.3,
      0.05
    )
  })

  return <mesh ref={meshRef}>...</mesh>
}
```

## Particle System
```tsx
function Particles({ count = 100, radius = 4 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.5 + Math.random() * 0.5)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  }, [count, radius])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} transparent opacity={0.6} />
    </points>
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

Use `client:only="react"` (not `client:load`) to avoid SSR hydration issues with Three.js.

## Assets
- Models: `/public/webgl/*.glb` (GLTF binary)
- Environment: `/public/webgl/*.hdr.jpg`
- Textures: `/public/webgl/*.jpg`

## Performance Tips
- Use `useGLTF.preload()` for models
- Clone scenes with `scene.clone()` for multiple instances
- Use `loading="lazy"` on canvas containers
- Limit particle counts on mobile
- Use `Float` from drei for simple animations instead of custom useFrame
