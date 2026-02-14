import { Suspense, useState, useCallback } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { MateToken } from "./MateToken"
import { Particles } from "./Particles"
import { ErrorBoundary } from "../ErrorBoundary"
import { LoadingSpinner } from "../LoadingSpinner"

function SceneLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function ResponsiveCamera() {
  const { viewport } = useThree()
  // Adjust camera distance based on viewport - closer on mobile
  const distance = Math.max(3.5, Math.min(4.5, 4 / Math.min(viewport.width, viewport.height) * 2))

  return <PerspectiveCamera makeDefault position={[0, 0, distance]} fov={50} />
}

function SceneContent({ onLoad }: { onLoad: () => void }) {
  return (
    <Suspense fallback={null}>
      <Environment
        files="/webgl/spruit_sunrise_2k.hdr.jpg"
        background={false}
        onLoad={onLoad}
      />
      <MateToken />
      <Particles />
    </Suspense>
  )
}

export function MateScene() {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  return (
    <ErrorBoundary>
      <div className="relative h-full w-full">
        {!loaded && <SceneLoading />}
        <div
          className={`h-full w-full transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <Canvas
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
            dpr={[1, 2]}
          >
            <ResponsiveCamera />
            <SceneContent onLoad={handleLoad} />

            <OrbitControls
              autoRotate
              autoRotateSpeed={0.5}
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
          </Canvas>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default MateScene
