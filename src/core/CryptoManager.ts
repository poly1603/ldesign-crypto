/**
 * @ldesign/crypto - 加密管理器核心类
 * 统一管理所有加密算法和操作
 */

import type {
  CacheConfig,
  CryptoAlgorithm,
  CryptoManagerConfig,
  CryptoPlugin,
  CryptoResult,
  PerformanceConfig,
} from '../types'
import { CryptoError, CryptoErrorType } from '../types'

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private config: PerformanceConfig
  private metrics: Map<string, number[]> = new Map()

  constructor(config: PerformanceConfig) {
    this.config = config
  }

  startTimer(): () => number {
    const start = performance.now()
    return () => performance.now() - start
  }

  recordMetric(operation: string, duration: number): void {
    if (!this.config.enabled)
return

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const metrics = this.metrics.get(operation)!
    metrics.push(duration)

    // 保持最近100次记录
    if (metrics.length > 100) {
      metrics.shift()
    }

    if (this.config.threshold && duration > this.config.threshold) {
      console.warn(`[CryptoManager] 操作 ${operation} 耗时 ${duration}ms 超过阈值`)
    }
  }

  getMetrics(operation?: string): Record<string, any> {
    if (operation) {
      const metrics = this.metrics.get(operation) || []
      return {
        operation,
        count: metrics.length,
        average: metrics.length > 0 ? metrics.reduce((a, b) => a + b, 0) / metrics.length : 0,
        min: metrics.length > 0 ? Math.min(...metrics) : 0,
        max: metrics.length > 0 ? Math.max(...metrics) : 0,
      }
    }

    const result: Record<string, any> = {}
    for (const [op, metrics] of this.metrics) {
      result[op] = {
        count: metrics.length,
        average: metrics.length > 0 ? metrics.reduce((a, b) => a + b, 0) / metrics.length : 0,
        min: metrics.length > 0 ? Math.min(...metrics) : 0,
        max: metrics.length > 0 ? Math.max(...metrics) : 0,
      }
    }
    return result
  }
}

/**
 * 缓存管理器
 */
class CacheManager {
  private config: CacheConfig
  private cache: Map<string, { data: any, timestamp: number }> = new Map()

  constructor(config: CacheConfig) {
    this.config = config
  }

