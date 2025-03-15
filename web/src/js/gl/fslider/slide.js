import {
  BoxGeometry,
  SphereGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  PlaneGeometry,
  Group,
} from "three"
import { SliderGroup } from "../dom/group"
import { WiggleBone } from "wiggle"
import { hey } from "../../hey"
import { Gl } from "../gl"
import { Raf } from "../../utils/subscribable"
import { Observe } from "../../modules/_/observe"
import gsap from "../../gsap"
import { Bg } from "./bg/"
// import { App } from "../../app"

const randomShape = () => {
  const geometry =
    Math.random() > 0.5
      ? new BoxGeometry(0.2, 0.2, 0.2)
      : new SphereGeometry(0.2, 16, 16)
  const material = new MeshNormalMaterial()
  return new Mesh(geometry, material)
}

const _bones = []
let _root = null
let _root2 = null

// //////////////////////////////////

export class Slide extends SliderGroup {
  #visible = true
  #raf = Raf.subscribe(t => this.raf(t))
  #observe = new Observe(this.element, {
    threshold: 0.05,
    // rootMargin: "0% 20% 0% -20%",
    callback: ({ isIn }) => {
      this.handleInView(isIn)
    },
  })

  constructor(element, { index }) {
    super(element, { index })
    this.element = element
    this.index = index

    this.bg = new Bg()
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
    model.renderOrder = 10

    model.traverse(child => {
      setMaterial(child)
      getWiggle(child)
    })

    this.model = model
    this.ctrl = new Group()

    // this.rotation.x = Math.PI * 2
    this.ctrl.add(model)
    const scale = 1.2
    this.ctrl.scale.set(scale, scale, scale)

    // _root.position.y = 2
    this.add(this.ctrl)
  }

  resize() {
    this.bg.scale.set(this.bounds.width, this.bounds.height, 1)
  }

  raf = ({ time }) => {
    this.bg.speed = hey.FSLIDER.lspeed

    // if (!this.#visible) return
    this.bg.time = time

    if (_root && this.model) {
      // _root.rotation.x += 2

      _bones.forEach(bone => bone.update(Raf.deltaTime))
      _root.position.z = Math.sin(time + this.index) * 0.2
      _root.position.x = Math.sin(time + this.index) * 0.2

      const speed = hey.FSLIDER.lspeed * 0.06
      _root.rotation.y += speed * 0.2
      // _root.rotation.y += 0.2
      // _root.rotation.x += speed * 0.8
      _root.rotation.z += speed * 0.3
      // _root.rotation.z += 0.2
    }
  }

  /** -- Animation */
  #anim = null

  handleInView = isIn => {
    if (isIn) {
      this.#visible = true

      if (this.model) {
        if (this.#anim) this.#anim.kill()
        this.#anim = gsap.to(this.model.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.2,
          delay: 0.1,
          ease: "expo.out",
        })
      }

      this.bg.view = 1
    } else {
      this.#visible = false
      if (this.#anim) this.#anim.kill()

      if (this.model) {
        this.#anim = gsap.to(this.model.scale, {
          x: 0.1,
          y: 0.1,
          z: 0.1,
        })
      }

      this.bg.view = 0.5
    }
  }
}

// //////////////////////////////////
function setMaterial(child) {
  if (child.isMesh) {
    const map = child.material.map
    child.material = new MeshBasicMaterial({
      depthTest: true,
      map,
      // side: FrontSide,
    })
  }
}

function getWiggle(child) {
  if (child.isSkinnedMesh) {
    child.skeleton.bones.forEach(bone => {
      if (!bone.parent.isBone && !_root) {
        console.log(bone)
        _root = bone
      } else {
        const wiggleBone = new WiggleBone(bone, {
          velocity: 0.5,
        })
        _bones.push(wiggleBone)
      }
    })
  }
}
