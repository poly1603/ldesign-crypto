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
var advancedValidation = require('./advanced-validation.cjs');
var benchmark = require('./benchmark.cjs');
var compression = require('./compression.cjs');
var cryptoHelpers = require('./crypto-helpers.cjs');
var errors = require('./errors.cjs');
var keyDerivation = require('./key-derivation.cjs');
var keyRotation = require('./key-rotation.cjs');
var lruCache = require('./lru-cache.cjs');
var objectPool = require('./object-pool.cjs');
var performanceLogger = require('./performance-logger.cjs');
var rateLimiter = require('./rate-limiter.cjs');
var secureStorage = require('./secure-storage.cjs');

class StringUtils {
  /**
   * 字符串转 WordArray
   * @param str 输入的 UTF-8 字符串
   * @returns CryptoJS 的 WordArray 表示
   */
  static stringToWordArray(str) {
    return CryptoJS.enc.Utf8.parse(str);
  }
  /**
   * WordArray 转字符串
   * @param wordArray CryptoJS WordArray
   * @returns UTF-8 字符串
   */
  static wordArrayToString(wordArray) {
    return CryptoJS.enc.Utf8.stringify(wordArray);
  }
  /**
   * 字符串转 Base64
   * @param str 输入 UTF-8 字符串
   * @returns Base64 字符串
   */
  static stringToBase64(str) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
  }
  /**
   * Base64 转字符串
   * @param base64 Base64 字符串
   * @returns UTF-8 字符串
   */
  static base64ToString(base64) {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64));
  }
  /**
   * 字符串转 Hex
   * @param str 输入 UTF-8 字符串
   * @returns 十六进制字符串
   */
  static stringToHex(str) {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(str));
  }
  /**
   * Hex 转字符串
   * @param hex 十六进制字符串
   * @returns UTF-8 字符串
   */
  static hexToString(hex) {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(hex));
  }
  /**
   * 根据编码类型转换字符串
   * @param str 输入 UTF-8 字符串
   * @param encoding 'base64' | 'hex' | 'utf8'
   */
  static encodeString(str, encoding) {
    switch (encoding) {
      case "base64":
        return this.stringToBase64(str);
      case "hex":
        return this.stringToHex(str);
      case "utf8":
      default:
        return str;
    }
  }
  /**
   * 根据编码类型解码字符串
   * @param encodedStr 已编码的字符串
   * @param encoding 'base64' | 'hex' | 'utf8'
   */
  static decodeString(encodedStr, encoding) {
    switch (encoding) {
      case "base64":
        return this.base64ToString(encodedStr);
      case "hex":
        return this.hexToString(encodedStr);
      case "utf8":
      default:
        return encodedStr;
    }
  }
}
class RandomUtils {
  /**
   * 生成随机字节
   * @param length 字节长度
   */
  static generateRandomBytes(length) {
    return CryptoJS.lib.WordArray.random(length);
  }
  /**
   * 生成随机字符串
   * @param length 字节长度（将被转换为不同编码的字符串）
   * @param encoding 输出编码类型：'base64' | 'hex' | 'utf8'（默认 hex）
   */
  static generateRandomString(length, encoding = "hex") {
    const randomBytes = this.generateRandomBytes(length);
    switch (encoding) {
      case "base64":
        return CryptoJS.enc.Base64.stringify(randomBytes);
      case "hex":
        return CryptoJS.enc.Hex.stringify(randomBytes);
      case "utf8":
        return CryptoJS.enc.Utf8.stringify(randomBytes);
      default:
        return CryptoJS.enc.Hex.stringify(randomBytes);
    }
  }
  /**
   * 生成盐值
   * @param length 盐值字节长度（默认 16）
   * @returns 十六进制字符串
   */
  static generateSalt(length = 16) {
    return this.generateRandomString(length, "hex");
  }
  /**
   * 生成初始化向量 (IV)
   * @param length IV 字节长度（默认 16）
   * @returns 十六进制字符串
   */
  static generateIV(length = 16) {
    return this.generateRandomString(length, "hex");
  }
  /**
   * 生成随机密钥
   * @param length 期望的字节长度，返回的十六进制字符串长度为 length * 2
   * @returns 十六进制字符串
   */
  static generateKey(length = 32) {
    return this.generateRandomString(length, "hex");
  }
}
class ValidationUtils {
  /**
   * 验证字符串是否为空
   * @param str 目标字符串
   */
  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }
  /**
   * 验证是否为有效的 Base64 字符串
   * 兼容浏览器与 Node 环境（无 atob/btoa 时使用正则与 CryptoJS 校验）
   * @param str Base64 字符串
   */
  static isValidBase64(str) {
    if (typeof str !== "string") {
      return false;
    }
    if (str.length === 0) {
      return true;
    }
    if (str.length % 4 !== 0) {
      return false;
    }
    if (!/^[A-Z0-9+/]+={0,2}$/i.test(str)) {
      return false;
    }
    try {
      if (typeof atob === "function" && typeof btoa === "function") {
        return btoa(atob(str)) === str;
      }
    } catch {
    }
    try {
      const wa = CryptoJS.enc.Base64.parse(str);
      const roundtrip = CryptoJS.enc.Base64.stringify(wa);
      return roundtrip.replace(/=+$/, "") === str.replace(/=+$/, "");
    } catch {
      return false;
    }
  }
  /**
   * 验证是否为有效的 Hex 字符串
   * @param str 十六进制字符串
   */
  static isValidHex(str) {
    if (str === "") {
      return true;
    }
    return /^[0-9a-f]+$/i.test(str) && str.length % 2 === 0;
  }
  /**
   * 验证密钥长度
   * @param key 密钥字符串
   * @param expectedLength 期望字节长度
   */
  static validateKeyLength(key, expectedLength) {
    return key.length === expectedLength;
  }
  /**
   * 验证 AES 密钥长度
   * @param key 明文密钥字符串
   * @param keySize 位数（128/192/256）
   */
  static validateAESKeyLength(key, keySize) {
    const expectedLength = keySize / 8;
    return key.length >= expectedLength;
  }
}
class ErrorUtils {
  /**
   * 创建加密错误
   */
  static createEncryptionError(message, algorithm) {
    const error = new Error(`Encryption Error${algorithm ? ` (${algorithm})` : ""}: ${message}`);
    error.name = "EncryptionError";
    return error;
  }
  /**
   * 创建解密错误
   */
  static createDecryptionError(message, algorithm) {
    const error = new Error(`Decryption Error${algorithm ? ` (${algorithm})` : ""}: ${message}`);
    error.name = "DecryptionError";
    return error;
  }
  /**
   * 创建哈希错误
   */
  static createHashError(message, algorithm) {
    const error = new Error(`Hash Error${algorithm ? ` (${algorithm})` : ""}: ${message}`);
    error.name = "HashError";
    return error;
  }
  /**
   * 创建验证错误
   */
  static createValidationError(message) {
    const error = new Error(`Validation Error: ${message}`);
    error.name = "ValidationError";
    return error;
  }
  /**
   * 处理错误
   */
  static handleError(error, context) {
    const message = error instanceof Error ? error.message : String(error);
    return context ? `${context}: ${message}` : message;
  }
}
const CONSTANTS = {
  // AES 相关常量
  AES: {
    KEY_SIZES: [128, 192, 256],
    MODES: ["CBC", "ECB", "CFB", "OFB", "CTR", "GCM"],
    DEFAULT_MODE: "CBC",
    DEFAULT_KEY_SIZE: 256,
    IV_LENGTH: 16
  },
  // RSA 相关常量
  RSA: {
    KEY_SIZES: [1024, 2048, 3072, 4096],
    DEFAULT_KEY_SIZE: 2048
  },
  // 哈希相关常量
  HASH: {
    ALGORITHMS: [
      "MD5",
      "SHA1",
      "SHA224",
      "SHA256",
      "SHA384",
      "SHA512"
    ]
  },
  // HMAC 相关常量
  HMAC: {
    ALGORITHMS: [
      "HMAC-MD5",
      "HMAC-SHA1",
      "HMAC-SHA256",
      "HMAC-SHA384",
      "HMAC-SHA512"
    ]
  },
  // 编码相关常量
  ENCODING: {
    TYPES: ["base64", "hex", "utf8"],
    DEFAULT: "hex"
  }
};

