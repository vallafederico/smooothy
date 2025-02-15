import { WebGPURenderer, PerspectiveCamera } from "three/webgpu"
import gsap from "../gsap"
import { Scene } from "./scene"

const GLPARAMS = {
  fov: 75,
  near: 0.1,
  far: 100,
  camZ: 3,
  clearColor: 0x000000,
  clearAlpha: 0,
}

class Gl {
  vp = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: () => this.vp.width / this.vp.height,
    pixelRatio: () => Math.min(window.devicePixelRatio, 2),
  }

  constructor(canvas = document.querySelector("[data-gl]")) {
    this.renderer = new WebGPURenderer({
      canvas,
      //   powerPreference: "high-performance",
      alpha: true,
    })

    this.renderer.setClearColor(0x000000, 1)
    this.renderer.setSize(this.vp.width, this.vp.height)
    this.renderer.setPixelRatio(this.vp.pixelRatio())

    this.camera = new PerspectiveCamera(
      GLPARAMS.fov,
      this.vp.aspect(),
      GLPARAMS.near,
      GLPARAMS.far
    )
    this.camera.position.set(0, 0, 4)

    this.scene = new Scene()

    gsap.ticker.add(this.render)
  }

  render = () => {
    this.scene.update?.()
    this.renderer.renderAsync(this.scene, this.camera)
  }
}

export default new Gl()
