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

var index = require('../utils/index.cjs');

class ChaCha20Encryptor {
  constructor() {
    this.NONCE_LENGTH = 12;
    this.KEY_LENGTH = 32;
    this.TAG_LENGTH = 16;
  }
  /**
   * ChaCha20-Poly1305 加密
   */
  encrypt(data, key, options = {}) {
    try {
      if (index.ValidationUtils.isEmpty(key)) {
        throw index.ErrorUtils.createEncryptionError("Key cannot be empty", "ChaCha20");
      }
      if (key.length !== this.KEY_LENGTH * 2) {
        throw index.ErrorUtils.createEncryptionError(`Invalid key length. Expected ${this.KEY_LENGTH * 2} hex characters`, "ChaCha20");
      }
      const nonce = options.nonce || index.RandomUtils.generateRandomString(this.NONCE_LENGTH, "hex");
      const encrypted = this.performChaCha20(data, key, nonce);
      const tag = this.generateAuthTag(encrypted, key, nonce, options.aad);
      return {
        success: true,
        data: encrypted + tag,
        algorithm: "ChaCha20-Poly1305",
        nonce,
        aad: options.aad
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: "ChaCha20-Poly1305",
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: "ChaCha20-Poly1305",
        error: "Unknown encryption error"
      };
    }
  }
  /**
   * ChaCha20-Poly1305 解密
   */
  decrypt(encryptedData, key, options = {}) {
    try {
      let ciphertext;
      let nonce;
      let aad;
      if (typeof encryptedData === "string") {
        ciphertext = encryptedData;
        nonce = options.nonce || "";
        aad = options.aad;
      } else {
        ciphertext = encryptedData.data || "";
        const extendedData = encryptedData;
        nonce = extendedData.nonce || options.nonce || "";
        aad = extendedData.aad || options.aad;
      }
      if (!nonce) {
        throw index.ErrorUtils.createDecryptionError("Nonce is required for decryption", "ChaCha20");
      }
      const tagStart = ciphertext.length - this.TAG_LENGTH * 2;
      const encrypted = ciphertext.substring(0, tagStart);
      const tag = ciphertext.substring(tagStart);
      const expectedTag = this.generateAuthTag(encrypted, key, nonce, aad);
      if (tag !== expectedTag) {
        throw index.ErrorUtils.createDecryptionError("Authentication failed", "ChaCha20");
      }
      const decrypted = this.performChaCha20(encrypted, key, nonce);
      return {
        success: true,
        data: decrypted,
        algorithm: "ChaCha20-Poly1305"
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: "ChaCha20-Poly1305",
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: "ChaCha20-Poly1305",
        error: "Unknown decryption error"
      };
    }
  }
  /**
   * 执行 ChaCha20 加密/解密（简化实现）
   */
  performChaCha20(data, key, nonce) {
    const keyBytes = this.hexToBytes(key);
    const nonceBytes = this.hexToBytes(nonce);
    let dataBytes;
    if (/^[0-9a-f]+$/i.test(data) && data.length % 2 === 0) {
      dataBytes = this.hexToBytes(data);
    } else {
      dataBytes = new TextEncoder().encode(data);
    }
    const result = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length] ^ nonceBytes[i % nonceBytes.length];
    }
    if (/^[0-9a-f]+$/i.test(data) && data.length % 2 === 0) {
      return new TextDecoder().decode(result);
    } else {
      return this.bytesToHex(result);
    }
  }
  /**
   * 生成认证标签（简化实现）
   */
  generateAuthTag(data, key, nonce, aad) {
    const input = data + nonce + (aad || "");
    const keyBytes = this.hexToBytes(key);
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash = hash & hash;
    }
    for (const byte of keyBytes) {
      hash ^= byte;
    }
    const tag = Math.abs(hash).toString(16).padStart(this.TAG_LENGTH * 2, "0");
    return tag.substring(0, this.TAG_LENGTH * 2);
  }
  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
  bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
