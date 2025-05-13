import { Gl } from "~/js/gl/gl"
import { Group } from "~/js/gl/dom/group"
import { hey } from "~/js/hey"
import { setMaterial } from "../fslider/food"
import { WiggleBone } from "wiggle"
import { Raf } from "~/js/utils/subscribable"
import { Scroll } from "~/js/scroll"
import { Mouse } from "~/js/mouse"
import { Observe } from "~/js/modules/_/observe"
import gsap from "~/js/gsap"

export class Item extends Group {
  #isIn = false
  #onLoad = hey.on("WEBGL_LOADED", () => this.onLoad())
  #raf = Raf.subscribe(t => this.raf(t))
  #observe = new Observe(this.element, {
    callback: ({ isIn }) => {
      if (isIn) {
        this.#isIn = true
      } else {
        this.#isIn = false
      }
    },
  })

  _bones = []
  _root = null

  a = {
    rx: 0,
  }

  constructor(el) {
    super(el)
    this.scale.set(2, 2, 2)
    this.rotation.set(0, 0.6, 0)
  }

  onLoad() {
    Gl.scene.assets.bonus.traverse(child => {
      setMaterial(child)
      if (child.isSkinnedMesh) {
        child.skeleton.bones.forEach(bone => {
          if (!bone.parent.isBone && !this._root) {
            this._root = bone
          } else {
            const wiggleBone = new WiggleBone(bone, {
              velocity: Gl.scene.assets.bonus.INFO.wiggle * 1.2,
            })
            this._bones.push(wiggleBone)
          }
        })
      }
    })

    this.add(Gl.scene.assets.bonus)
  }

  raf = ({ time }) => {
    if (!this._root || !this.visible) return

    this.rotation.y = 0.6 + Mouse.sex * 0.2 + this.a.rx
    this.rotation.z = Mouse.sey * 0.2 + Scroll.percent

    this._bones.forEach(bone => bone.update(Raf.deltaTime * 1000))
    this._root.position.z = Math.sin(time) * 0.1
    this._root.position.x = Math.sin(time) * 0.01
  }

  resize() {
    // console.log(this.bounds)
    const scale = this.bounds.height * 1.6
    this.scale.set(scale, scale, scale)
  }
}
