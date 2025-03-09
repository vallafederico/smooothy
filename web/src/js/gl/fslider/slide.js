import { BoxGeometry, SphereGeometry, MeshNormalMaterial, Mesh } from "three"
import { SliderGroup } from "../dom/group"

const randomShape = () => {
  const geometry =
    Math.random() > 0.5
      ? new BoxGeometry(0.2, 0.2, 0.2)
      : new SphereGeometry(0.2, 16, 16)
  const material = new MeshNormalMaterial()
  return new Mesh(geometry, material)
}

export class Slide extends SliderGroup {
  constructor(element, { index }) {
    super(element, { index })
    this.element = element
    this.index = index

    this.add(randomShape())
  }
}
