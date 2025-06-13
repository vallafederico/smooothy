// import gsap from "../gsap"
import Core, { lerp } from "smooothy"
import { Raf } from "../utils/subscribable"
import { map } from "../utils/math"

// /////////////////////////////////////////////

export class GSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this))
  letters: HTMLElement[]
  interface: any

  #lprogress: number = 0
  #ltarget: number = 0
  #lspeed: number = 0
  #settledQueue: number[] = []
  settleTimeout: NodeJS.Timeout
  #resizeTimeout: NodeJS.Timeout
  #debounceDelay = 250 // 250ms delay
  parallaxValuesText: HTMLSpanElement[]

  constructor(element: HTMLElement) {
    const slider = element.querySelector('[data-slider="wrapper"]')

    super(slider, {
      infinite: true,
    })

    this.parallaxValuesText = [
      ...element.querySelectorAll("[data-slide-parallax]"),
    ] as HTMLSpanElement[]

    this.letters = [
      ...element.querySelectorAll('[data-a="letter"]'),
    ] as HTMLElement[]

    this.#addKeyboardEvents()
    this.initInterface(element)
  }

  onUpdate = ({ parallaxValues }) => {
    const speed = Math.abs(this.speed) * 0.04 + 0.5

    if (this.config.infinite) {
      this.letters.forEach((letter, i) => {
        letter.style.transform = `
        translateY(${Math.sin(parallaxValues[i] * 1) * 20 + this.#lspeed * 4}%)
        scale(${Math.sin(Math.abs(parallaxValues[i]) * 0.5 + 2) + speed})
        `

        this.parallaxValuesText[i].textContent = parallaxValues[i].toFixed(3)
      })
    }
    this.updateInterface()
  }
  /** -- interface */

  updateInterface() {
    if (!this.interface) return
    const p_current = Math.abs(this.current % this.items.length)
    const p_target = Math.abs(this.target % this.items.length)
    this.#lprogress = lerp(this.#lprogress, this.progress, 0.2)
    this.#ltarget = lerp(this.#ltarget, p_target, 0.5)
    this.#lspeed = lerp(this.#lspeed, this.speed, 0.1)

    this.interface.read.speedv.textContent = this.speed.toFixed(3)
    this.interface.read.currentv.textContent = p_current.toFixed(3)
    this.interface.read.targetv.textContent = p_target.toFixed(3)
    this.interface.read.progressv.textContent = this.progress.toFixed(1)

    this.interface.read.current.style.transform = `scaleX(${
      (p_current / this.items.length) * 100
    }%)`

    this.interface.read.target.style.transform = `scaleX(${
      (this.#ltarget / this.items.length) * 100
    }%)`

    this.interface.read.progress.style.transform = `scaleX(${
      this.#lprogress * 100
    }%)`

    this.interface.read.speed.style.strokeDashoffset = `${
      this.interface.read.speedlength -
      this.interface.read.speedlength * map(this.#lspeed, 0, 10, 0, 1)
    }`

    if (Math.abs(this.speed) > 0.01) {
      this.interface.read.direction.textContent = this.speed > 0 ? "-1" : "+1"
    } else {
      this.interface.read.direction.textContent = "0"
    }
  }

  initInterface(element: HTMLElement) {
    // configure
    const config = [...element.querySelector("[data-configure]").children].map(
      item => item.querySelector("button")
    )

    config[0].onclick = () => {
      this.paused = !this.paused
      ;[...config[0].querySelectorAll("span")].forEach(span => {
        span.classList.toggle("opacity-50")
      })
    }

    config[1].onclick = () => {
      this.config.snap = !this.config.snap
      ;[...config[1].querySelectorAll("span")].forEach(span => {
        span.classList.toggle("opacity-50")
      })
    }

    config[2].onclick = () => {
      this.current = this.target = 0
      this.config.infinite = !this.config.infinite
      ;[...config[2].querySelectorAll("span")].forEach(span => {
        span.classList.toggle("opacity-50")
      })
    }

    // read
    const readWrapper = [...element.querySelectorAll("[data-read]")]
    const read = {
      speedv: readWrapper[0],
      speed: readWrapper[1],
      direction: document.querySelector("[data-direction]"),
      speedlength: readWrapper[1].getTotalLength(),
      currentv: readWrapper[2],
      current: readWrapper[3],
      targetv: readWrapper[4],
      target: readWrapper[5],
      progressv: readWrapper[6],
      progress: readWrapper[7],
    }

    read.speed.style.strokeDasharray = `${read.speedlength} ${read.speedlength}`
    read.speed.style.strokeDashoffset = `${read.speedlength}`

    // events
    const events = element.querySelector("[data-events]")
    this.interface = { config, read, events }

    // events interface
  }

  onSlideChange = (index: number) => {
    this.#settledQueue.push(index)
    this.processSettledQueue()
  }

  private processSettledQueue = () => {
    if (this.settleTimeout) clearTimeout(this.settleTimeout)
    this.settleTimeout = setTimeout(() => {
      this.createNewEvent("settled")
      this.#settledQueue = []
    }, 500)
  }

  createNewEvent(type: "settled" | "resize") {
    const firstEvent = this.interface.events.children[0]
    const newEvent = firstEvent.cloneNode(true)

    switch (type) {
      case "settled":
        newEvent.textContent = `[SLIDE] SETTLED #${this.#settledQueue[this.#settledQueue.length - 1]}`
        break
      case "resize":
        newEvent.textContent = `[SLIDER] RESIZED`
        break
    }
    this.interface.events.insertBefore(newEvent, firstEvent)
  }

  onResize = () => {
    if (!this.isVisible) return

    // Clear any existing timeout
    if (this.#resizeTimeout) {
      clearTimeout(this.#resizeTimeout)
    }

    // Set new timeout
    this.#resizeTimeout = setTimeout(() => {
      this.createNewEvent("resize")
    }, this.#debounceDelay)
  }

  /** -- keyboard */
  #handleKeydown = e => {
    if (!this.isVisible) return

    if (/^[0-9]$/.test(e.key)) {
      const slideIndex = parseInt(e.key)

      if (this.config.infinite) {
        this.goToIndex(slideIndex)
      } else {
        e.preventDefault()
        if (slideIndex > this.items.length - 1) return
        this.goToIndex(slideIndex)
      }
      return
    }

    if (e.key === " ") {
      e.preventDefault()
      e.stopPropagation()
    }

    switch (e.key) {
      case "ArrowLeft":
        this.goToPrev()
        break
      case "ArrowRight":
        this.goToNext()
        break
      case " ":
        this.goToNext()
        break
    }
  }

  #addKeyboardEvents() {
    window.addEventListener("keydown", this.#handleKeydown)
  }
}
