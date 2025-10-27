/**
 * 自适应缓存管理器
 * 
 * 提供智能的缓存预热、自适应策略和性能优化
 * 
 * 特性：
 * - 智能预热：基于使用模式预测
 * - 自适应大小：根据内存压力动态调整
 * - 热点检测：识别频繁访问的数据
 * - 预测性加载：提前加载可能需要的数据
 * - 分层缓存：L1（内存）+ L2（IndexedDB）
 * 
 * @module
 */

import { LRUCache } from './lru-cache'
import { performanceMonitor } from './performance-monitor'
import { memoryPoolManager } from './extended-object-pool'

/**
 * 缓存项元数据
 */
interface CacheItemMetadata {
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccess: number
  /** 创建时间 */
  createdAt: number
  /** 数据大小（字节） */
  size: number
  /** 访问模式（时间间隔数组） */
  accessPattern: number[]
  /** 预测的下次访问时间 */
  predictedNextAccess?: number
}

/**
 * 缓存配置
 */
export interface AdaptiveCacheConfig {
  /** 初始缓存大小 */
  initialSize?: number
  /** 最大缓存大小 */
  maxSize?: number
  /** 最小缓存大小 */
  minSize?: number
  /** TTL（毫秒） */
  ttl?: number
  /** 启用预热 */
  enablePrewarm?: boolean
  /** 启用自适应调整 */
  enableAdaptive?: boolean
  /** 启用 L2 缓存（IndexedDB） */
  enableL2Cache?: boolean
  /** 内存压力阈值（0-1） */
  memoryPressureThreshold?: number
  /** 预热批次大小 */
  prewarmBatchSize?: number
  /** 访问模式窗口大小 */
  patternWindowSize?: number
}

/**
 * 缓存统计
 */
export interface CacheStatistics {
  /** 命中率 */
  hitRate: number
  /** 未命中率 */
  missRate: number
  /** 驱逐率 */
  evictionRate: number
  /** 平均访问时间 */
  avgAccessTime: number
  /** 缓存效率评分（0-100） */
  efficiencyScore: number
  /** 内存使用量（MB） */
  memoryUsage: number
  /** 热点数据数量 */
  hotDataCount: number
}

/**
 * 预热策略
 */
export enum PrewarmStrategy {
  /** 最近最少使用 */
  LRU = 'lru',
  /** 最频繁使用 */
  LFU = 'lfu',
  /** 基于时间模式 */
  TIME_BASED = 'time_based',
  /** 混合策略 */
  HYBRID = 'hybrid',
}

/**
 * 自适应缓存管理器
 * 
 * @example
 * ```typescript
 * const cache = new AdaptiveCache<string>({
 *   initialSize: 1000,
 *   enablePrewarm: true,
 *   enableAdaptive: true
 * })
 * 
 * // 设置值
 * cache.set('key', 'value')
 * 
 * // 获取值（自动记录访问模式）
 * const value = cache.get('key')
 * 
 * // 预热缓存
 * await cache.prewarm()
 * 
 * // 获取统计信息
 * const stats = cache.getStatistics()
 * console.log(`缓存效率: ${stats.efficiencyScore}/100`)
 * ```
 */
export class AdaptiveCache<T> {
  private l1Cache: LRUCache<T>
  private metadata = new Map<string, CacheItemMetadata>()
  private config: Required<AdaptiveCacheConfig>

