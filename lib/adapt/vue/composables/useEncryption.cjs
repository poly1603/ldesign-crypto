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
require('../../../core/index.cjs');
var aes = require('../../../algorithms/aes.cjs');
require('crypto-js');
require('../../../utils/errors.cjs');
require('../../../utils/key-derivation.cjs');
require('../../../utils/object-pool.cjs');
require('../../../utils/performance-logger.cjs');
var encoding = require('../../../algorithms/encoding.cjs');
require('node-forge');

function useEncryption() {
  const isLoading = vue.ref(false);
  const error = vue.ref(null);
  const result = vue.ref(null);
  const hasError = vue.computed(() => error.value !== null);
  const isReady = vue.computed(() => !isLoading.value);
  const wrapAsync = async (fn) => {
    try {
      isLoading.value = true;
      error.value = null;
      const res = await fn();
      result.value = typeof res === "string" ? res : JSON.stringify(res);
      return res;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  const encryptText = async (text, password) => {
    return wrapAsync(() => {
      const encrypted = aes.aes.encrypt(text, password, { keySize: 256 });
      return encoding.base64.encode(JSON.stringify(encrypted));
    });
  };
  const decryptText = async (encryptedText, password) => {
    return wrapAsync(() => {
      const encryptedData = JSON.parse(encoding.base64.decode(encryptedText));
      const decrypted = aes.aes.decrypt(encryptedData, password, {
        keySize: 256,
        iv: encryptedData.iv
      });
      return decrypted.data || "";
    });
  };
  const encryptFile = async (fileContent, password) => {
    return wrapAsync(() => {
      const encoded = encoding.base64.encode(fileContent);
      const encrypted = aes.aes.encrypt(encoded, password, { keySize: 256 });
      return encoding.hex.encode(JSON.stringify(encrypted));
    });
  };
  const decryptFile = async (encryptedContent, password) => {
    return wrapAsync(() => {
      const encryptedData = JSON.parse(encoding.hex.decode(encryptedContent));
      const decrypted = aes.aes.decrypt(encryptedData, password, {
        keySize: 256,
        iv: encryptedData.iv
      });
      return encoding.base64.decode(decrypted.data || "");
    });
  };
  const clearError = () => {
    error.value = null;
  };
  const reset = () => {
    isLoading.value = false;
    error.value = null;
    result.value = null;
  };
  return {
    // 状态
    isLoading,
    error,
    result,
    // 计算属性
    hasError,
    isReady,
    // 操作
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    clearError,
    reset
  };
}

exports.useEncryption = useEncryption;
//# sourceMappingURL=useEncryption.cjs.map
