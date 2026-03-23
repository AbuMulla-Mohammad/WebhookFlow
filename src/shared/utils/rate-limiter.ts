type RateLimiterOptions = {
  windowMs: number;
  max: number;
};

export class RateLimiter {
  private requests: Map<string, { count: number; lastReset: number }> =
    new Map();
  private windowMs: number;
  private max: number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now - entry.lastReset > this.windowMs) {
      this.requests.set(key, { count: 1, lastReset: now });
      return true;
    }

    if (entry.count < this.max) {
      entry.count += 1;
      return true;
    }

    return false;
  }
}
