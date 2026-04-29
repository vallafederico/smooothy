import Core, { damp } from "../../../../package/index.ts"
import gsap from "../../js/gsap.ts"

export class Slider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, {
      ...config,
    })

    gsap.ticker.add(this.update.bind(this))
  }
}

export { damp }
export default Core
