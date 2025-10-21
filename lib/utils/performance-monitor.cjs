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

var process = require('node:process');

class PerformanceMonitor {
  constructor(config = {}) {
    this.metrics = [];
    this.startTimes = /* @__PURE__ */ new Map();
    this.realTimeCallbacks = /* @__PURE__ */ new Set();
    this.config = {
      enabled: true,
      maxMetrics: 1e4,
      samplingRate: 1,
      trackMemory: false,
      autoCleanup: true,
      cleanupThreshold: 36e5,
      // 1 hour
      realTimeMonitoring: false,
      ...config
    };
    if (this.config?.autoCleanup) {
      this.startAutoCleanup();
    }
  }
  /**
   * 开始监控操作
   */
  startOperation(operationId, _algorithm) {
    if (!this.config?.enabled || Math.random() > this.config?.samplingRate) {
      return;
    }
    this.startTimes.set(operationId, performance.now());
  }
  /**
   * 结束监控操作
   */
  endOperation(operationId, operation, success = true, dataSize, error, algorithm) {
    if (!this.config?.enabled || !this.startTimes.has(operationId)) {
      return;
    }
    const startTime = this.startTimes.get(operationId);
    if (!startTime) {
      return;
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    const metric = {
      operation,
      algorithm,
      startTime,
      endTime,
      duration,
      dataSize,
      throughput: dataSize ? dataSize / duration * 1e3 : void 0,
      memoryUsage: this.config?.trackMemory ? this.getMemoryUsage() : void 0,
      success,
      error
    };
    this.addMetric(metric);
    this.startTimes.delete(operationId);
    if (this.config?.realTimeMonitoring) {
      this.notifyRealTimeListeners(metric);
    }
  }
  /**
   * 记录指标
   */
  addMetric(metric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.config?.maxMetrics) {
      this.metrics.shift();
    }
  }
  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    } else if (typeof performance !== "undefined") {
      const perf = performance;
      return perf.memory?.usedJSHeapSize;
    }
    return void 0;
  }
  /**
   * 生成性能报告
   */
  generateReport(since) {
    const filteredMetrics = since ? this.metrics.filter((m) => m.startTime >= since) : this.metrics;
    const successfulMetrics = filteredMetrics.filter((m) => m.success);
    const failedMetrics = filteredMetrics.filter((m) => !m.success);
    const durations = filteredMetrics.map((m) => m.duration);
    const totalDataProcessed = filteredMetrics.reduce((sum, m) => sum + (m.dataSize || 0), 0);
    const byAlgorithm = this.groupByAlgorithm(filteredMetrics);
    const byOperation = this.groupByOperation(filteredMetrics);
    const timeSeriesData = this.generateTimeSeriesData(filteredMetrics);
    return {
      totalOperations: filteredMetrics.length,
      successfulOperations: successfulMetrics.length,
      failedOperations: failedMetrics.length,
      averageDuration: this.average(durations),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDataProcessed,
      averageThroughput: this.calculateAverageThroughput(filteredMetrics),
      byAlgorithm,
      byOperation,
      timeSeriesData
    };
  }
  /**
   * 按算法分组统计
   */
  groupByAlgorithm(metrics) {
    const grouped = /* @__PURE__ */ new Map();
    for (const metric of metrics) {
      const algorithm = metric.algorithm || "unknown";
      if (!grouped.has(algorithm)) {
        grouped.set(algorithm, {
          algorithm,
          count: 0,
          averageDuration: 0,
          totalDataProcessed: 0,
          successRate: 0
        });
      }
      const stats = grouped.get(algorithm);
      if (!stats)
        continue;
      stats.count++;
      stats.totalDataProcessed += metric.dataSize || 0;
      stats.averageDuration = (stats.averageDuration * (stats.count - 1) + metric.duration) / stats.count;
      const successCount = metrics.filter((m) => m.algorithm === algorithm && m.success).length;
      stats.successRate = successCount / stats.count;
    }
    return grouped;
  }
  /**
   * 按操作分组统计
   */
  groupByOperation(metrics) {
    const grouped = /* @__PURE__ */ new Map();
    for (const metric of metrics) {
      const operation = metric.operation;
      if (!grouped.has(operation)) {
        grouped.set(operation, {
          operation,
          count: 0,
          averageDuration: 0,
          successRate: 0
        });
      }
      const stats = grouped.get(operation);
      if (!stats)
        continue;
      stats.count++;
      stats.averageDuration = (stats.averageDuration * (stats.count - 1) + metric.duration) / stats.count;
      const successCount = metrics.filter((m) => m.operation === operation && m.success).length;
      stats.successRate = successCount / stats.count;
    }
    return grouped;
  }
  /**
   * 生成时间序列数据
   */
  generateTimeSeriesData(metrics) {
    if (metrics.length === 0) {
      return [];
    }
    const timeSeriesData = [];
    const interval = 6e4;
    const minTime = Math.min(...metrics.map((m) => m.startTime));
    const maxTime = Math.max(...metrics.map((m) => m.endTime));
    for (let time = minTime; time <= maxTime; time += interval) {
      const windowMetrics = metrics.filter((m) => m.startTime >= time && m.startTime < time + interval);
      if (windowMetrics.length > 0) {
        const operationsPerSecond = windowMetrics.length / interval * 1e3;
        const averageLatency = this.average(windowMetrics.map((m) => m.duration));
        const errorRate = windowMetrics.filter((m) => !m.success).length / windowMetrics.length;
        timeSeriesData.push({
          timestamp: time,
          operationsPerSecond,
          averageLatency,
          errorRate
        });
      }
    }
    return timeSeriesData;
  }
  /**
   * 计算平均值
   */
  average(values) {
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  /**
   * 计算平均吞吐量
   */
  calculateAverageThroughput(metrics) {
    const validMetrics = metrics.filter((m) => m.throughput !== void 0);
    if (validMetrics.length === 0) {
      return 0;
    }
    const throughputs = validMetrics.map((m) => m.throughput).filter((t) => t !== void 0);
    return this.average(throughputs);
  }
  /**
   * 清理旧数据
   */
  cleanup(olderThan) {
    const threshold = olderThan || Date.now() - this.config?.cleanupThreshold;
    this.metrics = this.metrics.filter((m) => m.startTime >= threshold);
  }
  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config?.cleanupThreshold);
  }
  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = void 0;
    }
  }
  /**
   * 注册实时监控回调
   */
  onRealTimeMetric(callback) {
    this.realTimeCallbacks.add(callback);
    return () => {
      this.realTimeCallbacks.delete(callback);
    };
  }
  /**
   * 通知实时监控监听器
   */
  notifyRealTimeListeners(metric) {
    this.realTimeCallbacks.forEach((callback) => {
      try {
        callback(metric);
      } catch (error) {
        console.error("Error in real-time metric callback:", error);
      }
    });
  }
  /**
   * 重置监控器
   */
  reset() {
    this.metrics = [];
    this.startTimes.clear();
  }
  /**
   * 获取当前指标
   */
  getMetrics() {
    return [...this.metrics];
  }
  /**
   * 导出指标数据
   */
  exportMetrics() {
    return JSON.stringify(this.metrics, null, 2);
  }
  /**
   * 导入指标数据
   */
  importMetrics(data) {
    try {
      const imported = JSON.parse(data);
      this.metrics = [...this.metrics, ...imported];
    } catch (error) {
      console.error("Failed to import metrics:", error);
    }
  }
  /**
   * 销毁监控器
   */
  destroy() {
    this.stopAutoCleanup();
    this.reset();
    this.realTimeCallbacks.clear();
  }
}
const performanceMonitor = new PerformanceMonitor();
function measurePerformance(target, propertyName, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function(...args) {
    const operationId = `${propertyName}_${Date.now()}`;
    performanceMonitor.startOperation(operationId);
    try {
      const result = await originalMethod.apply(this, args);
      performanceMonitor.endOperation(operationId, propertyName, true, JSON.stringify(args[0]).length);
      return result;
    } catch (error) {
      performanceMonitor.endOperation(operationId, propertyName, false, void 0, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  };
  return descriptor;
}

exports.PerformanceMonitor = PerformanceMonitor;
exports.measurePerformance = measurePerformance;
exports.performanceMonitor = performanceMonitor;
//# sourceMappingURL=performance-monitor.cjs.map
