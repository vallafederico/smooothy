// lerp
export function lerp(v0: number, v1: number, t: number): number {
  return v0 * (1 - t) + v1 * t
}

// map
export function map(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
): number {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}

// clamp
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
