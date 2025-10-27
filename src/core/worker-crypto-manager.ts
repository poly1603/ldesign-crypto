/**
 * Worker 加密管理器
 * 
 * 智能管理多线程和单线程加密操作，自动选择最优执行策略
 * 
 * 特性：
 * - 自动决策：基于数据大小和 CPU 负载选择执行策略
 * - 线程池管理：高效利用多核 CPU
 * - 性能监控：实时监控和优化
 * - 自动降级：Worker 不可用时自动降级到主线程
 * 
 * @module
 */

import type { AESOptions, DecryptResult, EncryptResult } from '../types'
import { AESEncryptor } from '../algorithms/aes'
import { DESEncryptor } from '../algorithms/des'
import { TripleDESEncryptor } from '../algorithms/tripledes'
import { RSAEncryptor } from '../algorithms/rsa'
import { getGlobalWorkerPool } from '../workers/worker-pool'
import { performanceMonitor } from '../utils/performance-monitor'
import { createEncryptFailure, createEncryptSuccess } from '../utils/object-pool'

/**
 * Worker 执行策略
 */
export enum ExecutionStrategy {
  /** 主线程执行 */
  MAIN_THREAD = 'main_thread',
  /** Worker 线程执行 */
  WORKER_THREAD = 'worker_thread',
  /** 自动选择 */
  AUTO = 'auto',
}

/**
 * Worker 加密管理器配置
 */
export interface WorkerCryptoManagerConfig {
  /** 启用 Worker（默认 true） */
  enableWorker?: boolean
  /** Worker 池大小（默认 CPU 核心数） */
  workerPoolSize?: number
  /** 使用 Worker 的最小数据大小（字节，默认 1KB） */
  workerThreshold?: number
  /** 执行策略（默认 AUTO） */
  strategy?: ExecutionStrategy
  /** 启用性能监控（默认 true） */
  enableMonitoring?: boolean
  /** Worker 超时时间（毫秒，默认 30000） */
  workerTimeout?: number
}

/**
 * 执行统计信息
 */
export interface ExecutionStats {
  /** 主线程执行次数 */
  mainThreadExecutions: number
  /** Worker 执行次数 */
  workerExecutions: number
  /** 主线程平均时间（毫秒） */
  mainThreadAvgTime: number
  /** Worker 平均时间（毫秒） */
  workerAvgTime: number
  /** Worker 使用率 */
  workerUtilization: number
  /** 性能提升比例 */
  performanceGain: number
}

/**
 * Worker 加密管理器
 * 
 * 提供智能的多线程加密管理，自动在主线程和 Worker 线程之间选择最优执行策略
 * 
 * @example
 * ```typescript
 * const manager = new WorkerCryptoManager({
 *   enableWorker: true,
 *   workerPoolSize: 4,
 *   workerThreshold: 1024 // 1KB
 * })
 * 
 * // 自动选择执行策略
 * const result = await manager.encrypt('large data...', 'key', 'AES')
 * 
 * // 强制使用 Worker
 * const result2 = await manager.encrypt('data', 'key', 'AES', {
 *   forceWorker: true
 * })
 * 
 * // 获取执行统计
 * const stats = manager.getExecutionStats()
 * console.log(`Worker 使用率: ${stats.workerUtilization}%`)
 * ```
 */
export class WorkerCryptoManager {
  private config: Required<WorkerCryptoManagerConfig>
  private workerPool = getGlobalWorkerPool()

  // 加密器实例
  private aesEncryptor = new AESEncryptor()
  private desEncryptor = new DESEncryptor()
  private tripleDesEncryptor = new TripleDESEncryptor()
  private rsaEncryptor = new RSAEncryptor()

  // 执行统计
  private stats = {
    mainThread: { count: 0, totalTime: 0 },
    worker: { count: 0, totalTime: 0 },
  }

