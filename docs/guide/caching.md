# 缓存机制

@ldesign/crypto 提供了智能缓存机制，可以显著提升重复操作的性能。

## 缓存配置

### 基础配置

```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto({
  cache: {
    enabled: true,           // 启用缓存
    maxSize: 1000,          // 最大缓存条目数
    ttl: 300000,            // 缓存生存时间(ms)，5分钟
    strategy: 'LRU'         // 缓存策略：LRU, LFU, FIFO
  }
})

await crypto.init()
```

### 高级配置

```typescript
const crypto = createCrypto({
  cache: {
    enabled: true,
    maxSize: 5000,
    ttl: 600000,           // 10分钟
    strategy: 'LRU',
    
    // 分层缓存配置
    layers: {
      memory: {
        enabled: true,
        maxSize: 1000,
        ttl: 300000
      },
      localStorage: {
        enabled: true,
        maxSize: 500,
        ttl: 3600000,      // 1小时
        prefix: 'ldesign_crypto_'
      },
      indexedDB: {
        enabled: true,
        maxSize: 2000,
        ttl: 86400000,     // 24小时
        dbName: 'CryptoCache',
        version: 1
      }
    },
    
    // 缓存策略配置
    policies: {
      keyGeneration: true,    // 缓存密钥生成
      hashResults: true,      // 缓存哈希结果
      encryptionKeys: true,   // 缓存加密密钥
      signatures: false       // 不缓存签名（安全考虑）
    },
    
    // 自定义缓存键生成
    keyGenerator: (operation, params) => {
      return `${operation}_${JSON.stringify(params)}`
    },
    
    // 缓存事件回调
    onHit: (key, value) => {
      console.log('缓存命中:', key)
    },
    
    onMiss: (key) => {
      console.log('缓存未命中:', key)
    },
    
    onEvict: (key, reason) => {
      console.log('缓存淘汰:', key, reason)
    }
  }
})
```

## 缓存策略

### LRU (最近最少使用)

```typescript
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.cache = new Map()
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // 移动到最后（最近使用）
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      // 更新现有键
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项（第一个）
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
  
  has(key) {
    return this.cache.has(key)
  }
  
  delete(key) {
    return this.cache.delete(key)
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}
```

### LFU (最少使用频率)

```typescript
class LFUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.cache = new Map()
    this.frequencies = new Map()
    this.minFrequency = 0
    this.frequencyGroups = new Map()
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return null
    }
    
    // 增加访问频率
    this.incrementFrequency(key)
    return this.cache.get(key)
  }
  
  set(key, value) {
    if (this.maxSize <= 0) return
    
    if (this.cache.has(key)) {
      // 更新现有键
      this.cache.set(key, value)
      this.incrementFrequency(key)
      return
    }
    
    if (this.cache.size >= this.maxSize) {
      // 淘汰最少使用的项
      this.evictLFU()
    }
    
    // 添加新项
    this.cache.set(key, value)
    this.frequencies.set(key, 1)
    this.addToFrequencyGroup(key, 1)
    this.minFrequency = 1
  }
  
  incrementFrequency(key) {
    const freq = this.frequencies.get(key)
    this.frequencies.set(key, freq + 1)
    
    // 从旧频率组移除
    this.removeFromFrequencyGroup(key, freq)
    
    // 添加到新频率组
    this.addToFrequencyGroup(key, freq + 1)
    
    // 更新最小频率
    if (freq === this.minFrequency && !this.frequencyGroups.get(freq)?.size) {
      this.minFrequency++
    }
  }
  
  evictLFU() {
    // 获取最小频率组的第一个键
    const minFreqGroup = this.frequencyGroups.get(this.minFrequency)
    const keyToEvict = minFreqGroup.values().next().value
    
    // 移除
    this.cache.delete(keyToEvict)
    this.frequencies.delete(keyToEvict)
    this.removeFromFrequencyGroup(keyToEvict, this.minFrequency)
  }
  
  addToFrequencyGroup(key, freq) {
    if (!this.frequencyGroups.has(freq)) {
      this.frequencyGroups.set(freq, new Set())
    }
    this.frequencyGroups.get(freq).add(key)
  }
  
  removeFromFrequencyGroup(key, freq) {
    const group = this.frequencyGroups.get(freq)
    if (group) {
      group.delete(key)
      if (group.size === 0) {
        this.frequencyGroups.delete(freq)
      }
    }
  }
}
```