  // 统计数据
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalAccessTime: 0,
    accessCount: 0,
  }

  // 自适应参数
  private currentSize: number
  private lastAdjustTime = Date.now()
  private memoryPressure = 0

  // 预热相关
  private prewarmQueue: string[] = []
  private isPrewarming = false

  // L2 缓存（IndexedDB）
  private l2Cache: IDBDatabase | null = null
  private l2CacheName = 'ldesign_crypto_cache'

  constructor(config: AdaptiveCacheConfig = {}) {
    this.config = {
      initialSize: config.initialSize ?? 1000,
      maxSize: config.maxSize ?? 10000,
      minSize: config.minSize ?? 100,
      ttl: config.ttl ?? 5 * 60 * 1000, // 5分钟
      enablePrewarm: config.enablePrewarm ?? true,
      enableAdaptive: config.enableAdaptive ?? true,
      enableL2Cache: config.enableL2Cache ?? false,
      memoryPressureThreshold: config.memoryPressureThreshold ?? 0.8,
      prewarmBatchSize: config.prewarmBatchSize ?? 50,
      patternWindowSize: config.patternWindowSize ?? 10,
    }

    this.currentSize = this.config.initialSize
    this.l1Cache = new LRUCache<T>({
      maxSize: this.currentSize,
      ttl: this.config.ttl,
      onEvict: (key) => this.handleEviction(key),
    })

    // 初始化 L2 缓存
    if (this.config.enableL2Cache && typeof indexedDB !== 'undefined') {
      this.initL2Cache()
    }

    // 启动自适应调整
    if (this.config.enableAdaptive) {
      this.startAdaptiveAdjustment()
    }
  }

  /**
   * 获取缓存值
   */
  async get(key: string): Promise<T | undefined> {
    const startTime = performance.now()

    // L1 缓存查找
    let value = this.l1Cache.get(key)

    if (value !== undefined) {
      this.stats.hits++
      this.updateAccessMetadata(key, startTime)
      return value
    }

    // L2 缓存查找
    if (this.l2Cache && !value) {
      value = await this.getFromL2(key)
      if (value !== undefined) {
        // 提升到 L1
        this.l1Cache.set(key, value)
        this.stats.hits++
        this.updateAccessMetadata(key, startTime)
        return value
      }
    }

    this.stats.misses++
    this.stats.totalAccessTime += performance.now() - startTime
    this.stats.accessCount++

    return undefined
  }

  /**
   * 设置缓存值
   */
  async set(key: string, value: T): Promise<void> {
    const size = this.estimateSize(value)

    // 更新元数据
    this.metadata.set(key, {
      accessCount: 0,
      lastAccess: Date.now(),
      createdAt: Date.now(),
      size,
      accessPattern: [],
    })

    // L1 缓存
    this.l1Cache.set(key, value)

    // L2 缓存
    if (this.l2Cache) {
      await this.setToL2(key, value)
    }

    // 检查是否需要预热
    if (this.config.enablePrewarm) {
      this.analyzeForPrewarm(key)
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<boolean> {
    this.metadata.delete(key)
    const l1Deleted = this.l1Cache.delete(key)

    if (this.l2Cache) {
      await this.deleteFromL2(key)
    }

    return l1Deleted
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.metadata.clear()
    this.l1Cache.clear()

    if (this.l2Cache) {
      await this.clearL2()
    }

    this.resetStats()
  }

  /**
   * 预热缓存
   */
  async prewarm(strategy: PrewarmStrategy = PrewarmStrategy.HYBRID): Promise<void> {
    if (this.isPrewarming) {
      return
    }

    this.isPrewarming = true
    const operationId = `cache_prewarm_${Date.now()}`
    performanceMonitor.startOperation(operationId)

    try {
      const candidates = this.selectPrewarmCandidates(strategy)

      // 分批预热
      for (let i = 0; i < candidates.length; i += this.config.prewarmBatchSize) {
        const batch = candidates.slice(i, i + this.config.prewarmBatchSize)
        await this.prewarmBatch(batch)

        // 避免阻塞主线程
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      performanceMonitor.endOperation(operationId, 'cache_prewarm', true)
    } finally {
      this.isPrewarming = false
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics(): CacheStatistics {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0
    const evictionRate = totalRequests > 0 ? this.stats.evictions / totalRequests : 0
    const avgAccessTime = this.stats.accessCount > 0
      ? this.stats.totalAccessTime / this.stats.accessCount
      : 0

    // 计算效率评分（0-100）
    const efficiencyScore = this.calculateEfficiencyScore(hitRate, evictionRate, avgAccessTime)

    // 计算内存使用
    const memoryUsage = this.calculateMemoryUsage()

    // 计算热点数据
    const hotDataCount = this.countHotData()

    return {
      hitRate,
      missRate,
      evictionRate,
      avgAccessTime,
      efficiencyScore,
      memoryUsage,
      hotDataCount,
    }
  }

  /**
   * 更新访问元数据
   */
  private updateAccessMetadata(key: string, startTime: number): void {
    const metadata = this.metadata.get(key)
    if (!metadata) {
      return
    }

    const now = Date.now()
    const accessTime = performance.now() - startTime

    // 更新访问计数和时间
    metadata.accessCount++
    metadata.lastAccess = now

    // 更新访问模式
    if (metadata.accessPattern.length > 0) {
      const interval = now - metadata.accessPattern[metadata.accessPattern.length - 1]
      metadata.accessPattern.push(interval)

      // 保持窗口大小
      if (metadata.accessPattern.length > this.config.patternWindowSize) {
        metadata.accessPattern.shift()
      }

      // 预测下次访问时间
      metadata.predictedNextAccess = this.predictNextAccess(metadata.accessPattern)
    } else {
      metadata.accessPattern.push(now)
    }

    this.stats.totalAccessTime += accessTime
    this.stats.accessCount++
  }

  /**
   * 处理驱逐事件
   */
  private async handleEviction(key: string): Promise<void> {
    this.stats.evictions++

    // 将数据移到 L2 缓存
    if (this.l2Cache) {
      const value = this.l1Cache.get(key)
      if (value !== undefined) {
        await this.setToL2(key, value)
      }
    }
  }

  /**
   * 选择预热候选项
   */
  private selectPrewarmCandidates(strategy: PrewarmStrategy): string[] {
    const candidates: Array<{ key: string; score: number }> = []

    for (const [key, metadata] of this.metadata.entries()) {
      let score = 0

      switch (strategy) {
        case PrewarmStrategy.LRU:
          score = Date.now() - metadata.lastAccess
          break

        case PrewarmStrategy.LFU:
          score = metadata.accessCount
          break

        case PrewarmStrategy.TIME_BASED:
          if (metadata.predictedNextAccess) {
            score = metadata.predictedNextAccess - Date.now()
          }
          break

        case PrewarmStrategy.HYBRID:
        default:
          // 综合评分
          const recencyScore = 1 / (Date.now() - metadata.lastAccess + 1)
          const frequencyScore = metadata.accessCount
          const sizeScore = 1 / (metadata.size + 1)
          score = recencyScore * 0.4 + frequencyScore * 0.4 + sizeScore * 0.2
          break
      }

      candidates.push({ key, score })
    }

    // 根据策略排序
    candidates.sort((a, b) => {
      if (strategy === PrewarmStrategy.LRU || strategy === PrewarmStrategy.TIME_BASED) {
        return a.score - b.score // 升序
      } else {
        return b.score - a.score // 降序
      }
    })

    // 返回前 N 个候选项
    return candidates
      .slice(0, Math.min(candidates.length, this.currentSize * 0.2))
      .map(c => c.key)
  }

  /**
   * 预热批次
   */
  private async prewarmBatch(keys: string[]): Promise<void> {
    const promises = keys.map(async key => {
      const value = await this.getFromL2(key)
      if (value !== undefined) {
        this.l1Cache.set(key, value)
      }
    })

    await Promise.all(promises)
  }

  /**
   * 预测下次访问时间
   */
  private predictNextAccess(pattern: number[]): number {
    if (pattern.length < 2) {
      return Date.now() + this.config.ttl
    }

    // 计算平均间隔
    const intervals = []
    for (let i = 1; i < pattern.length; i++) {
      intervals.push(pattern[i] - pattern[i - 1])
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

    // 加权移动平均（更近的间隔权重更大）
    let weightedSum = 0
    let weightSum = 0

    for (let i = 0; i < intervals.length; i++) {
      const weight = i + 1
      weightedSum += intervals[i] * weight
      weightSum += weight
    }

    const predictedInterval = weightedSum / weightSum

    return Date.now() + predictedInterval
  }

  /**
   * 启动自适应调整
   */
  private startAdaptiveAdjustment(): void {
    setInterval(() => {
      this.adjustCacheSize()
    }, 10000) // 每10秒调整一次
  }

  /**
   * 调整缓存大小
   */
  private adjustCacheSize(): void {
    const stats = this.getStatistics()

    // 检查内存压力
    this.memoryPressure = this.getMemoryPressure()

    // 根据效率评分和内存压力调整
    if (this.memoryPressure > this.config.memoryPressureThreshold) {
      // 内存压力大，减少缓存
      this.currentSize = Math.max(
        this.config.minSize,
        Math.floor(this.currentSize * 0.8)
      )
    } else if (stats.efficiencyScore < 60 && stats.evictionRate > 0.2) {
      // 效率低且驱逐率高，增加缓存
      this.currentSize = Math.min(
        this.config.maxSize,
        Math.floor(this.currentSize * 1.2)
      )
    } else if (stats.efficiencyScore > 80 && stats.evictionRate < 0.05) {
      // 效率高且驱逐率低，可以适当减少缓存
      this.currentSize = Math.max(
        this.config.minSize,
        Math.floor(this.currentSize * 0.95)
      )
    }

    // 更新 L1 缓存大小
    if (this.currentSize !== this.l1Cache.maxSize) {
      const newCache = new LRUCache<T>({
        maxSize: this.currentSize,
        ttl: this.config.ttl,
        onEvict: (key) => this.handleEviction(key),
      })

      // 迁移数据
      for (const [key, value] of this.l1Cache.entries()) {
        newCache.set(key, value)
      }

      this.l1Cache = newCache
      console.log(`Cache size adjusted to ${this.currentSize}`)
    }
  }

  /**
   * 计算效率评分
   */
  private calculateEfficiencyScore(
    hitRate: number,
    evictionRate: number,
    avgAccessTime: number
  ): number {
    // 命中率权重 50%
    const hitScore = hitRate * 50

    // 驱逐率权重 30%（反向）
    const evictionScore = (1 - evictionRate) * 30

    // 访问时间权重 20%（标准化）
    const timeScore = Math.max(0, Math.min(20, 20 - avgAccessTime * 2))

    return Math.round(hitScore + evictionScore + timeScore)
  }

  /**
   * 计算内存使用
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0

    for (const metadata of this.metadata.values()) {
      totalSize += metadata.size
    }

    return totalSize / (1024 * 1024) // MB
  }

  /**
   * 统计热点数据
   */
  private countHotData(): number {
    const threshold = Date.now() - 60000 // 1分钟内
    let count = 0

    for (const metadata of this.metadata.values()) {
      if (metadata.lastAccess > threshold && metadata.accessCount > 5) {
        count++
      }
    }

    return count
  }

  /**
   * 获取内存压力
   */
  private getMemoryPressure(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      const totalMemory = require('os').totalmem()
      return usage.heapUsed / totalMemory
    }

    // 浏览器环境估算
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      if (memory.usedJSHeapSize && memory.jsHeapSizeLimit) {
        return memory.usedJSHeapSize / memory.jsHeapSizeLimit
      }
    }

    return 0.5 // 默认中等压力
  }

  /**
   * 估算数据大小
   */
  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2 // UTF-16
    } catch {
      return 1024 // 默认 1KB
    }
  }

  /**
   * 分析是否需要预热
   */
  private analyzeForPrewarm(key: string): void {
    const metadata = this.metadata.get(key)
    if (!metadata) {
      return
    }

    // 如果是热点数据且不在 L1 缓存中，加入预热队列
    if (metadata.accessCount > 10 && !this.l1Cache.has(key)) {
      this.prewarmQueue.push(key)

      // 批量预热
      if (this.prewarmQueue.length >= this.config.prewarmBatchSize) {
        const batch = this.prewarmQueue.splice(0, this.config.prewarmBatchSize)
        this.prewarmBatch(batch)
      }
    }
  }

  /**
   * 重置统计
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalAccessTime: 0,
      accessCount: 0,
    }
  }

  // === L2 缓存（IndexedDB）相关方法 ===

  private async initL2Cache(): Promise<void> {
    try {
      const request = indexedDB.open(this.l2CacheName, 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }

      request.onsuccess = (event) => {
        this.l2Cache = (event.target as IDBOpenDBRequest).result
        console.log('L2 cache (IndexedDB) initialized')
      }

      request.onerror = () => {
        console.warn('Failed to initialize L2 cache')
      }
    } catch (error) {
      console.warn('IndexedDB not available:', error)
    }
  }

  private async getFromL2(key: string): Promise<T | undefined> {
    if (!this.l2Cache) {
      return undefined
    }

    return new Promise((resolve) => {
      const transaction = this.l2Cache!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : undefined)
      }

      request.onerror = () => {
        resolve(undefined)
      }
    })
  }

  private async setToL2(key: string, value: T): Promise<void> {
    if (!this.l2Cache) {
      return
    }

    return new Promise((resolve) => {
      const transaction = this.l2Cache!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put({ key, value, timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }

  private async deleteFromL2(key: string): Promise<void> {
    if (!this.l2Cache) {
      return
    }

    return new Promise((resolve) => {
      const transaction = this.l2Cache!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }

  private async clearL2(): Promise<void> {
    if (!this.l2Cache) {
      return
    }

    return new Promise((resolve) => {
      const transaction = this.l2Cache!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }
}

// 导出便捷函数
export const createAdaptiveCache = <T>(config?: AdaptiveCacheConfig) =>
  new AdaptiveCache<T>(config)