  constructor(config: WorkerCryptoManagerConfig = {}) {
    this.config = {
      enableWorker: config.enableWorker ?? true,
      workerPoolSize: config.workerPoolSize ?? ((typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4) || 4),
      workerThreshold: config.workerThreshold ?? 1024, // 1KB
      strategy: config.strategy ?? ExecutionStrategy.AUTO,
      enableMonitoring: config.enableMonitoring ?? true,
      workerTimeout: config.workerTimeout ?? 30000,
    }

    // 初始化 Worker 池
    if (this.config.enableWorker && typeof Worker !== 'undefined') {
      this.initializeWorkerPool()
    }
  }

  /**
   * 初始化 Worker 池
   */
  private initializeWorkerPool(): void {
    try {
      // Worker 池会在第一次使用时自动初始化
      console.log(`Worker pool initialized with ${this.config.workerPoolSize} workers`)
    } catch (error) {
      console.warn('Failed to initialize worker pool, falling back to main thread:', error)
      this.config.enableWorker = false
    }
  }

  /**
   * 决定执行策略
   */
  private shouldUseWorker(dataSize: number, algorithm: string, forceWorker?: boolean): boolean {
    // 强制使用 Worker
    if (forceWorker && this.config.enableWorker) {
      return true
    }

    // Worker 不可用
    if (!this.config.enableWorker || typeof Worker === 'undefined') {
      return false
    }

    // 根据策略决定
    switch (this.config.strategy) {
      case ExecutionStrategy.MAIN_THREAD:
        return false

      case ExecutionStrategy.WORKER_THREAD:
        return true

      case ExecutionStrategy.AUTO:
      default:
        // 基于数据大小的智能决策
        if (dataSize < this.config.workerThreshold) {
          return false // 小数据直接在主线程处理更快
        }

        // 检查 Worker 池状态
        const poolStats = this.workerPool.getStats()

        // 如果所有 Worker 都忙碌且队列较长，使用主线程
        if (poolStats.busyWorkers === poolStats.totalWorkers && poolStats.queueLength > 5) {
          return false
        }

        // RSA 等计算密集型算法优先使用 Worker
        if (['RSA', 'PBKDF2'].includes(algorithm.toUpperCase())) {
          return true
        }

        return true
    }
  }

  /**
   * 加密数据
   */
  async encrypt(
    data: string,
    key: string,
    algorithm: string,
    options?: AESOptions & { forceWorker?: boolean }
  ): Promise<EncryptResult> {
    const startTime = performance.now()
    const dataSize = new TextEncoder().encode(data).length
    const useWorker = this.shouldUseWorker(dataSize, algorithm, options?.forceWorker)

    let result: EncryptResult
    let operationId: string | undefined

    try {
      // 开始性能监控
      if (this.config.enableMonitoring) {
        operationId = `encrypt_${algorithm}_${Date.now()}`
        performanceMonitor.startOperation(operationId, algorithm as any)
      }

      if (useWorker) {
        // 使用 Worker 执行
        result = await this.workerPool.encrypt(data, key, algorithm, options)
        this.updateStats('worker', performance.now() - startTime)
      } else {
        // 在主线程执行
        result = await this.encryptInMainThread(data, key, algorithm, options)
        this.updateStats('mainThread', performance.now() - startTime)
      }

      // 结束性能监控
      if (this.config.enableMonitoring && operationId) {
        performanceMonitor.endOperation(
          operationId,
          useWorker ? 'worker_encrypt' : 'main_encrypt',
          result.success,
          dataSize,
          result.error,
          algorithm as any
        )
      }

      return result
    } catch (error) {
      // 结束性能监控（失败情况）
      if (this.config.enableMonitoring && operationId) {
        performanceMonitor.endOperation(
          operationId,
          useWorker ? 'worker_encrypt' : 'main_encrypt',
          false,
          dataSize,
          error instanceof Error ? error.message : 'Unknown error',
          algorithm as any
        )
      }

      return createEncryptFailure(
        algorithm,
        error instanceof Error ? error.message : 'Encryption failed'
      )
    }
  }

