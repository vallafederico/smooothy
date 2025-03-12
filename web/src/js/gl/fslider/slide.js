import {
  BoxGeometry,
  SphereGeometry,
  MeshNormalMaterial,
  Mesh,
  PlaneGeometry,
} from "three"
import { SliderGroup } from "../dom/group"
import { WiggleBone } from "wiggle"
import { hey } from "../../hey"
import { Gl } from "../gl"
import { Raf } from "../../utils/subscribable"
// import { App } from "../../app"

const randomShape = () => {
  const geometry =
    Math.random() > 0.5
      ? new BoxGeometry(0.2, 0.2, 0.2)
      : new SphereGeometry(0.2, 16, 16)
  const material = new MeshNormalMaterial({
    // depthTest: false,
    // depthWrite: false,
  })
  return new Mesh(geometry, material)
}

// //////////////////////////////////
const _bones = []
let _root = null

// //////////////////////////////////

export class Slide extends SliderGroup {
  #raf = Raf.subscribe(t => this.raf(t))

  constructor(element, { index }) {
    super(element, { index })
    this.element = element
    this.index = index

    this.bg = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshNormalMaterial({
        depthWrite: false,
      })
    )
    this.add(this.bg)

    if (this.index === 0) {
      hey.on("WEBGL_LOADED", this.onLoad)
    } else {
      this.shape = randomShape()
      this.shape.rotation.set(0.4, 0.2, 0.7)
      this.add(this.shape)
    }
  }

  onLoad = () => {
    const model = Gl.scene.assets.model
    model.renderOrder = 1

    model.traverse(child => {
      if (child.isMesh)
        child.material = new MeshNormalMaterial({
          depthTest: true,
          // side: FrontSide,
        })
      if (child.isSkinnedMesh) {
        child.skeleton.bones.forEach(bone => {
          if (!bone.parent.isBone) {
            _root = bone
          } else {
            const wiggleBone = new WiggleBone(bone, {
              velocity: 0.15,
            })
            _bones.push(wiggleBone)
          }
        })
      }
    })

    this.model = model
    this.add(model)
  }

  resize() {
    // console.log("resize")
    this.bg.scale.set(this.bounds.width, this.bounds.height, 1)
  }

  raf = ({ time }) => {
    _bones.forEach(bone => bone.update(Raf.deltaTime * 1000))

    if (_root) {
      _root.position.y = Math.sin(time) * 0.1
      _root.position.x = Math.cos(time) * 0.1

      const speed = hey.FSLIDER.speed * 0.01
      _root.rotation.y += speed * 0.5
      _root.rotation.x += speed * 0.5
      _root.rotation.z += speed * 0.1
      // _root.rotation.z += hey.FSLIDER.speed * 0.01

      // _root.rotation.y = Math.sin(time) * 0.1
      // _root.rotation.x = Math.cos(time) * 0.1
      // _root.rotation.z = Math.sin(time) * 0.1
    }

    // if (this.model) {
    // this.model.rotation.y += 0.01
    // this.model.rotation.x += 0.006
    // this.model.rotation.z += 0.008
    // }
  }
}
