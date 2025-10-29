<script setup lang="ts">
import { ref } from 'vue'
import { encrypt, decrypt, hash, PerformanceMonitor } from '@ldesign/crypto'

/**
 * 性能测试演示组件
 */

// 性能监控器
const monitor = new PerformanceMonitor({
  enableDetailedMetrics: true,
  sampleSize: 100,
})

// 测试配置
const testSize = ref<'small' | 'medium' | 'large'>('small')
const iterations = ref(100)

// 测试结果
const results = ref<any>(null)
const testing = ref(false)

// 测试数据大小配置
const dataSizes = {
  small: { size: 100, label: '小数据 (100 字节)' },
  medium: { size: 10000, label: '中等数据 (10KB)' },
  large: { size: 100000, label: '大数据 (100KB)' },
}

/**
 * 生成测试数据
 */
function generateTestData(size: number): string {
  return 'x'.repeat(size)
}

/**
 * 运行性能测试
 */
async function runBenchmark() {
  testing.value = true
  results.value = null

  const testData = generateTestData(dataSizes[testSize.value].size)
  const key = 'test-key-123456'

  const benchmarkResults: any = {
    dataSize: dataSizes[testSize.value].size,
    iterations: iterations.value,
    tests: {},
  }

  try {
    // AES 加密性能测试
    monitor.startOperation('aes-encrypt', 'AES')
    const aesEncryptStart = performance.now()
    for (let i = 0; i < iterations.value; i++) {
      await encrypt.aes(testData, key)
    }
    const aesEncryptTime = performance.now() - aesEncryptStart
    monitor.endOperation('aes-encrypt', 'AES')

    benchmarkResults.tests.aesEncrypt = {
      totalTime: aesEncryptTime.toFixed(2),
      avgTime: (aesEncryptTime / iterations.value).toFixed(2),
      opsPerSec: (iterations.value / (aesEncryptTime / 1000)).toFixed(0),
    }

    // AES 解密性能测试
    const encryptedData = await encrypt.aes(testData, key)
    if (encryptedData.success && encryptedData.data) {
      monitor.startOperation('aes-decrypt', 'AES')
      const aesDecryptStart = performance.now()
      for (let i = 0; i < iterations.value; i++) {
        await decrypt.aes(encryptedData.data, key)
      }
      const aesDecryptTime = performance.now() - aesDecryptStart
      monitor.endOperation('aes-decrypt', 'AES')

      benchmarkResults.tests.aesDecrypt = {
        totalTime: aesDecryptTime.toFixed(2),
        avgTime: (aesDecryptTime / iterations.value).toFixed(2),
        opsPerSec: (iterations.value / (aesDecryptTime / 1000)).toFixed(0),
      }
    }

    // SHA-256 哈希性能测试
    monitor.startOperation('sha256', 'SHA256')
    const sha256Start = performance.now()
    for (let i = 0; i < iterations.value; i++) {
      await hash.sha256(testData)
    }
    const sha256Time = performance.now() - sha256Start
    monitor.endOperation('sha256', 'SHA256')

    benchmarkResults.tests.sha256 = {
      totalTime: sha256Time.toFixed(2),
      avgTime: (sha256Time / iterations.value).toFixed(2),
      opsPerSec: (iterations.value / (sha256Time / 1000)).toFixed(0),
    }

    // MD5 哈希性能测试
    monitor.startOperation('md5', 'MD5')
    const md5Start = performance.now()
    for (let i = 0; i < iterations.value; i++) {
      await hash.md5(testData)
    }
    const md5Time = performance.now() - md5Start
    monitor.endOperation('md5', 'MD5')

    benchmarkResults.tests.md5 = {
      totalTime: md5Time.toFixed(2),
      avgTime: (md5Time / iterations.value).toFixed(2),
      opsPerSec: (iterations.value / (md5Time / 1000)).toFixed(0),
    }

    results.value = benchmarkResults
  } catch (err) {
    console.error('性能测试失败:', err)
  } finally {
    testing.value = false
  }
}

/**
 * 获取性能报告
 */
function getPerformanceReport() {
  return monitor.getReport()
}

/**
 * 格式化吞吐量
 */
function formatThroughput(dataSize: number, opsPerSec: number): string {
  const bytesPerSec = dataSize * Number(opsPerSec)
  if (bytesPerSec < 1024) {
    return `${bytesPerSec.toFixed(0)} B/s`
  } else if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(2)} KB/s`
  } else {
    return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`
  }
}
</script>

