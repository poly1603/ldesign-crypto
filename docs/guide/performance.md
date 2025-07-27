# 性能监控

@ldesign/crypto 内置了完整的性能监控系统，帮助你优化加密操作的性能。

## 启用性能监控

### 基础配置

```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto({
  performance: {
    enabled: true, // 启用性能监控
    detailed: true, // 详细监控信息
    threshold: 100 // 性能阈值(ms)，超过会发出警告
  }
})

await crypto.init()
```

### 高级配置

```typescript
const crypto = createCrypto({
  performance: {
    enabled: true,
    detailed: true,
    threshold: 100,

    // 自定义监控选项
    trackMemory: true, // 监控内存使用
    trackCPU: true, // 监控CPU使用
    sampleRate: 1.0, // 采样率 (0.0-1.0)
    maxRecords: 1000, // 最大记录数

    // 回调函数
    onSlowOperation: (metrics) => {
      console.warn('慢操作检测:', metrics)
    },

    onError: (error) => {
      console.error('性能监控错误:', error)
    }
  }
})
```

## 获取性能指标

### 实时性能数据

```typescript
// 执行一些加密操作
await crypto.aesEncrypt('test data', { key: 'test-key', mode: 'CBC' })
await crypto.sha256('test data')
await crypto.generateRSAKeyPair(2048)

// 获取性能指标
const metrics = crypto.getPerformanceMetrics()

console.log('性能指标:', {
  totalOperations: metrics.totalOperations,
  averageTime: metrics.averageTime,
  slowestOperation: metrics.slowestOperation,
  fastestOperation: metrics.fastestOperation,
  memoryUsage: metrics.memoryUsage,
  cpuUsage: metrics.cpuUsage
})
```

### 详细操作记录

```typescript
// 获取详细的操作记录
const records = crypto.getPerformanceRecords()

records.forEach((record) => {
  console.log(`${record.operation}: ${record.duration}ms`, {
    algorithm: record.algorithm,
    dataSize: record.dataSize,
    timestamp: record.timestamp,
    memoryBefore: record.memoryBefore,
    memoryAfter: record.memoryAfter
  })
})
```

## 性能分析

### 算法性能对比

```typescript
class PerformanceAnalyzer {
  constructor(crypto) {
    this.crypto = crypto
    this.results = new Map()
  }

  async benchmarkSymmetric() {
    const testData = 'A'.repeat(1024 * 1024) // 1MB数据
    const iterations = 100

    const algorithms = [
      { name: 'AES-128-CBC', key: this.crypto.generateKey('AES', 128) },
      { name: 'AES-256-CBC', key: this.crypto.generateKey('AES', 256) },
      { name: 'AES-256-GCM', key: this.crypto.generateKey('AES', 256) }
    ]

    for (const alg of algorithms) {
      console.log(`测试 ${alg.name}...`)

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        const mode = alg.name.includes('GCM') ? 'GCM' : 'CBC'
        await this.crypto.aesEncrypt(testData, {
          key: alg.key,
          mode
        })
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations
      const throughput = (testData.length * iterations) / (totalTime / 1000) / 1024 / 1024

      this.results.set(alg.name, {
        totalTime,
        avgTime,
        throughput: `${throughput.toFixed(2)} MB/s`
      })
    }

    return this.results
  }

  async benchmarkHash() {
    const testData = 'A'.repeat(1024 * 1024) // 1MB数据
    const iterations = 1000

    const algorithms = ['SHA-256', 'SHA-512', 'MD5', 'SM3']

    for (const alg of algorithms) {
      console.log(`测试 ${alg}...`)

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        switch (alg) {
          case 'SHA-256':
            await this.crypto.sha256(testData)
            break
          case 'SHA-512':
            await this.crypto.sha512(testData)
            break
          case 'MD5':
            await this.crypto.md5(testData)
            break
          case 'SM3':
            await this.crypto.sm3(testData)
            break
        }
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations
      const throughput = (testData.length * iterations) / (totalTime / 1000) / 1024 / 1024

      this.results.set(alg, {
        totalTime,
        avgTime,
        throughput: `${throughput.toFixed(2)} MB/s`
      })
    }

    return this.results
  }

  printResults() {
    console.table(Object.fromEntries(this.results))
  }
}

// 使用示例
const analyzer = new PerformanceAnalyzer(crypto)
await analyzer.benchmarkSymmetric()
await analyzer.benchmarkHash()
analyzer.printResults()
```

