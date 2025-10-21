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

var crypto = require('./crypto.cjs');
var performance = require('./performance.cjs');

class CryptoManager {
  constructor(config = {}) {
    this.config = {
      defaultAlgorithm: "AES",
      enableCache: true,
      maxCacheSize: 1e3,
      enableParallel: true,
      autoGenerateIV: true,
      keyDerivation: false,
      debug: false,
      logLevel: "error",
      ...config
    };
    this.encrypt = new crypto.Encrypt();
    this.decrypt = new crypto.Decrypt();
    this.hash = new crypto.Hash();
    this.hmac = new crypto.HMAC();
    this.keyGenerator = new crypto.KeyGenerator();
    this.optimizer = new performance.PerformanceOptimizer();
    this.log("info", "CryptoManager initialized", this.config);
  }
  /**
   * 简化的加密方法
   */
  async encryptData(data, key, algorithm, options) {
    const targetAlgorithm = algorithm || this.config?.defaultAlgorithm;
    try {
      this.log("debug", `Encrypting data with ${targetAlgorithm}`);
      const result = this.encrypt.encrypt(data, key, targetAlgorithm, options);
      this.log("debug", "Encryption completed", {
        algorithm: targetAlgorithm,
        success: result.success
      });
      return result;
    } catch (error) {
      this.log("error", "Encryption failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown encryption error",
        algorithm: targetAlgorithm
      };
    }
  }
  /**
   * 简化的解密方法
   */
  async decryptData(encryptedData, key, algorithm, options) {
    try {
      this.log("debug", "Decrypting data");
      const result = this.decrypt.decrypt(encryptedData, key, algorithm, options);
      this.log("debug", "Decryption completed", { success: result.success });
      return result;
    } catch (error) {
      this.log("error", "Decryption failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown decryption error",
        algorithm: algorithm || "Unknown"
      };
    }
  }
  /**
   * 批量加密
   */
  async batchEncrypt(operations) {
    if (!this.config?.enableParallel || operations.length <= 1) {
      const results = [];
      for (const op of operations) {
        const result = await this.encryptData(op.data, op.key, op.algorithm, op.options);
        results.push({ id: op.id, result });
      }
      return results;
    }
    return this.optimizer.batchEncrypt(operations);
  }
  /**
   * 批量解密
   */
  async batchDecrypt(operations) {
    if (!this.config?.enableParallel || operations.length <= 1) {
      const results = [];
      for (const op of operations) {
        const result = await this.decryptData(op.data, op.key, op.algorithm, op.options);
        results.push({ id: op.id, result });
      }
      return results;
    }
    return this.optimizer.batchDecrypt(operations);
  }
  /**
   * 哈希计算
   */
  hashData(data, algorithm = "SHA256", options) {
    return this.hash.hash(data, algorithm, options).hash;
  }
  /**
   * HMAC 计算
   */
  hmacData(data, key, algorithm = "SHA256") {
    switch (algorithm) {
      case "MD5":
        return this.hmac.md5(data, key);
      case "SHA1":
        return this.hmac.sha1(data, key);
      case "SHA256":
        return this.hmac.sha256(data, key);
      case "SHA384":
        return this.hmac.sha384(data, key);
      case "SHA512":
        return this.hmac.sha512(data, key);
      default:
        return this.hmac.sha256(data, key);
    }
  }
  /**
   * 生成密钥
   */
  generateKey(algorithm, keySize) {
    switch (algorithm.toUpperCase()) {
      case "AES":
        return this.keyGenerator.generateKey((keySize || 256) / 8);
      case "RSA": {
        const rsaKeySize = keySize || 2048;
        return this.keyGenerator.generateRSAKeyPair(rsaKeySize);
      }
      case "DES":
        return this.keyGenerator.generateRandomBytes(8);
      case "3DES":
        return this.keyGenerator.generateRandomBytes(24);
      case "BLOWFISH":
        return this.keyGenerator.generateRandomBytes(keySize || 16);
      default:
        throw new Error(`Unsupported algorithm for key generation: ${algorithm}`);
    }
  }
  /**
   * 获取支持的算法列表
   */
  getSupportedAlgorithms() {
    return ["AES", "RSA", "DES", "3DES", "Blowfish"];
  }
  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return this.optimizer.getCacheStats();
  }
  /**
   * 获取缓存统计（别名）
   */
  getCacheStats() {
    return this.optimizer.getCacheStats();
  }
  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return this.optimizer.getPerformanceMetrics();
  }
  /**
   * 清理过期缓存
   */
  cleanupCache() {
    const cleaned = this.optimizer.cleanupCache();
    this.log("info", `Cleaned ${cleaned} expired cache entries`);
    return cleaned;
  }
  /**
   * 清除缓存
   */
  clearCache() {
    this.optimizer.clearCache();
    this.log("info", "Cache cleared");
  }
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("info", "Configuration updated", newConfig);
  }
  /**
   * 获取当前配置
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * 日志记录
   */
  log(level, message, data) {
    if (!this.config?.debug) {
      return;
    }
    const levels = ["error", "warn", "info", "debug"];
    levels.indexOf(this.config?.logLevel);
  }
}
const cryptoManager = new CryptoManager();

exports.CryptoManager = CryptoManager;
exports.cryptoManager = cryptoManager;
//# sourceMappingURL=manager.cjs.map