<template>
  <div class="demo-card">
    <div class="card-header">
      <h2 class="card-title">⚡ 性能基准测试</h2>
      <p class="card-description">
        测试各种加密算法的性能表现，帮助选择最适合的算法。
      </p>
    </div>

    <div class="card-content">
      <!-- 测试配置 -->
      <div class="config-section">
        <h3 class="section-title">⚙️ 测试配置</h3>
        
        <div class="config-grid">
          <div class="form-group">
            <label class="form-label">数据大小</label>
            <select v-model="testSize" class="form-select">
              <option value="small">{{ dataSizes.small.label }}</option>
              <option value="medium">{{ dataSizes.medium.label }}</option>
              <option value="large">{{ dataSizes.large.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">迭代次数</label>
            <input
              v-model.number="iterations"
              type="number"
              class="form-input"
              min="10"
              max="1000"
              step="10"
            />
          </div>
        </div>

        <button
          class="btn btn-primary"
          :disabled="testing"
          @click="runBenchmark"
        >
          {{ testing ? '测试中...' : '🚀 开始测试' }}
        </button>
      </div>

      <!-- 测试进度 -->
      <div v-if="testing" class="testing-indicator">
        <div class="spinner" />
        <div class="testing-text">正在运行性能测试，请稍候...</div>
      </div>

      <!-- 测试结果 -->
      <div v-if="results" class="results-section">
        <h3 class="section-title">📊 测试结果</h3>

        <div class="results-summary">
          <div class="summary-item">
            <div class="summary-label">数据大小</div>
            <div class="summary-value">{{ results.dataSize }} 字节</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">迭代次数</div>
            <div class="summary-value">{{ results.iterations }} 次</div>
          </div>
        </div>

        <div class="results-table">
          <table>
            <thead>
              <tr>
                <th>算法</th>
                <th>总耗时</th>
                <th>平均耗时</th>
                <th>吞吐量</th>
                <th>操作/秒</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="results.tests.aesEncrypt">
                <td>
                  <span class="algorithm-badge">AES 加密</span>
                </td>
                <td>{{ results.tests.aesEncrypt.totalTime }} ms</td>
                <td>{{ results.tests.aesEncrypt.avgTime }} ms</td>
                <td>{{ formatThroughput(results.dataSize, results.tests.aesEncrypt.opsPerSec) }}</td>
                <td>{{ results.tests.aesEncrypt.opsPerSec }}</td>
              </tr>
              <tr v-if="results.tests.aesDecrypt">
                <td>
                  <span class="algorithm-badge">AES 解密</span>
                </td>
                <td>{{ results.tests.aesDecrypt.totalTime }} ms</td>
                <td>{{ results.tests.aesDecrypt.avgTime }} ms</td>
                <td>{{ formatThroughput(results.dataSize, results.tests.aesDecrypt.opsPerSec) }}</td>
                <td>{{ results.tests.aesDecrypt.opsPerSec }}</td>
              </tr>
              <tr v-if="results.tests.sha256">
                <td>
                  <span class="algorithm-badge">SHA-256</span>
                </td>
                <td>{{ results.tests.sha256.totalTime }} ms</td>
                <td>{{ results.tests.sha256.avgTime }} ms</td>
                <td>{{ formatThroughput(results.dataSize, results.tests.sha256.opsPerSec) }}</td>
                <td>{{ results.tests.sha256.opsPerSec }}</td>
              </tr>
              <tr v-if="results.tests.md5">
                <td>
                  <span class="algorithm-badge">MD5</span>
                </td>
                <td>{{ results.tests.md5.totalTime }} ms</td>
                <td>{{ results.tests.md5.avgTime }} ms</td>
                <td>{{ formatThroughput(results.dataSize, results.tests.md5.opsPerSec) }}</td>
                <td>{{ results.tests.md5.opsPerSec }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 性能优化建议 -->
      <div class="info-section">
        <h3 class="info-title">💡 性能优化建议</h3>
        <ul class="info-list">
          <li><strong>选择合适的算法</strong>：根据安全需求和性能要求选择算法</li>
          <li><strong>使用流式处理</strong>：处理大文件时使用流式加密避免内存溢出</li>
          <li><strong>启用缓存</strong>：对于重复计算可以使用缓存提高性能</li>
          <li><strong>并行处理</strong>：使用 Worker 线程进行并行加密</li>
          <li><strong>硬件加速</strong>：使用 Web Crypto API 利用硬件加速</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './demo-styles.css';

.config-section {
  margin-bottom: 2rem;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.testing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin: 2rem 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.testing-text {
  margin-top: 1rem;
  font-size: 1.125rem;
  color: #6b7280;
}

.results-section {
  margin-top: 2rem;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.75rem;
  text-align: center;
}

.summary-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.results-table {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  background: #f9fafb;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:hover {
  background: #f9fafb;
}

.algorithm-badge {
  padding: 0.375rem 0.875rem;
  background: #667eea;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>


