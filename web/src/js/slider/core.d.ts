interface ViewportData {
  itemWidth: number;
  wrapperWidth: number;
  marginWidth: number;
  totalWidth: number;
}

interface ParallaxElement {
  element: HTMLElement;
  value: number;
}

interface SliderConfig {
  /** Sensitivity of drag interactions. Default: 0.005 */
  dragSensitivity?: number;
  /** Smoothing factor for animations. Default: 0.08 */
  lerpFactor?: number;
  /** Whether the slider loops infinitely. Default: true */
  infinite?: boolean;
  /** Sensitivity of scroll interactions. Default: 1 */
  scrollSensitivity?: number;
  /** Whether to snap to slides. Default: true */
  snap?: boolean;
  /** Strength of snap effect. Default: 0.1 */
  snapStrength?: number;
  /** Function to calculate total width offset. Default: returns itemWidth */
  totalWidthOffset?: (viewport: {
    itemWidth: number;
    wrapperWidth: number;
  }) => number;
  /** Whether to enable scroll interactions. Default: false */
  useScroll?: boolean;
}

export declare class Core {
  constructor(wrapper: HTMLElement, config?: SliderConfig);

  config: SliderConfig;
  wrapper: HTMLElement;
  items: HTMLElement[];
  current: number;
  target: number;
  isDragging: boolean;
  dragStart: number;
  dragStartTarget: number;
  isVisible: boolean;
  viewport: ViewportData;
  parallaxItems: ParallaxElement[][];

  update(): void;
  goToNext(): void;
  goToPrev(): void;
  goToIndex(index: number): void;
  getProgress(): number;
  destroy(): void;

  get currentSlide(): number;
  set snap(value: boolean);
}
