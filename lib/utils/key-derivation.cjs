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

class KeyDerivation {
  /**
   * 从密码派生密钥
   *
   * @param password 密码
   * @param options 派生选项
   * @returns 派生结果
   *
   * @example
   * ```typescript
   * const result = KeyDerivation.deriveKey('myPassword123')
   *  // 派生的密钥
   *  // 使用的盐值
   * ```
   */
  static deriveKey(password, options = {}) {
    const { salt = this.generateSalt(), iterations = this.DEFAULT_ITERATIONS, keySize = this.DEFAULT_KEY_SIZE, hasher = CryptoJS.algo.SHA256 } = options;
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize / 4,
      // CryptoJS使用32位字为单位
      iterations,
      hasher
    });
    return {
      key: key.toString(CryptoJS.enc.Hex),
      salt,
      iterations,
      keySize
    };
  }
  /**
   * 验证密码是否匹配派生的密钥
   *
   * @param password 要验证的密码
   * @param derivedKey 之前派生的密钥
   * @param salt 使用的盐值
   * @param options 派生选项
   * @returns 是否匹配
   *
   * @example
   * ```typescript
   * const result = KeyDerivation.deriveKey('myPassword123')
   * const isValid = KeyDerivation.verifyKey('myPassword123', result.key, result.salt)
   *  // true
   * ```
   */
  static verifyKey(password, derivedKey, salt, options = {}) {
    const result = this.deriveKey(password, { ...options, salt });
    return result.key === derivedKey;
  }
  /**
   * 生成随机盐值
   *
   * @param size 盐值大小（字节，默认16）
   * @returns 盐值（Hex字符串）
   */
  static generateSalt(size = this.SALT_SIZE) {
    return CryptoJS.lib.WordArray.random(size).toString(CryptoJS.enc.Hex);
  }
  /**
   * 从密码派生多个密钥
   *
   * @param password 密码
   * @param count 密钥数量
   * @param options 派生选项
   * @returns 派生的密钥数组
   *
   * @example
   * ```typescript
   * const keys = KeyDerivation.deriveMultipleKeys('myPassword', 3)
   * // 返回3个不同的密钥，可用于不同用途
   * ```
   */
  static deriveMultipleKeys(password, count, options = {}) {
    const results = [];
    const baseSalt = options.salt || this.generateSalt();
    for (let i = 0; i < count; i++) {
      const salt = CryptoJS.SHA256(`${baseSalt}:${i}`).toString(CryptoJS.enc.Hex);
      results.push(this.deriveKey(password, { ...options, salt }));
    }
    return results;
  }
  /**
   * 计算推荐的迭代次数
   *
   * 根据目标延迟时间计算合适的迭代次数
   *
   * @param targetDelayMs 目标延迟时间（毫秒，默认100ms）
   * @returns 推荐的迭代次数
   */
  static calculateIterations(targetDelayMs = 100) {
    const testPassword = "test-password-for-benchmark";
    const testSalt = this.generateSalt();
    const testIterations = 1e3;
    const startTime = performance.now();
    CryptoJS.PBKDF2(testPassword, testSalt, {
      keySize: this.DEFAULT_KEY_SIZE / 4,
      iterations: testIterations
    });
    const endTime = performance.now();
    const actualDelay = endTime - startTime;
    const ratio = targetDelayMs / actualDelay;
    const recommendedIterations = Math.floor(testIterations * ratio);
    return Math.max(1e3, recommendedIterations);
  }
  /**
   * 从密码派生加密密钥和HMAC密钥
   *
   * @param password 密码
   * @param options 派生选项
   * @returns 加密密钥和HMAC密钥
   *
   * @example
   * ```typescript
   * const { encryptionKey, hmacKey } = KeyDerivation.deriveEncryptionKeys('myPassword')
   * // 使用encryptionKey进行加密，使用hmacKey进行消息认证
   * ```
   */
  static deriveEncryptionKeys(password, options = {}) {
    const salt = options.salt || this.generateSalt();
    const encryptionKey = this.deriveKey(password, {
      ...options,
      salt: CryptoJS.SHA256(`${salt}:encryption`).toString(CryptoJS.enc.Hex)
    });
    const hmacKey = this.deriveKey(password, {
      ...options,
      salt: CryptoJS.SHA256(`${salt}:hmac`).toString(CryptoJS.enc.Hex)
    });
    return {
      encryptionKey,
      hmacKey,
      salt
    };
  }
  /**
   * 估算派生时间
   *
   * @param iterations 迭代次数
   * @returns 预估时间（毫秒）
   */
  static estimateDerivationTime(iterations) {
    const testPassword = "test";
    const testSalt = this.generateSalt();
    const testIterations = 1e3;
    const startTime = performance.now();
    CryptoJS.PBKDF2(testPassword, testSalt, {
      keySize: this.DEFAULT_KEY_SIZE / 4,
      iterations: testIterations
    });
    const endTime = performance.now();
    const timePerIteration = (endTime - startTime) / testIterations;
    return timePerIteration * iterations;
  }
}
KeyDerivation.DEFAULT_ITERATIONS = 1e4;
KeyDerivation.DEFAULT_KEY_SIZE = 32;
KeyDerivation.SALT_SIZE = 16;
function deriveKey(password, options) {
  return KeyDerivation.deriveKey(password, options);
}
function verifyKey(password, derivedKey, salt, options) {
  return KeyDerivation.verifyKey(password, derivedKey, salt, options);
}
function generateSalt(size) {
  return KeyDerivation.generateSalt(size);
}

exports.KeyDerivation = KeyDerivation;
exports.deriveKey = deriveKey;
exports.generateSalt = generateSalt;
exports.verifyKey = verifyKey;
//# sourceMappingURL=key-derivation.cjs.map
