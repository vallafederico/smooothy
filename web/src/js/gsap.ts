import gsap from "gsap"
import Scroll from "./scroll"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"

gsap.registerPlugin(DrawSVGPlugin)
const defaults = {
  ease: "expo.out",
  duration: 1.2,
}

gsap.defaults(defaults)

const random10 = () => Math.random() * 10

export default gsap
export { defaults, random10 }
