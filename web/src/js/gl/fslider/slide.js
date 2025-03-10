import {
  BoxGeometry,
  SphereGeometry,
  MeshNormalMaterial,
  Mesh,
  PlaneGeometry,
} from "three"
import { SliderGroup } from "../dom/group"

const randomShape = () => {
  const geometry =
    Math.random() > 0.5
      ? new BoxGeometry(0.2, 0.2, 0.2)
      : new SphereGeometry(0.2, 16, 16)
  const material = new MeshNormalMaterial()
  return new Mesh(geometry, material)
}

// //////////////////////////////////

export class Slide extends SliderGroup {
  constructor(element, { index }) {
    super(element, { index })
    this.element = element
    this.index = index

    this.bg = new Mesh(new PlaneGeometry(1, 1), new MeshNormalMaterial())

    this.shape = randomShape()

    this.shape.rotation.set(0.4, 0.2, 0.7)
    // this.children[1].position.z = 0.5

    // this.children[1].layers.enable(1)
    // this.children[1].layers.set(1)

    this.add(this.bg)
    this.add(this.shape)
  }

  resize() {
    // console.log("resize")
    this.bg.scale.set(this.bounds.width, this.bounds.height, 1)
  }
}
