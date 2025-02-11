// lerp
export function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

// map
export function map(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

// clamp
export function clamp(min, max, num) {
  return Math.min(Math.max(num, min), max);
}

/** ------------ Angles **/
export function radToDeg(r) {
  return (r * 180) / Math.PI;
}

export function degToRad(d) {
  return (d * Math.PI) / 180;
}

/** ------------ Bitwise **/
const isPowerOfTwo = (n) => !!n && (n & (n - 1)) == 0;

/**
 * Linearly interpolates between a and b with a damped factor
 * that is framerate-independent.
 *
 * @param {number} a         The current value.
 * @param {number} b         The target value.
 * @param {number} lambda    Damping rate (larger -> faster).
 * @param {number} deltaTime Time elapsed since last frame.
 * @returns {number}         The new interpolated value.
 */
