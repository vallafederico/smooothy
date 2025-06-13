import { WebGLRenderer, PerspectiveCamera, ACESFilmicToneMapping } from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { Raf, Resize } from "../utils/subscribable.js"
import { Post } from "./post/index.js"

import { Scene } from "./scenes/scene.js"

export const config = {
  // guiHidden: import.meta.env.PROD,
  clearColor: 0x000000,
  alpha: true,
  controls: false,
}

export class Gl {
  static time = 0
  static paused = true
  static mouse = { x: 0, y: 0 }

  static {
    const container = document.querySelector('[data-gl="c"]')
    if (container) this.startup(container)
  }

  static startup(container) {
    this.vp = {
      container: container,
      w: window.innerWidth,
      h: window.innerHeight,
      aspect: () => {
        return this.vp.w / this.vp.h
      },
      dpr: () => {
        return Math.min(window.devicePixelRatio, 2)
      },
    }

    this.renderer = new WebGLRenderer({
      // antialias: true,
      alpha: config.alpha,
      canvas: this.vp.container,
      // toneMapping: ACESFilmicToneMapping,
    })

    this.renderer.setPixelRatio(this.vp.dpr())
    this.renderer.setSize(this.vp.w, this.vp.h)
    this.renderer.setClearColor(config.clearColor, 0)

    this.camera = new PerspectiveCamera(
      70, // fov
      this.vp.aspect(), // aspect
      0.1, // near
      1000 // far
    )

    this.vp.camera = this.camera
    this.vp.renderer = this.renderer

    this.camera.position.set(0, 0, 2)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enabled = config.controls

    Resize.subscribe(this.resize.bind(this), 10)
    this.init()
  }

  static async init() {
    this.resize({ width: this.vp.w, height: this.vp.h })

    queueMicrotask(() => {
      this.scene = new Scene(this.vp)
      this.post = new Post()

      this.paused = false
      Raf.subscribe(this.render.bind(this), 10)
    })
  }

  static render() {
    if (this.paused) return
    this.time += 0.05
    this.controls?.update()

    this.scene?.render?.(this.time)
    this.post.renderPost()
  }

  static resize({ width, height }) {
    this.vp.w = width
    this.vp.h = height

    this.renderer.setSize(this.vp.w, this.vp.h)
    this.camera.aspect = this.vp.w / this.vp.h
    this.camera.updateProjectionMatrix()

    this.vp.viewSize = this.viewSize
    this.vp.px = this.pixel

    // this.scene?.resize(this.vp)
  }

  /* Utils */

  static get viewSize() {
    const fovInRad = (this.camera.fov * Math.PI) / 180
    const height = Math.abs(this.camera.position.z * Math.tan(fovInRad / 2) * 2)
    return { w: height * (this.vp.w / this.vp.h), h: height }
  }

  static get pixel() {
    return (this.viewSize.w / this.vp.w + this.viewSize.h / this.vp.h) / 2
  }
}
