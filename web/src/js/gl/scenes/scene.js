import { Scene } from "three"
import { Dom } from "../dom"
import { FSlider } from "../fslider"
// import { Quad } from "../quad"
// import { Gl } from "./gl";

export default class extends Scene {
  isOn = true

  constructor(vp) {
    super()
    // this.vp = Gl.vp;

    this.create()
  }

  create() {
    /** -- slider */
    // const slider = document.querySelector('[data-module="fslider"]')
    // if (slider) {
    //   this.fslider = new FSlider(slider)
    //   this.add(this.fslider)
    // }
  }

  render(t) {
    // this.quad?.render(t)
  }

  resize(vp) {
    // this.vp = vp;
  }
}
