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

var CryptoJS = require('crypto-js');
var lruCache = require('../utils/lru-cache.cjs');

class PerformanceOptimizer {
  constructor(config = {}) {
    this.operationTimes = [];
    const {
      maxCacheSize = 1e3,
      cacheTTL = 5 * 60 * 1e3,
      // 默认 5 分钟过期
      enableCache = true,
      maxOperationTimes = 1e3,
      autoCleanupInterval = 60 * 1e3,
      // 默认 1 分钟清理一次
      memoryThreshold = 50 * 1024 * 1024,
      // 默认 50MB
      enableWorker = false,
      // workerPoolSize, // 未使用，Worker池在Web平台中暂不支持
      maxConcurrency = 10
      // 默认最大 10 个并发
    } = config;
    this.enableCache = enableCache;
    this.maxOperationTimes = maxOperationTimes;
    this.autoCleanupInterval = autoCleanupInterval;
    this.memoryThreshold = memoryThreshold;
    this.enableWorker = enableWorker;
    this.workerPool = null;
    this.maxConcurrency = maxConcurrency;
    this.resultCache = new lruCache.LRUCache({
      maxSize: maxCacheSize,
      ttl: cacheTTL,
      updateAgeOnGet: true
    });
    if (this.enableWorker) {
      console.warn("Worker pool is not available in browser environment");
      this.enableWorker = false;
    }
    if (this.autoCleanupInterval > 0) {
      this.startAutoCleanup();
    }
  }
  /**
   * 批量加密
   * 优化：支持 Worker 并行处理或主线程并行处理
   */
  async batchEncrypt(operations) {
    if (this.enableWorker && this.workerPool) {
      try {
        const workerOps = operations.map((op) => ({
          data: op.data,
          key: op.key,
          algorithm: op.algorithm,
          options: op.options
        }));
        const results = await this.workerPool.batchEncrypt(workerOps);
        return operations.map((op, index) => ({
          id: op.id,
          result: results[index]
        }));
      } catch (error) {
        console.warn("Worker batch encrypt failed, falling back to main thread:", error);
      }
    }
    const tasks = operations.map((operation) => async () => {
      const cacheKey = this.generateCacheKey("encrypt", operation);
      let result = this.getFromCache(cacheKey);
      if (!result) {
        result = await this.performEncryption(operation);
        this.setCache(cacheKey, result);
      }
      return {
        id: operation.id,
        result
      };
    });
    return this.runWithConcurrencyControl(tasks);
  }
  /**
   * 批量解密
   * 优化：支持 Worker 并行处理或主线程并行处理
   */
  async batchDecrypt(operations) {
    if (this.enableWorker && this.workerPool) {
      try {
        const workerOps = operations.map((op) => ({
          data: op.data,
          key: op.key,
          algorithm: op.algorithm,
          options: op.options
        }));
        const results = await this.workerPool.batchDecrypt(workerOps);
        return operations.map((op, index) => ({
          id: op.id,
          result: results[index]
        }));
      } catch (error) {
        console.warn("Worker batch decrypt failed, falling back to main thread:", error);
      }
    }
    const tasks = operations.map((operation) => async () => {
      const cacheKey = this.generateCacheKey("decrypt", operation);
      let result = this.getFromCache(cacheKey);
      if (!result) {
        result = await this.performDecryption(operation);
        this.setCache(cacheKey, result);
      }
      return {
        id: operation.id,
        result
      };
    });
    return this.runWithConcurrencyControl(tasks);
  }
  /**
   * 并发控制执行任务
   * 优化：限制同时执行的任务数量，避免资源耗尽
   * 优化：使用 Array.from 预分配结果数组，减少动态扩容
   * @param tasks 任务数组
   * @returns Promise 结果数组
   */
  async runWithConcurrencyControl(tasks) {
    const results = Array.from({ length: tasks.length });
    const executing = /* @__PURE__ */ new Set();
    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index];
      const promise = Promise.resolve().then(async () => {
        results[index] = await task();
      });
      const cleanup = promise.finally(() => {
        executing.delete(cleanup);
      });
      executing.add(cleanup);
      if (executing.size >= this.maxConcurrency) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);
    return results;
  }
  /**
   * 执行加密操作
   * 优化：使用真实的加密实现
   */
  async performEncryption(operation) {
    const startTime = performance.now();
    try {
      let result;
      switch (operation.algorithm.toUpperCase()) {
        case "AES": {
          const { aes } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = aes.encrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "RSA": {
          const { rsa } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = rsa.encrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "DES": {
          const { des } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = des.encrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "3DES": {
          const { des3 } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = des3.encrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "BLOWFISH": {
          const { blowfish } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = blowfish.encrypt(operation.data, operation.key, operation.options);
          break;
        }
        default:
          result = {
            success: false,
            data: "",
            algorithm: operation.algorithm,
            error: `Unsupported algorithm: ${operation.algorithm}`
          };
      }
      const endTime = performance.now();
      this.recordOperationTime(endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordOperationTime(endTime - startTime);
      return {
        success: false,
        data: "",
        algorithm: operation.algorithm,
        error: error instanceof Error ? error.message : "Unknown encryption error"
      };
    }
  }
  /**
   * 执行解密操作
   * 优化：使用真实的解密实现
   */
  async performDecryption(operation) {
    const startTime = performance.now();
    try {
      let result;
      switch (operation.algorithm.toUpperCase()) {
        case "AES": {
          const { aes } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = aes.decrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "RSA": {
          const { rsa } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = rsa.decrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "DES": {
          const { des } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = des.decrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "3DES": {
          const { des3 } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = des3.decrypt(operation.data, operation.key, operation.options);
          break;
        }
        case "BLOWFISH": {
          const { blowfish } = await Promise.resolve().then(function () { return require('../algorithms/index.cjs'); });
          result = blowfish.decrypt(operation.data, operation.key, operation.options);
          break;
        }
        default:
          result = {
            success: false,
            data: "",
            algorithm: operation.algorithm,
            error: `Unsupported algorithm: ${operation.algorithm}`
          };
      }
      const endTime = performance.now();
      this.recordOperationTime(endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordOperationTime(endTime - startTime);
      return {
        success: false,
        data: "",
        algorithm: operation.algorithm,
        error: error instanceof Error ? error.message : "Unknown decryption error"
      };
    }
  }
  /**
   * 记录操作时间
   */
  recordOperationTime(time) {
    this.operationTimes.push(time);
    if (this.operationTimes.length > this.maxOperationTimes) {
      this.operationTimes.shift();
    }
  }
  /**
   * 生成缓存键
   * 优化：使用哈希算法生成固定长度的键，避免冲突和内存浪费
   */
  generateCacheKey(operation, data) {
    const rawKey = `${operation}:${data.algorithm}:${data.key}:${data.data}:${JSON.stringify(data.options || {})}`;
    const hash = CryptoJS.MD5(rawKey).toString();
    return hash;
  }
  /**
   * 从缓存获取结果
   */
  getFromCache(key) {
    if (!this.enableCache) {
      return void 0;
    }
    return this.resultCache.get(key);
  }
  /**
   * 设置缓存
   */
  setCache(key, value) {
    if (!this.enableCache) {
      return;
    }
    this.resultCache.set(key, value);
  }
  /**
   * 清除缓存
   */
  clearCache() {
    this.resultCache.clear();
  }
  /**
   * 清理过期缓存
   */
  cleanupCache() {
    return this.resultCache.cleanup();
  }
  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.resultCache.getStats();
  }
  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    const avgLatency = this.operationTimes.length > 0 ? this.operationTimes.reduce((sum, time) => sum + time, 0) / this.operationTimes.length : 0;
    const opsPerSecond = avgLatency > 0 ? 1e3 / avgLatency : 0;
    const stats = this.resultCache.getStats();
    return {
      operationsPerSecond: opsPerSecond,
      averageLatency: avgLatency,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: stats.hitRate,
      cacheSize: stats.size
    };
  }
  /**
   * 获取内存使用情况
   * 优化：更准确的内存估算
   */
  getMemoryUsage() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return this.resultCache.size * 1024;
  }
  /**
   * 重置性能统计
   */
  resetStats() {
    this.resultCache.resetStats();
    this.operationTimes = [];
  }
  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.autoCleanupInterval);
  }
  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
  }
  /**
   * 执行清理
   */
  performCleanup() {
    this.resultCache.cleanup();
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > this.memoryThreshold) {
      const stats = this.resultCache.getStats();
      const targetSize = Math.floor(stats.size / 2);
      const keys = this.resultCache.keys();
      for (let i = 0; i < keys.length - targetSize; i++) {
        this.resultCache.delete(keys[i]);
      }
    }
  }
  /**
   * 销毁优化器
   */
  async destroy() {
    this.stopAutoCleanup();
    this.clearCache();
    this.operationTimes = [];
    if (this.workerPool) {
      try {
        await this.workerPool.terminate();
        this.workerPool = null;
      } catch (error) {
        console.warn("Failed to terminate worker pool:", error);
      }
    }
  }
  /**
   * 获取 Worker 池统计信息
   */
  getWorkerStats() {
    if (this.workerPool) {
      return this.workerPool.getStats();
    }
    return null;
  }
}

exports.PerformanceOptimizer = PerformanceOptimizer;
//# sourceMappingURL=performance.cjs.map
