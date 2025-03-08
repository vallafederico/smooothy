import { Scene } from "three"
import { Quad } from "../quad"
import { Dom } from "../dom"
// import { Gl } from "./gl";

export default class extends Scene {
  isOn = true

  constructor(vp) {
    super()
    // this.vp = Gl.vp;

    this.create()
  }

  create() {
    // console.log("create")
    // this.quad = new Quad()
    // this.add(this.quad)

    const dom = document.querySelector("[data-slider='food']").children[4]
      .children[0]

    this.dom = new Dom(dom)
    this.add(this.dom)
  }

  render(t) {
    // this.quad?.render(t)
  }

  resize(vp) {
    // this.vp = vp;
  }
}
