/**
 * Checks if the current environment supports touch interaction.
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in globalThis || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
}

/**
 * Helper class to detect double-tap events on items with an identifier.
 */
export class DoubleTapDetector {
  private lastTapTime = 0;
  private lastTapId: string | number | null = null;

  constructor(private readonly delayMs = 300) {}

  isDoubleTap(id: string | number): boolean {
    const now = Date.now();
    const isDouble = this.lastTapId === id && now - this.lastTapTime < this.delayMs;
    this.lastTapTime = now;
    this.lastTapId = id;
    return isDouble;
  }

  reset(): void {
    this.lastTapTime = 0;
    this.lastTapId = null;
  }
}
