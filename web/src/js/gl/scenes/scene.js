import { Scene } from "three"
import { FSlider } from "../fslider"
import { loadAssets } from "../utils/loader"
import { hey } from "../../hey"

export default class extends Scene {
  isOn = true

  constructor() {
    super()
    this.create()
  }

  async load() {
    let t = performance.now()
    this.assets = await loadAssets()
    console.log("(ms):::", performance.now() - t, this.assets)
    hey.WEBGL_LOADED = true
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

  static world = {
    env: null,
  }
}
