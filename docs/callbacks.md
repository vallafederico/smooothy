# Callbacks Usage

## No slider on some screen sizes

```js
const onResize = api => {
  /* kill based on media query */
  if (window.innerWidth < 768) {
    api.kill()
  } else {
    api.init()
  }
}

const slider = new Slider(s1, {
  onResize,
})
```

## Add or remove active state

```js
const onSlideChange = (slide, previous) => {
  // add active class to current
  // and remove from previous
  slider.items[previous].classList.remove("active")
  slider.items[slide].classList.add("active")
}

const slider = new Slider(s1, {
  onSlideChange,
})
```

## Progress bar

```js
 function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

// select the element that you want to use
const progressbar = document.querySelector(...)

// create a variable (if you want to use iut eased)
let easedProgress = 0

const onUpdate = { progress } => {
  // update and assign the lerped value
  easedProgress = lerp(easedProgress, progress, 0.1)
  progressbar.style.transform = `scaleX(${easedProgress * 100}%)`
}

const slider = new Slider(s1, {
  onUpdate,
})
```

## Slide indicator

(WIP)
