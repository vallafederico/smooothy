import VirtualScroll from "virtual-scroll";
import { damp, lerp, symmetricMod } from "./utils";

export class Core {
  #speed = 0;
  #lspeed = 0;
  #_bounceLimit = 0.5; // How far past the edges we can drag
  #offset = 0;
  #previousTime = 0;
  #deltaTime = 0;

  #currentSlide = 0;
  #previousSlide = 0; // Add this to track previous slide
  #onSlideChange = null; // Add callback property

  constructor(wrapper, config = {}) {
    this.config = {
      dragSensitivity: 0.005,
      lerpFactor: 0.08,
      infinite: true,
      scrollSensitivity: 1, // Add scroll sensitivity config
      snap: true, // Add snap configuration
      snapStrength: 0.1, // Controls how strongly it snaps (0-1)
      useScroll: false, // PARAMS
      totalWidthOffset: ({ itemWidth, wrapperWidth }) => itemWidth,
      ...config,
    };

    this.wrapper = wrapper;
    this.items = [...wrapper.children];

    // State
    this.current = 0;
    this.target = 0;
    this.isDragging = false;
    this.dragStart = 0;
    this.dragStartTarget = 0;
    this.isVisible = false;

    this.#currentSlide = 0;
    this.#previousSlide = 0;

    // Initialize
    this.#setupViewport();
    this.#setupParallaxItems();
    this.#setupIntersectionObserver();
    this.#addEventListeners();
    this.wrapper.style.cursor = "grab";

    this.#setupViewport();
    this.#setupVirtualScroll();
  }

