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
import '../algorithms/encoding.js';
import 'node-forge';

class SecureStorage {
  /**
   * 创建安全存储实例
   *
   * @param options 存储选项
   *
   * @example
   * ```typescript
   * const storage = new SecureStorage({ key: 'my-secret-key' })
   * storage.set('user', { name: 'John', age: 30 })
   * const user = storage.get('user')
   * ```
   */
  constructor(options) {
    this.key = options.key;
    this.prefix = options.prefix || "secure_";
    this.storage = options.useSessionStorage ? sessionStorage : localStorage;
    this.defaultTTL = options.ttl || 0;
  }
  /**
   * 存储数据
   *
   * @param key 键名
   * @param value 值（自动序列化）
   * @param ttl 过期时间（毫秒，可选）
   * @returns 是否成功
   */
  set(key, value, ttl) {
    try {
      const now = Date.now();
      const expiresAt = ttl || this.defaultTTL ? now + (ttl || this.defaultTTL) : 0;
      const serialized = JSON.stringify(value);
      const encrypted = aes.encrypt(serialized, this.key);
      if (!encrypted.success) {
        throw new Error(encrypted.error || "Encryption failed");
      }
      const item = {
        data: encrypted.data || "",
        timestamp: now,
        expiresAt,
        type: typeof value
      };
      this.storage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error("SecureStorage.set error:", error);
      return false;
    }
  }
  /**
   * 获取数据
   *
   * @param key 键名
   * @param defaultValue 默认值（可选）
   * @returns 值或默认值
   */
  get(key, defaultValue) {
    try {
      const itemStr = this.storage.getItem(this.prefix + key);
      if (!itemStr) {
        return defaultValue;
      }
      const item = JSON.parse(itemStr);
      if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
        this.remove(key);
        return defaultValue;
      }
      const decrypted = aes.decrypt(item.data, this.key);
      if (!decrypted.success || !decrypted.data) {
        throw new Error(decrypted.error || "Decryption failed");
      }
      return JSON.parse(decrypted.data);
    } catch (error) {
      console.error("SecureStorage.get error:", error);
      return defaultValue;
    }
  }
  /**
   * 删除数据
   *
   * @param key 键名
   * @returns 是否成功
   */
  remove(key) {
    try {
      this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error("SecureStorage.remove error:", error);
      return false;
    }
  }
  /**
   * 清空所有数据
   *
   * @returns 是否成功
   */
  clear() {
    try {
      const keys = this.keys();
      keys.forEach((key) => this.remove(key));
      return true;
    } catch (error) {
      console.error("SecureStorage.clear error:", error);
      return false;
    }
  }
  /**
   * 检查键是否存在
   *
   * @param key 键名
   * @returns 是否存在
   */
  has(key) {
    return this.storage.getItem(this.prefix + key) !== null;
  }
  /**
   * 获取所有键名
   *
   * @returns 键名数组
   */
  keys() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }
  /**
   * 获取存储项数量
   *
   * @returns 数量
   */
  size() {
    return this.keys().length;
  }
  /**
   * 清理过期数据
   *
   * @returns 清理的数量
   */
  cleanup() {
    let count = 0;
    const now = Date.now();
    const keys = this.keys();
    for (const key of keys) {
      try {
        const itemStr = this.storage.getItem(this.prefix + key);
        if (itemStr) {
          const item = JSON.parse(itemStr);
          if (item.expiresAt > 0 && now > item.expiresAt) {
            this.remove(key);
            count++;
          }
        }
      } catch {
      }
    }
    return count;
  }
  /**
   * 获取存储项的元数据
   *
   * @param key 键名
   * @returns 元数据或undefined
   */
  getMetadata(key) {
    try {
      const itemStr = this.storage.getItem(this.prefix + key);
      if (!itemStr) {
        return void 0;
      }
      const item = JSON.parse(itemStr);
      const now = Date.now();
      return {
        timestamp: item.timestamp,
        expiresAt: item.expiresAt,
        type: item.type,
        isExpired: item.expiresAt > 0 && now > item.expiresAt
      };
    } catch {
      return void 0;
    }
  }
  /**
   * 更新密钥（重新加密所有数据）
   *
   * @param newKey 新密钥
   * @returns 是否成功
   */
  updateKey(newKey) {
    try {
      const keys = this.keys();
      const tempData = /* @__PURE__ */ new Map();
      for (const key of keys) {
        const value = this.get(key);
        if (value !== void 0) {
          tempData.set(key, value);
        }
      }
      this.key = newKey;
      for (const [key, value] of tempData.entries()) {
        this.set(key, value);
      }
      return true;
    } catch (error) {
      console.error("SecureStorage.updateKey error:", error);
      return false;
    }
  }
}
function createSecureStorage(options) {
  return new SecureStorage(options);
}

export { SecureStorage, createSecureStorage };
//# sourceMappingURL=secure-storage.js.map