### 内存使用监控

```typescript
class MemoryMonitor {
  constructor(crypto) {
    this.crypto = crypto
    this.snapshots = []
  }

  takeSnapshot(label) {
    if (performance.memory) {
      this.snapshots.push({
        label,
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      })
    }
  }

  async monitorOperation(operation, ...args) {
    this.takeSnapshot('before')

    const startTime = performance.now()
    const result = await operation(...args)
    const endTime = performance.now()

    this.takeSnapshot('after')

    const before = this.snapshots[this.snapshots.length - 2]
    const after = this.snapshots[this.snapshots.length - 1]

    return {
      result,
      duration: endTime - startTime,
      memoryDelta: after.used - before.used,
      memoryUsage: {
        before: before.used,
        after: after.used,
        peak: Math.max(before.used, after.used)
      }
    }
  }

  getMemoryReport() {
    return this.snapshots.map((snapshot, index) => ({
      ...snapshot,
      delta: index > 0 ? snapshot.used - this.snapshots[index - 1].used : 0
    }))
  }
}

// 使用示例
const monitor = new MemoryMonitor(crypto)

const result = await monitor.monitorOperation(
  crypto.aesEncrypt.bind(crypto),
  'large data'.repeat(10000),
  { key: crypto.generateKey('AES', 256), mode: 'CBC' }
)

console.log('操作结果:', result)
console.log('内存报告:', monitor.getMemoryReport())
```

## 性能优化建议

### 1. 算法选择优化

```typescript
// 根据数据大小选择算法
function selectOptimalAlgorithm(dataSize) {
  if (dataSize < 1024) {
    // 小数据：选择启动开销小的算法
    return { algorithm: 'AES', keySize: 128, mode: 'ECB' }
  }
 else if (dataSize < 1024 * 1024) {
    // 中等数据：平衡安全性和性能
    return { algorithm: 'AES', keySize: 256, mode: 'CBC' }
  }
 else {
    // 大数据：选择高性能模式
    return { algorithm: 'AES', keySize: 256, mode: 'CTR' }
  }
}

// 使用示例
const data = 'some data'
const config = selectOptimalAlgorithm(data.length)
const encrypted = await crypto.aesEncrypt(data, config)
```

### 2. 批量操作优化

```typescript
// 批量加密优化
async function optimizedBatchEncrypt(dataList, key) {
  const batchSize = 10 // 批次大小
  const results = []

  for (let i = 0; i < dataList.length; i += batchSize) {
    const batch = dataList.slice(i, i + batchSize)

    // 并行处理批次内的数据
    const batchResults = await Promise.all(
      batch.map(data => crypto.aesEncrypt(data, { key, mode: 'CBC' }))
    )

    results.push(...batchResults)

    // 避免阻塞主线程
    if (i % (batchSize * 10) === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return results
}
```

### 3. 缓存策略优化

```typescript
class PerformanceCache {
  constructor(maxSize = 1000, ttl = 300000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
    this.accessTimes = new Map()
  }

  set(key, value) {
    // LRU淘汰策略
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestKey()
      this.cache.delete(oldestKey)
      this.accessTimes.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
    this.accessTimes.set(key, Date.now())
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item)
return null

    // 检查过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      this.accessTimes.delete(key)
      return null
    }

    // 更新访问时间
    this.accessTimes.set(key, Date.now())
    return item.value
  }

  findOldestKey() {
    let oldestKey = null
    let oldestTime = Infinity

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    }

    return oldestKey
  }

  clear() {
    this.cache.clear()
    this.accessTimes.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    }
  }
}
```

## Web Workers 优化

### 后台加密处理

