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

var vue = require('vue');
var index = require('../../../core/index.cjs');

function useCrypto() {
  const isEncrypting = vue.ref(false);
  const isDecrypting = vue.ref(false);
  const lastError = vue.ref(null);
  const lastResult = vue.ref(null);
  const handleError = (error) => {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    lastError.value = errorMessage;
    throw new Error(errorMessage);
  };
  const wrapAsync = async (operation, loadingRef) => {
    try {
      loadingRef.value = true;
      lastError.value = null;
      const result = operation();
      if (typeof result === "object" && result !== null && "success" in result) {
        lastResult.value = result;
      }
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      loadingRef.value = false;
    }
  };
  const encryptAES = async (data, key, options) => {
    return wrapAsync(() => index.encrypt.aes(data, key, options), isEncrypting);
  };
  const decryptAES = async (encryptedData, key, options) => {
    return wrapAsync(() => index.decrypt.aes(encryptedData, key, options), isDecrypting);
  };
  const encryptRSA = async (data, publicKey, options) => {
    return wrapAsync(() => index.encrypt.rsa(data, publicKey, options), isEncrypting);
  };
  const decryptRSA = async (encryptedData, privateKey, options) => {
    return wrapAsync(() => index.decrypt.rsa(encryptedData, privateKey, options), isDecrypting);
  };
  const encodeBase64 = async (data) => {
    return wrapAsync(() => index.encrypt.base64(data), isEncrypting);
  };
  const decodeBase64 = async (encodedData) => {
    return wrapAsync(() => index.decrypt.base64(encodedData), isDecrypting);
  };
  const encodeHex = async (data) => {
    return wrapAsync(() => index.encrypt.hex(data), isEncrypting);
  };
  const decodeHex = async (encodedData) => {
    return wrapAsync(() => index.decrypt.hex(encodedData), isDecrypting);
  };
  const generateRSAKeyPair = async (keySize) => {
    return wrapAsync(() => index.keyGenerator.generateRSAKeyPair(keySize), isEncrypting);
  };
  const generateKey = async (length) => {
    return wrapAsync(() => index.keyGenerator.generateKey(length), isEncrypting);
  };
  const generateSalt = async (length) => {
    return wrapAsync(() => index.keyGenerator.generateSalt(length), isEncrypting);
  };
  const generateIV = async (length) => {
    return wrapAsync(() => index.keyGenerator.generateIV(length), isEncrypting);
  };
  const clearError = () => {
    lastError.value = null;
  };
  const reset = () => {
    isEncrypting.value = false;
    isDecrypting.value = false;
    lastError.value = null;
    lastResult.value = null;
  };
  return {
    // 状态
    isEncrypting,
    isDecrypting,
    lastError,
    lastResult,
    // 操作
    encryptAES,
    decryptAES,
    encryptRSA,
    decryptRSA,
    encodeBase64,
    decodeBase64,
    encodeHex,
    decodeHex,
    generateRSAKeyPair,
    generateKey,
    generateSalt,
    generateIV,
    clearError,
    reset,
    // 便捷访问
    encrypt: index.encrypt,
    decrypt: index.decrypt,
    keyGenerator: index.keyGenerator
  };
}

exports.useCrypto = useCrypto;
//# sourceMappingURL=useCrypto.cjs.map
