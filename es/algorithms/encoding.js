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
import { ErrorUtils, ValidationUtils } from '../utils/index.js';

class Encoder {
  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!Encoder.instance) {
      Encoder.instance = new Encoder();
    }
    return Encoder.instance;
  }
  /**
   * 私有构造函数，防止外部直接实例化
   */
  constructor() {
  }
  /**
   * 编码字符串
   */
  encode(data, encoding2) {
    try {
      switch (encoding2.toLowerCase()) {
        case "base64":
          return this.encodeBase64(data);
        case "hex":
          return this.encodeHex(data);
        case "utf8":
          return data;
        // UTF-8 是默认编码，无需转换
        default:
          throw ErrorUtils.createEncryptionError(`Unsupported encoding type: ${encoding2}`, "Encoding");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw ErrorUtils.createEncryptionError("Unknown encoding error", "Encoding");
    }
  }
  /**
   * 解码字符串
   */
  decode(encodedData, encoding2) {
    try {
      switch (encoding2.toLowerCase()) {
        case "base64":
          return this.decodeBase64(encodedData);
        case "hex":
          return this.decodeHex(encodedData);
        case "utf8":
          return encodedData;
        // UTF-8 是默认编码，无需转换
        default:
          throw ErrorUtils.createDecryptionError(`Unsupported encoding type: ${encoding2}`, "Decoding");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw ErrorUtils.createDecryptionError("Unknown decoding error", "Decoding");
    }
  }
  /**
   * Base64 编码
   */
  encodeBase64(data) {
    try {
      if (typeof btoa !== "undefined") {
        return btoa(unescape(encodeURIComponent(data)));
      } else {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
      }
    } catch {
      throw ErrorUtils.createEncryptionError("Failed to encode Base64", "Base64");
    }
  }
  /**
   * Base64 解码
   */
  decodeBase64(encodedData) {
    try {
      if (!ValidationUtils.isValidBase64(encodedData)) {
        throw ErrorUtils.createDecryptionError("Invalid Base64 format", "Base64");
      }
      if (typeof atob !== "undefined") {
        return decodeURIComponent(escape(atob(encodedData)));
      } else {
        return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encodedData));
      }
    } catch {
      throw ErrorUtils.createDecryptionError("Failed to decode Base64", "Base64");
    }
  }
  /**
   * Hex 编码
   */
  encodeHex(data) {
    try {
      return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(data));
    } catch {
      throw ErrorUtils.createEncryptionError("Failed to encode Hex", "Hex");
    }
  }
  /**
   * Hex 解码
   */
  decodeHex(encodedData) {
    try {
      if (!ValidationUtils.isValidHex(encodedData)) {
        throw ErrorUtils.createDecryptionError("Invalid Hex format", "Hex");
      }
      return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(encodedData));
    } catch {
      throw ErrorUtils.createDecryptionError("Failed to decode Hex", "Hex");
    }
  }
  /**
   * URL 安全的 Base64 编码
   */
  encodeBase64Url(data) {
    const base642 = this.encodeBase64(data);
    return base642.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  /**
   * URL 安全的 Base64 解码
   */
  decodeBase64Url(encodedData) {
    let base642 = encodedData.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base642.length % 4;
    if (padding) {
      base642 += "=".repeat(4 - padding);
    }
    return this.decodeBase64(base642);
  }
}
Encoder.instance = null;
const encoding = {
  /**
   * Base64 编码
   */
  base64: {
    encode: (data) => {
      return Encoder.getInstance().encode(data, "base64");
    },
    decode: (encodedData) => {
      return Encoder.getInstance().decode(encodedData, "base64");
    },
    encodeUrl: (data) => {
      return Encoder.getInstance().encodeBase64Url(data);
    },
    decodeUrl: (encodedData) => {
      return Encoder.getInstance().decodeBase64Url(encodedData);
    }
  },
  /**
   * Hex 编码
   */
  hex: {
    encode: (data) => {
      return Encoder.getInstance().encode(data, "hex");
    },
    decode: (encodedData) => {
      return Encoder.getInstance().decode(encodedData, "hex");
    }
  },
  /**
   * 通用编码函数
   */
  encode: (data, encoding2) => {
    return Encoder.getInstance().encode(data, encoding2);
  },
  /**
   * 通用解码函数
   */
  decode: (encodedData, encoding2) => {
    return Encoder.getInstance().decode(encodedData, encoding2);
  }
};
const base64 = encoding.base64;
const hex = encoding.hex;

export { Encoder, base64, encoding, hex };
//# sourceMappingURL=encoding.js.map
