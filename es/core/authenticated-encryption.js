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
import { ErrorUtils, RandomUtils } from '../utils/index.js';

class AuthenticatedEncryption {
  /**
   * 加密并认证数据
   */
  encrypt(data, key, options = {}) {
    const { algorithm = "AES", keySize = 256, aad } = options;
    try {
      if (algorithm.toUpperCase() !== "AES") {
        throw ErrorUtils.createEncryptionError("Authenticated encryption currently only supports AES algorithm", "AEAD");
      }
      const iv = RandomUtils.generateIV(16);
      const salt = RandomUtils.generateSalt(32);
      const saltWordArray = CryptoJS.enc.Hex.parse(salt);
      const derivedKeys = CryptoJS.PBKDF2(key, saltWordArray, {
        keySize: keySize / 32 * 2,
        // 需要两倍大小（加密+认证）
        iterations: 1e5
      });
      const encryptionKey = CryptoJS.lib.WordArray.create(derivedKeys.words.slice(0, keySize / 32));
      const authKey = CryptoJS.lib.WordArray.create(derivedKeys.words.slice(keySize / 32));
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        // 使用CBC模式（GCM在CryptoJS中需要额外配置）
        padding: CryptoJS.pad.Pkcs7
      });
      const ciphertext = encrypted.toString();
      const authData = ciphertext + iv + salt + (aad || "");
      const authTag = CryptoJS.HmacSHA256(authData, authKey).toString();
      return {
        success: true,
        ciphertext,
        authTag,
        iv,
        salt,
        algorithm: "AES",
        aad
      };
    } catch (error) {
      return {
        success: false,
        ciphertext: "",
        authTag: "",
        iv: "",
        salt: "",
        algorithm,
        error: error instanceof Error ? error.message : "Authenticated encryption failed"
      };
    }
  }
  /**
   * 解密并验证数据
   */
  decrypt(encryptedResult, key, options = {}) {
    try {
      let result;
      if (typeof encryptedResult === "string") {
        try {
          result = JSON.parse(encryptedResult);
        } catch {
          throw ErrorUtils.createDecryptionError("Invalid encrypted data format", "AEAD");
        }
      } else {
        result = encryptedResult;
      }
      const { ciphertext, authTag, iv, salt, aad } = result;
      const { keySize = 256 } = options;
      const saltWordArray = CryptoJS.enc.Hex.parse(salt);
      const derivedKeys = CryptoJS.PBKDF2(key, saltWordArray, {
        keySize: keySize / 32 * 2,
        iterations: 1e5
      });
      const encryptionKey = CryptoJS.lib.WordArray.create(derivedKeys.words.slice(0, keySize / 32));
      const authKey = CryptoJS.lib.WordArray.create(derivedKeys.words.slice(keySize / 32));
      const authData = ciphertext + iv + salt + (aad || "");
      const computedAuthTag = CryptoJS.HmacSHA256(authData, authKey).toString();
      if (computedAuthTag !== authTag) {
        return {
          success: false,
          data: "",
          verified: false,
          error: "Authentication verification failed - data may have been tampered with"
        };
      }
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      const decrypted = CryptoJS.AES.decrypt(ciphertext, encryptionKey, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        // 使用CBC模式
        padding: CryptoJS.pad.Pkcs7
      });
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedStr) {
        return {
          success: false,
          data: "",
          verified: false,
          error: "Decryption failed - invalid key or corrupted data"
        };
      }
      return {
        success: true,
        data: decryptedStr,
        verified: true
      };
    } catch (error) {
      return {
        success: false,
        data: "",
        verified: false,
        error: error instanceof Error ? error.message : "Authenticated decryption failed"
      };
    }
  }
  /**
   * 序列化加密结果为 JSON
   */
  serializeResult(result) {
    return JSON.stringify(result);
  }
  /**
   * 从 JSON 反序列化加密结果
   */
  deserializeResult(json) {
    return JSON.parse(json);
  }
}
const authenticatedEncryption = new AuthenticatedEncryption();
function encryptWithAuth(data, key, options) {
  return authenticatedEncryption.encrypt(data, key, options);
}
function decryptWithAuth(encryptedData, key, options) {
  return authenticatedEncryption.decrypt(encryptedData, key, options);
}
function encryptJSONWithAuth(obj, key, options) {
  const result = authenticatedEncryption.encrypt(JSON.stringify(obj), key, options);
  return authenticatedEncryption.serializeResult(result);
}
function decryptJSONWithAuth(encryptedData, key, options) {
  const result = authenticatedEncryption.decrypt(encryptedData, key, options);
  if (!result.success || !result.verified) {
    return {
      data: null,
      verified: false,
      error: result.error
    };
  }
  try {
    return {
      data: JSON.parse(result.data),
      verified: true
    };
  } catch {
    return {
      data: null,
      verified: false,
      error: "Failed to parse JSON data"
    };
  }
}

export { AuthenticatedEncryption, authenticatedEncryption, decryptJSONWithAuth, decryptWithAuth, encryptJSONWithAuth, encryptWithAuth };
//# sourceMappingURL=authenticated-encryption.js.map
