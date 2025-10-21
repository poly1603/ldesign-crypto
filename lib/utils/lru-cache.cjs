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

class LRUNode {
  constructor(key, value) {
    this.prev = null;
    this.next = null;
    this.key = key;
    this.value = value;
    this.timestamp = Date.now();
  }
}
class LRUCache {
  constructor(options) {
    this.head = null;
    this.tail = null;
    this.currentMemorySize = 0;
    this.memorySizes = /* @__PURE__ */ new Map();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.memoryEvictions = 0;
    this.maxSize = options.maxSize;
    this.ttl = options.ttl || 0;
    this.updateAgeOnGet = options.updateAgeOnGet ?? true;
    this.maxMemorySize = options.maxMemorySize || 0;
    this.cleanupInterval = options.cleanupInterval || 0;
    this.cache = /* @__PURE__ */ new Map();
    this.sizeCalculator = options.sizeCalculator || this.defaultSizeCalculator;
    if (this.cleanupInterval > 0 && this.ttl > 0) {
      this.startAutoCleanup();
    }
  }
  /**
   * 默认的大小计算器
   */
  defaultSizeCalculator(value) {
    if (value === null || value === void 0) {
      return 0;
    }
    if (typeof value === "string") {
      return new Blob([value]).size;
    }
    if (typeof value === "object") {
      try {
        const json = JSON.stringify(value);
        return new Blob([json]).size;
      } catch {
        return 256;
      }
    }
    if (typeof value === "number") {
      return 8;
    }
    if (typeof value === "boolean") {
      return 4;
    }
    return 64;
  }
  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
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
   * 获取缓存值
   */
  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      this.misses++;
      return void 0;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      this.misses++;
      return void 0;
    }
    if (this.updateAgeOnGet) {
      node.timestamp = Date.now();
    }
    this.moveToHead(node);
    this.hits++;
    return node.value;
  }
  /**
   * 设置缓存值
   */
  set(key, value) {
    let node = this.cache.get(key);
    const newSize = this.sizeCalculator(value);
    if (node) {
      const oldSize = this.memorySizes.get(key) || 0;
      this.currentMemorySize = this.currentMemorySize - oldSize + newSize;
      this.memorySizes.set(key, newSize);
      node.value = value;
      node.timestamp = Date.now();
      this.moveToHead(node);
    } else {
      node = new LRUNode(key, value);
      if (this.maxMemorySize > 0) {
        if (newSize > this.maxMemorySize) {
          console.warn(`Cache entry size (${newSize} bytes) exceeds max memory size (${this.maxMemorySize} bytes)`);
          return;
        }
        while (this.currentMemorySize + newSize > this.maxMemorySize && this.tail) {
          this.removeTail();
          this.memoryEvictions++;
        }
      }
      this.cache.set(key, node);
      this.addToHead(node);
      this.currentMemorySize += newSize;
      this.memorySizes.set(key, newSize);
      if (this.cache.size > this.maxSize) {
        this.removeTail();
      }
    }
  }
  /**
   * 删除缓存项
   */
  delete(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    this.removeNode(node);
    this.cache.delete(key);
    const size = this.memorySizes.get(key) || 0;
    this.currentMemorySize -= size;
    this.memorySizes.delete(key);
    return true;
  }
  /**
   * 检查是否存在
   */
  has(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      return false;
    }
    return true;
  }
  /**
   * 清空缓存
   */
  clear() {
    let current = this.head;
    while (current) {
      const next = current.next;
      current.prev = null;
      current.next = null;
      current = next;
    }
    this.cache.clear();
    this.memorySizes.clear();
    this.head = null;
    this.tail = null;
    this.currentMemorySize = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.memoryEvictions = 0;
  }
  /**
   * 获取缓存大小
   */
  get size() {
    return this.cache.size;
  }
  /**
   * 获取统计信息
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      currentMemorySize: this.currentMemorySize,
      maxMemorySize: this.maxMemorySize,
      memoryUsagePercent: this.maxMemorySize > 0 ? this.currentMemorySize / this.maxMemorySize * 100 : 0,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      memoryEvictions: this.memoryEvictions,
      hitRate,
      totalRequests: total
    };
  }
  /**
   * 重置统计信息
   */
  resetStats() {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.memoryEvictions = 0;
  }
  /**
   * 清理过期项
   */
  cleanup() {
    if (this.ttl === 0) {
      return 0;
    }
    let cleaned = 0;
    const now = Date.now();
    const keysToDelete = [];
    for (const [key, node] of this.cache.entries()) {
      if (now - node.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.delete(key);
      cleaned++;
    }
    return cleaned;
  }
  /**
   * 批量获取缓存值
   * 性能优化：减少多次调用的开销
   */
  getMany(keys) {
    const results = /* @__PURE__ */ new Map();
    for (const key of keys) {
      const value = this.get(key);
      if (value !== void 0) {
        results.set(key, value);
      }
    }
    return results;
  }
  /**
   * 批量设置缓存值
   * 性能优化：减少多次调用的开销
   */
  setMany(entries) {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }
  /**
   * 批量删除缓存项
   * 性能优化：减少多次调用的开销
   */
  deleteMany(keys) {
    let deleted = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }
  /**
   * 获取所有键
   */
  keys() {
    return Array.from(this.cache.keys());
  }
  /**
   * 获取所有值
   */
  values() {
    const values = [];
    for (const node of this.cache.values()) {
      if (!this.isExpired(node)) {
        values.push(node.value);
      }
    }
    return values;
  }
  /**
   * 获取所有条目
   */
  entries() {
    const entries = [];
    for (const [key, node] of this.cache.entries()) {
      if (!this.isExpired(node)) {
        entries.push([key, node.value]);
      }
    }
    return entries;
  }
  /**
   * 检查节点是否过期
   */
  isExpired(node) {
    if (this.ttl === 0) {
      return false;
    }
    return Date.now() - node.timestamp > this.ttl;
  }
  /**
   * 将节点移动到头部
   */
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  /**
   * 添加节点到头部
   */
  addToHead(node) {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  /**
   * 从链表中移除节点
   */
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
  /**
   * 移除尾部节点（最久未使用）
   */
  removeTail() {
    if (!this.tail) {
      return;
    }
    const key = this.tail.key;
    const tailNode = this.tail;
    this.removeNode(tailNode);
    this.cache.delete(key);
    this.evictions++;
    const size = this.memorySizes.get(key) || 0;
    this.currentMemorySize -= size;
    this.memorySizes.delete(key);
    tailNode.prev = null;
    tailNode.next = null;
  }
  /**
   * 销毁缓存（释放资源）
   */
  destroy() {
    this.stopAutoCleanup();
    this.clear();
  }
}

exports.LRUCache = LRUCache;
//# sourceMappingURL=lru-cache.cjs.map
