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
var index = require('../utils/index.cjs');

class PBKDF2 {
  constructor() {
    this.defaultOptions = {
      iterations: 1e5,
      // OWASP 推荐最少 100,000 次
      keyLength: 32,
      // 256 bits
      salt: "",
      outputFormat: "hex"
    };
  }
  /**
   * 派生密钥
   */
  derive(password, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const salt = opts.salt || index.RandomUtils.generateSalt(16);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: opts.keyLength / 4,
      // CryptoJS 使用 words (4 bytes)
      iterations: opts.iterations,
      hasher: CryptoJS.algo.SHA256
    });
    let keyString;
    switch (opts.outputFormat) {
      case "base64":
        keyString = CryptoJS.enc.Base64.stringify(key);
        break;
      case "raw":
        keyString = key.toString();
        break;
      case "hex":
      default:
        keyString = key.toString(CryptoJS.enc.Hex);
    }
    return {
      key: keyString,
      salt,
      algorithm: "PBKDF2-SHA256",
      parameters: {
        iterations: opts.iterations,
        keyLength: opts.keyLength
      }
    };
  }
  /**
   * 验证密码
   */
  verify(password, derivedKey, salt, options = {}) {
    const result = this.derive(password, { ...options, salt });
    return result.key === derivedKey;
  }
  /**
   * 推荐的安全参数
   */
  getRecommendedParameters(securityLevel = "medium") {
    switch (securityLevel) {
      case "low":
        return { iterations: 5e4, keyLength: 16 };
      // 128 bits
      case "high":
        return { iterations: 2e5, keyLength: 64 };
      // 512 bits
      case "medium":
      default:
        return { iterations: 1e5, keyLength: 32 };
    }
  }
}
class Argon2 {
  constructor() {
    this.defaultOptions = {
      iterations: 3,
      // 时间成本
      keyLength: 32,
      salt: "",
      memoryCost: 4096,
      // 4 MB
      parallelism: 1,
      timeCost: 3,
      outputFormat: "hex"
    };
  }
  /**
   * 派生密钥（简化实现）
   * 注意：这是一个简化的实现，实际应使用专门的 Argon2 库
   */
  derive(password, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const salt = opts.salt || index.RandomUtils.generateSalt(16);
    let hash = password + salt;
    for (let t = 0; t < (opts.timeCost || opts.iterations); t++) {
      const memoryBlocks = [];
      const blockCount = Math.floor((opts.memoryCost || 4096) / 128);
      for (let i = 0; i < blockCount; i++) {
        const block = CryptoJS.SHA256(hash + i).toString();
        memoryBlocks.push(block);
        if (i % (opts.parallelism || 1) === 0) {
          hash = CryptoJS.SHA256(hash + memoryBlocks.join("")).toString();
        }
      }
      hash = CryptoJS.SHA256(hash + memoryBlocks.join("")).toString();
    }
    while (hash.length < opts.keyLength * 2) {
      hash += CryptoJS.SHA256(hash).toString();
    }
    hash = hash.substring(0, opts.keyLength * 2);
    let keyString = hash;
    if (opts.outputFormat === "base64") {
      const wordArray = CryptoJS.enc.Hex.parse(hash);
      keyString = CryptoJS.enc.Base64.stringify(wordArray);
    }
    return {
      key: keyString,
      salt,
      algorithm: "Argon2id",
      parameters: {
        iterations: opts.timeCost || opts.iterations,
        keyLength: opts.keyLength,
        memoryCost: opts.memoryCost,
        parallelism: opts.parallelism,
        timeCost: opts.timeCost
      }
    };
  }
  /**
   * 验证密码
   */
  verify(password, derivedKey, salt, options = {}) {
    const result = this.derive(password, { ...options, salt });
    return result.key === derivedKey;
  }
  /**
   * 推荐的安全参数
   */
  getRecommendedParameters(securityLevel = "medium") {
    switch (securityLevel) {
      case "low":
        return {
          timeCost: 2,
          memoryCost: 2048,
          // 2 MB
          parallelism: 1,
          keyLength: 16
        };
      case "high":
        return {
          timeCost: 4,
          memoryCost: 8192,
          // 8 MB
          parallelism: 2,
          keyLength: 64
        };
      case "medium":
      default:
        return {
          timeCost: 3,
          memoryCost: 4096,
          // 4 MB
          parallelism: 1,
          keyLength: 32
        };
    }
  }
}
class Scrypt {
  constructor() {
    this.defaultOptions = {
      iterations: 16384,
      // N = 2^14
      keyLength: 32,
      salt: "",
      memoryCost: 8,
      // r = 8
      parallelism: 1,
      // p = 1
      outputFormat: "hex"
    };
  }
  /**
   * 派生密钥（简化实现）
   * 注意：这是一个简化的实现，实际应使用专门的 scrypt 库
   */
  derive(password, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const salt = opts.salt || index.RandomUtils.generateSalt(16);
    let derivedKey = CryptoJS.PBKDF2(password, salt, {
      keySize: opts.keyLength / 4,
      iterations: 1,
      hasher: CryptoJS.algo.SHA256
    }).toString();
    const blocks = [];
    for (let i = 0; i < opts.iterations; i++) {
      derivedKey = CryptoJS.SHA256(derivedKey + i).toString();
      blocks.push(derivedKey);
    }
    for (let i = 0; i < opts.iterations; i++) {
      const j = Number.parseInt(derivedKey.substring(0, 8), 16) % blocks.length;
      derivedKey = CryptoJS.SHA256(derivedKey + blocks[j]).toString();
    }
    const finalKey = CryptoJS.PBKDF2(derivedKey, salt, {
      keySize: opts.keyLength / 4,
      iterations: 1,
      hasher: CryptoJS.algo.SHA256
    });
    let keyString;
    switch (opts.outputFormat) {
      case "base64":
        keyString = CryptoJS.enc.Base64.stringify(finalKey);
        break;
      case "raw":
        keyString = finalKey.toString();
        break;
      case "hex":
      default:
        keyString = finalKey.toString(CryptoJS.enc.Hex);
    }
    return {
      key: keyString,
      salt,
      algorithm: "scrypt",
      parameters: {
        iterations: opts.iterations,
        keyLength: opts.keyLength,
        memoryCost: opts.memoryCost,
        parallelism: opts.parallelism
      }
    };
  }
  /**
   * 验证密码
   */
  verify(password, derivedKey, salt, options = {}) {
    const result = this.derive(password, { ...options, salt });
    return result.key === derivedKey;
  }
  /**
   * 推荐的安全参数
   */
  getRecommendedParameters(securityLevel = "medium") {
    switch (securityLevel) {
      case "low":
        return {
          iterations: 8192,
          // N = 2^13
          memoryCost: 8,
          parallelism: 1,
          keyLength: 16
        };
      case "high":
        return {
          iterations: 32768,
          // N = 2^15
          memoryCost: 8,
          parallelism: 2,
          keyLength: 64
        };
      case "medium":
      default:
        return {
          iterations: 16384,
          // N = 2^14
          memoryCost: 8,
          parallelism: 1,
          keyLength: 32
        };
    }
  }
}
class KDFManager {
  constructor() {
    this.pbkdf2 = new PBKDF2();
    this.argon2 = new Argon2();
    this.scrypt = new Scrypt();
  }
  /**
   * 派生密钥
   */
  derive(password, algorithm = "pbkdf2", options) {
    switch (algorithm) {
      case "argon2":
        return this.argon2.derive(password, options);
      case "scrypt":
        return this.scrypt.derive(password, options);
      case "pbkdf2":
      default:
        return this.pbkdf2.derive(password, options);
    }
  }
  /**
   * 派生密钥（异步版本）
   */
  async deriveKey(password, salt, algorithm = "pbkdf2", options) {
    return this.derive(password, algorithm, { ...options, salt });
  }
  /**
   * 验证密码
   */
  verify(password, derivedKey, salt, algorithm = "pbkdf2", options) {
    switch (algorithm) {
      case "argon2":
        return this.argon2.verify(password, derivedKey, salt, options);
      case "scrypt":
        return this.scrypt.verify(password, derivedKey, salt, options);
      case "pbkdf2":
      default:
        return this.pbkdf2.verify(password, derivedKey, salt, options);
    }
  }
  /**
   * 获取推荐参数
   */
  getRecommendedParameters(algorithm = "pbkdf2", securityLevel = "medium") {
    switch (algorithm) {
      case "argon2":
        return this.argon2.getRecommendedParameters(securityLevel);
      case "scrypt":
        return this.scrypt.getRecommendedParameters(securityLevel);
      case "pbkdf2":
      default:
        return this.pbkdf2.getRecommendedParameters(securityLevel);
    }
  }
  /**
   * 基准测试 - 测试不同参数的性能
   */
  async benchmark(algorithm, password = "test") {
    const results = [];
    const securityLevels = ["low", "medium", "high"];
    for (const level of securityLevels) {
      let params = this.getRecommendedParameters(algorithm, level);
      if (algorithm === "pbkdf2") {
        params = {
          ...params,
          iterations: level === "low" ? 1e3 : level === "medium" ? 5e3 : 1e4
        };
      }
      const startTime = performance.now();
      for (let i = 0; i < 3; i++) {
        this.derive(password + i, algorithm, params);
      }
      const endTime = performance.now();
      const timeMs = (endTime - startTime) / 3;
      results.push({
        algorithm: `${algorithm}-${level}`,
        parameters: params,
        timeMs,
        opsPerSecond: 1e3 / timeMs
      });
    }
    return results;
  }
}
const pbkdf2 = new PBKDF2();
const argon2 = new Argon2();
const scrypt = new Scrypt();
const kdfManager = new KDFManager();

exports.Argon2 = Argon2;
exports.KDFManager = KDFManager;
exports.PBKDF2 = PBKDF2;
exports.Scrypt = Scrypt;
exports.argon2 = argon2;
exports.kdfManager = kdfManager;
exports.pbkdf2 = pbkdf2;
exports.scrypt = scrypt;
//# sourceMappingURL=kdf.cjs.map
