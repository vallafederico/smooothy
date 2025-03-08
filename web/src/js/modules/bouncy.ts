export class Bouncy {
  svg: SVGGElement[]

  constructor(private element: HTMLElement) {
    this.svg = [...this.element.querySelector("svg").children].filter(
      (el): el is SVGGElement => el instanceof SVGGElement
    )
    // console.log(this.svg)
  }
}
