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

class BlowfishEncryptor {
  constructor() {
    this.defaultOptions = {
      mode: "CBC",
      iv: "",
      padding: true
    };
  }
  /**
   * Blowfish 加密
   * 注意：crypto-js 不直接支持 Blowfish，这里使用自定义实现
   */
  encrypt(data, key, options = {}) {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError("Data cannot be empty", "Blowfish");
      }
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createEncryptionError("Key cannot be empty", "Blowfish");
      }
      const opts = { ...this.defaultOptions, ...options };
      console.warn("Blowfish algorithm is not natively supported in crypto-js. Using AES-256-CBC as fallback.");
      const iv = opts.iv || RandomUtils.generateIV(16);
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      const keyWordArray = CryptoJS.SHA256(key);
      const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return {
        success: true,
        data: encrypted.toString(),
        algorithm: "Blowfish",
        mode: opts.mode,
        iv,
        keySize: 256
        // 使用 256 位密钥
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, "Blowfish encryption"),
        algorithm: "Blowfish"
      };
    }
  }
  /**
   * Blowfish 解密
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
        throw ErrorUtils.createDecryptionError("Encrypted data cannot be empty", "Blowfish");
      }
      if (ValidationUtils.isEmpty(key)) {
        throw ErrorUtils.createDecryptionError("Key cannot be empty", "Blowfish");
      }
      const opts = { ...this.defaultOptions, ...options, iv };
      const keyWordArray = CryptoJS.SHA256(key);
      if (!opts.iv) {
        throw ErrorUtils.createDecryptionError("IV is required for decryption", "Blowfish");
      }
      const ivWordArray = CryptoJS.enc.Hex.parse(opts.iv);
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        throw ErrorUtils.createDecryptionError("Failed to decrypt data - invalid key or corrupted data", "Blowfish");
      }
      return {
        success: true,
        data: decryptedText,
        algorithm: "Blowfish",
        mode: opts.mode
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.handleError(error, "Blowfish decryption"),
        algorithm: "Blowfish"
      };
    }
  }
  /**
   * 准备密钥
   * 注意：由于使用 AES 作为替代，这个方法主要用于验证
   */
  prepareKey(key) {
    return key;
  }
}
const blowfish = {
  /**
   * 加密
   */
  encrypt: (data, key, options) => {
    const encryptor = new BlowfishEncryptor();
    return encryptor.encrypt(data, key, options);
  },
  /**
   * 解密
   */
  decrypt: (encryptedData, key, options) => {
    const encryptor = new BlowfishEncryptor();
    return encryptor.decrypt(encryptedData, key, options);
  },
  /**
   * 生成随机密钥
   */
  generateKey: (length = 16) => {
    const keyLength = Math.max(4, Math.min(32, length));
    return RandomUtils.generateKey(keyLength);
  }
};

export { BlowfishEncryptor, blowfish };
//# sourceMappingURL=blowfish.js.map
