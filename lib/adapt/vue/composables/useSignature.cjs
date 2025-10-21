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

function useSignature() {
  const isSigning = vue.ref(false);
  const isVerifying = vue.ref(false);
  const lastError = vue.ref(null);
  const lastSignature = vue.ref(null);
  const lastVerificationResult = vue.ref(null);
  const isLoading = vue.computed(() => isSigning.value || isVerifying.value);
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
    return wrapAsync(() => index.digitalSignature.sign(data, privateKey, algorithm), isSigning);
  };
  const verify = async (data, signature, publicKey, algorithm = "sha256") => {
    return wrapAsync(() => index.digitalSignature.verify(data, signature, publicKey, algorithm), isVerifying);
  };
  const signMultiple = async (dataList, privateKey, algorithm = "sha256") => {
    return wrapAsync(() => {
      return dataList.map((data) => index.digitalSignature.sign(data, privateKey, algorithm));
    }, isSigning);
  };
  const verifyMultiple = async (verificationList) => {
    return wrapAsync(() => {
      return verificationList.map((item) => index.digitalSignature.verify(item.data, item.signature, item.publicKey, item.algorithm || "sha256"));
    }, isVerifying);
  };
  const signFile = async (fileContent, privateKey, algorithm = "sha256") => {
    return wrapAsync(() => index.digitalSignature.sign(fileContent, privateKey, algorithm), isSigning);
  };
  const verifyFile = async (fileContent, signature, publicKey, algorithm = "sha256") => {
    return wrapAsync(() => index.digitalSignature.verify(fileContent, signature, publicKey, algorithm), isVerifying);
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
    digitalSignature: index.digitalSignature
  };
}

exports.useSignature = useSignature;
//# sourceMappingURL=useSignature.cjs.map
