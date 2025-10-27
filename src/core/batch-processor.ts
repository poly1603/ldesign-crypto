/**
 * 高性能批量操作处理器
 * 
 * 提供优化的批量加密/解密操作，支持智能并行策略、内存管理和性能监控
 * 
 * 特性：
 * - 自适应并发控制
 * - 智能任务分组
 * - 内存压力监控
 * - 进度回调
 * - 错误重试机制
 * 
 * @module
 */

import type { DecryptResult, EncryptionAlgorithm, EncryptResult } from '../types'
import type { BatchOperation } from './performance'
import { workerCryptoManager } from './worker-crypto-manager'
import { cryptoWasm } from '../wasm/crypto-wasm'
import { memoryPoolManager } from '../utils/extended-object-pool'
import { performanceMonitor } from '../utils/performance-monitor'

/**
 * 批量处理器配置
 */
export interface BatchProcessorConfig {
  /** 最大并发数（默认 CPU 核心数） */
  maxConcurrency?: number
  /** 启用 Worker（默认 true） */
  enableWorker?: boolean
  /** 启用 WebAssembly（默认 true） */
  enableWasm?: boolean
  /** 启用智能任务分组（默认 true） */
  enableSmartGrouping?: boolean
  /** 任务超时时间（毫秒，默认 30000） */
  taskTimeout?: number
  /** 启用错误重试（默认 true） */
  enableRetry?: boolean
  /** 最大重试次数（默认 3） */
  maxRetries?: number
  /** 内存压力阈值（MB，默认 500） */
  memoryPressureThreshold?: number
  /** 进度回调间隔（毫秒，默认 100） */
  progressInterval?: number
}

/**
 * 批量处理进度
 */
export interface BatchProgress {
  /** 总任务数 */
  total: number
  /** 已完成数 */
  completed: number
  /** 失败数 */
  failed: number
  /** 进度百分比 */
  percentage: number
  /** 估计剩余时间（毫秒） */
  estimatedTimeRemaining: number
  /** 当前吞吐量（任务/秒） */
  throughput: number
}

/**
 * 任务执行策略
 */
export enum ExecutionStrategy {
  /** 主线程执行 */
  MAIN_THREAD = 'main_thread',
  /** Worker 线程执行 */
  WORKER_THREAD = 'worker_thread',
  /** WebAssembly 执行 */
  WASM = 'wasm',
  /** 混合策略 */
  HYBRID = 'hybrid',
}

/**
 * 任务分组
 */
interface TaskGroup {
  strategy: ExecutionStrategy
  tasks: Array<{
    index: number
    operation: BatchOperation
  }>
}

/**
 * 高性能批量处理器
 * 
 * @example
 * ```typescript
 * const processor = new BatchProcessor({
 *   maxConcurrency: 8,
 *   enableSmartGrouping: true
 * })
 * 
 * // 批量加密，带进度回调
 * const results = await processor.batchEncrypt(operations, {
 *   onProgress: (progress) => {
 *     console.log(`进度: ${progress.percentage}%`)
 *     console.log(`吞吐量: ${progress.throughput} ops/s`)
 *   }
 * })
 * ```
 */
export class BatchProcessor {
  private config: Required<BatchProcessorConfig>
  private currentMemoryUsage = 0
  private operationStartTime = 0
  private completedOperations = 0
  private failedOperations = 0

  constructor(config: BatchProcessorConfig = {}) {
    const cpuCount = typeof navigator !== 'undefined'
      ? navigator.hardwareConcurrency || 4
      : 4

    this.config = {
      maxConcurrency: config.maxConcurrency ?? cpuCount,
      enableWorker: config.enableWorker ?? true,
      enableWasm: config.enableWasm ?? true,
      enableSmartGrouping: config.enableSmartGrouping ?? true,
      taskTimeout: config.taskTimeout ?? 30000,
      enableRetry: config.enableRetry ?? true,
      maxRetries: config.maxRetries ?? 3,
      memoryPressureThreshold: config.memoryPressureThreshold ?? 500,
      progressInterval: config.progressInterval ?? 100,
    }
  }

  /**
   * 批量加密
   */
  async batchEncrypt(
    operations: BatchOperation[],
    options?: {
      onProgress?: (progress: BatchProgress) => void
      abortSignal?: AbortSignal
    }
  ): Promise<Array<{ id: string; result: EncryptResult }>> {
    return this.processBatch(operations, 'encrypt', options)
  }

  /**
   * 批量解密
   */
  async batchDecrypt(
    operations: BatchOperation[],
    options?: {
      onProgress?: (progress: BatchProgress) => void
      abortSignal?: AbortSignal
    }
  ): Promise<Array<{ id: string; result: DecryptResult }>> {
    return this.processBatch(operations, 'decrypt', options)
  }

