/**
 * Utility functions
 * Add your utility functions here
 */

/**
 * Linear interpolation
 */
export function lerp(v0: number, v1: number, t: number): number {
  return v0 * (1 - t) + v1 * t
}

/**
 * Damped interpolation
 */
export function damp(
  a: number,
  b: number,
  lambda: number,
  deltaTime: number
): number {
  const t = 1 - Math.exp(-lambda * deltaTime)
  return a + (b - a) * t
}
