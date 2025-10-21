/**
 * LRU (Least Recently Used) 缓存实现
 *
 * 高性能的 LRU 缓存，用于优化加密操作的性能
 * 特性：
 * - O(1) 时间复杂度的读写操作
 * - 自动淘汰最久未使用的项
 * - 支持过期时间
 * - 内存使用优化
 */
/**
 * LRU 缓存配置
 */
export interface LRUCacheOptions {
    /** 最大缓存数量 */
    maxSize: number;
    /** 过期时间（毫秒），0 表示永不过期 */
    ttl?: number;
    /** 是否在获取时更新过期时间 */
    updateAgeOnGet?: boolean;
    /** 最大内存大小（字节），0 表示不限制 */
    maxMemorySize?: number;
    /** 计算条目大小的函数 */
    sizeCalculator?: <V>(value: V) => number;
    /** 自动清理过期项的间隔（毫秒），0 表示不自动清理 */
    cleanupInterval?: number;
}
/**
 * LRU 缓存类
 */
export declare class LRUCache<K = string, V = unknown> {
    private maxSize;
    private ttl;
    private updateAgeOnGet;
    private cache;
    private head;
    private tail;
    private maxMemorySize;
    private currentMemorySize;
    private sizeCalculator;
    private memorySizes;
    private cleanupInterval;
    private cleanupTimer?;
    private hits;
    private misses;
    private evictions;
    private memoryEvictions;
    constructor(options: LRUCacheOptions);
    /**
     * 默认的大小计算器
     */
    private defaultSizeCalculator;
    /**
     * 启动自动清理
     */
    private startAutoCleanup;
    /**
     * 停止自动清理
     */
    private stopAutoCleanup;
    /**
     * 获取缓存值
     */
    get(key: K): V | undefined;
    /**
     * 设置缓存值
     */
    set(key: K, value: V): void;
    /**
     * 删除缓存项
     */
    delete(key: K): boolean;
    /**
     * 检查是否存在
     */
    has(key: K): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 获取缓存大小
     */
    get size(): number;
    /**
     * 获取统计信息
     */
    getStats(): {
        size: number;
        maxSize: number;
        currentMemorySize: number;
        maxMemorySize: number;
        memoryUsagePercent: number;
        hits: number;
        misses: number;
        evictions: number;
        memoryEvictions: number;
        hitRate: number;
        totalRequests: number;
    };
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 清理过期项
     */
    cleanup(): number;
    /**
     * 批量获取缓存值
     * 性能优化：减少多次调用的开销
     */
    getMany(keys: K[]): Map<K, V>;
    /**
     * 批量设置缓存值
     * 性能优化：减少多次调用的开销
     */
    setMany(entries: Array<[K, V]>): void;
    /**
     * 批量删除缓存项
     * 性能优化：减少多次调用的开销
     */
    deleteMany(keys: K[]): number;
    /**
     * 获取所有键
     */
    keys(): K[];
    /**
     * 获取所有值
     */
    values(): V[];
    /**
     * 获取所有条目
     */
    entries(): Array<[K, V]>;
    /**
     * 检查节点是否过期
     */
    private isExpired;
    /**
     * 将节点移动到头部
     */
    private moveToHead;
    /**
     * 添加节点到头部
     */
    private addToHead;
    /**
     * 从链表中移除节点
     */
    private removeNode;
    /**
     * 移除尾部节点（最久未使用）
     */
    private removeTail;
    /**
     * 销毁缓存（释放资源）
     */
    destroy(): void;
}