  /**
   * 处理批量操作
   */
  private async processBatch(
    operations: BatchOperation[],
    type: 'encrypt' | 'decrypt',
    options?: {
      onProgress?: (progress: BatchProgress) => void
      abortSignal?: AbortSignal
    }
  ): Promise<Array<{ id: string; result: EncryptResult | DecryptResult }>> {
    // 初始化统计
    this.operationStartTime = performance.now()
    this.completedOperations = 0
    this.failedOperations = 0

    // 性能监控
    const operationId = `batch_${type}_${Date.now()}`
    performanceMonitor.startOperation(operationId)

    // 进度回调
    let progressTimer: NodeJS.Timeout | undefined
    if (options?.onProgress) {
      progressTimer = setInterval(() => {
        const progress = this.calculateProgress(operations.length)
        options.onProgress!(progress)
      }, this.config.progressInterval)
    }

    try {
      // 智能任务分组
      const taskGroups = this.config.enableSmartGrouping
        ? this.groupTasksByStrategy(operations)
        : [{ strategy: ExecutionStrategy.HYBRID, tasks: operations.map((op, index) => ({ index, operation: op })) }]

      // 并行执行各组任务
      const groupResults = await Promise.all(
        taskGroups.map(group => this.processTaskGroup(group, type, options?.abortSignal))
      )

      // 合并结果
      const results = new Array(operations.length)
      for (const groupResult of groupResults) {
        for (const { index, result } of groupResult) {
          results[index] = { id: operations[index].id, result }
        }
      }

      performanceMonitor.endOperation(
        operationId,
        `batch_${type}`,
        true,
        operations.reduce((sum, op) => sum + new TextEncoder().encode(op.data).length, 0)
      )

      return results
    } finally {
      if (progressTimer) {
        clearInterval(progressTimer)
      }
    }
  }

  /**
   * 智能任务分组
   */
  private groupTasksByStrategy(operations: BatchOperation[]): TaskGroup[] {
    const groups: TaskGroup[] = []

    // 根据数据大小和算法特性分组
    const smallTasks: typeof operations[0][] = []
    const mediumTasks: typeof operations[0][] = []
    const largeTasks: typeof operations[0][] = []
    const heavyTasks: typeof operations[0][] = []

    operations.forEach((op, index) => {
      const dataSize = new TextEncoder().encode(op.data).length
      const isHeavyAlgorithm = ['RSA', 'PBKDF2'].includes(op.algorithm.toUpperCase())

      if (isHeavyAlgorithm) {
        heavyTasks.push({ index, operation: op })
      } else if (dataSize < 1024) { // < 1KB
        smallTasks.push({ index, operation: op })
      } else if (dataSize < 1024 * 10) { // < 10KB
        mediumTasks.push({ index, operation: op })
      } else {
        largeTasks.push({ index, operation: op })
      }
    })

    // 小任务使用主线程（避免通信开销）
    if (smallTasks.length > 0) {
      groups.push({
        strategy: ExecutionStrategy.MAIN_THREAD,
        tasks: smallTasks,
      })
    }

    // 中等任务使用 WebAssembly
    if (mediumTasks.length > 0 && this.config.enableWasm) {
      groups.push({
        strategy: ExecutionStrategy.WASM,
        tasks: mediumTasks,
      })
    }

    // 大任务和计算密集型任务使用 Worker
    if ((largeTasks.length > 0 || heavyTasks.length > 0) && this.config.enableWorker) {
      groups.push({
        strategy: ExecutionStrategy.WORKER_THREAD,
        tasks: [...largeTasks, ...heavyTasks],
      })
    }

    // 如果某些策略不可用，使用混合策略
    const ungrouped = [
      ...(this.config.enableWasm ? [] : mediumTasks),
      ...(this.config.enableWorker ? [] : [...largeTasks, ...heavyTasks]),
    ]

    if (ungrouped.length > 0) {
      groups.push({
        strategy: ExecutionStrategy.HYBRID,
        tasks: ungrouped,
      })
    }

    return groups
  }

  /**
   * 处理任务组
   */
  private async processTaskGroup(
    group: TaskGroup,
    type: 'encrypt' | 'decrypt',
    abortSignal?: AbortSignal
  ): Promise<Array<{ index: number; result: EncryptResult | DecryptResult }>> {
    const { strategy, tasks } = group

    // 根据策略选择执行方法
    switch (strategy) {
      case ExecutionStrategy.MAIN_THREAD:
        return this.processMainThread(tasks, type, abortSignal)

      case ExecutionStrategy.WORKER_THREAD:
        return this.processWorker(tasks, type, abortSignal)

      case ExecutionStrategy.WASM:
        return this.processWasm(tasks, type, abortSignal)

      case ExecutionStrategy.HYBRID:
      default:
        return this.processHybrid(tasks, type, abortSignal)
    }
  }

