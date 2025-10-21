/**
 * Object Pool
 *
 * 对象池实现，用于减少频繁对象创建的 GC 压力
 *
 * 特性：
 * - 自动对象回收和复用
 * - 配置化的池大小
 * - 统计信息监控
 * - 线程安全（单线程优化）
 *
 * @example
 * ```ts
 * import { EncryptResultPool } from '@ldesign/crypto'
 *
 * const pool = new EncryptResultPool({ maxSize: 100 })
 * const result = pool.acquire()
 * // 使用 result
 * pool.release(result)
 * ```
 */
import type { DecryptResult, EncryptResult } from '../types';
/**
 * 对象池配置
 */
export interface ObjectPoolOptions {
    /** 最大池大小 */
    maxSize?: number;
    /** 是否启用统计 */
    enableStats?: boolean;
    /** 对象创建工厂函数 */
    factory?: () => unknown;
    /** 对象重置函数 */
    reset?: (obj: unknown) => void;
}
/**
 * 对象池统计信息
 */
export interface ObjectPoolStats {
    /** 当前池大小 */
    size: number;
    /** 最大池大小 */
    maxSize: number;
    /** 获取次数 */
    acquires: number;
    /** 释放次数 */
    releases: number;
    /** 命中次数（从池中获取） */
    hits: number;
    /** 未命中次数（新创建） */
    misses: number;
    /** 命中率 */
    hitRate: number;
    /** 丢弃次数（池满时） */
    discards: number;
}
/**
 * 通用对象池
 */
export declare class ObjectPool<T> {
    private pool;
    private readonly maxSize;
    private readonly enableStats;
    private readonly factory;
    private readonly resetFn;
    private acquires;
    private releases;
    private hits;
    private misses;
    private discards;
    constructor(options: ObjectPoolOptions & {
        factory: () => T;
        reset: (obj: T) => void;
    });
    /**
     * 从池中获取对象
     */
    acquire(): T;
    /**
     * 释放对象回池
     */
    release(obj: T): void;
    /**
     * 清空池
     */
    clear(): void;
    /**
     * 获取统计信息
     */
    getStats(): ObjectPoolStats;
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 获取当前池大小
     */
    get size(): number;
    /**
     * 预热池（预先创建对象）
     */
    prewarm(count: number): void;
}
/**
 * EncryptResult 对象池
 */
export declare class EncryptResultPool extends ObjectPool<EncryptResult> {
    constructor(options?: Omit<ObjectPoolOptions, 'factory' | 'reset'>);
    /**
     * 创建成功的加密结果
     */
    createSuccess(data: string, algorithm: string, extras?: Partial<EncryptResult>): EncryptResult;
    /**
     * 创建失败的加密结果
     */
    createFailure(algorithm: string, error: string): EncryptResult;
}
/**
 * DecryptResult 对象池
 */
export declare class DecryptResultPool extends ObjectPool<DecryptResult> {
    constructor(options?: Omit<ObjectPoolOptions, 'factory' | 'reset'>);
    /**
     * 创建成功的解密结果
     */
    createSuccess(data: string, algorithm: string, mode?: string): DecryptResult;
    /**
     * 创建失败的解密结果
     */
    createFailure(algorithm: string, error: string, mode?: string): DecryptResult;
}
/**
 * 全局对象池实例
 */
export declare const globalEncryptResultPool: EncryptResultPool;
export declare const globalDecryptResultPool: DecryptResultPool;
/**
 * 便捷函数：获取加密结果对象
 */
export declare function acquireEncryptResult(): EncryptResult;
/**
 * 便捷函数：释放加密结果对象
 */
export declare function releaseEncryptResult(result: EncryptResult): void;
/**
 * 便捷函数：获取解密结果对象
 */
export declare function acquireDecryptResult(): DecryptResult;
/**
 * 便捷函数：释放解密结果对象
 */
export declare function releaseDecryptResult(result: DecryptResult): void;
/**
 * 便捷函数：创建成功的加密结果
 */
export declare function createEncryptSuccess(data: string, algorithm: string, extras?: Partial<EncryptResult>): EncryptResult;
/**
 * 便捷函数：创建失败的加密结果
 */
export declare function createEncryptFailure(algorithm: string, error: string): EncryptResult;
/**
 * 便捷函数：创建成功的解密结果
 */
export declare function createDecryptSuccess(data: string, algorithm: string, mode?: string): DecryptResult;
/**
 * 便捷函数：创建失败的解密结果
 */
export declare function createDecryptFailure(algorithm: string, error: string, mode?: string): DecryptResult;
/**
 * 获取所有池的统计信息
 */
export declare function getAllPoolStats(): {
    encryptResults: ObjectPoolStats;
    decryptResults: ObjectPoolStats;
};
/**
 * 清空所有池
 */
export declare function clearAllPools(): void;
