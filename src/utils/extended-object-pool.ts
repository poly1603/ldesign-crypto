/**
 * 扩展对象池 - 高级内存管理
 * 
 * 提供更全面的对象池化支持，减少 GC 压力，提升性能
 * 
 * 特性：
 * - 支持多种对象类型池化
 * - 智能池大小管理
 * - 自动预热和收缩
 * - 详细的性能统计
 * 
 * @module
 */

import CryptoJS from 'crypto-js'
import { ObjectPool } from './object-pool'

/**
 * WordArray 对象池
 * 用于池化 CryptoJS 的 WordArray 对象
 */
export class WordArrayPool extends ObjectPool<CryptoJS.lib.WordArray> {
  constructor(maxSize = 500) {
    super({
      maxSize,
      factory: () => CryptoJS.lib.WordArray.create(),
      reset: (obj) => {
        // 清空 WordArray
        obj.words.length = 0
        obj.sigBytes = 0
      },
    })
  }

  /**
   * 创建指定大小的 WordArray
   */
  createWithSize(sigBytes: number): CryptoJS.lib.WordArray {
    const wordArray = this.acquire()
    const nWords = Math.ceil(sigBytes / 4)

    // 确保 words 数组有足够的容量
    if (wordArray.words.length < nWords) {
      wordArray.words = new Array(nWords)
    }

    wordArray.sigBytes = sigBytes
    return wordArray
  }

  /**
   * 从字符串创建 WordArray
   */
  createFromString(str: string, encoding: CryptoJS.lib.IEncoder = CryptoJS.enc.Utf8): CryptoJS.lib.WordArray {
    const wordArray = this.acquire()
    const encoded = encoding.parse(str)

    // 复制数据
    wordArray.words = [...encoded.words]
    wordArray.sigBytes = encoded.sigBytes

    return wordArray
  }

  /**
   * 克隆 WordArray
   */
  clone(source: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    const wordArray = this.acquire()
    wordArray.words = [...source.words]
    wordArray.sigBytes = source.sigBytes
    return wordArray
  }
}

/**
 * 缓冲区池
 * 用于池化 ArrayBuffer 和 Uint8Array
 */
export class BufferPool {
  private pools = new Map<number, ObjectPool<ArrayBuffer>>()
  private maxPoolSize: number
  private sizeBuckets = [
    64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
  ]

  constructor(maxPoolSize = 100) {
    this.maxPoolSize = maxPoolSize
    this.initializePools()
  }

  /**
   * 初始化不同大小的池
   */
  private initializePools(): void {
    for (const size of this.sizeBuckets) {
      this.pools.set(size, new ObjectPool<ArrayBuffer>({
        maxSize: this.maxPoolSize,
        factory: () => new ArrayBuffer(size),
        reset: () => {
          // ArrayBuffer 不需要重置
        },
      }))
    }
  }

  /**
   * 获取合适大小的缓冲区
   */
  acquire(size: number): ArrayBuffer {
    // 找到最小的合适尺寸
    const bucketSize = this.sizeBuckets.find(s => s >= size) || size

    let pool = this.pools.get(bucketSize)
    if (!pool) {
      // 如果没有合适的池，创建一个临时池
      pool = new ObjectPool<ArrayBuffer>({
        maxSize: Math.min(10, this.maxPoolSize),
        factory: () => new ArrayBuffer(bucketSize),
        reset: () => { },
      })
      this.pools.set(bucketSize, pool)
    }

    const buffer = pool.acquire()

    // 如果池中的缓冲区大小不符（可能是新创建的），重新创建
    if (buffer.byteLength !== bucketSize) {
      return new ArrayBuffer(size)
    }

    return buffer
  }

  /**
   * 释放缓冲区
   */
  release(buffer: ArrayBuffer): void {
    const pool = this.pools.get(buffer.byteLength)
    if (pool) {
      pool.release(buffer)
    }
  }