  /**
   * 主线程处理
   */
  private async processMainThread(
    tasks: Array<{ index: number; operation: BatchOperation }>,
    type: 'encrypt' | 'decrypt',
    abortSignal?: AbortSignal
  ): Promise<Array<{ index: number; result: EncryptResult | DecryptResult }>> {
    const results = await this.runWithConcurrencyControl(
      tasks.map(({ index, operation }) => async () => {
        if (abortSignal?.aborted) {
          throw new Error('Operation aborted')
        }

        const result = await this.executeOperation(operation, type, ExecutionStrategy.MAIN_THREAD)
        this.completedOperations++

        if (!result.success) {
          this.failedOperations++
        }

        return { index, result }
      }),
      Math.min(this.config.maxConcurrency, tasks.length)
    )

    return results
  }

  /**
   * Worker 处理
   */
  private async processWorker(
    tasks: Array<{ index: number; operation: BatchOperation }>,
    type: 'encrypt' | 'decrypt',
    abortSignal?: AbortSignal
  ): Promise<Array<{ index: number; result: EncryptResult | DecryptResult }>> {
    if (!this.config.enableWorker) {
      return this.processMainThread(tasks, type, abortSignal)
    }

    const operations = tasks.map(t => t.operation)

    try {
      if (type === 'encrypt') {
        const results = await workerCryptoManager.batchEncrypt(operations)
        return tasks.map(({ index }, i) => ({ index, result: results[i] }))
      } else {
        const results = await workerCryptoManager.batchDecrypt(operations)
        return tasks.map(({ index }, i) => ({ index, result: results[i] }))
      }
    } catch (error) {
      console.warn('Worker processing failed, falling back to main thread:', error)
      return this.processMainThread(tasks, type, abortSignal)
    }
  }

  /**
   * WebAssembly 处理
   */
  private async processWasm(
    tasks: Array<{ index: number; operation: BatchOperation }>,
    type: 'encrypt' | 'decrypt',
    abortSignal?: AbortSignal
  ): Promise<Array<{ index: number; result: EncryptResult | DecryptResult }>> {
    if (!this.config.enableWasm || !cryptoWasm.initialized) {
      return this.processMainThread(tasks, type, abortSignal)
    }

    // 初始化 WebAssembly
    await cryptoWasm.initialize()

    const results = await this.runWithConcurrencyControl(
      tasks.map(({ index, operation }) => async () => {
        if (abortSignal?.aborted) {
          throw new Error('Operation aborted')
        }

        let result: EncryptResult | DecryptResult

        if (type === 'encrypt') {
          result = await cryptoWasm.aesEncrypt(
            operation.data,
            operation.key,
            operation.options as any
          )
        } else {
          result = await cryptoWasm.aesDecrypt(
            operation.data,
            operation.key,
            operation.options as any
          )
        }

        this.completedOperations++

        if (!result.success) {
          this.failedOperations++
        }

        return { index, result }
      }),
      Math.min(this.config.maxConcurrency, tasks.length)
    )

    return results
  }

  /**
   * 混合策略处理
   */
  private async processHybrid(
    tasks: Array<{ index: number; operation: BatchOperation }>,
    type: 'encrypt' | 'decrypt',
    abortSignal?: AbortSignal
  ): Promise<Array<{ index: number; result: EncryptResult | DecryptResult }>> {
    // 使用 WorkerCryptoManager 的智能决策
    const results = await this.runWithConcurrencyControl(
      tasks.map(({ index, operation }) => async () => {
        if (abortSignal?.aborted) {
          throw new Error('Operation aborted')
        }

        let result: EncryptResult | DecryptResult

        if (type === 'encrypt') {
          result = await workerCryptoManager.encrypt(
            operation.data,
            operation.key,
            operation.algorithm,
            operation.options
          )
        } else {
          result = await workerCryptoManager.decrypt(
            operation.data,
            operation.key,
            operation.algorithm,
            operation.options
          )
        }

        this.completedOperations++

        if (!result.success) {
          this.failedOperations++
        }

        return { index, result }
      }),
      Math.min(this.config.maxConcurrency, tasks.length)
    )

    return results
  }

