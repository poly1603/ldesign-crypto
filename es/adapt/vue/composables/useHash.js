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
import { hmacInstance } from '../../../core/index.js';
import { hash } from '../../../algorithms/hash.js';
import '../../../algorithms/aes.js';
import 'crypto-js';
import '../../../utils/errors.js';
import '../../../utils/key-derivation.js';
import '../../../utils/object-pool.js';
import '../../../utils/performance-logger.js';
import '../../../algorithms/encoding.js';
import 'node-forge';

function useHash() {
  const isHashing = ref(false);
  const lastError = ref(null);
  const lastHash = ref(null);
  const isLoading = computed(() => isHashing.value);
  const handleError = (error) => {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    lastError.value = errorMessage;
    throw new Error(errorMessage);
  };
  const wrapAsync = async (operation) => {
    try {
      isHashing.value = true;
      lastError.value = null;
      const result = operation();
      if (typeof result === "string") {
        lastHash.value = result;
      }
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      isHashing.value = false;
    }
  };
  const md5 = async (data, options) => {
    return wrapAsync(() => hash.md5(data, options));
  };
  const sha1 = async (data, options) => {
    return wrapAsync(() => hash.sha1(data, options));
  };
  const sha224 = async (data, options) => {
    return wrapAsync(() => hash.sha224(data, options));
  };
  const sha256 = async (data, options) => {
    return wrapAsync(() => hash.sha256(data, options));
  };
  const sha384 = async (data, options) => {
    return wrapAsync(() => hash.sha384(data, options));
  };
  const sha512 = async (data, options) => {
    return wrapAsync(() => hash.sha512(data, options));
  };
  const hashData = async (data, algorithm = "SHA256", options) => {
    return wrapAsync(() => hash.hash(data, algorithm, options));
  };
  const verify = async (data, expectedHash, algorithm = "SHA256", options) => {
    return wrapAsync(() => hash.verify(data, expectedHash, algorithm, options));
  };
  const hmacMd5 = async (data, key, options) => {
    return wrapAsync(() => hmacInstance.md5(data, key, options));
  };
  const hmacSha1 = async (data, key, options) => {
    return wrapAsync(() => hmacInstance.sha1(data, key, options));
  };
  const hmacSha256 = async (data, key, options) => {
    return wrapAsync(() => hmacInstance.sha256(data, key, options));
  };
  const hmacSha384 = async (data, key, options) => {
    return wrapAsync(() => hmacInstance.sha384(data, key, options));
  };
  const hmacSha512 = async (data, key, options) => {
    return wrapAsync(() => hmacInstance.sha512(data, key, options));
  };
  const hmacData = async (data, key, algorithm = "SHA256", options) => {
    return wrapAsync(() => hmacInstance.hmac(data, key, algorithm, options));
  };
  const verifyHmac = async (data, key, expectedHmac, algorithm = "SHA256", options) => {
    return wrapAsync(() => hmacInstance.verify(data, key, expectedHmac, algorithm, options));
  };
  const hashMultiple = async (dataList, algorithm = "SHA256", options) => {
    return wrapAsync(() => {
      return dataList.map((data) => hash.hash(data, algorithm, options));
    });
  };
  const hashFile = async (fileContent, algorithm = "SHA256", options) => {
    return wrapAsync(() => hash.hash(fileContent, algorithm, options));
  };
  const clearError = () => {
    lastError.value = null;
  };
  const reset = () => {
    isHashing.value = false;
    lastError.value = null;
    lastHash.value = null;
  };
  return {
    // 状态
    isHashing,
    lastError,
    lastHash,
    isLoading,
    // 基础哈希函数
    md5,
    sha1,
    sha224,
    sha256,
    sha384,
    sha512,
    hashData,
    verify,
    // HMAC 函数
    hmacMd5,
    hmacSha1,
    hmacSha256,
    hmacSha384,
    hmacSha512,
    hmacData,
    verifyHmac,
    // 高级功能
    hashMultiple,
    hashFile,
    // 工具函数
    clearError,
    reset,
    // 便捷访问
    hash,
    hmac: hmacInstance
  };
}

export { useHash };
//# sourceMappingURL=useHash.js.map
