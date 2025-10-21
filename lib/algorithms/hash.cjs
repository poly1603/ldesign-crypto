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

class Hasher {
  constructor() {
    this.defaultOptions = {
      encoding: index.CONSTANTS.ENCODING.DEFAULT
    };
  }
  /**
   * 计算哈希值
   */
  hash(data, algorithm = "SHA256", options = {}) {
    try {
      const opts = { ...this.defaultOptions, ...options };
      let hashFunction;
      switch (algorithm.toUpperCase()) {
        case "MD5":
          hashFunction = CryptoJS.MD5;
          break;
        case "SHA1":
          hashFunction = CryptoJS.SHA1;
          break;
        case "SHA224":
          hashFunction = CryptoJS.SHA224;
          break;
        case "SHA256":
          hashFunction = CryptoJS.SHA256;
          break;
        case "SHA384":
          hashFunction = CryptoJS.SHA384;
          break;
        case "SHA512":
          hashFunction = CryptoJS.SHA512;
          break;
        default:
          throw index.ErrorUtils.createHashError(`Unsupported hash algorithm: ${algorithm}`);
      }
      const hashWordArray = hashFunction(data);
      let hashString;
      switch (opts.encoding) {
        case "base64":
          hashString = CryptoJS.enc.Base64.stringify(hashWordArray);
          break;
        case "hex":
          hashString = CryptoJS.enc.Hex.stringify(hashWordArray);
          break;
        case "utf8":
          hashString = CryptoJS.enc.Utf8.stringify(hashWordArray);
          break;
        default:
          hashString = CryptoJS.enc.Hex.stringify(hashWordArray);
      }
      return {
        success: true,
        hash: hashString,
        algorithm,
        encoding: opts.encoding
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw index.ErrorUtils.createHashError("Unknown hash error", algorithm);
    }
  }
  /**
   * 验证哈希值
   */
  verify(data, expectedHash, algorithm = "SHA256", options = {}) {
    try {
      const result = this.hash(data, algorithm, options);
      return result.hash === expectedHash;
    } catch {
      return false;
    }
  }
  /**
   * 计算文件哈希（模拟，实际应用中需要处理文件流）
   */
  hashFile(fileContent, algorithm = "SHA256", options = {}) {
    return this.hash(fileContent, algorithm, options);
  }
}
class HMACHasher {
  constructor() {
    this.defaultOptions = {
      encoding: index.CONSTANTS.ENCODING.DEFAULT
    };
  }
  /**
   * 计算 HMAC
   */
  hmac(data, key, algorithm = "SHA256", options = {}) {
    try {
      const opts = { ...this.defaultOptions, ...options };
      let hmacFunction;
      switch (algorithm.toUpperCase()) {
        case "MD5":
          hmacFunction = CryptoJS.HmacMD5;
          break;
        case "SHA1":
          hmacFunction = CryptoJS.HmacSHA1;
          break;
        case "SHA224":
          hmacFunction = CryptoJS.HmacSHA224;
          break;
        case "SHA256":
          hmacFunction = CryptoJS.HmacSHA256;
          break;
        case "SHA384":
          hmacFunction = CryptoJS.HmacSHA384;
          break;
        case "SHA512":
          hmacFunction = CryptoJS.HmacSHA512;
          break;
        default:
          throw index.ErrorUtils.createHashError(`Unsupported HMAC algorithm: ${algorithm}`);
      }
      const hmacWordArray = hmacFunction(data, key);
      let hmacString;
      switch (opts.encoding) {
        case "base64":
          hmacString = CryptoJS.enc.Base64.stringify(hmacWordArray);
          break;
        case "hex":
          hmacString = CryptoJS.enc.Hex.stringify(hmacWordArray);
          break;
        case "utf8":
          hmacString = CryptoJS.enc.Utf8.stringify(hmacWordArray);
          break;
        default:
          hmacString = CryptoJS.enc.Hex.stringify(hmacWordArray);
      }
      return {
        success: true,
        hash: hmacString,
        algorithm: `HMAC-${algorithm}`,
        encoding: opts.encoding
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw index.ErrorUtils.createHashError("Unknown HMAC error", `HMAC-${algorithm}`);
    }
  }
  /**
   * 验证 HMAC
   */
  verify(data, key, expectedHmac, algorithm = "SHA256", options = {}) {
    try {
      const result = this.hmac(data, key, algorithm, options);
      return result.hash === expectedHmac;
    } catch {
      return false;
    }
  }
}
const hash = {
  /**
   * MD5 哈希
   */
  md5: (data, options) => {
    const hasher = new Hasher();
    return hasher.hash(data, "MD5", options).hash;
  },
  /**
   * SHA1 哈希
   */
  sha1: (data, options) => {
    const hasher = new Hasher();
    return hasher.hash(data, "SHA1", options).hash;
  },
  /**
   * SHA224 哈希
   */
  sha224: (data, options) => {
    const hasher = new Hasher();
    return hasher.hash(data, "SHA224", options).hash;
  },
  /**
   * SHA256 哈希
   */
  sha256: (data, options) => {
    const hasher = new Hasher();
    return hasher.hash(data, "SHA256", options).hash;
  },
  /**
   * SHA384 哈希
   */
  sha384: (data, options) => {
    const hasher = new Hasher();
    return hasher.hash(data, "SHA384", options).hash;
  },
  /**
   * SHA512 哈希
   */
  sha512: (data, options) => {
    const hasher = new Hasher();
    return hasher.hash(data, "SHA512", options).hash;
  },
  /**
   * 通用哈希函数
   */
  hash: (data, algorithm = "SHA256", options) => {
    const hasher = new Hasher();
    return hasher.hash(data, algorithm, options).hash;
  },
  /**
   * 验证哈希
   */
  verify: (data, expectedHash, algorithm = "SHA256", options) => {
    const hasher = new Hasher();
    return hasher.verify(data, expectedHash, algorithm, options);
  }
};
const hmac = {
  /**
   * HMAC-MD5
   */
  md5: (data, key, options) => {
    const hasher = new HMACHasher();
    return hasher.hmac(data, key, "MD5", options).hash;
  },
  /**
   * HMAC-SHA1
   */
  sha1: (data, key, options) => {
    const hasher = new HMACHasher();
    return hasher.hmac(data, key, "SHA1", options).hash;
  },
  /**
   * HMAC-SHA256
   */
  sha256: (data, key, options) => {
    const hasher = new HMACHasher();
    return hasher.hmac(data, key, "SHA256", options).hash;
  },
  /**
   * HMAC-SHA384
   */
  sha384: (data, key, options) => {
    const hasher = new HMACHasher();
    return hasher.hmac(data, key, "SHA384", options).hash;
  },
  /**
   * HMAC-SHA512
   */
  sha512: (data, key, options) => {
    const hasher = new HMACHasher();
    return hasher.hmac(data, key, "SHA512", options).hash;
  },
  /**
   * 验证 HMAC
   */
  verify: (data, key, expectedHmac, algorithm = "SHA256", options) => {
    const hasher = new HMACHasher();
    return hasher.verify(data, key, expectedHmac, algorithm, options);
  }
};

exports.HMACHasher = HMACHasher;
exports.Hasher = Hasher;
exports.hash = hash;
exports.hmac = hmac;
//# sourceMappingURL=hash.cjs.map
