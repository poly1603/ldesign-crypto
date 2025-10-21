/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:49 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

class TokenBucket {
  constructor(maxTokens, refillRate) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }
  /**
   * 尝试获取令牌
   */
  tryConsume(count = 1) {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
  /**
   * 获取状态
   */
  getStatus() {
    this.refill();
    const nextRefillTime = this.lastRefill + 1e3;
    return { tokens: this.tokens, nextRefillTime };
  }
  /**
   * 重置
   */
  reset() {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
  /**
   * 填充令牌
   */
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1e3;
    const tokensToAdd = elapsed * this.refillRate;
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}
class SlidingWindow {
  constructor(maxRequests, windowMs) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  /**
   * 尝试记录请求
   */
  tryRecord() {
    const now = Date.now();
    this.cleanup(now);
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
  /**
   * 获取状态
   */
  getStatus() {
    const now = Date.now();
    this.cleanup(now);
    const oldestRequest = this.requests[0] || now;
    return { count: this.requests.length, oldestRequest };
  }
  /**
   * 重置
   */
  reset() {
    this.requests = [];
  }
  /**
   * 清理过期请求
   */
  cleanup(now) {
    const cutoff = now - this.windowMs;
    this.requests = this.requests.filter((time) => time > cutoff);
  }
}
class FixedWindow {
  constructor(maxRequests, windowMs) {
    this.count = 0;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.windowStart = Date.now();
  }
  /**
   * 尝试记录请求
   */
  tryRecord() {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.count = 0;
      this.windowStart = now;
    }
    if (this.count < this.maxRequests) {
      this.count++;
      return true;
    }
    return false;
  }
  /**
   * 获取状态
   */
  getStatus() {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.count = 0;
      this.windowStart = now;
    }
    return { count: this.count, windowStart: this.windowStart };
  }
  /**
   * 重置
   */
  reset() {
    this.count = 0;
    this.windowStart = Date.now();
  }
}
class RateLimiter {
  constructor(options) {
    const { maxRequests, windowMs, strategy = "sliding-window", refillRate = maxRequests / (windowMs / 1e3), maxTokens = maxRequests } = options;
    this.strategy = strategy;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.limiters = /* @__PURE__ */ new Map();
    if (strategy === "token-bucket") {
      this.refillRate = refillRate;
      this.maxTokens = maxTokens;
    }
  }
  /**
   * 尝试获取许可（主方法）
   */
  tryAcquire(identifier, count = 1) {
    const limiter = this.getLimiter(identifier);
    if (this.strategy === "token-bucket") {
      return limiter.tryConsume(count);
    } else if (this.strategy === "sliding-window") {
      return limiter.tryRecord();
    } else {
      return limiter.tryRecord();
    }
  }
  /**
   * 获取限流状态
   */
  getStatus(identifier) {
    const limiter = this.getLimiter(identifier);
    const now = Date.now();
    if (this.strategy === "token-bucket") {
      const bucket = limiter;
      const status = bucket.getStatus();
      return {
        limited: status.tokens <= 0,
        remaining: Math.floor(status.tokens),
        resetTime: status.nextRefillTime
      };
    } else if (this.strategy === "sliding-window") {
      const window = limiter;
      const status = window.getStatus();
      const remaining = this.maxRequests - status.count;
      const resetTime = status.oldestRequest + this.windowMs;
      return {
        limited: remaining <= 0,
        remaining,
        resetTime,
        retryAfter: remaining <= 0 ? resetTime - now : void 0
      };
    } else {
      const window = limiter;
      const status = window.getStatus();
      const remaining = this.maxRequests - status.count;
      const resetTime = status.windowStart + this.windowMs;
      return {
        limited: remaining <= 0,
        remaining,
        resetTime,
        retryAfter: remaining <= 0 ? resetTime - now : void 0
      };
    }
  }
  /**
   * 重置指定标识符的限流器
   */
  reset(identifier) {
    const limiter = this.limiters.get(identifier);
    if (limiter) {
      if ("reset" in limiter) {
        limiter.reset();
      }
    }
  }
  /**
   * 重置所有限流器
   */
  resetAll() {
    this.limiters.clear();
  }
  /**
   * 获取或创建限流器
   */
  getLimiter(identifier) {
    let limiter = this.limiters.get(identifier);
    if (!limiter) {
      if (this.strategy === "token-bucket") {
        if (this.maxTokens === void 0 || this.refillRate === void 0) {
          throw new Error("Token bucket requires maxTokens and refillRate");
        }
        limiter = new TokenBucket(this.maxTokens, this.refillRate);
      } else if (this.strategy === "sliding-window") {
        limiter = new SlidingWindow(this.maxRequests, this.windowMs);
      } else {
        limiter = new FixedWindow(this.maxRequests, this.windowMs);
      }
      this.limiters.set(identifier, limiter);
    }
    return limiter;
  }
  /**
   * 清理内存（移除长期未使用的限流器）
   */
  cleanup() {
    let cleaned = 0;
    const identifiersToDelete = [];
    for (const [identifier, limiter] of this.limiters.entries()) {
      if (this.strategy === "sliding-window") {
        const window = limiter;
        const status = window.getStatus();
        if (status.count === 0) {
          identifiersToDelete.push(identifier);
        }
      }
    }
    for (const identifier of identifiersToDelete) {
      this.limiters.delete(identifier);
      cleaned++;
    }
    return cleaned;
  }
}
function createTokenBucketLimiter(maxTokens, refillRate) {
  return new RateLimiter({
    maxRequests: maxTokens,
    windowMs: 1e3,
    strategy: "token-bucket",
    maxTokens,
    refillRate
  });
}
function createSlidingWindowLimiter(maxRequests, windowMs) {
  return new RateLimiter({
    maxRequests,
    windowMs,
    strategy: "sliding-window"
  });
}
function createFixedWindowLimiter(maxRequests, windowMs) {
  return new RateLimiter({
    maxRequests,
    windowMs,
    strategy: "fixed-window"
  });
}

exports.RateLimiter = RateLimiter;
exports.createFixedWindowLimiter = createFixedWindowLimiter;
exports.createSlidingWindowLimiter = createSlidingWindowLimiter;
exports.createTokenBucketLimiter = createTokenBucketLimiter;
//# sourceMappingURL=rate-limiter.cjs.map
