import { Group, MeshPhysicalMaterial, MeshBasicMaterial } from "three"
import { WiggleBone } from "wiggle"
import { Raf } from "../../../utils/subscribable"
import { hey } from "../../../hey"
import gsap from "../../../gsap"

import { SLIDER_FOOD } from "../../../../content"

const rand = (ind = 0) =>
  ind % 2 === 0 ? Math.random() + 0.5 : -Math.random() - 0.5

export class Food extends Group {
  renderOrder = 10
  _bones = []
  _root = null

  a = {
    scale: 1.3,
    randoms: [0, 0, 0],
    base: {
      rot: [rand(), rand(), rand()],
    },
  }

  constructor(model, index) {
    super()
    this.model = model
    this.index = index

    this.lib = SLIDER_FOOD.filter(item => item.name === model.name)[0]

    this.a.randoms.forEach((_, i) => (this.a.randoms[i] = rand(this.index)))

    this.onLoad()
  }

  onLoad() {
    this.model.traverse(child => {
      setMaterial(child)
      if (child.isSkinnedMesh) {
        child.skeleton.bones.forEach(bone => {
          if (!bone.parent.isBone && !this._root) {
            // console.log(bone)
            this._root = bone
          } else {
            const wiggleBone = new WiggleBone(bone, {
              velocity: this.lib.wiggle,
            })
            this._bones.push(wiggleBone)
          }
        })
      }
    })

    this.add(this.model)
  }

  onRaf = (time, parallax) => {
    if (this._root && this.model) {
      const scale = this.a.scale - Math.abs(parallax) * 0.2 + 0.1
      this.scale.set(scale, scale, scale)

      const loop = Math.sin(time + this.index) * 0.8

      this._bones.forEach(bone => bone.update(Raf.deltaTime))
      this._root.position.z = Math.sin(loop) * 0.8
      this._root.position.x = Math.cos(loop) * 0.04
      // this._root.position.y = Math.sin(time + this.index) * 0.05

      const speed = hey.FSLIDER.lspeed
      this._root.rotation.y = this.a.randoms[0] * speed * 0.2
      this._root.rotation.z = speed * 0.4 + loop * 0.2
    }
  }

  #anim = null
  handleInView = isIn => {
    if (isIn) {
      if (this.#anim) this.#anim.kill()
      this.#anim = gsap.to(this.a, {
        scale: 1.2,
        duration: 1.2,
        delay: 0.1 + Math.random() * 0.2,
        ease: "expo.out",
      })
    } else {
      if (this.#anim) this.#anim.kill()
      this.#anim = gsap.to(this.a, {
        scale: 0.2,
      })
    }
  }
}

// //////////////////////////////////
function setMaterial(child) {
  if (child.isMesh) {
    const map = child.material.map
    child.material = new MeshBasicMaterial({
      map,
      // metalness: 0,
      // roughness: 1,
    })
  }
}

// function getWiggle(child, root, bones) {
//   if (child.isSkinnedMesh) {
//     child.skeleton.bones.forEach(bone => {
//       if (!bone.parent.isBone && !root) {
//         console.log(bone)
//         root = bone
//       } else {
//         const wiggleBone = new WiggleBone(bone, {
//           velocity: 0.6,
//         })
//         bones.push(wiggleBone)
//       }
//     })
//   }
// }
