import gsap from "gsap"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
// import { SplitText } from "gsap/SplitText"
import { prefersReducedMotion } from "./utils/media"

const reduced = prefersReducedMotion()

gsap.registerPlugin(DrawSVGPlugin)

const defaults = {
  ease: "expo.out",
  duration: 1.2,
}

gsap.defaults(defaults)

export default gsap
export { defaults, reduced }