## 分层缓存

### 内存缓存层

```typescript
class MemoryCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000
    this.ttl = options.ttl || 300000
    this.cache = new Map()
    this.timers = new Map()
  }
  
  set(key, value, customTTL) {
    // 清除现有定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
    }
    
    // 检查容量
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value
      this.delete(firstKey)
    }
    
    // 设置值
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
    
    // 设置过期定时器
    const ttl = customTTL || this.ttl
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)
    
    this.timers.set(key, timer)
  }
  
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.delete(key)
      return null
    }
    
    return item.value
  }
  
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
      this.timers.delete(key)
    }
    return this.cache.delete(key)
  }
  
  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.cache.clear()
  }
}
```

### LocalStorage 缓存层

```typescript
class LocalStorageCache {
  constructor(options = {}) {
    this.prefix = options.prefix || 'cache_'
    this.maxSize = options.maxSize || 500
    this.ttl = options.ttl || 3600000
  }
  
  set(key, value, customTTL) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: customTTL || this.ttl
      }
      
      const storageKey = this.prefix + key
      localStorage.setItem(storageKey, JSON.stringify(item))
      
      // 检查存储容量
      this.cleanup()
    } catch (error) {
      console.warn('LocalStorage 写入失败:', error)
    }
  }
  
  get(key) {
    try {
      const storageKey = this.prefix + key
      const itemStr = localStorage.getItem(storageKey)
      
      if (!itemStr) return null
      
      const item = JSON.parse(itemStr)
      
      // 检查过期
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(storageKey)
        return null
      }
      
      return item.value
    } catch (error) {
      console.warn('LocalStorage 读取失败:', error)
      return null
    }
  }
  
  delete(key) {
    const storageKey = this.prefix + key
    localStorage.removeItem(storageKey)
  }
  
  cleanup() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key)
      }
    }
    
    // 按时间戳排序，删除最旧的项
    if (keys.length > this.maxSize) {
      const items = keys.map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          return { key, timestamp: item.timestamp }
        } catch {
          return { key, timestamp: 0 }
        }
      }).sort((a, b) => a.timestamp - b.timestamp)
      
      const toDelete = items.slice(0, keys.length - this.maxSize)
      toDelete.forEach(item => localStorage.removeItem(item.key))
    }
  }
  
  clear() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key)
      }
    }
    keys.forEach(key => localStorage.removeItem(key))
  }
}
```

### IndexedDB 缓存层

```typescript
class IndexedDBCache {
  constructor(options = {}) {
    this.dbName = options.dbName || 'CryptoCache'
    this.version = options.version || 1
    this.storeName = 'cache'
    this.maxSize = options.maxSize || 2000
    this.ttl = options.ttl || 86400000
    this.db = null
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }
  
  async set(key, value, customTTL) {
    if (!this.db) await this.init()
    
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    
    const item = {
      key,
      value,
      timestamp: Date.now(),
      ttl: customTTL || this.ttl
    }
    
    return new Promise((resolve, reject) => {
      const request = store.put(item)
      request.onsuccess = () => {
        this.cleanup()
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }
  
  async get(key) {
    if (!this.db) await this.init()
    
    const transaction = this.db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      
      request.onsuccess = () => {
        const item = request.result
        
        if (!item) {
          resolve(null)
          return
        }
        
        // 检查过期
        if (Date.now() - item.timestamp > item.ttl) {
          this.delete(key)
          resolve(null)
          return
        }
        
        resolve(item.value)
      }
      
      request.onerror = () => reject(request.error)
    })
  }
  
  async delete(key) {
    if (!this.db) await this.init()
    
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async cleanup() {
    if (!this.db) return
    
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    const index = store.index('timestamp')
    
    // 获取所有项并按时间戳排序
    const request = index.openCursor()
    const items = []
    
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        items.push({
          key: cursor.value.key,
          timestamp: cursor.value.timestamp
        })
        cursor.continue()
      } else {
        // 删除超出限制的最旧项
        if (items.length > this.maxSize) {
          const toDelete = items
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(0, items.length - this.maxSize)
          
          toDelete.forEach(item => store.delete(item.key))
        }
      }
    }
  }
}
```

## 智能缓存管理

### 自适应缓存