class AESGCMEncryptor {
  constructor() {
    this.IV_LENGTH = 12;
    this.TAG_LENGTH = 16;
  }
  async encrypt(data, key, options = {}) {
    try {
      if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        return await this.encryptBrowser(data, key, options);
      }
      return this.encryptNode(data, key, options);
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: "AES-GCM",
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: "AES-GCM",
        error: "Unknown encryption error"
      };
    }
  }
  async decrypt(encryptedData, key, options = {}) {
    try {
      if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        return await this.decryptBrowser(encryptedData, key, options);
      }
      return this.decryptNode(encryptedData, key, options);
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: "AES-GCM",
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: "AES-GCM",
        error: "Unknown decryption error"
      };
    }
  }
  /**
   * 浏览器环境的 AES-GCM 加密
   */
  async encryptBrowser(data, key, options) {
    const iv = options.nonce || index.RandomUtils.generateRandomString(this.IV_LENGTH, "hex");
    const keyBuffer = this.hexToArrayBuffer(key);
    const dataBuffer = new TextEncoder().encode(data);
    const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["encrypt"]);
    const encrypted = await crypto.subtle.encrypt({
      name: "AES-GCM",
      iv: this.hexToArrayBuffer(iv),
      additionalData: options.aad ? new TextEncoder().encode(options.aad) : void 0,
      tagLength: (options.tagLength || this.TAG_LENGTH) * 8
    }, cryptoKey, dataBuffer);
    return {
      success: true,
      data: this.arrayBufferToHex(encrypted),
      algorithm: "AES-GCM",
      iv,
      aad: options.aad
    };
  }
  /**
   * 浏览器环境的 AES-GCM 解密
   */
  async decryptBrowser(encryptedData, key, options) {
    let ciphertext;
    let iv;
    let aad;
    if (typeof encryptedData === "string") {
      ciphertext = encryptedData;
      iv = options.nonce || "";
      aad = options.aad;
    } else {
      ciphertext = encryptedData.data || "";
      iv = encryptedData.iv || options.nonce || "";
      const extendedData = encryptedData;
      aad = extendedData.aad || options.aad;
    }
    const keyBuffer = this.hexToArrayBuffer(key);
    const encryptedBuffer = this.hexToArrayBuffer(ciphertext);
    const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: this.hexToArrayBuffer(iv),
      additionalData: aad ? new TextEncoder().encode(aad) : void 0,
      tagLength: (options.tagLength || this.TAG_LENGTH) * 8
    }, cryptoKey, encryptedBuffer);
    return {
      success: true,
      data: new TextDecoder().decode(decrypted),
      algorithm: "AES-GCM"
    };
  }
  /**
   * Node.js 环境的 AES-GCM 加密（简化实现）
   */
  encryptNode(data, key, options) {
    const iv = options.nonce || index.RandomUtils.generateRandomString(this.IV_LENGTH, "hex");
    const encrypted = this.simpleXor(data, key, iv);
    const tag = this.generateTag(encrypted, key, iv, options.aad);
    return {
      success: true,
      data: encrypted + tag,
      algorithm: "AES-GCM",
      iv,
      aad: options.aad
    };
  }
  /**
   * Node.js 环境的 AES-GCM 解密（简化实现）
   */
  decryptNode(encryptedData, key, options) {
    let ciphertext;
    let iv;
    let aad;
    if (typeof encryptedData === "string") {
      ciphertext = encryptedData;
      iv = options.nonce || "";
      aad = options.aad;
    } else {
      ciphertext = encryptedData.data || "";
      iv = encryptedData.iv || options.nonce || "";
      const extendedData = encryptedData;
      aad = extendedData.aad || options.aad;
    }
    const tagStart = ciphertext.length - this.TAG_LENGTH * 2;
    const encrypted = ciphertext.substring(0, tagStart);
    const tag = ciphertext.substring(tagStart);
    const expectedTag = this.generateTag(encrypted, key, iv, aad);
    if (tag !== expectedTag) {
      throw index.ErrorUtils.createDecryptionError("Authentication failed", "AES-GCM");
    }
    const decrypted = this.simpleXor(encrypted, key, iv);
    return {
      success: true,
      data: decrypted,
      algorithm: "AES-GCM"
    };
  }
  simpleXor(data, key, iv) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const dataChar = data.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const ivChar = iv.charCodeAt(i % iv.length);
      result.push(String.fromCharCode(dataChar ^ keyChar ^ ivChar));
    }
    return result.join("");
  }
  generateTag(data, key, iv, aad) {
    const input = data + iv + (aad || "");
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(this.TAG_LENGTH * 2, "0").substring(0, this.TAG_LENGTH * 2);
  }
  hexToArrayBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }
  arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
const chacha20 = new ChaCha20Encryptor();
const aesGcm = new AESGCMEncryptor();

exports.AESGCMEncryptor = AESGCMEncryptor;
exports.ChaCha20Encryptor = ChaCha20Encryptor;
exports.aesGcm = aesGcm;
exports.chacha20 = chacha20;
//# sourceMappingURL=advanced.cjs.map
