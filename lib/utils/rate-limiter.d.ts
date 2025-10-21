/**
 * Rate Limiter
 *
 * 用于限制加密操作的频率，防止滥用和资源耗尽
 *
 * 特性：
 * - 令牌桶算法实现
 * - 滑动窗口限流
 * - 支持多种限流策略
 * - 内存高效
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 })
 * if (limiter.tryAcquire('user-id')) {
 *   // 执行加密操作
 * } else {
 *   throw new Error('Rate limit exceeded')
 * }
 * ```
 */
/**
 * 限流策略类型
 */
export type RateLimitStrategy = 'token-bucket' | 'sliding-window' | 'fixed-window';
/**
 * 限流配置
 */
export interface RateLimiterOptions {
    /** 时间窗口内最大请求数 */
    maxRequests: number;
    /** 时间窗口（毫秒） */
    windowMs: number;
    /** 限流策略 */
    strategy?: RateLimitStrategy;
    /** 令牌填充速率（每秒） */
    refillRate?: number;
    /** 最大令牌数 */
    maxTokens?: number;
}
/**
 * 限流状态
 */
export interface RateLimitStatus {
    /** 是否被限流 */
    limited: boolean;
    /** 剩余请求数 */
    remaining: number;
    /** 重置时间戳 */
    resetTime: number;
    /** 重试等待时间（毫秒） */
    retryAfter?: number;
}
/**
 * 限流器主类
 */
export declare class RateLimiter {
    private readonly strategy;
    private readonly windowMs;
    private readonly maxRequests;
    private limiters;
    constructor(options: RateLimiterOptions);
    private refillRate?;
    private maxTokens?;
    /**
     * 尝试获取许可（主方法）
     */
    tryAcquire(identifier: string, count?: number): boolean;
    /**
     * 获取限流状态
     */
    getStatus(identifier: string): RateLimitStatus;
    /**
     * 重置指定标识符的限流器
     */
    reset(identifier: string): void;
    /**
     * 重置所有限流器
     */
    resetAll(): void;
    /**
     * 获取或创建限流器
     */
    private getLimiter;
    /**
     * 清理内存（移除长期未使用的限流器）
     */
    cleanup(): number;
}
/**
 * 便捷函数：创建令牌桶限流器
 */
export declare function createTokenBucketLimiter(maxTokens: number, refillRate: number): RateLimiter;
/**
 * 便捷函数：创建滑动窗口限流器
 */
export declare function createSlidingWindowLimiter(maxRequests: number, windowMs: number): RateLimiter;
/**
 * 便捷函数：创建固定窗口限流器
 */
export declare function createFixedWindowLimiter(maxRequests: number, windowMs: number): RateLimiter;
