# Smooothy

## WIP

[Deploy](https://smooothy.surge.sh)

### Features

- [ ] autoscroll

- [x] snap or not snap (toggleable)
- [x] get speed
- [x] get current slide and assign class (+ js events)
- [x] loop or non loop
- [x] respond to keyboard and buttons
- [x] parallax items w/ per item configurable parallax

#### Ideas

- [ ] Events

#### Issues

- [ ] distinguish between click and drag and click (ie elements are links)
- [ ] progress weird (on drag)

- [ ] better next and previous buttons
- [x] speed should be captured also when switching slides via button
- [x] issue when arrow navigating and infinite
- [x] correct current slide when infinite

#### Embla prevent click

https://github.com/davidjerleke/embla-carousel/blob/master/packages/embla-carousel/src/components/DragHandler.ts

## TEMP Docs

slide children can have parallax. assign `data-slide="parallax"` to the element. if you want to assign custom amount, you can use `data-parallax="{AMOUNT}"`

#### Slider

##### Setup

| Attribute            | Type      | Default | Description           |
| -------------------- | --------- | ------- | --------------------- |
| [data-slider="w"]    | Mandatory |         | Slides Container      |
| [data-slider="next"] | Optional  |         | next slide button     |
| [data-slider="prev"] | Optional  |         | previous slide button |

##### Options

| Option    | Type      | Default | Description               |
| --------- | --------- | ------- | ------------------------- |
| center    | `boolean` |         | centered                  |
| factor    | `number`  |         | how smooth                |
| isEnabled | `boolean` |         | enabled or disabled       |
| snapping  | `boolean` |         | snaps?                    |
| bouncy    | `number`  |         | bounce amount past bounds |
| lerp      | `number`  |         | lerp value for animation  |
| infinite  | `boolean` |         | infinite or not           |
| parallax  | `boolean` |         | has parallax or not       |

#### Events

| Option | Type      | Default | Description |
| ------ | --------- | ------- | ----------- |
| ...    | `boolean` |         | centered    |

#### Slides

| Option          | Type          | Default | Description            |
| --------------- | ------------- | ------- | ---------------------- |
| [data-parallax] | `number/none` | 50%     | Child element parallax |