  /**
   * 获取 Uint8Array
   */
  acquireUint8Array(size: number): Uint8Array {
    const buffer = this.acquire(size)
    return new Uint8Array(buffer, 0, size)
  }

  /**
   * 释放 Uint8Array
   */
  releaseUint8Array(array: Uint8Array): void {
    if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
      this.release(array.buffer)
    }
  }

  /**
   * 获取所有池的统计信息
   */
  getStats(): Map<number, any> {
    const stats = new Map<number, any>()
    for (const [size, pool] of this.pools) {
      stats.set(size, pool.getStats())
    }
    return stats
  }

  /**
   * 清空所有池
   */
  clear(): void {
    for (const pool of this.pools.values()) {
      pool.clear()
    }
  }
}

/**
 * CipherParams 对象池
 * 用于池化 CryptoJS 的 CipherParams 对象
 */
export class CipherParamsPool extends ObjectPool<CryptoJS.lib.CipherParams> {
  constructor(maxSize = 200) {
    super({
      maxSize,
      factory: () => {
        // CryptoJS.lib.CipherParams 不能直接创建，返回一个兼容的对象
        return {
          ciphertext: undefined,
          key: undefined,
          iv: undefined,
          salt: undefined,
          algorithm: undefined,
          mode: undefined,
          padding: undefined,
          blockSize: undefined,
          formatter: undefined,
        } as any
      },
      reset: (obj) => {
        // 重置 CipherParams
        obj.ciphertext = undefined as any
        obj.key = undefined as any
        obj.iv = undefined as any
        obj.salt = undefined as any
        obj.algorithm = undefined as any
        obj.mode = undefined as any
        obj.padding = undefined as any
        obj.blockSize = undefined as any
        obj.formatter = undefined as any
      },
    })
  }

  /**
   * 创建带参数的 CipherParams
   */
  createWithParams(params: Partial<CryptoJS.lib.CipherParams>): CryptoJS.lib.CipherParams {
    const cipherParams = this.acquire()
    Object.assign(cipherParams, params)
    return cipherParams
  }
}

/**
 * Base64 字符串缓存池
 * 用于缓存常用的 Base64 编码结果
 */
export class Base64Cache {
  private cache = new Map<string, string>()
  private maxSize: number
  private accessOrder: string[] = []

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  /**
   * 获取或计算 Base64 编码
   */
  getOrCompute(data: string, encoder: () => string): string {
    const cached = this.cache.get(data)
    if (cached) {
      // 更新访问顺序
      this.updateAccessOrder(data)
      return cached
    }

    const encoded = encoder()
    this.set(data, encoded)
    return encoded
  }

  /**
   * 设置缓存
   */
  private set(key: string, value: string): void {
    // 如果缓存已满，删除最久未使用的项
    if (this.cache.size >= this.maxSize) {
      const lru = this.accessOrder.shift()
      if (lru) {
        this.cache.delete(lru)
      }
    }

    this.cache.set(key, value)
    this.accessOrder.push(key)
  }

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(key)
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // 需要额外的命中统计逻辑
    }
  }
}

/**
 * 统一的内存池管理器
 */
export class MemoryPoolManager {
  private static instance: MemoryPoolManager

  // 各种对象池
  readonly wordArrayPool = new WordArrayPool()
  readonly bufferPool = new BufferPool()
  readonly cipherParamsPool = new CipherParamsPool()
  readonly base64Cache = new Base64Cache()

  // 性能统计
  private stats = {
    wordArrayAllocations: 0,
    bufferAllocations: 0,
    cipherParamsAllocations: 0,
    base64CacheHits: 0,
    base64CacheMisses: 0,
  }

