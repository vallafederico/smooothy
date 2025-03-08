import { hey } from "../hey"

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Check if viewport width is tablet or smaller (<=1024px)
 * @returns {boolean} True if viewport is tablet or smaller
 */
export const isTabletOrBelow = (): boolean => {
  return window.matchMedia("(max-width: 1024px)").matches
}