  private generateKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`
  }

  get(operation: string, params: any): any | null {
    if (!this.config.enabled)
return null

    const key = this.generateKey(operation, params)
    const cached = this.cache.get(key)

    if (!cached)
return null

    // 检查是否过期
    if (this.config.ttl && Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(operation: string, params: any, data: any): void {
    if (!this.config.enabled)
return

    const key = this.generateKey(operation, params)

    // 检查缓存大小限制
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      // 删除最旧的缓存项
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * 加密管理器主类
 */
export class CryptoManager {
  private config: CryptoManagerConfig
  private plugins: Map<string, CryptoPlugin> = new Map()
  private algorithms: Map<CryptoAlgorithm, CryptoPlugin> = new Map()
  private performanceMonitor: PerformanceMonitor
  private cacheManager: CacheManager
  private initialized = false

  constructor(config: CryptoManagerConfig = {}) {
    this.config = {
      defaultEncoding: 'hex',
      performance: { enabled: false },
      cache: { enabled: false },
      debug: false,
      ...config,
    }

    this.performanceMonitor = new PerformanceMonitor(this.config.performance!)
    this.cacheManager = new CacheManager(this.config.cache!)
  }

  /**
   * 初始化管理器
   */
  async init(): Promise<void> {
    if (this.initialized)
return

    try {
      // 初始化插件
      if (this.config.plugins) {
        for (const plugin of this.config.plugins) {
          await this.registerPlugin(plugin)
        }
      }

      this.initialized = true
      this.debug('CryptoManager initialized successfully')
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.UNSUPPORTED_OPERATION,
        `Failed to initialize CryptoManager: ${error}`,
        undefined,
        error,
      )
    }
  }

  /**
   * 注册插件
   */
  async registerPlugin(plugin: CryptoPlugin): Promise<void> {
    try {
      // 初始化插件
      if (plugin.init) {
        await plugin.init()
      }

      // 注册插件
      this.plugins.set(plugin.name, plugin)

      // 注册算法映射
      for (const algorithm of plugin.algorithms) {
        this.algorithms.set(algorithm, plugin)
      }

      this.debug(`Plugin ${plugin.name} registered successfully`)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.UNSUPPORTED_OPERATION,
        `Failed to register plugin ${plugin.name}: ${error}`,
        undefined,
        error,
      )
    }
  }

  /**
   * 卸载插件
   */
  async unregisterPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin)
return

    try {
      // 移除算法映射
      for (const algorithm of plugin.algorithms) {
        this.algorithms.delete(algorithm)
      }

      // 销毁插件
      if (plugin.destroy) {
        await plugin.destroy()
      }

      // 移除插件
      this.plugins.delete(pluginName)

      this.debug(`Plugin ${pluginName} unregistered successfully`)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.UNSUPPORTED_OPERATION,
        `Failed to unregister plugin ${pluginName}: ${error}`,
        undefined,
        error,
      )
    }
  }

  /**
   * 检查算法是否支持
   */
  isAlgorithmSupported(algorithm: CryptoAlgorithm): boolean {
    return this.algorithms.has(algorithm)
  }

  /**
   * 获取支持的算法列表
   */
  getSupportedAlgorithms(): CryptoAlgorithm[] {
    return Array.from(this.algorithms.keys())
  }

  /**
   * 获取插件信息
   */
  getPluginInfo(): Array<{ name: string, algorithms: CryptoAlgorithm[] }> {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      algorithms: plugin.algorithms,
    }))
  }

  /**
   * 执行加密操作（带性能监控和缓存）
   */
  protected async executeOperation<T>(
    operation: string,
    algorithm: CryptoAlgorithm,
    executor: () => Promise<T> | T,
    params?: any,
  ): Promise<CryptoResult> {
    const timer = this.performanceMonitor.startTimer()

    try {
      // 检查缓存
      if (params) {
        const cached = this.cacheManager.get(operation, params)
        if (cached) {
          this.debug(`Cache hit for ${operation}`)
          return {
            success: true,
            data: cached,
            algorithm,
            duration: timer(),
          }
        }
      }

      // 执行操作
      const result = await executor()
      const duration = timer()

      // 记录性能
      this.performanceMonitor.recordMetric(operation, duration)

      // 缓存结果
      if (params && typeof result === 'string') {
        this.cacheManager.set(operation, params, result)
      }

      return {
        success: true,
        data: result as string,
        algorithm,
        duration,
      }
    }
 catch (error) {
      const duration = timer()
      this.performanceMonitor.recordMetric(`${operation}_error`, duration)

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        algorithm,
        duration,
      }
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(operation?: string): Record<string, any> {
    return this.performanceMonitor.getMetrics(operation)
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cacheManager.clear()
  }

  /**
   * 获取缓存信息
   */
  getCacheInfo(): { size: number, enabled: boolean } {
    return {
      size: this.cacheManager.size(),
      enabled: this.config.cache!.enabled,
    }
  }

  /**
   * 调试日志
   */
  private debug(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[CryptoManager] ${message}`, ...args)
    }
  }

  /**
   * 获取算法插件
   */
  protected getAlgorithmPlugin(algorithm: CryptoAlgorithm): CryptoPlugin {
    const plugin = this.algorithms.get(algorithm)
    if (!plugin) {
      throw new CryptoError(
        CryptoErrorType.UNSUPPORTED_OPERATION,
        `Algorithm ${algorithm} is not supported`,
        algorithm,
      )
    }
    return plugin
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    // 卸载所有插件
    for (const pluginName of this.plugins.keys()) {
      await this.unregisterPlugin(pluginName)
    }

    // 清空缓存
    this.clearCache()

    this.initialized = false
    this.debug('CryptoManager destroyed')
  }
}
