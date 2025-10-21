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

class TripleDESEncryptor {
  constructor() {
    this.defaultOptions = {
      mode: "CBC",
      iv: "",
      padding: "Pkcs7"
    };
  }
  /**
   * 3DES 加密
   */
  encrypt(data, key, options = {}) {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError("Data cannot be empty", "3DES");
      }
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError("Key cannot be empty", "3DES");
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
      const encrypted = CryptoJS.TripleDES.encrypt(data, keyWordArray, config);
      return {
        success: true,
        data: encrypted.toString(),
        algorithm: "3DES",
        mode: opts.mode,
        iv,
        keySize: 192
        // 3DES 密钥大小为 192 位
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, "3DES encryption"),
        algorithm: "3DES"
      };
    }
  }
  /**
   * 3DES 解密
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
        throw ErrorUtils.createDecryptionError("Encrypted data cannot be empty", "3DES");
      }
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError("Key cannot be empty", "3DES");
      }
      const opts = { ...this.defaultOptions, ...options, iv };
      if (!opts.iv) {
        throw ErrorUtils.createDecryptionError("IV is required for decryption", "3DES");
      }
      if (!/^[A-Z0-9+/=]+$/i.test(ciphertext) && !/^[0-9a-f]+$/i.test(ciphertext)) {
        throw ErrorUtils.createDecryptionError("Invalid encrypted data format", "3DES");
      }
      const keyWordArray = this.prepareKey(key);
      const ivWordArray = CryptoJS.enc.Hex.parse(opts.iv);
      const mode = this.getMode(opts.mode);
      const config = {
        mode,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivWordArray
      };
      let decrypted;
      let decryptedText;
      try {
        decrypted = CryptoJS.TripleDES.decrypt(ciphertext, keyWordArray, config);
        decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      } catch {
        throw ErrorUtils.createDecryptionError("Failed to decrypt data - invalid format or corrupted data", "3DES");
      }
      if (!decryptedText || decryptedText.length === 0) {
        throw ErrorUtils.createDecryptionError("Failed to decrypt data - invalid key or corrupted data", "3DES");
      }
      return {
        success: true,
        data: decryptedText,
        algorithm: "3DES",
        mode: opts.mode
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, "3DES decryption"),
        algorithm: "3DES"
      };
    }
  }
  /**
   * 准备密钥
   */
  prepareKey(key) {
    if (key.length < 24) {
      while (key.length < 24) {
        key += key;
      }
      key = key.substring(0, 24);
    } else if (key.length > 24) {
      key = key.substring(0, 24);
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
const tripledes = {
  /**
   * 加密
   */
  encrypt: (data, key, options) => {
    const encryptor = new TripleDESEncryptor();
    return encryptor.encrypt(data, key, options);
  },
  /**
   * 解密
   */
  decrypt: (encryptedData, key, options) => {
    const encryptor = new TripleDESEncryptor();
    return encryptor.decrypt(encryptedData, key, options);
  },
  /**
   * 生成随机密钥
   */
  generateKey: () => {
    return RandomUtils.generateKey(24);
  }
};
const des3 = tripledes;

export { TripleDESEncryptor, des3, tripledes };
//# sourceMappingURL=tripledes.js.map
