import { useEffect, useRef, useState } from "react"
import Core, { CoreConfig } from "smooothy"
import gsap from "gsap"

/** hook */
export function useSmooothy(config: Partial<CoreConfig> = {}) {
  const sliderRef = useRef<HTMLElement | null>(null)
  const [slider, setSlider] = useState<Core | null>(null)

  const refCallback = (node: HTMLElement | null) => {
    if (node && !slider) {
      const instance = new Core(node, config)
      gsap.ticker.add(instance.update.bind(instance))
      setSlider(instance)
    }
    sliderRef.current = node
  }

  useEffect(() => {
    return () => {
      if (slider) {
        gsap.ticker.remove(slider.update.bind(slider))
        slider.destroy()
      }
    }
  }, [slider])

  return { ref: refCallback, slider }
}

/** component */
const slides = Array.from({ length: 10 }, (_, i) => i)

export default function ReactSlider() {
  const { ref, slider } = useSmooothy()

  return (
    <div
      className="py-sm pb-xl flex w-screen overflow-x-hidden px-[calc(50%-40vw)] focus:outline-none md:px-[calc(50%-15vw)]"
      ref={ref}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className="flex aspect-[3/4] w-[80vw] shrink-0 items-center justify-center p-1 md:w-[30vw]"
        >
          <div className="relative h-full w-full p-8 outline outline-gray-800">
            <div className="h-full w-full outline outline-gray-600" />
            <p className="absolute top-2 left-2 z-10">{i}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
