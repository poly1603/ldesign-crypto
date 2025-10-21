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

class PerformanceLogger {
  constructor(options = {}) {
    this.metrics = [];
    this.maxMetrics = options.maxMetrics || 1e3;
    this.enabled = options.enabled ?? true;
    this.startTime = Date.now();
  }
  /**
   * 记录性能指标
   */
  log(metric) {
    if (!this.enabled)
      return;
    const fullMetric = {
      ...metric,
      timestamp: Date.now()
    };
    this.metrics.push(fullMetric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }
  /**
   * 测量操作性能
   */
  async measure(operation, algorithm, dataSize, fn) {
    const start = performance.now();
    let success = true;
    let error;
    try {
      const result = await fn();
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const duration = performance.now() - start;
      this.log({
        operation,
        algorithm,
        dataSize,
        duration,
        success,
        error
      });
    }
  }
  /**
   * 获取性能统计
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        operationsPerSecond: 0,
        byAlgorithm: /* @__PURE__ */ new Map()
      };
    }
    const successful = this.metrics.filter((m) => m.success);
    const failed = this.metrics.filter((m) => !m.success);
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const durations = this.metrics.map((m) => m.duration);
    const byAlgorithm = /* @__PURE__ */ new Map();
    for (const metric of this.metrics) {
      const current = byAlgorithm.get(metric.algorithm) || {
        count: 0,
        totalDuration: 0,
        averageDuration: 0
      };
      current.count++;
      current.totalDuration += metric.duration;
      current.averageDuration = current.totalDuration / current.count;
      byAlgorithm.set(metric.algorithm, current);
    }
    const runningTime = (Date.now() - this.startTime) / 1e3;
    const operationsPerSecond = runningTime > 0 ? this.metrics.length / runningTime : 0;
    return {
      totalOperations: this.metrics.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      totalDuration,
      averageDuration: totalDuration / this.metrics.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      operationsPerSecond,
      byAlgorithm
    };
  }
  /**
   * 获取最近的指标
   */
  getRecentMetrics(count = 10) {
    return this.metrics.slice(-count);
  }
  /**
   * 获取特定算法的指标
   */
  getMetricsByAlgorithm(algorithm) {
    return this.metrics.filter((m) => m.algorithm === algorithm);
  }
  /**
   * 获取失败的操作
   */
  getFailedOperations() {
    return this.metrics.filter((m) => !m.success);
  }
  /**
   * 清除所有指标
   */
  clear() {
    this.metrics = [];
  }
  /**
   * 启用/禁用日志记录
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  /**
   * 是否启用
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * 导出指标为 JSON
   */
  exportMetrics() {
    return JSON.stringify({
      stats: this.getStats(),
      metrics: this.metrics
    }, (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }, 2);
  }
  /**
   * 生成性能报告
   */
  generateReport() {
    const stats = this.getStats();
    const lines = [];
    lines.push("=== \u52A0\u5BC6\u6027\u80FD\u62A5\u544A ===");
    lines.push(`\u603B\u64CD\u4F5C\u6570: ${stats.totalOperations}`);
    lines.push(`\u6210\u529F: ${stats.successfulOperations} | \u5931\u8D25: ${stats.failedOperations}`);
    lines.push(`\u6210\u529F\u7387: ${(stats.successfulOperations / stats.totalOperations * 100).toFixed(2)}%`);
    lines.push(`\u603B\u8017\u65F6: ${stats.totalDuration.toFixed(2)}ms`);
    lines.push(`\u5E73\u5747\u8017\u65F6: ${stats.averageDuration.toFixed(2)}ms`);
    lines.push(`\u6700\u5C0F\u8017\u65F6: ${stats.minDuration.toFixed(2)}ms`);
    lines.push(`\u6700\u5927\u8017\u65F6: ${stats.maxDuration.toFixed(2)}ms`);
    lines.push(`\u64CD\u4F5C\u901F\u7387: ${stats.operationsPerSecond.toFixed(2)} ops/s`);
    if (stats.byAlgorithm.size > 0) {
      lines.push("\n=== \u6309\u7B97\u6CD5\u7EDF\u8BA1 ===");
      for (const [algo, stat] of stats.byAlgorithm) {
        lines.push(`${algo}:`);
        lines.push(`  \u64CD\u4F5C\u6570: ${stat.count}`);
        lines.push(`  \u5E73\u5747\u8017\u65F6: ${stat.averageDuration.toFixed(2)}ms`);
        lines.push(`  \u5360\u6BD4: ${(stat.count / stats.totalOperations * 100).toFixed(2)}%`);
      }
    }
    const failed = this.getFailedOperations();
    if (failed.length > 0) {
      lines.push("\n=== \u5931\u8D25\u64CD\u4F5C ===");
      for (const metric of failed.slice(-5)) {
        lines.push(`${metric.operation} (${metric.algorithm}): ${metric.error}`);
      }
    }
    return lines.join("\n");
  }
}
const globalPerformanceLogger = new PerformanceLogger({
  maxMetrics: 5e3,
  enabled: false
  // 默认禁用，避免影响生产环境性能
});
function measurePerformance(operation, algorithm) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args) {
      const dataSize = typeof args[0] === "string" ? args[0].length : 0;
      return globalPerformanceLogger.measure(operation, algorithm, dataSize, () => originalMethod.apply(this, args));
    };
    return descriptor;
  };
}

exports.PerformanceLogger = PerformanceLogger;
exports.globalPerformanceLogger = globalPerformanceLogger;
exports.measurePerformance = measurePerformance;
//# sourceMappingURL=performance-logger.cjs.map
