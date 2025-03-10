# Framework Based Examples

## Frameworks

While it works as just the Core, the idea is to provide all the core functionality, keep it as light as it can be, and extend it based on your needs.

### React

Basic react example with a hook you can abstract.

```tsx
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
            <p className="absolute left-2 top-2 z-10">{i}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### Remix

Basic example whould work but make it isomorphic.

#### Next

If Nextjs for the love of god "useclient". Probably abstract the hook.

### Vue

Vue example with composable to abstract.

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import Core, { CoreConfig } from "smooothy"
import gsap from "gsap"

/** composable */
function useSmooothy(config: Partial<CoreConfig> = {}) {
  const sliderElement = ref<HTMLElement | null>(null)
  const slider = ref<Core | null>(null)

  onMounted(() => {
    if (sliderElement.value) {
      const instance = new Core(sliderElement.value, config)
      gsap.ticker.add(instance.update.bind(instance))
      slider.value = instance
    }
  })

  onUnmounted(() => {
    if (slider.value) {
      gsap.ticker.remove(slider.value.update.bind(slider.value))
      slider.value.destroy()
    }
  })

  return {
    sliderElement,
    slider,
  }
}

/** implementation */
const slides = Array.from({ length: 10 }, (_, i) => i)
const { sliderElement, slider } = useSmooothy({
  infinite: true,
})
</script>

<template>
  <div
    ref="sliderElement"
    class="py-sm pb-xl flex w-screen overflow-x-hidden px-[calc(50%-40vw)] focus:outline-none md:px-[calc(50%-15vw)]"
  >
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="flex aspect-[3/4] w-[80vw] shrink-0 items-center justify-center p-1 md:w-[30vw]"
    >
      <div class="relative h-full w-full p-8 outline outline-gray-800">
        <div class="h-full w-full outline outline-gray-600" />
        <p class="absolute left-2 top-2 z-10">{{ i }}</p>
      </div>
    </div>
  </div>
</template>
```

#### Nuxt

...

### Solid

```html
<!-- ... -->
```

```js
//
```

#### Solidstart

### Svelte

```html
<!-- ... -->
```

```js
//
```

#### Sveltekit
