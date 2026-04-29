# Changelog

## 0.1.0

_29/04/2026_ · _Current_

Significant input + lifecycle overhaul. Most consumers should not need
to change anything; the public API is preserved and the changes are
additive — but the inline-style + listener model is different enough
that a minor bump is warranted.

### Added

- **`isIdle` getter.** True when the slider isn't dragging, has
  ~zero speed, has converged target/current, and (when snapping) is
  parked at a snap point. `update()` reads this to skip the per-item
  transform write loop while idle (cheap fast-path); consumers can
  read it to skip their own per-frame work too. First `update()` after
  construction / `init()` / `resize()` always runs the full pass so
  `parallaxValues` is populated before `onUpdate` fires.
- **MutationObserver.** Core watches the wrapper for added/removed
  direct children (`childList: true`, **not** `subtree`) and
  re-initialises items + viewport automatically. Useful for sliders
  fed by fetched data — no more manual `resize()` on DOM mutation.
- **Velocity-aware snap.** `pointerUp` projects an inertial resting
  position from a smoothed per-pointerMove target delta
  (`projection = dragDelta / (1 - speedDecay)`) and snaps to the
  nearest slide. A hard flick can now travel multiple slides; a slow
  drag still advances one. Only applied when `snap` is on; free-scroll
  release behavior is unchanged.
- **`isTouching` field** is now public on the Core type and reflects
  `pointerType === 'touch'` for the active drag.

### Changed

- **Pointer Events.** Mouse, touch, and pen now flow through one
  unified `pointerdown` / `pointermove` / `pointerup` /
  `pointercancel` / `lostpointercapture` listener set on the wrapper,
  with `setPointerCapture` for off-wrapper drags. The window-level
  `mousemove` / `mouseup` / `touchmove` / `touchend` listeners are
  gone, as is the manual touch-axis-lock state machine — `touch-action`
  CSS now handles cross-axis page scrolling declaratively.
- **Inline styles on the wrapper** (when `disableInput: false`):
  Core sets `touch-action: pan-y` (or `pan-x` for vertical sliders),
  `user-select: none`, and `cursor: grab/grabbing`. Original values are
  snapshotted at construction and **restored on `destroy()`** so they
  don't leak into the host page. Passive mode (`disableInput: true`)
  still skips all of this — manage these styles yourself.
- **`resize()` re-collects items** from `wrapper.children` and clamps
  `currentSlide` so removing slides at runtime works without re-init.
- Only one pointer is tracked at a time. Secondary pointerdowns
  (multi-touch, second mouse) are ignored until the active drag ends.

### Fixed

- **`destroy()` actually removes its listeners.** Previously the
  removal calls passed freshly-allocated arrow functions to
  `removeEventListener`, which never matched the originals registered
  in the constructor, leaking handlers on every SPA route change.
  Handlers are now stored as instance fields and removed by reference.
- **`destroy()` always cleans up `virtual-scroll`,** not only when
  `scrollInput` was true. (Virtual-scroll is installed whenever
  `disableInput: false`.)
- **`destroy()` also disconnects the `ResizeObserver`** (was leaked)
  and the new `MutationObserver`, and releases any in-flight pointer
  capture.
- **`update()` does not blow up first-frame consumers.** With the new
  idle fast-path, `parallaxValues` would have been undefined on the
  very first `update()` call when the slider started at rest. Gated
  the fast-path on a `#hasRendered` flag — first frame always runs the
  full pass.
- **`resize()` re-renders against the new viewport** even when the
  slider is idle (previously the position would be stale until the
  next drag).

### Removed (internal — unlikely to affect consumers)

- Internal fields `touchStartX/Y`, `touchPreviousX/Y`, and
  `scrollDirection` are gone. They were used by the old touch-axis-lock
  machine and have no replacement (the browser handles it now via
  `touch-action`). Not referenced by any in-repo example.
- The mouse/touch fallback branch inside `pointerMove` was collapsed
  to a single line (`event.movementX/Y ?? 0`). Behavior is identical
  for `PointerEvent` callers; externally-synthesised input that omits
  `movementX/Y` now yields zero speed instead of using stale touch
  state (the public method still consumes `clientX/Y` for drag
  distance regardless).

### Browser support note

This release uses `PointerEvent` and `setPointerCapture`, supported
in Safari since 13.1. IE11 is no longer supported.

## 0.0.1

_00/02/2025_

Init

## 0.0.5

_04/03/2025_

Types

## 0.0.25

_04/03/2025_

Ready for alpha release
Added unpkg support

## 0.0.28

_04/03/2025_

Added variable width support
Different sizes

## 0.0.35

_04/02/2026_

- Fixed touch move handler processing events when slider is not touching or paused
- Thanks to Paulo for catching this bug!

## 0.0.30

_04/02/2025_

- Fixed mobile not scrolling

## 0.0.29

_04/03/2025_

Added vertical slider support

- New `vertical: boolean` config option for vertical scrolling
- Extended Viewport interface with height dimensions (`itemHeight`, `wrapperHeight`, `totalHeight`)
- Updated keyboard navigation to use ArrowUp/ArrowDown for vertical mode
- All features (infinite, snap, variable width, etc.) now work in both orientations
- Added vertical slider example component and documentation
