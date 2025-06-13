import { Group, MeshBasicMaterial } from "three"
import { WiggleBone } from "wiggle"
import { Raf } from "../../../utils/subscribable"
import { hey } from "../../../hey"
import gsap from "../../../gsap"
import { Mouse } from "../../../mouse"

const rand = (ind = 0) =>
  ind % 2 === 0 ? Math.random() + 0.5 : -Math.random() - 0.5

export class Food extends Group {
  renderOrder = 10
  _bones = []
  _root = null

  a = {
    scale: 0,
    rotation: Math.random() < 0.5 ? 5 : -6,
    ry: 0,
    rz: 0,
    startY: 0,
    y: 0,
    z: 0,
    randoms: [0, 0, 0],
    base: {
      rot: [rand(), rand(), rand()],
    },
  }

  constructor(model, index, lib) {
    super()
    this.model = model
    this.index = index
    this.lib = lib

    this.globDirection = this.index % 2 === 0 ? 1 : -1

    this.a.randoms.forEach((_, i) => (this.a.randoms[i] = rand(this.index)))
    this.a.startY = this.index % 2 === 0 ? 3 : -3
    this.onLoad()
  }

  onLoad() {
    this.model.traverse(child => {
      setMaterial(child)
      if (child.isSkinnedMesh) {
        child.skeleton.bones.forEach(bone => {
          if (!bone.parent.isBone && !this._root) {
            this._root = bone
          } else {
            const wiggleBone = new WiggleBone(bone, {
              velocity: this.lib.wiggle * 1.3,
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

      this.position.y = this.a.startY

      this._bones.forEach(bone => bone.update(Raf.deltaTime * 1000))
      this._root.position.z = Math.sin(loop) * 0.8 + this.a.z
      this._root.position.x = Math.sin(loop) * 0.04

      const speed = hey.FSLIDER.lspeed
      this._root.rotation.y =
        this.a.randoms[0] * speed * 0.2 +
        this.a.rotation +
        this.a.ry +
        Mouse.sex * this.globDirection * 0.2

      this._root.rotation.z =
        speed * 0.4 + loop * 0.2 + this.a.rotation + this.a.rz

      this._root.rotation.x = Mouse.sey * 0.3 * this.globDirection
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
        scale: 0.8,
      })
    }
  }
}

// //////////////////////////////////

export function setMaterial(child) {
  if (child.isMesh) {
    const map = child.material.map
    child.material = new MeshBasicMaterial({
      map,
    })
  }
}
