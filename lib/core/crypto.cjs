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

var aes = require('../algorithms/aes.cjs');
var blowfish = require('../algorithms/blowfish.cjs');
var des = require('../algorithms/des.cjs');
var encoding = require('../algorithms/encoding.cjs');
var hash = require('../algorithms/hash.cjs');
var rsa = require('../algorithms/rsa.cjs');
var tripledes = require('../algorithms/tripledes.cjs');
var index = require('../utils/index.cjs');

class Encrypt {
  /**
   * AES 加密
   */
  aes(data, key, options) {
    return aes.aes.encrypt(data, key, options);
  }
  /**
   * AES-128 加密
   */
  aes128(data, key, options) {
    return aes.aes.encrypt128(data, key, options);
  }
  /**
   * AES-192 加密
   */
  aes192(data, key, options) {
    return aes.aes.encrypt192(data, key, options);
  }
  /**
   * AES-256 加密
   */
  aes256(data, key, options) {
    return aes.aes.encrypt256(data, key, options);
  }
  /**
   * RSA 加密
   */
  rsa(data, publicKey, options) {
    return rsa.rsa.encrypt(data, publicKey, options);
  }
  /**
   * DES 加密
   */
  des(data, key, options) {
    return des.des.encrypt(data, key, options);
  }
  /**
   * 3DES 加密
   */
  des3(data, key, options) {
    return tripledes.des3.encrypt(data, key, options);
  }
  /**
   * Triple DES 加密 (别名)
   */
  tripledes(data, key, options) {
    return tripledes.tripledes.encrypt(data, key, options);
  }
  /**
   * Blowfish 加密
   */
  blowfish(data, key, options) {
    return blowfish.blowfish.encrypt(data, key, options);
  }
  /**
   * 通用加密方法
   * 根据算法类型自动选择合适的加密方法
   */
  encrypt(data, key, algorithm, options) {
    switch (algorithm.toUpperCase()) {
      case "AES":
        return this.aes(data, key, options);
      case "RSA":
        return this.rsa(data, key, options);
      case "DES":
        return this.des(data, key, options);
      case "3DES":
        return this.des3(data, key, options);
      case "BLOWFISH":
        return this.blowfish(data, key, options);
      default:
        return {
          success: false,
          error: `Unsupported encryption algorithm: ${algorithm}`,
          algorithm
        };
    }
  }
  /**
   * Base64 编码
   */
  base64(data) {
    return encoding.encoding.base64.encode(data);
  }
  /**
   * URL 安全的 Base64 编码
   */
  base64Url(data) {
    return encoding.encoding.base64.encodeUrl(data);
  }
  /**
   * Hex 编码
   */
  hex(data) {
    return encoding.encoding.hex.encode(data);
  }
  /**
   * 通用编码
   */
  encode(data, encodingType) {
    return encoding.encoding.encode(data, encodingType);
  }
}
class Decrypt {
  constructor() {
    this.encoder = encoding.Encoder.getInstance();
  }
  /**
   * AES 解密
   */
  aes(encryptedData, key, options) {
    return aes.aes.decrypt(encryptedData, key, options);
  }
  /**
   * AES-128 解密
   */
  aes128(encryptedData, key, options) {
    return aes.aes.decrypt128(encryptedData, key, options);
  }
  /**
   * AES-192 解密
   */
  aes192(encryptedData, key, options) {
    return aes.aes.decrypt192(encryptedData, key, options);
  }
  /**
   * AES-256 解密
   */
  aes256(encryptedData, key, options) {
    return aes.aes.decrypt256(encryptedData, key, options);
  }
  /**
   * RSA 解密
   */
  rsa(encryptedData, privateKey, options) {
    return rsa.rsa.decrypt(encryptedData, privateKey, options);
  }
  /**
   * DES 解密
   */
  des(encryptedData, key, options) {
    return des.des.decrypt(encryptedData, key, options);
  }
  /**
   * 3DES 解密
   */
  des3(encryptedData, key, options) {
    return tripledes.des3.decrypt(encryptedData, key, options);
  }
  /**
   * Triple DES 解密 (别名)
   */
  tripledes(encryptedData, key, options) {
    return tripledes.tripledes.decrypt(encryptedData, key, options);
  }
  /**
   * Blowfish 解密
   */
  blowfish(encryptedData, key, options) {
    return blowfish.blowfish.decrypt(encryptedData, key, options);
  }
  /**
   * 通用解密方法
   * 根据算法类型自动选择合适的解密方法
   */
  decrypt(encryptedData, key, algorithm, options) {
    let targetAlgorithm = algorithm;
    if (typeof encryptedData === "object" && encryptedData.algorithm) {
      targetAlgorithm = encryptedData.algorithm;
    }
    if (!targetAlgorithm) {
      return {
        success: false,
        error: "Algorithm must be specified for decryption",
        algorithm: "Unknown"
      };
    }
    switch (targetAlgorithm.toUpperCase()) {
      case "AES":
        return this.aes(encryptedData, key, options);
      case "RSA":
        return this.rsa(encryptedData, key, options);
      case "DES":
        return this.des(encryptedData, key, options);
      case "3DES":
        return this.des3(encryptedData, key, options);
      case "BLOWFISH":
        return this.blowfish(encryptedData, key, options);
      default:
        return {
          success: false,
          error: `Unsupported decryption algorithm: ${targetAlgorithm}`,
          algorithm: targetAlgorithm
        };
    }
  }
  /**
   * Base64 解码
   */
  base64(encodedData) {
    return encoding.encoding.base64.decode(encodedData);
  }
  /**
   * URL 安全的 Base64 解码
   */
  base64Url(encodedData) {
    return encoding.encoding.base64.decodeUrl(encodedData);
  }
  /**
   * Hex 解码
   */
  hex(encodedData) {
    return encoding.encoding.hex.decode(encodedData);
  }
  /**
   * 通用解码
   */
  decode(encodedData, encoding2) {
    return this.encoder.decode(encodedData, encoding2);
  }
}
class Hash {
  constructor() {
    this.hasher = new hash.Hasher();
  }
  /**
   * MD5 哈希
   */
  md5(data, options) {
    return this.hasher.hash(data, "MD5", options);
  }
  /**
   * SHA1 哈希
   */
  sha1(data, options) {
    return this.hasher.hash(data, "SHA1", options);
  }
  /**
   * SHA224 哈希
   */
  sha224(data, options) {
    return this.hasher.hash(data, "SHA224", options);
  }
  /**
   * SHA256 哈希
   */
  sha256(data, options) {
    return this.hasher.hash(data, "SHA256", options);
  }
  /**
   * SHA384 哈希
   */
  sha384(data, options) {
    return this.hasher.hash(data, "SHA384", options);
  }
  /**
   * SHA512 哈希
   */
  sha512(data, options) {
    return this.hasher.hash(data, "SHA512", options);
  }
  /**
   * 通用哈希方法
   */
  hash(data, algorithm = "SHA256", options) {
    return this.hasher.hash(data, algorithm, options);
  }
  /**
   * 验证哈希
   */
  verify(data, expectedHash, algorithm = "SHA256", options) {
    return this.hasher.verify(data, expectedHash, algorithm, options);
  }
}
class HMAC {
  constructor() {
    this.hmacHasher = new hash.HMACHasher();
  }
  /**
   * HMAC-MD5
   */
  md5(data, key, options) {
    return this.hmacHasher.hmac(data, key, "MD5", options).hash;
  }
  /**
   * HMAC-SHA1
   */
  sha1(data, key, options) {
    return this.hmacHasher.hmac(data, key, "SHA1", options).hash;
  }
  /**
   * HMAC-SHA256
   */
  sha256(data, key, options) {
    return this.hmacHasher.hmac(data, key, "SHA256", options).hash;
  }
  /**
   * HMAC-SHA384
   */
  sha384(data, key, options) {
    return this.hmacHasher.hmac(data, key, "SHA384", options).hash;
  }
  /**
   * HMAC-SHA512
   */
  sha512(data, key, options) {
    return this.hmacHasher.hmac(data, key, "SHA512", options).hash;
  }
  /**
   * 通用 HMAC
   */
  hmac(data, key, algorithm = "SHA256", options) {
    switch (algorithm.toUpperCase()) {
      case "MD5":
        return this.md5(data, key, options);
      case "SHA1":
        return this.sha1(data, key, options);
      case "SHA256":
        return this.sha256(data, key, options);
      case "SHA384":
        return this.sha384(data, key, options);
      case "SHA512":
        return this.sha512(data, key, options);
      default:
        return this.sha256(data, key, options);
    }
  }
  /**
   * 验证 HMAC
   */
  verify(data, key, expectedHmac, algorithm = "SHA256", options) {
    return this.hmacHasher.verify(data, key, expectedHmac, algorithm, options);
  }
}
class KeyGenerator {
  /**
   * 生成 RSA 密钥对
   */
  generateRSAKeyPair(keySize = index.CONSTANTS.RSA.DEFAULT_KEY_SIZE) {
    return rsa.rsa.generateKeyPair(keySize);
  }
  /**
   * 生成随机密钥
   */
  generateKey(length = 32) {
    return index.RandomUtils.generateKey(length);
  }
  /**
   * 生成随机字节
   */
  generateRandomBytes(length) {
    return index.RandomUtils.generateRandomString(length);
  }
  /**
   * 生成盐值
   */
  generateSalt(length = 16) {
    return index.RandomUtils.generateSalt(length);
  }
  /**
   * 生成初始化向量
   */
  generateIV(length = 16) {
    return index.RandomUtils.generateIV(length);
  }
}
class DigitalSignature {
  /**
   * RSA 签名
   */
  sign(data, privateKey, algorithm = "sha256") {
    return rsa.rsa.sign(data, privateKey, algorithm);
  }
  /**
   * RSA 验证签名
   */
  verify(data, signature, publicKey, algorithm = "sha256") {
    return rsa.rsa.verify(data, signature, publicKey, algorithm);
  }
}

exports.Decrypt = Decrypt;
exports.DigitalSignature = DigitalSignature;
exports.Encrypt = Encrypt;
exports.HMAC = HMAC;
exports.Hash = Hash;
exports.KeyGenerator = KeyGenerator;
//# sourceMappingURL=crypto.cjs.map
