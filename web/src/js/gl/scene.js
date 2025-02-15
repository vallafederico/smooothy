import { Scene as S } from "three/webgpu"
import { Cube } from "./cube"

export class Scene extends S {
  constructor() {
    super()

    this.add(new Cube())
  }

  update = () => {
    this.children.forEach(child => {
      child.update?.()
    })
  }
}