  private constructor() {
    // 预热池
    this.prewarm()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MemoryPoolManager {
    if (!MemoryPoolManager.instance) {
      MemoryPoolManager.instance = new MemoryPoolManager()
    }
    return MemoryPoolManager.instance
  }

  /**
   * 预热对象池
   */
  private prewarm(): void {
    // 预热 WordArray 池
    this.wordArrayPool.prewarm(20)

    // 预热常用大小的缓冲区
    const commonSizes = [256, 512, 1024, 4096]
    for (const size of commonSizes) {
      const pool = this.bufferPool['pools'].get(size)
      if (pool) {
        pool.prewarm(5)
      }
    }

    // 预热 CipherParams 池
    this.cipherParamsPool.prewarm(10)
  }

  /**
   * 获取 WordArray
   */
  acquireWordArray(): CryptoJS.lib.WordArray {
    this.stats.wordArrayAllocations++
    return this.wordArrayPool.acquire()
  }

  /**
   * 释放 WordArray
   */
  releaseWordArray(wordArray: CryptoJS.lib.WordArray): void {
    this.wordArrayPool.release(wordArray)
  }

  /**
   * 获取缓冲区
   */
  acquireBuffer(size: number): ArrayBuffer {
    this.stats.bufferAllocations++
    return this.bufferPool.acquire(size)
  }

  /**
   * 释放缓冲区
   */
  releaseBuffer(buffer: ArrayBuffer): void {
    this.bufferPool.release(buffer)
  }

  /**
   * 获取 CipherParams
   */
  acquireCipherParams(): CryptoJS.lib.CipherParams {
    this.stats.cipherParamsAllocations++
    return this.cipherParamsPool.acquire()
  }

  /**
   * 释放 CipherParams
   */
  releaseCipherParams(params: CryptoJS.lib.CipherParams): void {
    this.cipherParamsPool.release(params)
  }

  /**
   * Base64 编码（带缓存）
   */
  base64Encode(data: string): string {
    return this.base64Cache.getOrCompute(data, () => {
      this.stats.base64CacheMisses++
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
    })
  }

  /**
   * 获取综合统计信息
   */
  getStats() {
    return {
      allocations: this.stats,
      pools: {
        wordArray: this.wordArrayPool.getStats(),
        buffer: Array.from(this.bufferPool.getStats().entries()),
        cipherParams: this.cipherParamsPool.getStats(),
        base64Cache: this.base64Cache.getStats(),
      },
      memory: {
        estimatedUsage: this.estimateMemoryUsage(),
      },
    }
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): number {
    let total = 0

    // WordArray 池
    const wordArrayStats = this.wordArrayPool.getStats()
    total += wordArrayStats.size * 100 // 估计每个 WordArray 100 字节

    // Buffer 池
    for (const [size, stats] of this.bufferPool.getStats()) {
      total += (stats as any).size * size
    }

    // CipherParams 池
    const cipherStats = this.cipherParamsPool.getStats()
    total += cipherStats.size * 200 // 估计每个 CipherParams 200 字节

    return total
  }

  /**
   * 清理所有池
   */
  clearAll(): void {
    this.wordArrayPool.clear()
    this.bufferPool.clear()
    this.cipherParamsPool.clear()
    this.base64Cache.clear()
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      wordArrayAllocations: 0,
      bufferAllocations: 0,
      cipherParamsAllocations: 0,
      base64CacheHits: 0,
      base64CacheMisses: 0,
    }

    this.wordArrayPool.resetStats()
    this.cipherParamsPool.resetStats()
  }
}

// 导出全局实例
export const memoryPoolManager = MemoryPoolManager.getInstance()

// 便捷函数
export const acquireWordArray = () => memoryPoolManager.acquireWordArray()
export const releaseWordArray = (wa: CryptoJS.lib.WordArray) => memoryPoolManager.releaseWordArray(wa)
export const acquireBuffer = (size: number) => memoryPoolManager.acquireBuffer(size)
export const releaseBuffer = (buffer: ArrayBuffer) => memoryPoolManager.releaseBuffer(buffer)
export const acquireCipherParams = () => memoryPoolManager.acquireCipherParams()
export const releaseCipherParams = (params: CryptoJS.lib.CipherParams) => memoryPoolManager.releaseCipherParams(params)


