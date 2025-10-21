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
var forge = require('node-forge');
var cryptoHelpers = require('../utils/crypto-helpers.cjs');

function performEncryption(data, key, algorithm, options) {
  try {
    switch (algorithm.toUpperCase()) {
      case "AES": {
        const keySize = options?.keySize || 256;
        const mode = options?.mode || "CBC";
        const salt = CryptoJS.SHA256(key);
        const derivedKey = CryptoJS.PBKDF2(key, salt, {
          keySize: keySize / 32,
          iterations: 1e5
          // OWASP 2023推荐
        });
        const config = cryptoHelpers.createCryptoJSConfig({
          mode,
          padding: options?.padding || "Pkcs7",
          iv: options?.iv
        });
        const encrypted = CryptoJS.AES.encrypt(data, derivedKey, config);
        return {
          success: true,
          data: encrypted.toString(),
          algorithm: "AES",
          mode,
          keySize
        };
      }
      case "DES": {
        const mode = options?.mode || "CBC";
        const config = cryptoHelpers.createCryptoJSConfig({
          mode,
          iv: options?.iv
        });
        const encrypted = CryptoJS.DES.encrypt(data, key, config);
        return {
          success: true,
          data: encrypted.toString(),
          algorithm: "DES",
          mode
        };
      }
      case "3DES":
      case "TRIPLEDES": {
        const mode = options?.mode || "CBC";
        const config = cryptoHelpers.createCryptoJSConfig({
          mode,
          iv: options?.iv
        });
        const encrypted = CryptoJS.TripleDES.encrypt(data, key, config);
        return {
          success: true,
          data: encrypted.toString(),
          algorithm: "3DES",
          mode
        };
      }
      case "RSA": {
        const publicKey = forge.pki.publicKeyFromPem(key);
        const encrypted = publicKey.encrypt(data, "RSA-OAEP", {
          md: forge.md.sha256.create()
        });
        return {
          success: true,
          data: forge.util.encode64(encrypted),
          algorithm: "RSA"
        };
      }
      default:
        return {
          success: false,
          data: "",
          algorithm,
          error: `Unsupported algorithm: ${algorithm}`
        };
    }
  } catch (error) {
    return {
      success: false,
      data: "",
      algorithm,
      error: cryptoHelpers.getErrorMessage(error) || "Encryption failed"
    };
  }
}
function performDecryption(data, key, algorithm, options) {
  try {
    switch (algorithm.toUpperCase()) {
      case "AES": {
        const keySize = options?.keySize || 256;
        const mode = options?.mode || "CBC";
        const salt = CryptoJS.SHA256(key);
        const derivedKey = CryptoJS.PBKDF2(key, salt, {
          keySize: keySize / 32,
          iterations: 1e5
          // OWASP 2023推荐
        });
        const config = cryptoHelpers.createCryptoJSConfig({
          mode,
          padding: options?.padding || "Pkcs7",
          iv: options?.iv
        });
        const decrypted = CryptoJS.AES.decrypt(data, derivedKey, config);
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) {
          return {
            success: false,
            data: "",
            algorithm: "AES",
            mode,
            error: "Decryption failed - invalid key or corrupted data"
          };
        }
        return {
          success: true,
          data: decryptedStr,
          algorithm: "AES",
          mode
        };
      }
      case "DES": {
        const mode = options?.mode || "CBC";
        const config = cryptoHelpers.createCryptoJSConfig({
          mode,
          iv: options?.iv
        });
        const decrypted = CryptoJS.DES.decrypt(data, key, config);
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) {
          return {
            success: false,
            data: "",
            algorithm: "DES",
            mode,
            error: "Decryption failed"
          };
        }
        return {
          success: true,
          data: decryptedStr,
          algorithm: "DES",
          mode
        };
      }
      case "3DES":
      case "TRIPLEDES": {
        const mode = options?.mode || "CBC";
        const config = cryptoHelpers.createCryptoJSConfig({
          mode,
          iv: options?.iv
        });
        const decrypted = CryptoJS.TripleDES.decrypt(data, key, config);
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) {
          return {
            success: false,
            data: "",
            algorithm: "3DES",
            mode,
            error: "Decryption failed"
          };
        }
        return {
          success: true,
          data: decryptedStr,
          algorithm: "3DES",
          mode
        };
      }
      case "RSA": {
        const privateKey = forge.pki.privateKeyFromPem(key);
        const encrypted = forge.util.decode64(data);
        const decrypted = privateKey.decrypt(encrypted, "RSA-OAEP", {
          md: forge.md.sha256.create()
        });
        return {
          success: true,
          data: decrypted,
          algorithm: "RSA"
        };
      }
      default:
        return {
          success: false,
          data: "",
          algorithm,
          error: `Unsupported algorithm: ${algorithm}`
        };
    }
  } catch (error) {
    return {
      success: false,
      data: "",
      algorithm,
      error: cryptoHelpers.getErrorMessage(error) || "Decryption failed"
    };
  }
}
function handleMessage(message) {
  const { id, type, algorithm, data, key, options } = message;
  try {
    if (type === "encrypt") {
      const result = performEncryption(data, key, algorithm, options);
      return { id, result };
    } else if (type === "decrypt") {
      const result = performDecryption(data, key, algorithm, options);
      return { id, result };
    } else {
      return {
        id,
        result: {
          success: false,
          data: "",
          algorithm,
          error: `Unknown operation type: ${type}`
        }
      };
    }
  } catch (error) {
    return {
      id,
      result: {
        success: false,
        data: "",
        algorithm,
        error: cryptoHelpers.getErrorMessage(error) || "Worker operation failed"
      }
    };
  }
}
if (typeof globalThis !== "undefined" && "postMessage" in globalThis) {
  globalThis.addEventListener("message", (event) => {
    const response = handleMessage(event.data);
    globalThis.postMessage(response);
  });
}

exports.handleMessage = handleMessage;
exports.performDecryption = performDecryption;
exports.performEncryption = performEncryption;
//# sourceMappingURL=crypto.worker.cjs.map