exports.AdvancedValidator = advancedValidation.AdvancedValidator;
exports.Benchmark = benchmark.Benchmark;
exports.compareBenchmark = benchmark.compareBenchmark;
exports.createBenchmark = benchmark.createBenchmark;
exports.quickBenchmark = benchmark.quickBenchmark;
exports.DataCompressor = compression.DataCompressor;
exports.compress = compression.compress;
exports.decompress = compression.decompress;
exports.createCryptoJSConfig = cryptoHelpers.createCryptoJSConfig;
exports.getCryptoJSMode = cryptoHelpers.getCryptoJSMode;
exports.getCryptoJSPadding = cryptoHelpers.getCryptoJSPadding;
exports.getErrorMessage = cryptoHelpers.getErrorMessage;
exports.CryptoError = errors.CryptoError;
Object.defineProperty(exports, "CryptoErrorCode", {
    enumerable: true,
    get: function () { return errors.CryptoErrorCode; }
});
exports.CryptoErrorFactory = errors.CryptoErrorFactory;
exports.DecryptionError = errors.DecryptionError;
exports.EncodingError = errors.EncodingError;
exports.EncryptionError = errors.EncryptionError;
exports.ErrorHandler = errors.ErrorHandler;
exports.HashError = errors.HashError;
exports.KeyManagementError = errors.KeyManagementError;
exports.RateLimitError = errors.RateLimitError;
exports.StorageError = errors.StorageError;
exports.ValidationError = errors.ValidationError;
exports.KeyDerivation = keyDerivation.KeyDerivation;
exports.deriveKey = keyDerivation.deriveKey;
exports.generateSalt = keyDerivation.generateSalt;
exports.verifyKey = keyDerivation.verifyKey;
exports.KeyRotation = keyRotation.KeyRotation;
exports.createKeyRotation = keyRotation.createKeyRotation;
exports.LRUCache = lruCache.LRUCache;
exports.DecryptResultPool = objectPool.DecryptResultPool;
exports.EncryptResultPool = objectPool.EncryptResultPool;
exports.ObjectPool = objectPool.ObjectPool;
exports.acquireDecryptResult = objectPool.acquireDecryptResult;
exports.acquireEncryptResult = objectPool.acquireEncryptResult;
exports.clearAllPools = objectPool.clearAllPools;
exports.createDecryptFailure = objectPool.createDecryptFailure;
exports.createDecryptSuccess = objectPool.createDecryptSuccess;
exports.createEncryptFailure = objectPool.createEncryptFailure;
exports.createEncryptSuccess = objectPool.createEncryptSuccess;
exports.getAllPoolStats = objectPool.getAllPoolStats;
exports.globalDecryptResultPool = objectPool.globalDecryptResultPool;
exports.globalEncryptResultPool = objectPool.globalEncryptResultPool;
exports.releaseDecryptResult = objectPool.releaseDecryptResult;
exports.releaseEncryptResult = objectPool.releaseEncryptResult;
exports.PerformanceLogger = performanceLogger.PerformanceLogger;
exports.globalPerformanceLogger = performanceLogger.globalPerformanceLogger;
exports.measurePerformance = performanceLogger.measurePerformance;
exports.RateLimiter = rateLimiter.RateLimiter;
exports.createFixedWindowLimiter = rateLimiter.createFixedWindowLimiter;
exports.createSlidingWindowLimiter = rateLimiter.createSlidingWindowLimiter;
exports.createTokenBucketLimiter = rateLimiter.createTokenBucketLimiter;
exports.SecureStorage = secureStorage.SecureStorage;
exports.createSecureStorage = secureStorage.createSecureStorage;
exports.CONSTANTS = CONSTANTS;
exports.ErrorUtils = ErrorUtils;
exports.RandomUtils = RandomUtils;
exports.StringUtils = StringUtils;
exports.ValidationUtils = ValidationUtils;
//# sourceMappingURL=index.cjs.map
