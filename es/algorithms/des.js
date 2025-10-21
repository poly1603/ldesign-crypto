/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import CryptoJS from 'crypto-js';
import { RandomUtils, ValidationUtils, ErrorUtils } from '../utils/index.js';

class DESEncryptor {
  constructor() {
    this.defaultOptions = {
      mode: "CBC",
      iv: "",
      padding: "Pkcs7"
    };
  }
  /**
   * DES 加密
   */
  encrypt(data, key, options = {}) {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError("Data cannot be empty", "DES");
      }
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError("Key cannot be empty", "DES");
      }
      const opts = { ...this.defaultOptions, ...options };
      const iv = opts.iv || RandomUtils.generateIV(8);
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      const keyWordArray = this.prepareKey(key);
      const mode = this.getMode(opts.mode);
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray
      };
      const encrypted = CryptoJS.DES.encrypt(data, keyWordArray, config);
      return {
        success: true,
        data: encrypted.toString(),
        algorithm: "DES",
        mode: opts.mode,
        iv,
        keySize: 64
        // DES 密钥大小为 64 位
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, "DES encryption"),
        algorithm: "DES"
      };
    }
  }
  /**
   * DES 解密
   */
  decrypt(encryptedData, key, options = {}) {
    try {
      let ciphertext;
      let iv;
      if (typeof encryptedData === "string") {
        ciphertext = encryptedData;
        iv = options.iv;
      } else {
        ciphertext = encryptedData.data || "";
        iv = encryptedData.iv || options.iv;
      }
      if (ValidationUtils.isEmpty(ciphertext)) {
        throw ErrorUtils.createDecryptionError("Encrypted data cannot be empty", "DES");
      }
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError("Key cannot be empty", "DES");
      }
      const opts = { ...this.defaultOptions, ...options, iv };
      const keyWordArray = this.prepareKey(key);
      if (!opts.iv) {
        throw ErrorUtils.createDecryptionError("IV is required for decryption", "DES");
      }
      const ivWordArray = CryptoJS.enc.Hex.parse(opts.iv);
      const mode = this.getMode(opts.mode);
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray
      };
      const decrypted = CryptoJS.DES.decrypt(ciphertext, keyWordArray, config);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        throw ErrorUtils.createDecryptionError("Failed to decrypt data - invalid key or corrupted data", "DES");
      }
      return {
        success: true,
        data: decryptedText,
        algorithm: "DES",
        mode: opts.mode
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, "DES decryption"),
        algorithm: "DES"
      };
    }
  }
  /**
   * 准备密钥
   */
  prepareKey(key) {
    if (key.length < 8) {
      key = key.padEnd(8, "0");
    } else if (key.length > 8) {
      key = key.substring(0, 8);
    }
    return CryptoJS.enc.Utf8.parse(key);
  }
  /**
   * 获取加密模式
   */
  getMode(mode) {
    switch (mode.toUpperCase()) {
      case "CBC":
        return CryptoJS.mode.CBC;
      case "ECB":
        return CryptoJS.mode.ECB;
      case "CFB":
        return CryptoJS.mode.CFB;
      case "OFB":
        return CryptoJS.mode.OFB;
      default:
        return CryptoJS.mode.CBC;
    }
  }
}
const des = {
  /**
   * 加密
   */
  encrypt: (data, key, options) => {
    const encryptor = new DESEncryptor();
    return encryptor.encrypt(data, key, options);
  },
  /**
   * 解密
   */
  decrypt: (encryptedData, key, options) => {
    const encryptor = new DESEncryptor();
    return encryptor.decrypt(encryptedData, key, options);
  },
  /**
   * 生成随机密钥
   */
  generateKey: () => {
    return RandomUtils.generateKey(8);
  }
};

export { DESEncryptor, des };
//# sourceMappingURL=des.js.map
