// import { Observe } from "./_/observe"
import { Track } from "./_/track"

export class Callout extends Track {
  constructor(element: HTMLElement) {
    super(element, {
      top: "center",
      bottom: "center",
    })
  }

  handleScroll = (value: number) => {
    console.log(value)
  }
}
