// import gsap from "../gsap"
import Core from "smooothy"
import { Raf } from "../utils/subscribable"

export class GSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this))

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'), {
      infinite: true,
    })
  }

  // onUpdate = () => {
  //   // console.log("updating", this.current)
  // }
}
