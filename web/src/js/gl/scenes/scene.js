import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js"
import { Scene as THREE_Scene } from "three"
import { FSlider } from "../fslider"
import { Item } from "../item"
import { loadAssets } from "../utils/loader"
import { hey } from "../../hey"

import { SLIDER_FOOD } from "../../../content"

export class Scene extends THREE_Scene {
  isOn = true

  constructor() {
    super()
    this.create()
  }

  async load() {
    let t = performance.now()
    this.assets = await loadAssets()

    // console.log(this.assets.model)

    // const item = Math.floor(Math.random() * this.assets.model.children.length)
    /*
    0 - toast !
    1 - hotdog 
    2 - fish
    3 - mushroom !
    4 - ramen !
    5 - cake !         
    */

    const item = [0, 3, 4, 5][Math.floor(Math.random() * 4)]

    // const item = 0

    this.assets.bonus = SkeletonUtils.clone(this.assets.model.children[item])
    this.assets.bonus.INFO = SLIDER_FOOD[item]
    console.log("(ms):::", performance.now() - t, this.assets)

    this.environment = this.assets.hdr_world
    this.environmentIntensity = 1
    this.environmentRotation.set(0, 0.5, 1)

    hey.WEBGL_LOADED = true

    setTimeout(() => {
      hey.START = true
    }, 0)
  }

  async create() {
    /** -- slider */
    const slider = document.querySelector('[data-module="fslider"]')
    if (slider) {
      this.fslider = new FSlider(slider)
      this.add(this.fslider)
    }

    const item = document.querySelector('[data-gl="item"]')
    if (item) {
      this.item = new Item(item)
      this.add(this.item)
    }

    await this.load()
  }

  // ////////////////////// world

  // static world = {
  //   env: new DataTexture(null, 1, 1),
  // }
}