  #setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: "50px",
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
      });
    }, options);

    this.observer.observe(this.wrapper);
  }

  #setupViewport() {
    this.viewport = {
      itemWidth: this.items[0].clientWidth,
      wrapperWidth: this.wrapper.clientWidth,
      marginWidth: (this.wrapper.clientWidth - this.items[0].clientWidth) / 2,
      totalWidth: this.items.reduce((sum, item) => sum + item.clientWidth, 0),
    };

    this.#offset = this.config.totalWidthOffset(this.viewport);

    this.maxScroll =
      -(this.viewport.totalWidth - this.#offset) / this.viewport.itemWidth;
  }

  #setupParallaxItems() {
    this.parallaxItems = this.items
      .map((item) => {
        const elements = [...item.querySelectorAll("[data-parallax]")].map(
          (el) => ({
            element: el,
            value: +el.dataset.parallax || 1,
          })
        );
        return elements.length ? elements : null;
      })
      .filter(Boolean);
  }

  #addEventListeners() {
    this.wrapper.addEventListener("mousedown", (e) => this.#handleDragStart(e));
    window.addEventListener("mousemove", (e) => this.#handleDragMove(e));
    window.addEventListener("mouseup", () => this.#handleDragEnd());

    this.wrapper.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.#handleDragStart(e.touches[0]);
    });
    window.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.#handleDragMove(e.touches[0]);
    });
    window.addEventListener("touchend", () => this.#handleDragEnd());

    window.addEventListener("resize", () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.#setupViewport(), 10);
    });
  }

  /** Events */

  #calculateBounds(newTarget) {
    if (!this.config.infinite) {
      if (newTarget > this.#_bounceLimit) {
        return this.#_bounceLimit;
      } else if (newTarget < this.maxScroll - this.#_bounceLimit) {
        return this.maxScroll - this.#_bounceLimit;
      }
    }
    return newTarget;
  }

  #setupVirtualScroll() {
    this.virtualScroll = new VirtualScroll({
      mouseMultiplier: 0.5,
      touchMultiplier: 2,
      firefoxMultiplier: 30,
      useKeyboard: false,
      passive: false,
      el: this.wrapper,
    });

    this.virtualScroll.on((event) => {
      if (!this.isDragging) {
        const delta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;

        const deltaX = delta * this.config.scrollSensitivity * 0.001;
        let newTarget = this.target + deltaX;

        // Use same bounds logic as drag end
        if (!this.config.infinite) {
          if (newTarget > 0) {
            newTarget = 0;
          } else if (newTarget < this.maxScroll) {
            newTarget = this.maxScroll;
          }
        }

        this.target = this.#calculateBounds(newTarget);
        this.#speed = -deltaX * 2;
      }
    });
  }

  #handleDragStart(event) {
    this.isDragging = true;
    this.dragStart = event.clientX;
    this.dragStartTarget = this.target;
    this.wrapper.style.cursor = "grabbing";
  }

  #handleDragMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.dragStart;
    let newTarget = this.dragStartTarget + deltaX * this.config.dragSensitivity;

    this.target = this.#calculateBounds(newTarget);
    this.#speed += event.movementX * 0.01;
  }

  #handleDragEnd() {
    this.isDragging = false;
    this.wrapper.style.cursor = "grab";

    // Snap back to bounds if not infinite
    if (!this.config.infinite) {
      if (this.target > 0) {
        this.target = 0;
      } else if (this.target < this.maxScroll) {
        this.target = this.maxScroll;
      } else if (this.config.snap) {
        // Only snap if snap is enabled
        const snapped = Math.round(this.target);
        this.target = Math.min(0, Math.max(this.maxScroll, snapped));
      }
    } else if (this.config.snap) {
      // Snap in infinite mode if enabled
      this.target = Math.round(this.target);
    }
  }

  /** Update */

  update() {
    if (!this.isVisible) return;

    // Update deltaTime
    const currentTime = performance.now();
    this.#deltaTime = (currentTime - this.#previousTime) / 1000;
    this.#previousTime = currentTime;

    // Handle snapping in one place
    if (this.config.snap && !this.isDragging) {
      const currentSnap = Math.round(this.target);
      const diff = currentSnap - this.target;
      this.target += diff * this.config.snapStrength;
    }

    this.current = damp(this.current, this.target, 5, this.#deltaTime);

    if (this.config.infinite) {
      this.#updateCurrentSlide(
        Math.round(Math.abs(this.current)) % this.items.length
      );
      this.#updateInfinite();
    } else {
      this.#updateCurrentSlide(Math.round(Math.abs(this.current)));
      this.#updateFinite();
    }

    this.#renderSpeed();

    // console.log(this.target);
  }

  #updateFinite() {
    this.items.forEach((item, i) => {
      const translateX = this.current * this.viewport.itemWidth;
      item.style.transform = `translateX(${translateX}px)`;
    });
  }

  #updateInfinite() {
    this.items.forEach((item, i) => {
      const unitPos = this.current + i;
      const x = symmetricMod(unitPos, this.items.length) - i;

      const translateX = x * this.viewport.itemWidth;
      item.style.transform = `translateX(${translateX}px)`;

      //   Update parallax elements if they exist
      if (this.parallaxItems[i]) {
        const baseX = symmetricMod(unitPos, this.items.length / 2);

        this.parallaxItems[i].forEach(({ element, value }) => {
          element.style.transform = `translateX(${baseX * value * 20}%)`;
        });
      }
    });
  }

  #renderSpeed() {
    this.#lspeed = damp(this.#lspeed, this.#speed, 5, this.#deltaTime);
    this.#speed *= 0.85;
  }

  goToNext() {
    if (!this.config.infinite) {
      this.target = Math.max(this.maxScroll, Math.round(this.target - 1));
    } else {
      this.target = Math.round(this.target - 1);
    }
  }

  goToPrev() {
    if (!this.config.infinite) {
      this.target = Math.min(0, Math.round(this.target + 1));
    } else {
      this.target = Math.round(this.target + 1);
    }
  }

  goToIndex(index) {
    this.target = -index;
  }

  set snap(value) {
    this.config.snap = value;
  }

  getProgress() {
    const totalSlides = this.items.length;
    const currentIndex = Math.abs(this.current) % totalSlides;
    return currentIndex / totalSlides;
  }

  destroy() {
    window.removeEventListener("mousemove", this.#handleDragMove);
    window.removeEventListener("mouseup", this.#handleDragEnd);
    window.removeEventListener("touchmove", this.#handleDragMove);
    window.removeEventListener("touchend", this.#handleDragEnd);
    this.wrapper.removeEventListener("mousedown", this.#handleDragStart);
    this.wrapper.removeEventListener("touchstart", this.#handleDragStart);
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    // Only destroy virtual scroll if it was initialized
    if (this.virtualScroll && this.config.useScroll) {
      this.virtualScroll.destroy();
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  get currentSlide() {
    return this.#currentSlide;
  }

  #updateCurrentSlide(newSlide) {
    if (this.#currentSlide !== newSlide) {
      this.#previousSlide = this.#currentSlide;
      this.#currentSlide = newSlide;

      //   console.log("currentSlide", this.#currentSlide);
    }
  }
}

// actual class

// export class ModelSlider extends Slider {
//   constructor(wrapper, config = {}) {
//     super(wrapper, config);

//     this.items.forEach((item, i) => {
//       let startX = 0;
//       let startTime = 0;

//       item.addEventListener("mousedown", (e) => {
//         e.preventDefault();
//         startX = e.clientX;
//         startTime = Date.now();
//       });

//       item.addEventListener("mouseup", (e) => {
//         e.preventDefault();
//         const deltaX = Math.abs(e.clientX - startX);
//         const deltaTime = Date.now() - startTime;

//         if (deltaX < 5 && deltaTime < 200) {
//           item.children[0].click();
//         }
//       });
//     });
//   }
// }