```typescript
class AdaptiveCache {
  constructor(options = {}) {
    this.memoryCache = new MemoryCache(options.memory)
    this.localStorageCache = new LocalStorageCache(options.localStorage)
    this.indexedDBCache = new IndexedDBCache(options.indexedDB)
    
    this.hitRates = {
      memory: 0,
      localStorage: 0,
      indexedDB: 0
    }
    
    this.accessCounts = {
      memory: 0,
      localStorage: 0,
      indexedDB: 0
    }
  }
  
  async get(key) {
    // 按层级查找
    let value = this.memoryCache.get(key)
    if (value !== null) {
      this.recordHit('memory')
      return value
    }
    
    value = this.localStorageCache.get(key)
    if (value !== null) {
      this.recordHit('localStorage')
      // 提升到内存缓存
      this.memoryCache.set(key, value)
      return value
    }
    
    value = await this.indexedDBCache.get(key)
    if (value !== null) {
      this.recordHit('indexedDB')
      // 提升到上层缓存
      this.localStorageCache.set(key, value)
      this.memoryCache.set(key, value)
      return value
    }
    
    this.recordMiss()
    return null
  }
  
  async set(key, value, options = {}) {
    const { priority = 'normal', size = 0 } = options
    
    // 根据优先级和大小决定缓存层级
    if (priority === 'high' || size < 1024) {
      // 高优先级或小数据：所有层级
      this.memoryCache.set(key, value)
      this.localStorageCache.set(key, value)
      await this.indexedDBCache.set(key, value)
    } else if (priority === 'normal' || size < 1024 * 1024) {
      // 普通优先级或中等数据：内存和LocalStorage
      this.memoryCache.set(key, value)
      this.localStorageCache.set(key, value)
    } else {
      // 低优先级或大数据：仅IndexedDB
      await this.indexedDBCache.set(key, value)
    }
  }
  
  recordHit(layer) {
    this.accessCounts[layer]++
    this.hitRates[layer] = (this.hitRates[layer] + 1) / this.accessCounts[layer]
  }
  
  recordMiss() {
    Object.keys(this.accessCounts).forEach(layer => {
      this.accessCounts[layer]++
    })
  }
  
  getStats() {
    return {
      hitRates: { ...this.hitRates },
      accessCounts: { ...this.accessCounts },
      totalHitRate: Object.values(this.hitRates).reduce((a, b) => a + b, 0) / 3
    }
  }
  
  async optimize() {
    const stats = this.getStats()
    
    // 根据命中率调整缓存策略
    if (stats.hitRates.memory < 0.5) {
      // 内存命中率低，增加内存缓存大小
      this.memoryCache.maxSize *= 1.2
    }
    
    if (stats.hitRates.localStorage < 0.3) {
      // LocalStorage命中率低，减少使用
      this.localStorageCache.maxSize *= 0.8
    }
    
    // 清理低效缓存
    await this.cleanup()
  }
  
  async cleanup() {
    // 清理过期项
    this.memoryCache.clear()
    this.localStorageCache.cleanup()
    await this.indexedDBCache.cleanup()
  }
}
```

## 缓存使用示例

### 基础使用

```typescript
// 启用缓存的加密操作
const crypto = createCrypto({
  cache: { enabled: true }
})

// 第一次调用 - 计算并缓存
const hash1 = await crypto.sha256('test data')

// 第二次调用 - 从缓存返回
const hash2 = await crypto.sha256('test data')

console.log(hash1 === hash2) // true
console.log('缓存命中率:', crypto.getCacheStats().hitRate)
```

### 高级缓存控制

```typescript
// 自定义缓存选项
const result = await crypto.aesEncrypt('sensitive data', {
  key: 'encryption-key',
  mode: 'CBC'
}, {
  cache: {
    enabled: true,
    ttl: 60000,        // 1分钟过期
    priority: 'high',   // 高优先级
    tags: ['sensitive'] // 缓存标签
  }
})

// 清除特定标签的缓存
crypto.clearCacheByTag('sensitive')

// 预热缓存
await crypto.preloadCache([
  { operation: 'sha256', data: 'common data 1' },
  { operation: 'sha256', data: 'common data 2' },
  { operation: 'aesEncrypt', data: 'common data 3', options: { key: 'key1' } }
])
```

缓存机制可以显著提升重复操作的性能，特别是在处理相同数据的哈希计算和密钥生成时。
