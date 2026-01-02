import VirtualScroll from "virtual-scroll"
import Core, { damp } from "../../../../package/index.ts"
import gsap from "../../js/gsap.ts"

export class Slider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, {
      ...config,
      infinite: false,
      snap: true,
      variableWidth: true,
      scrollInput: true,
    })

    gsap.ticker.add(this.update.bind(this))
  }
}

export { damp }
export default Core
