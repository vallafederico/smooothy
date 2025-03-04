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
        <p class="absolute top-2 left-2 z-10">{{ i }}</p>
      </div>
    </div>
  </div>
</template>