  /**
   * 执行单个操作
   */
  private async executeOperation(
    operation: BatchOperation,
    type: 'encrypt' | 'decrypt',
    strategy: ExecutionStrategy
  ): Promise<EncryptResult | DecryptResult> {
    // 使用内存池
    const wordArray = memoryPoolManager.acquireWordArray()

    try {
      // 根据算法执行操作
      const { aes, des, des3, rsa, blowfish } = await import('../algorithms')

      let result: EncryptResult | DecryptResult

      if (type === 'encrypt') {
        switch (operation.algorithm.toUpperCase()) {
          case 'AES':
            result = aes.encrypt(operation.data, operation.key, operation.options)
            break
          case 'DES':
            result = des.encrypt(operation.data, operation.key, operation.options)
            break
          case '3DES':
            result = des3.encrypt(operation.data, operation.key, operation.options)
            break
          case 'RSA':
            result = rsa.encrypt(operation.data, operation.key, operation.options)
            break
          case 'BLOWFISH':
            result = blowfish.encrypt(operation.data, operation.key, operation.options)
            break
          default:
            result = {
              success: false,
              data: '',
              algorithm: operation.algorithm,
              error: `Unsupported algorithm: ${operation.algorithm}`,
            }
        }
      } else {
        switch (operation.algorithm.toUpperCase()) {
          case 'AES':
            result = aes.decrypt(operation.data, operation.key, operation.options)
            break
          case 'DES':
            result = des.decrypt(operation.data, operation.key, operation.options)
            break
          case '3DES':
            result = des3.decrypt(operation.data, operation.key, operation.options)
            break
          case 'RSA':
            result = rsa.decrypt(operation.data, operation.key, operation.options)
            break
          case 'BLOWFISH':
            result = blowfish.decrypt(operation.data, operation.key, operation.options)
            break
          default:
            result = {
              success: false,
              data: '',
              algorithm: operation.algorithm,
              error: `Unsupported algorithm: ${operation.algorithm}`,
            }
        }
      }

      return result
    } finally {
      memoryPoolManager.releaseWordArray(wordArray)
    }
  }

  /**
   * 并发控制执行
   */
  private async runWithConcurrencyControl<T>(
    tasks: (() => Promise<T>)[],
    maxConcurrency: number
  ): Promise<T[]> {
    const results: T[] = new Array(tasks.length)
    const executing: Set<Promise<void>> = new Set()

    // 内存压力检查
    const checkMemoryPressure = () => {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage()
        this.currentMemoryUsage = usage.heapUsed / 1024 / 1024 // MB

        if (this.currentMemoryUsage > this.config.memoryPressureThreshold) {
          // 减少并发数
          return Math.max(1, Math.floor(maxConcurrency / 2))
        }
      }
      return maxConcurrency
    }

    let dynamicConcurrency = checkMemoryPressure()

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]

      const promise = task().then(result => {
        results[i] = result
      })

      const cleanup = promise.finally(() => {
        executing.delete(cleanup)
        // 定期检查内存压力
        if (i % 10 === 0) {
          dynamicConcurrency = checkMemoryPressure()
        }
      })

      executing.add(cleanup)

      if (executing.size >= dynamicConcurrency) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
    return results
  }

  /**
   * 计算进度
   */
  private calculateProgress(total: number): BatchProgress {
    const completed = this.completedOperations
    const failed = this.failedOperations
    const percentage = Math.round((completed / total) * 100)

    const elapsed = performance.now() - this.operationStartTime
    const throughput = completed / (elapsed / 1000) // 任务/秒

    const remaining = total - completed
    const estimatedTimeRemaining = remaining > 0 && throughput > 0
      ? (remaining / throughput) * 1000
      : 0

    return {
      total,
      completed,
      failed,
      percentage,
      estimatedTimeRemaining,
      throughput,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<BatchProcessorConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<BatchProcessorConfig> {
    return { ...this.config }
  }
}

// 导出全局实例
export const batchProcessor = new BatchProcessor()

/**
 * 便捷函数：批量加密
 */
export async function batchEncrypt(
  operations: BatchOperation[],
  options?: {
    onProgress?: (progress: BatchProgress) => void
    abortSignal?: AbortSignal
  }
): Promise<Array<{ id: string; result: EncryptResult }>> {
  return batchProcessor.batchEncrypt(operations, options)
}

/**
 * 便捷函数：批量解密
 */
export async function batchDecrypt(
  operations: BatchOperation[],
  options?: {
    onProgress?: (progress: BatchProgress) => void
    abortSignal?: AbortSignal
  }
): Promise<Array<{ id: string; result: DecryptResult }>> {
  return batchProcessor.batchDecrypt(operations, options)
}