  /**
   * 解密数据
   */
  async decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    algorithm?: string,
    options?: AESOptions & { forceWorker?: boolean }
  ): Promise<DecryptResult> {
    const startTime = performance.now()

    // 提取算法信息
    const algo = algorithm || (typeof encryptedData === 'object' ? encryptedData.algorithm : 'AES')
    const data = typeof encryptedData === 'string' ? encryptedData : encryptedData.data
    const dataSize = new TextEncoder().encode(data).length

    const useWorker = this.shouldUseWorker(dataSize, algo, options?.forceWorker)

    let result: DecryptResult
    let operationId: string | undefined

    try {
      // 开始性能监控
      if (this.config.enableMonitoring) {
        operationId = `decrypt_${algo}_${Date.now()}`
        performanceMonitor.startOperation(operationId, algo as any)
      }

      if (useWorker) {
        // 使用 Worker 执行
        result = await this.workerPool.decrypt(data, key, algo, options)
        this.updateStats('worker', performance.now() - startTime)
      } else {
        // 在主线程执行
        result = await this.decryptInMainThread(encryptedData, key, algo, options)
        this.updateStats('mainThread', performance.now() - startTime)
      }

      // 结束性能监控
      if (this.config.enableMonitoring && operationId) {
        performanceMonitor.endOperation(
          operationId,
          useWorker ? 'worker_decrypt' : 'main_decrypt',
          result.success,
          dataSize,
          result.error,
          algo as any
        )
      }

      return result
    } catch (error) {
      // 结束性能监控（失败情况）
      if (this.config.enableMonitoring && operationId) {
        performanceMonitor.endOperation(
          operationId,
          useWorker ? 'worker_decrypt' : 'main_decrypt',
          false,
          dataSize,
          error instanceof Error ? error.message : 'Unknown error',
          algo as any
        )
      }

      return {
        success: false,
        data: '',
        algorithm: algo,
        error: error instanceof Error ? error.message : 'Decryption failed',
      }
    }
  }

  /**
   * 在主线程执行加密
   */
  private async encryptInMainThread(
    data: string,
    key: string,
    algorithm: string,
    options?: AESOptions
  ): Promise<EncryptResult> {
    switch (algorithm.toUpperCase()) {
      case 'AES':
        return this.aesEncryptor.encrypt(data, key, options)
      case 'DES':
        return this.desEncryptor.encrypt(data, key, options)
      case '3DES':
      case 'TRIPLEDES':
        return this.tripleDesEncryptor.encrypt(data, key, options)
      case 'RSA':
        return this.rsaEncryptor.encrypt(data, key)
      default:
        return createEncryptFailure(algorithm, `Unsupported algorithm: ${algorithm}`)
    }
  }

  /**
   * 在主线程执行解密
   */
  private async decryptInMainThread(
    encryptedData: string | EncryptResult,
    key: string,
    algorithm: string,
    options?: AESOptions
  ): Promise<DecryptResult> {
    switch (algorithm.toUpperCase()) {
      case 'AES':
        return this.aesEncryptor.decrypt(encryptedData, key, options)
      case 'DES':
        return this.desEncryptor.decrypt(encryptedData, key, options)
      case '3DES':
      case 'TRIPLEDES':
        return this.tripleDesEncryptor.decrypt(encryptedData, key, options)
      case 'RSA':
        return this.rsaEncryptor.decrypt(encryptedData, key)
      default:
        return {
          success: false,
          data: '',
          algorithm,
          error: `Unsupported algorithm: ${algorithm}`,
        }
    }
  }

  /**
   * 批量加密
   */
  async batchEncrypt(
    operations: Array<{
      data: string
      key: string
      algorithm: string
      options?: AESOptions
    }>
  ): Promise<EncryptResult[]> {
    // 根据数据大小分组
    const workerOps: typeof operations = []
    const mainThreadOps: typeof operations = []

    for (const op of operations) {
      const dataSize = new TextEncoder().encode(op.data).length
      if (this.shouldUseWorker(dataSize, op.algorithm)) {
        workerOps.push(op)
      } else {
        mainThreadOps.push(op)
      }
    }

    // 并行执行
    const promises: Promise<EncryptResult>[] = []

    // Worker 批量操作
    if (workerOps.length > 0) {
      promises.push(...workerOps.map(op =>
        this.encrypt(op.data, op.key, op.algorithm, { ...op.options, forceWorker: true })
      ))
    }

    // 主线程批量操作
    if (mainThreadOps.length > 0) {
      promises.push(...mainThreadOps.map(op =>
        this.encrypt(op.data, op.key, op.algorithm, { ...op.options, forceWorker: false })
      ))
    }

    return Promise.all(promises)
  }

  /**
   * 批量解密
   */
  async batchDecrypt(
    operations: Array<{
      data: string | EncryptResult
      key: string
      algorithm?: string
      options?: AESOptions
    }>
  ): Promise<DecryptResult[]> {
    return Promise.all(
      operations.map(op =>
        this.decrypt(op.data, op.key, op.algorithm, op.options)
      )
    )
  }

  /**
   * 更新统计信息
   */
  private updateStats(type: 'mainThread' | 'worker', time: number): void {
    this.stats[type].count++
    this.stats[type].totalTime += time
  }

  /**
   * 获取执行统计
   */
  getExecutionStats(): ExecutionStats {
    const mainThreadCount = this.stats.mainThread.count
    const workerCount = this.stats.worker.count
    const totalCount = mainThreadCount + workerCount

    const mainThreadAvgTime = mainThreadCount > 0
      ? this.stats.mainThread.totalTime / mainThreadCount
      : 0

    const workerAvgTime = workerCount > 0
      ? this.stats.worker.totalTime / workerCount
      : 0

    const workerUtilization = totalCount > 0
      ? (workerCount / totalCount) * 100
      : 0

    const performanceGain = mainThreadAvgTime > 0 && workerAvgTime > 0
      ? ((mainThreadAvgTime - workerAvgTime) / mainThreadAvgTime) * 100
      : 0

    return {
      mainThreadExecutions: mainThreadCount,
      workerExecutions: workerCount,
      mainThreadAvgTime,
      workerAvgTime,
      workerUtilization,
      performanceGain,
    }
  }

  /**
   * 获取 Worker 池统计
   */
  getWorkerPoolStats() {
    return this.workerPool.getStats()
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      mainThread: { count: 0, totalTime: 0 },
      worker: { count: 0, totalTime: 0 },
    }
    this.workerPool.resetStats()
  }

  /**
   * 预热 Worker 池
   * 通过执行一些小任务来初始化 Worker
   */
  async warmup(): Promise<void> {
    if (!this.config.enableWorker) {
      return
    }

    const warmupOps = []
    const algorithms = ['AES', 'DES', 'RSA']

    // 为每个 Worker 创建预热任务
    for (let i = 0; i < this.config.workerPoolSize; i++) {
      for (const algo of algorithms) {
        warmupOps.push({
          data: 'warmup',
          key: 'warmup-key',
          algorithm: algo,
        })
      }
    }

    // 执行预热
    await this.batchEncrypt(warmupOps)

    // 重置统计（不计入预热操作）
    this.resetStats()
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    await this.workerPool.terminate()
  }
}

// 延迟初始化全局实例
let _workerCryptoManager: WorkerCryptoManager | null = null

export function getWorkerCryptoManager(): WorkerCryptoManager {
  if (!_workerCryptoManager) {
    _workerCryptoManager = new WorkerCryptoManager()
  }
  return _workerCryptoManager
}

// 导出全局实例（延迟初始化）
export const workerCryptoManager = getWorkerCryptoManager()

/**
 * 便捷函数：使用 Worker 加密
 */
export async function encryptWithWorker(
  data: string,
  key: string,
  algorithm: string = 'AES',
  options?: AESOptions
): Promise<EncryptResult> {
  return getWorkerCryptoManager().encrypt(data, key, algorithm, options)
}

/**
 * 便捷函数：使用 Worker 解密
 */
export async function decryptWithWorker(
  encryptedData: string | EncryptResult,
  key: string,
  algorithm?: string,
  options?: AESOptions
): Promise<DecryptResult> {
  return getWorkerCryptoManager().decrypt(encryptedData, key, algorithm, options)
}


