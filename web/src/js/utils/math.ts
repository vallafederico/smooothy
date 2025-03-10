import { Raf } from "./subscribable"

/** ------------ Damp/Lerp **/

/**
 * Framerate independent dampening using power-based smoothing
 * @param current - The current value
 * @param target - The target value to transition towards
 * @param smoothing - Smoothing factor (larger = smoother/slower, recommended: 0.001 to 1)
 * @param dt - Delta time in seconds
 * @returns Interpolated value between current and target
 */
export function dampPow(
  current: number,
  target: number,
  smoothing: number,
  dt: number = Raf.deltaTime
): number {
  return lerp(current, target, 1 - Math.pow(smoothing, dt))
}

/**
 * Framerate independent dampening using exponential decay
 * @param current - The current value
 * @param target - The target value to transition towards
 * @param lambda - Decay rate (larger = faster decay)
 * @param dt - Delta time in seconds
 * @returns Interpolated value between current and target
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number = Raf.deltaTime
): number {
  // console.log(Raf.deltaTime, current, target, lambda)
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

export function lerp(v0: number, v1: number, t: number): number {
  return v0 * (1 - t) + v1 * t
}

/** ------------ Map/Clamp **/
export function map(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
): number {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}

export function clamp(min: number, max: number, num: number): number {
  return Math.min(Math.max(num, min), max)
}

/** ------------ Angles **/
export function radToDeg(r: number): number {
  return (r * 180) / Math.PI
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180
}

/** ------------ Bitwise **/
export const isPowerOfTwo = (n: number): boolean => !!n && (n & (n - 1)) === 0

export function symmetricMod(value: number, base: number): number {
  let m = value % base
  if (Math.abs(m) > base / 2) {
    m = m > 0 ? m - base : m + base
  }
  return m
}
