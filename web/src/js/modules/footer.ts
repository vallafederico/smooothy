import { Observe } from "./_/observe"

export class Footer extends Observe {
  constructor(element: HTMLElement) {
    super(element)
    // console.log(element)
  }

  isIn = () => {
    // console.log("in")
  }

  isOut = () => {
    // console.log("out")
  }
}
