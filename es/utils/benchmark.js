/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { aes } from '../algorithms/aes.js';
import 'crypto-js';
import './errors.js';
import './key-derivation.js';
import './object-pool.js';
import './performance-logger.js';
import { encoding } from '../algorithms/encoding.js';
import { hash } from '../algorithms/hash.js';
import 'node-forge';

class Benchmark {
  constructor(options = {}) {
    this.options = {
      iterations: options.iterations ?? 100,
      warmupIterations: options.warmupIterations ?? 10,
      dataSizes: options.dataSizes ?? [100, 1024, 10240, 102400],
      // 100B, 1KB, 10KB, 100KB
      algorithms: options.algorithms ?? ["AES", "SHA256", "Base64"],
      verbose: options.verbose ?? false
    };
  }
  /**
   * 运行所有基准测试
   */
  async runAll() {
    const startTime = Date.now();
    const results = [];
    this.log("\u{1F680} \u5F00\u59CB\u6027\u80FD\u57FA\u51C6\u6D4B\u8BD5...\n");
    if (this.options.algorithms.includes("AES")) {
      results.push(...await this.benchmarkAES());
    }
    if (this.options.algorithms.includes("SHA256")) {
      results.push(...await this.benchmarkHash("SHA256"));
    }
    if (this.options.algorithms.includes("MD5")) {
      results.push(...await this.benchmarkHash("MD5"));
    }
    if (this.options.algorithms.includes("Base64")) {
      results.push(...await this.benchmarkEncoding("base64"));
    }
    if (this.options.algorithms.includes("Hex")) {
      results.push(...await this.benchmarkEncoding("hex"));
    }
    const endTime = Date.now();
    this.log("\n\u2705 \u57FA\u51C6\u6D4B\u8BD5\u5B8C\u6210\uFF01\n");
    return {
      name: "Crypto Performance Benchmark",
      startTime,
      endTime,
      duration: endTime - startTime,
      results
    };
  }
  /**
   * AES 加密基准测试
   */
  async benchmarkAES() {
    this.log("\u{1F4CA} \u6D4B\u8BD5 AES \u52A0\u5BC6...");
    const results = [];
    const key = "test-key-for-benchmark";
    for (const size of this.options.dataSizes) {
      const data = this.generateTestData(size);
      for (let i = 0; i < this.options.warmupIterations; i++) {
        aes.encrypt(data, key);
      }
      const encryptStart = performance.now();
      for (let i = 0; i < this.options.iterations; i++) {
        aes.encrypt(data, key);
      }
      const encryptEnd = performance.now();
      const encryptTime = encryptEnd - encryptStart;
      results.push({
        algorithm: "AES-256",
        operation: "encrypt",
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: encryptTime,
        averageTime: encryptTime / this.options.iterations,
        operationsPerSecond: this.options.iterations / encryptTime * 1e3,
        throughput: size * this.options.iterations / encryptTime / 1024
        // KB/s
      });
      const encrypted = aes.encrypt(data, key);
      const decryptStart = performance.now();
      for (let i = 0; i < this.options.iterations; i++) {
        aes.decrypt(encrypted, key);
      }
      const decryptEnd = performance.now();
      const decryptTime = decryptEnd - decryptStart;
      results.push({
        algorithm: "AES-256",
        operation: "decrypt",
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: decryptTime,
        averageTime: decryptTime / this.options.iterations,
        operationsPerSecond: this.options.iterations / decryptTime * 1e3,
        throughput: size * this.options.iterations / decryptTime / 1024
        // KB/s
      });
      this.log(`  ${this.formatSize(size)}: \u52A0\u5BC6 ${this.formatTime(encryptTime / this.options.iterations)}, \u89E3\u5BC6 ${this.formatTime(decryptTime / this.options.iterations)}`);
    }
    return results;
  }
  /**
   * 哈希算法基准测试
   */
  async benchmarkHash(algorithm) {
    this.log(`\u{1F4CA} \u6D4B\u8BD5 ${algorithm} \u54C8\u5E0C...`);
    const results = [];
    for (const size of this.options.dataSizes) {
      const data = this.generateTestData(size);
      for (let i = 0; i < this.options.warmupIterations; i++) {
        hash.hash(data, algorithm);
      }
      const start = performance.now();
      for (let i = 0; i < this.options.iterations; i++) {
        hash.hash(data, algorithm);
      }
      const end = performance.now();
      const totalTime = end - start;
      results.push({
        algorithm,
        operation: "hash",
        dataSize: size,
        iterations: this.options.iterations,
        totalTime,
        averageTime: totalTime / this.options.iterations,
        operationsPerSecond: this.options.iterations / totalTime * 1e3,
        throughput: size * this.options.iterations / totalTime / 1024
        // KB/s
      });
      this.log(`  ${this.formatSize(size)}: ${this.formatTime(totalTime / this.options.iterations)}`);
    }
    return results;
  }
  /**
   * 编码算法基准测试
   */
  async benchmarkEncoding(type) {
    this.log(`\u{1F4CA} \u6D4B\u8BD5 ${type.toUpperCase()} \u7F16\u7801...`);
    const results = [];
    for (const size of this.options.dataSizes) {
      const data = this.generateTestData(size);
      for (let i = 0; i < this.options.warmupIterations; i++) {
        encoding.encode(data, type);
      }
      const encodeStart = performance.now();
      for (let i = 0; i < this.options.iterations; i++) {
        encoding.encode(data, type);
      }
      const encodeEnd = performance.now();
      const encodeTime = encodeEnd - encodeStart;
      results.push({
        algorithm: type.toUpperCase(),
        operation: "encode",
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: encodeTime,
        averageTime: encodeTime / this.options.iterations,
        operationsPerSecond: this.options.iterations / encodeTime * 1e3,
        throughput: size * this.options.iterations / encodeTime / 1024
        // KB/s
      });
      const encoded = encoding.encode(data, type);
      for (let i = 0; i < this.options.warmupIterations; i++) {
        encoding.decode(encoded, type);
      }
      const decodeStart = performance.now();
      for (let i = 0; i < this.options.iterations; i++) {
        encoding.decode(encoded, type);
      }
      const decodeEnd = performance.now();
      const decodeTime = decodeEnd - decodeStart;
      results.push({
        algorithm: type.toUpperCase(),
        operation: "decode",
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: decodeTime,
        averageTime: decodeTime / this.options.iterations,
        operationsPerSecond: this.options.iterations / decodeTime * 1e3,
        throughput: size * this.options.iterations / decodeTime / 1024
        // KB/s
      });
      this.log(`  ${this.formatSize(size)}: \u7F16\u7801 ${this.formatTime(encodeTime / this.options.iterations)}, \u89E3\u7801 ${this.formatTime(decodeTime / this.options.iterations)}`);
    }
    return results;
  }
  /**
   * 生成测试数据
   */
  generateTestData(size) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < size; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  /**
   * 生成性能报告
   */
  generateReport(suite) {
    let report = "\n";
    report += `${"\u2550".repeat(80)}
`;
    report += "  \u6027\u80FD\u57FA\u51C6\u6D4B\u8BD5\u62A5\u544A\n";
    report += `${"\u2550".repeat(80)}

`;
    report += `\u6D4B\u8BD5\u5957\u4EF6: ${suite.name}
`;
    report += `\u5F00\u59CB\u65F6\u95F4: ${new Date(suite.startTime).toLocaleString()}
`;
    report += `\u603B\u8017\u65F6: ${this.formatTime(suite.duration)}
`;
    report += `\u6D4B\u8BD5\u6570\u91CF: ${suite.results.length}

`;
    const grouped = /* @__PURE__ */ new Map();
    for (const result of suite.results) {
      const key = result.algorithm;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      const group = grouped.get(key);
      if (group) {
        group.push(result);
      }
    }
    for (const [algorithm, results] of grouped) {
      report += `${`\u2500`.repeat(80)}
`;
      report += `\u7B97\u6CD5: ${algorithm}
`;
      report += `${`\u2500`.repeat(80)}

`;
      report += "  \u6570\u636E\u5927\u5C0F    \u64CD\u4F5C      \u8FED\u4EE3\u6B21\u6570    \u5E73\u5747\u8017\u65F6    \u541E\u5410\u91CF\n";
      report += `  ${"\u2500".repeat(72)}
`;
      for (const result of results) {
        report += `  ${this.formatSize(result.dataSize).padEnd(10)}  `;
        report += `${result.operation.padEnd(8)}  `;
        report += `${result.iterations.toString().padEnd(10)}  `;
        report += `${this.formatTime(result.averageTime).padEnd(10)}  `;
        report += `${this.formatThroughput(result.throughput)}
`;
      }
      report += "\n";
    }
    report += `${"\u2550".repeat(80)}
`;
    return report;
  }
  /**
   * 生成 JSON 报告
   */
  generateJSONReport(suite) {
    return JSON.stringify(suite, null, 2);
  }
  /**
   * 格式化大小
   */
  formatSize(bytes) {
    if (bytes < 1024) {
      return `${bytes}B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }
  /**
   * 格式化时间
   */
  formatTime(ms) {
    if (ms < 1) {
      return `${(ms * 1e3).toFixed(2)}\u03BCs`;
    }
    if (ms < 1e3) {
      return `${ms.toFixed(2)}ms`;
    }
    return `${(ms / 1e3).toFixed(2)}s`;
  }
  /**
   * 格式化吞吐量
   */
  formatThroughput(kbps) {
    if (kbps < 1024) {
      return `${kbps.toFixed(2)} KB/s`;
    }
    return `${(kbps / 1024).toFixed(2)} MB/s`;
  }
  /**
   * 日志输出
   */
  log(_message) {
  }
}
function createBenchmark(options) {
  return new Benchmark(options);
}
async function quickBenchmark() {
  const benchmark = createBenchmark({
    iterations: 50,
    warmupIterations: 5,
    dataSizes: [100, 1024, 10240],
    verbose: true
  });
  const results = await benchmark.runAll();
  return results;
}
async function compareBenchmark(algorithm1, algorithm2, options) {
  const benchmark = createBenchmark({
    ...options,
    algorithms: [algorithm1, algorithm2],
    verbose: false
  });
  const results = await benchmark.runAll();
  let report = "\n";
  report += `\u6BD4\u8F83 ${algorithm1} vs ${algorithm2}
`;
  report += `${"\u2500".repeat(60)}

`;
  const algo1Results = results.results.filter((r) => r.algorithm === algorithm1);
  const algo2Results = results.results.filter((r) => r.algorithm === algorithm2);
  for (let i = 0; i < Math.min(algo1Results.length, algo2Results.length); i++) {
    const r1 = algo1Results[i];
    const r2 = algo2Results[i];
    if (r1.operation === r2.operation && r1.dataSize === r2.dataSize) {
      const faster = r1.averageTime < r2.averageTime ? algorithm1 : algorithm2;
      const speedup = Math.max(r1.averageTime, r2.averageTime) / Math.min(r1.averageTime, r2.averageTime);
      report += `${r1.operation} (${benchmark.formatSize(r1.dataSize)}): ${faster} \u5FEB ${speedup.toFixed(2)}x
`;
    }
  }
  return report;
}

export { Benchmark, compareBenchmark, createBenchmark, quickBenchmark };
//# sourceMappingURL=benchmark.js.map
