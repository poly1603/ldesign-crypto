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
import { digitalSignature } from '../../../core/index.js';

function useSignature() {
  const isSigning = ref(false);
  const isVerifying = ref(false);
  const lastError = ref(null);
  const lastSignature = ref(null);
  const lastVerificationResult = ref(null);
  const isLoading = computed(() => isSigning.value || isVerifying.value);
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
      if (typeof result === "string" && loadingRef === isSigning) {
        lastSignature.value = result;
      } else if (typeof result === "boolean" && loadingRef === isVerifying) {
        lastVerificationResult.value = result;
      }
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      loadingRef.value = false;
    }
  };
  const sign = async (data, privateKey, algorithm = "sha256") => {
    return wrapAsync(() => digitalSignature.sign(data, privateKey, algorithm), isSigning);
  };
  const verify = async (data, signature, publicKey, algorithm = "sha256") => {
    return wrapAsync(() => digitalSignature.verify(data, signature, publicKey, algorithm), isVerifying);
  };
  const signMultiple = async (dataList, privateKey, algorithm = "sha256") => {
    return wrapAsync(() => {
      return dataList.map((data) => digitalSignature.sign(data, privateKey, algorithm));
    }, isSigning);
  };
  const verifyMultiple = async (verificationList) => {
    return wrapAsync(() => {
      return verificationList.map((item) => digitalSignature.verify(item.data, item.signature, item.publicKey, item.algorithm || "sha256"));
    }, isVerifying);
  };
  const signFile = async (fileContent, privateKey, algorithm = "sha256") => {
    return wrapAsync(() => digitalSignature.sign(fileContent, privateKey, algorithm), isSigning);
  };
  const verifyFile = async (fileContent, signature, publicKey, algorithm = "sha256") => {
    return wrapAsync(() => digitalSignature.verify(fileContent, signature, publicKey, algorithm), isVerifying);
  };
  const clearError = () => {
    lastError.value = null;
  };
  const reset = () => {
    isSigning.value = false;
    isVerifying.value = false;
    lastError.value = null;
    lastSignature.value = null;
    lastVerificationResult.value = null;
  };
  return {
    // 状态
    isSigning,
    isVerifying,
    lastError,
    lastSignature,
    lastVerificationResult,
    isLoading,
    // 操作
    sign,
    verify,
    signMultiple,
    verifyMultiple,
    signFile,
    verifyFile,
    clearError,
    reset,
    // 便捷访问
    digitalSignature
  };
}

export { useSignature };
//# sourceMappingURL=useSignature.js.map