```typescript
// crypto-worker.js
self.onmessage = async function (e) {
  const { id, operation, data, options } = e.data

  try {
    // 动态导入加密库
    const { createCrypto } = await import('@ldesign/crypto')
    const crypto = createCrypto({ performance: { enabled: true } })
    await crypto.init()

    let result
    switch (operation) {
      case 'aesEncrypt':
        result = await crypto.aesEncrypt(data, options)
        break
      case 'aesDecrypt':
        result = await crypto.aesDecrypt(data, options)
        break
      case 'sha256':
        result = await crypto.sha256(data)
        break
      // 添加更多操作...
    }

    self.postMessage({
      id,
      success: true,
      result,
      metrics: crypto.getPerformanceMetrics()
    })
  }
 catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message
    })
  }
}
```

```typescript
// 主线程使用
class WorkerCrypto {
  constructor() {
    this.worker = new Worker('/crypto-worker.js')
    this.pendingOperations = new Map()
    this.worker.onmessage = this.handleMessage.bind(this)
  }

  handleMessage(e) {
    const { id, success, result, error, metrics } = e.data
    const { resolve, reject } = this.pendingOperations.get(id)

    if (success) {
      resolve({ result, metrics })
    }
 else {
      reject(new Error(error))
    }

    this.pendingOperations.delete(id)
  }

  async encrypt(data, options) {
    const id = Date.now() + Math.random()

    return new Promise((resolve, reject) => {
      this.pendingOperations.set(id, { resolve, reject })

      this.worker.postMessage({
        id,
        operation: 'aesEncrypt',
        data,
        options
      })
    })
  }
}

// 使用示例
const workerCrypto = new WorkerCrypto()
const { result, metrics } = await workerCrypto.encrypt('large data', {
  key: 'encryption-key',
  mode: 'CBC'
})
```

## 性能监控仪表板

### 实时监控组件

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const metrics = ref({
  totalOperations: 0,
  averageTime: 0,
  throughput: 0,
  memoryUsage: 0
})

const recentOperations = ref([])
const performanceChart = ref(null)

let updateInterval = null

onMounted(() => {
  // 定期更新性能指标
  updateInterval = setInterval(updateMetrics, 1000)
  initChart()
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

function updateMetrics() {
  // 从crypto实例获取最新指标
  const latest = crypto.getPerformanceMetrics()
  metrics.value = latest

  // 更新操作历史
  const records = crypto.getPerformanceRecords()
  recentOperations.value = records.slice(-10).reverse()
}

function formatBytes(bytes) {
  if (bytes === 0)
return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

function initChart() {
  // 初始化性能图表
  const ctx = performanceChart.value.getContext('2d')
  // 使用Chart.js或其他图表库绘制性能趋势图
}
</script>

<template>
  <div class="performance-dashboard">
    <h2>性能监控仪表板</h2>

    <!-- 实时指标 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>总操作数</h3>
        <div class="metric-value">
          {{ metrics.totalOperations }}
        </div>
      </div>

      <div class="metric-card">
        <h3>平均耗时</h3>
        <div class="metric-value">
          {{ metrics.averageTime }}ms
        </div>
      </div>

      <div class="metric-card">
        <h3>吞吐量</h3>
        <div class="metric-value">
          {{ metrics.throughput }} ops/s
        </div>
      </div>

      <div class="metric-card">
        <h3>内存使用</h3>
        <div class="metric-value">
          {{ formatBytes(metrics.memoryUsage) }}
        </div>
      </div>
    </div>

    <!-- 性能图表 -->
    <div class="charts-section">
      <canvas ref="performanceChart" width="800" height="400" />
    </div>

    <!-- 操作历史 -->
    <div class="history-section">
      <h3>最近操作</h3>
      <table class="operations-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>操作</th>
            <th>算法</th>
            <th>耗时</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="op in recentOperations" :key="op.id">
            <td>{{ formatTime(op.timestamp) }}</td>
            <td>{{ op.operation }}</td>
            <td>{{ op.algorithm }}</td>
            <td>{{ op.duration }}ms</td>
            <td :class="op.status">
              {{ op.status }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.performance-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--vp-c-border);
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-top: 0.5rem;
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.operations-table th,
.operations-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-border);
}

.operations-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}

.status.success { color: #28a745; }
.status.warning { color: #ffc107; }
.status.error { color: #dc3545; }
</style>
```

这个性能监控系统提供了全面的性能分析和优化建议，帮助开发者优化加密操作的性能。
