/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, computed } from 'vue';
import '../../../core/index.js';
import { aes } from '../../../algorithms/aes.js';
import 'crypto-js';
import '../../../utils/errors.js';
import '../../../utils/key-derivation.js';
import '../../../utils/object-pool.js';
import '../../../utils/performance-logger.js';
import { base64, hex } from '../../../algorithms/encoding.js';
import 'node-forge';

function useEncryption() {
  const isLoading = ref(false);
  const error = ref(null);
  const result = ref(null);
  const hasError = computed(() => error.value !== null);
  const isReady = computed(() => !isLoading.value);
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
      const encrypted = aes.encrypt(text, password, { keySize: 256 });
      return base64.encode(JSON.stringify(encrypted));
    });
  };
  const decryptText = async (encryptedText, password) => {
    return wrapAsync(() => {
      const encryptedData = JSON.parse(base64.decode(encryptedText));
      const decrypted = aes.decrypt(encryptedData, password, {
        keySize: 256,
        iv: encryptedData.iv
      });
      return decrypted.data || "";
    });
  };
  const encryptFile = async (fileContent, password) => {
    return wrapAsync(() => {
      const encoded = base64.encode(fileContent);
      const encrypted = aes.encrypt(encoded, password, { keySize: 256 });
      return hex.encode(JSON.stringify(encrypted));
    });
  };
  const decryptFile = async (encryptedContent, password) => {
    return wrapAsync(() => {
      const encryptedData = JSON.parse(hex.decode(encryptedContent));
      const decrypted = aes.decrypt(encryptedData, password, {
        keySize: 256,
        iv: encryptedData.iv
      });
      return base64.decode(decrypted.data || "");
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

export { useEncryption };
//# sourceMappingURL=useEncryption.js.map
