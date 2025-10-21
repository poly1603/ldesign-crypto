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
import { keyGenerator } from '../../../core/index.js';

function useKeyManager() {
  const isGenerating = ref(false);
  const error = ref(null);
  const keys = ref({});
  const hasError = computed(() => error.value !== null);
  const keyCount = computed(() => Object.keys(keys.value).length);
  const keyNames = computed(() => Object.keys(keys.value));
  const isReady = computed(() => !isGenerating.value);
  const wrapAsync = async (fn) => {
    try {
      isGenerating.value = true;
      error.value = null;
      return await fn();
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      return null;
    } finally {
      isGenerating.value = false;
    }
  };
  const generateAESKey = async (keySize = 256) => {
    return wrapAsync(() => {
      const keyLength = keySize / 8;
      return keyGenerator.generateKey(keyLength);
    });
  };
  const generateRSAKeyPair = async (keySize = 2048) => {
    return wrapAsync(() => {
      return keyGenerator.generateRSAKeyPair(keySize);
    });
  };
  const generateRandomKey = async (length = 32) => {
    return wrapAsync(() => {
      return keyGenerator.generateRandomBytes(length);
    });
  };
  const storeKey = (name, key) => {
    keys.value[name] = key;
  };
  const getKey = (name) => {
    return keys.value[name] || null;
  };
  const removeKey = (name) => {
    if (name in keys.value) {
      delete keys.value[name];
      return true;
    }
    return false;
  };
  const exportKeys = () => {
    try {
      return JSON.stringify(keys.value, null, 2);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      return "";
    }
  };
  const importKeys = (keysData) => {
    try {
      const importedKeys = JSON.parse(keysData);
      if (typeof importedKeys === "object" && importedKeys !== null) {
        keys.value = { ...keys.value, ...importedKeys };
        return true;
      }
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      return false;
    }
  };
  const clearError = () => {
    error.value = null;
  };
  const clearKeys = () => {
    keys.value = {};
  };
  return {
    // 状态
    isGenerating,
    error,
    keys,
    // 计算属性
    hasError,
    keyCount,
    keyNames,
    isReady,
    // 操作
    generateAESKey,
    generateRSAKeyPair,
    generateRandomKey,
    storeKey,
    getKey,
    removeKey,
    exportKeys,
    importKeys,
    clearError,
    clearKeys
  };
}

export { useKeyManager };
//# sourceMappingURL=useKeyManager.js.map
