import { Mouse } from "../mouse"
import { Scroll } from "../scroll"
import { Raf } from "../utils/subscribable"

// (*) MOUSE - deforms
// (*) MOUSE - 3 states (normal, slider over, sliding)
// (*) MOUSE - disappearsa and appears when mouse exits the page
// (*) MOUSE - handle link and hoverable things
// (*) MOUSE - make simple state machine for the cursor

export class Cursor {
  #raf = Raf.subscribe(this.handleRaf.bind(this))
  circle: HTMLElement

  constructor(private element: HTMLElement) {
    this.element = element.children[0] as HTMLElement
    this.circle = element.children[1] as HTMLElement
  }

  handleRaf(time: number) {
    this.element.style.left = `${Mouse.ex[0]}px`
    this.element.style.top = `${Mouse.ey[0]}px`
    this.element.style.transform = `rotate(${Mouse.sex * 360 * 4}deg)`

    this.circle.style.left = `${Mouse.ex[1]}px`
    this.circle.style.top = `${Mouse.ey[1]}px`
    // this.circle.style.transform = `rotate(${Mouse.sey * 360 * 2}deg)`
  }

  handleLinks() {
    const links = document.querySelectorAll("a")
    links.forEach(link => {
      link.addEventListener("mouseenter", () => {})
    })
  }

  hide = () => {}
  show = () => {}
}
