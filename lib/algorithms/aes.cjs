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
var lruCache = require('../utils/lru-cache.cjs');

class AESEncryptor {
  constructor() {
    this.defaultOptions = {
      mode: index.CONSTANTS.AES.DEFAULT_MODE,
      keySize: index.CONSTANTS.AES.DEFAULT_KEY_SIZE,
      iv: "",
      padding: "Pkcs7",
      salt: void 0,
      // 将使用密钥的SHA-256作为盐值
      iterations: 1e5
      // OWASP 2023推荐
    };
  }
  /**
   * 获取默认选项（公开方法，用于外部访问）
   */
  static getDefaultOptions() {
    return {
      mode: index.CONSTANTS.AES.DEFAULT_MODE,
      keySize: index.CONSTANTS.AES.DEFAULT_KEY_SIZE,
      iv: "",
      padding: "Pkcs7",
      salt: void 0,
      // 将使用密钥的SHA-256作为盐值
      iterations: 1e5
      // OWASP 2023推荐
    };
  }
  /**
   * AES 加密
   *
   * @param data 明文字符串（允许为空字符串）
   * @param key 加密密钥；可传入普通字符串（将通过 PBKDF2-SHA256 派生），或十六进制字符串（长度需与 keySize 匹配）
   * @param options 可选项：mode、keySize、iv（十六进制）、padding
   * @returns EncryptResult 包含加密后字符串（默认使用 CryptoJS 默认格式，通常为 Base64）以及算法、模式、IV 等信息
   *
   * @example
   * ```ts
   * const res = new AESEncryptor().encrypt('hello', 'secret', { keySize: 256, mode: 'CBC' })
   * if (res.success)
   * ```
   */
  encrypt(data, key, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    try {
      if (index.ValidationUtils.isEmpty(key)) {
        throw index.ErrorUtils.createEncryptionError("Key cannot be empty", "AES");
      }
      if (opts.keySize && ![128, 192, 256].includes(opts.keySize)) {
        throw index.ErrorUtils.createEncryptionError("Invalid key size. Must be 128, 192, or 256", "AES");
      }
      const validModes = ["CBC", "ECB", "CFB", "OFB", "CTR"];
      if (opts.mode && !validModes.includes(opts.mode)) {
        throw index.ErrorUtils.createEncryptionError(`Invalid mode. Must be one of: ${validModes.join(", ")}`, "AES");
      }
      if (opts.iv && opts.iv.length !== index.CONSTANTS.AES.IV_LENGTH * 2) {
        throw index.ErrorUtils.createEncryptionError(`Invalid IV length. Must be ${index.CONSTANTS.AES.IV_LENGTH * 2} characters (hex)`, "AES");
      }
      const iv = opts.iv || index.RandomUtils.generateIV(index.CONSTANTS.AES.IV_LENGTH);
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      const keyWordArray = this.prepareKey(key, opts.keySize);
      const mode = this.getMode(opts.mode);
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray
      };
      const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, config);
      return {
        success: true,
        data: encrypted.toString(),
        algorithm: "AES",
        mode: opts.mode,
        keySize: opts.keySize,
        iv
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw index.ErrorUtils.createEncryptionError("Unknown encryption error", "AES");
    }
  }
  /**
   * AES 解密
   *
   * @param encryptedData 加密后的字符串，或加密结果对象（包含算法、模式、iv、keySize 等）
   * @param key 解密密钥；规则与加密相同
   * @param options 可选项：mode、keySize、iv（十六进制）、padding。若传入字符串且未提供 iv，将尝试使用 CryptoJS 默认格式自动解析
   * @returns DecryptResult 包含解密后的明文字符串
   *
   * @example
   * ```ts
   * const enc = new AESEncryptor().encrypt('hello', 'secret')
   * const dec = new AESEncryptor().decrypt(enc, 'secret')
   * ```
   */
  decrypt(encryptedData, key, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    try {
      if (index.ValidationUtils.isEmpty(key)) {
        throw index.ErrorUtils.createDecryptionError("Key cannot be empty", "AES");
      }
      const decryptParams = this.extractDecryptParams(encryptedData, opts, key);
      if (decryptParams.isDefaultFormat) {
        if (decryptParams.result) {
          return decryptParams.result;
        }
        return {
          success: false,
          data: "",
          algorithm: "AES",
          error: "Decryption failed"
        };
      }
      return this.performStandardDecryption(decryptParams.ciphertext, decryptParams.iv, key, decryptParams.keySize, decryptParams.mode);
    } catch (error) {
      return this.createDecryptErrorResult(error, opts.mode);
    }
  }
  /**
   * 提取解密参数
   * 优化：将参数提取逻辑独立出来，使主方法更清晰
   */
  extractDecryptParams(encryptedData, opts, key) {
    if (typeof encryptedData === "string") {
      const iv2 = opts.iv;
      if (!iv2) {
        const result = this.tryDecryptWithDefaultFormat(encryptedData, key, opts.mode);
        return {
          ciphertext: "",
          iv: "",
          keySize: opts.keySize,
          mode: opts.mode,
          isDefaultFormat: true,
          result
        };
      }
      return {
        ciphertext: encryptedData,
        iv: iv2,
        keySize: opts.keySize,
        mode: opts.mode,
        isDefaultFormat: false
      };
    }
    const ciphertext = encryptedData.data || "";
    const iv = encryptedData.iv || opts.iv;
    if (!iv) {
      throw index.ErrorUtils.createDecryptionError("IV not found in encrypted data", "AES");
    }
    return {
      ciphertext,
      iv,
      keySize: encryptedData.keySize || opts.keySize,
      mode: encryptedData.mode || opts.mode,
      isDefaultFormat: false
    };
  }
  /**
   * 尝试使用CryptoJS默认格式解密
   * 优化：将默认格式解密逻辑提取为独立方法
   */
  tryDecryptWithDefaultFormat(encryptedData, key, mode) {
    try {
      try {
        CryptoJS.enc.Base64.parse(encryptedData);
      } catch {
        throw index.ErrorUtils.createDecryptionError("Invalid encrypted data format - not valid Base64", "AES");
      }
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      this.validateDecryptionResult(decrypted, decryptedString);
      return {
        success: true,
        data: decryptedString,
        algorithm: "AES",
        mode
      };
    } catch (error) {
      return this.createDecryptErrorResult(error, mode);
    }
  }
  /**
   * 执行标准解密流程
   * 优化：将标准解密逻辑提取为独立方法
   */
  performStandardDecryption(ciphertext, iv, key, keySize, mode) {
    const keyWordArray = this.prepareKey(key, keySize);
    const ivWordArray = CryptoJS.enc.Hex.parse(iv);
    const modeObject = this.getMode(mode);
    const config = {
      mode: modeObject,
      padding: CryptoJS.pad.Pkcs7,
      iv: ivWordArray
    };
    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, config);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    this.validateDecryptionResult(decrypted, decryptedString);
    return {
      success: true,
      data: decryptedString,
      algorithm: "AES",
      mode
    };
  }
  /**
   * 验证解密结果
   * 优化：提取验证逻辑，避免代码重复
   */
  validateDecryptionResult(decrypted, decryptedString) {
    if (decrypted.sigBytes < 0) {
      throw index.ErrorUtils.createDecryptionError("Failed to decrypt data - invalid key or corrupted data", "AES");
    }
    if (!this.validateUtf8String(decryptedString)) {
      throw index.ErrorUtils.createDecryptionError("Decrypted data contains invalid characters - wrong key", "AES");
    }
  }
  /**
   * 创建解密错误结果
   * 优化：统一错误处理逻辑
   */
  createDecryptErrorResult(error, mode) {
    if (error instanceof Error) {
      return {
        success: false,
        data: "",
        algorithm: "AES",
        mode,
        error: error.message
      };
    }
    return {
      success: false,
      data: "",
      algorithm: "AES",
      mode,
      error: "Unknown decryption error"
    };
  }
  /**
   * 验证 UTF-8 字符串有效性
   * 优化：提取为独立方法，避免代码重复
   */
  validateUtf8String(str) {
    if (str.length === 0) {
      return true;
    }
    try {
      const testEncode = CryptoJS.enc.Utf8.parse(str);
      const reEncoded = testEncode.toString(CryptoJS.enc.Utf8);
      return reEncoded === str;
    } catch {
      return false;
    }
  }
  /**
   * 准备密钥
   * 优化：使用 LRU 缓存，自动管理缓存大小和过期
   */
  prepareKey(key, keySize) {
    const cacheKey = CryptoJS.MD5(`${key}_${keySize}`).toString();
    const cachedKey = AESEncryptor.keyCache.get(cacheKey);
    if (cachedKey) {
      return cachedKey;
    }
    let keyWordArray;
    if (index.ValidationUtils.isValidHex(key)) {
      keyWordArray = CryptoJS.enc.Hex.parse(key);
      if (keyWordArray.sigBytes * 8 === keySize) {
        AESEncryptor.keyCache.set(cacheKey, keyWordArray);
        return keyWordArray;
      }
    }
    const salt = CryptoJS.SHA256(key);
    const iterations = 1e5;
    keyWordArray = CryptoJS.PBKDF2(key, salt, {
      keySize: keySize / 32,
      iterations
    });
    AESEncryptor.keyCache.set(cacheKey, keyWordArray);
    return keyWordArray;
  }
  /**
   * 获取加密模式（带缓存）
   */
  getMode(mode) {
    if (!mode) {
      return CryptoJS.mode.CBC;
    }
    const modeKey = mode.toUpperCase();
    const cachedMode = AESEncryptor.modeCache.get(modeKey);
    if (cachedMode) {
      return cachedMode;
    }
    let modeObject;
    switch (modeKey) {
      case "CBC":
        modeObject = CryptoJS.mode.CBC;
        break;
      case "ECB":
        modeObject = CryptoJS.mode.ECB;
        break;
      case "CFB":
        modeObject = CryptoJS.mode.CFB;
        break;
      case "OFB":
        modeObject = CryptoJS.mode.OFB;
        break;
      case "CTR":
        modeObject = CryptoJS.mode.CTR;
        break;
      default:
        modeObject = CryptoJS.mode.CBC;
    }
    AESEncryptor.modeCache.set(modeKey, modeObject);
    return modeObject;
  }
  /**
   * 从对象池获取WordArray
   */
  static getWordArrayFromPool() {
    return this.wordArrayPool.pop() || null;
  }
  /**
   * 归还WordArray到对象池
   */
  static returnWordArrayToPool(wordArray) {
    if (this.wordArrayPool.length < this.MAX_POOL_SIZE) {
      wordArray.words = [];
      wordArray.sigBytes = 0;
      this.wordArrayPool.push(wordArray);
    }
  }
  /**
   * 清理静态资源（供外部调用）
   */
  static cleanup() {
    this.keyCache.clear();
    this.modeCache.clear();
    this.wordArrayPool = [];
  }
}
AESEncryptor.keyCache = new lruCache.LRUCache({
  maxSize: 100,
  ttl: 5 * 60 * 1e3,
  updateAgeOnGet: true,
  maxMemorySize: 10 * 1024 * 1024
  // 10MB 内存限制
});
AESEncryptor.modeCache = /* @__PURE__ */ new Map();
AESEncryptor.wordArrayPool = [];
AESEncryptor.MAX_POOL_SIZE = 50;
const aes = {
  /**
   * AES 加密
   */
  encrypt: (data, key, options) => {
    try {
      const encryptor = new AESEncryptor();
      return encryptor.encrypt(data, key, options);
    } catch (error) {
      const opts = { ...AESEncryptor.getDefaultOptions(), ...options };
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: "AES",
          mode: opts.mode,
          keySize: opts.keySize,
          iv: "",
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: "AES",
        mode: opts.mode,
        keySize: opts.keySize,
        iv: "",
        error: "Unknown encryption error"
      };
    }
  },
  /**
   * AES 解密
   */
  decrypt: (encryptedData, key, options) => {
    try {
      const encryptor = new AESEncryptor();
      return encryptor.decrypt(encryptedData, key, options);
    } catch (error) {
      const opts = { ...AESEncryptor.getDefaultOptions(), ...options };
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: "AES",
          mode: opts.mode,
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: "AES",
        mode: opts.mode,
        error: "Unknown decryption error"
      };
    }
  },
  /**
   * AES-128 加密
   */
  encrypt128: (data, key, options) => {
    return aes.encrypt(data, key, { ...options, keySize: 128 });
  },
  /**
   * AES-192 加密
   */
  encrypt192: (data, key, options) => {
    return aes.encrypt(data, key, { ...options, keySize: 192 });
  },
  /**
   * AES-256 加密
   */
  encrypt256: (data, key, options) => {
    return aes.encrypt(data, key, { ...options, keySize: 256 });
  },
  /**
   * AES-128 解密
   */
  decrypt128: (encryptedData, key, options) => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 128 });
  },
  /**
   * AES-192 解密
   */
  decrypt192: (encryptedData, key, options) => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 192 });
  },
  /**
   * AES-256 解密
   */
  decrypt256: (encryptedData, key, options) => {
    return aes.decrypt(encryptedData, key, { ...options, keySize: 256 });
  }
};

exports.AESEncryptor = AESEncryptor;
exports.aes = aes;
//# sourceMappingURL=aes.cjs.map
