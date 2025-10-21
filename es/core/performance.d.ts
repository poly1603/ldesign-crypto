import type { DecryptResult, EncryptionAlgorithm, EncryptResult } from '../types';
/**
 * 批量操作接口
 */
export interface BatchOperation {
    id: string;
    data: string;
    key: string;
    algorithm: EncryptionAlgorithm;
    options?: Record<string, unknown>;
}
/**
 * 批量操作结果
 */
export interface BatchResult<T> {
    id: string;
    result: T;
}
/**
 * 缓存统计信息
 */
export interface CacheStats {
    size: number;
    maxSize: number;
    hitRate: number;
    totalRequests: number;
    hits: number;
    misses: number;
    evictions: number;
}
/**
 * 性能指标
 */
export interface PerformanceMetrics {
    operationsPerSecond: number;
    averageLatency: number;
    memoryUsage: number;
    cacheHitRate: number;
    cacheSize: number;
}
/**
 * 性能优化配置
 */
export interface PerformanceOptimizerConfig {
    /** 最大缓存数量 */
    maxCacheSize?: number;
    /** 缓存过期时间（毫秒），0 表示永不过期 */
    cacheTTL?: number;
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 最大操作时间记录数 */
    maxOperationTimes?: number;
    /** 自动清理间隔（毫秒），0 表示禁用自动清理 */
    autoCleanupInterval?: number;
    /** 内存使用阈值（字节），超过此值将触发清理 */
    memoryThreshold?: number;
    /** 是否启用 Worker 并行处理 */
    enableWorker?: boolean;
    /** Worker 线程池大小 */
    workerPoolSize?: number;
    /** 批量操作最大并发数 */
    maxConcurrency?: number;
}
/**
 * 性能优化工具类
 *
 * 提供高性能的缓存和批量操作支持
 * 优化点：
 * - 使用 LRU 缓存替代简单 Map
 * - 优化缓存键生成算法
 * - 移除未使用的内存池
 * - 添加缓存过期机制
 */
export declare class PerformanceOptimizer {
    private resultCache;
    private operationTimes;
    private maxOperationTimes;
    private enableCache;
    private autoCleanupInterval;
    private memoryThreshold;
    private cleanupTimer?;
    private enableWorker;
    private workerPool;
    private maxConcurrency;
    constructor(config?: PerformanceOptimizerConfig);
    /**
     * 批量加密
     * 优化：支持 Worker 并行处理或主线程并行处理
     */
    batchEncrypt(operations: BatchOperation[]): Promise<BatchResult<EncryptResult>[]>;
    /**
     * 批量解密
     * 优化：支持 Worker 并行处理或主线程并行处理
     */
    batchDecrypt(operations: BatchOperation[]): Promise<BatchResult<DecryptResult>[]>;
    /**
     * 并发控制执行任务
     * 优化：限制同时执行的任务数量，避免资源耗尽
     * 优化：使用 Array.from 预分配结果数组，减少动态扩容
     * @param tasks 任务数组
     * @returns Promise 结果数组
     */
    private runWithConcurrencyControl;
    /**
     * 执行加密操作
     * 优化：使用真实的加密实现
     */
    private performEncryption;
    /**
     * 执行解密操作
     * 优化：使用真实的解密实现
     */
    private performDecryption;
    /**
     * 记录操作时间
     */
    private recordOperationTime;
    /**
     * 生成缓存键
     * 优化：使用哈希算法生成固定长度的键，避免冲突和内存浪费
     */
    private generateCacheKey;
    /**
     * 从缓存获取结果
     */
    private getFromCache;
    /**
     * 设置缓存
     */
    private setCache;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 清理过期缓存
     */
    cleanupCache(): number;
    /**
     * 获取缓存统计信息
     */
    getCacheStats(): CacheStats;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * 获取内存使用情况
     * 优化：更准确的内存估算
     */
    private getMemoryUsage;
    /**
     * 重置性能统计
     */
    resetStats(): void;
    /**
     * 启动自动清理
     */
    private startAutoCleanup;
    /**
     * 停止自动清理
     */
    stopAutoCleanup(): void;
    /**
     * 执行清理
     */
    private performCleanup;
    /**
     * 销毁优化器
     */
    destroy(): Promise<void>;
    /**
     * 获取 Worker 池统计信息
     */
    getWorkerStats(): Record<string, unknown> | null;
}
