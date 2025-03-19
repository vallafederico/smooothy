import { Scene as THREE_Scene, DataTexture, Vector3 } from "three"
import { FSlider } from "../fslider"
import { loadAssets } from "../utils/loader"
import { hey } from "../../hey"

export class Scene extends THREE_Scene {
  isOn = true

  constructor() {
    super()
    this.create()
  }

  async load() {
    let t = performance.now()
    this.assets = await loadAssets()
    console.log("(ms):::", performance.now() - t, this.assets)

    this.environment = this.assets.hdr_world
    this.environmentIntensity = 1
    this.environmentRotation.set(0, 0.5, 1)

    hey.WEBGL_LOADED = true

    setTimeout(() => {
      hey.START = true
    }, 800)
  }

  async create() {
    /** -- slider */
    const slider = document.querySelector('[data-module="fslider"]')
    if (slider) {
      this.fslider = new FSlider(slider)
      this.add(this.fslider)
    }

    await this.load()
  }

  // ////////////////////// world

  // static world = {
  //   env: new DataTexture(null, 1, 1),
  // }
}
