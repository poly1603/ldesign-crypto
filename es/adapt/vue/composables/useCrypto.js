/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref } from 'vue';
import { keyGenerator, decrypt, encrypt } from '../../../core/index.js';

function useCrypto() {
  const isEncrypting = ref(false);
  const isDecrypting = ref(false);
  const lastError = ref(null);
  const lastResult = ref(null);
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
    return wrapAsync(() => encrypt.aes(data, key, options), isEncrypting);
  };
  const decryptAES = async (encryptedData, key, options) => {
    return wrapAsync(() => decrypt.aes(encryptedData, key, options), isDecrypting);
  };
  const encryptRSA = async (data, publicKey, options) => {
    return wrapAsync(() => encrypt.rsa(data, publicKey, options), isEncrypting);
  };
  const decryptRSA = async (encryptedData, privateKey, options) => {
    return wrapAsync(() => decrypt.rsa(encryptedData, privateKey, options), isDecrypting);
  };
  const encodeBase64 = async (data) => {
    return wrapAsync(() => encrypt.base64(data), isEncrypting);
  };
  const decodeBase64 = async (encodedData) => {
    return wrapAsync(() => decrypt.base64(encodedData), isDecrypting);
  };
  const encodeHex = async (data) => {
    return wrapAsync(() => encrypt.hex(data), isEncrypting);
  };
  const decodeHex = async (encodedData) => {
    return wrapAsync(() => decrypt.hex(encodedData), isDecrypting);
  };
  const generateRSAKeyPair = async (keySize) => {
    return wrapAsync(() => keyGenerator.generateRSAKeyPair(keySize), isEncrypting);
  };
  const generateKey = async (length) => {
    return wrapAsync(() => keyGenerator.generateKey(length), isEncrypting);
  };
  const generateSalt = async (length) => {
    return wrapAsync(() => keyGenerator.generateSalt(length), isEncrypting);
  };
  const generateIV = async (length) => {
    return wrapAsync(() => keyGenerator.generateIV(length), isEncrypting);
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
    encrypt,
    decrypt,
    keyGenerator
  };
}

export { useCrypto };
//# sourceMappingURL=useCrypto.js.map
