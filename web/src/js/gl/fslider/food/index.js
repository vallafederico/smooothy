import { Group, MeshPhysicalMaterial, MeshBasicMaterial } from "three"
import { WiggleBone } from "wiggle"
import { Raf } from "../../../utils/subscribable"
import { hey } from "../../../hey"
import gsap from "../../../gsap"

const scale = 1.2

const _bones = []
let _root = null

export class Food extends Group {
  renderOrder = 10

  constructor(model, index) {
    super()
    this.model = model
    this.index = index
    this.scale.set(scale, scale, scale)

    this.onLoad()
  }

  onLoad = () => {
    this.model.traverse(child => {
      setMaterial(child)
      getWiggle(child)
    })

    this.add(this.model)
  }

  onRaf = time => {
    if (_root && this.model) {
      // _root.rotation.x += 2

      _bones.forEach(bone => bone.update(Raf.deltaTime))
      _root.position.z = Math.sin(time + this.index) * 0.2
      _root.position.x = Math.sin(time + this.index) * 0.2

      const speed = hey.FSLIDER.lspeed * 0.06
      // _root.rotation.x += speed * 0.1
      _root.rotation.y += speed * 0.2
      _root.rotation.z += speed * 0.3
    }
  }

  #anim = null
  handleInView = isIn => {
    if (isIn) {
      if (this.#anim) this.#anim.kill()
      this.#anim = gsap.to(this.model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        delay: 0.1,
        ease: "expo.out",
      })
    } else {
      if (this.#anim) this.#anim.kill()

      this.#anim = gsap.to(this.model.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
      })
    }
  }
}

// //////////////////////////////////
function setMaterial(child) {
  if (child.isMesh) {
    const map = child.material.map
    child.material = new MeshPhysicalMaterial({
      map,
      metalness: 0,
      roughness: 1,
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
          velocity: 0.6,
        })
        _bones.push(wiggleBone)
      }
    })
  }
}
