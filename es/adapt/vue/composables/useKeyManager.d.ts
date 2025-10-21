import type { RSAKeyPair } from '../../../types';
import { type Ref } from 'vue';
/**
 * 密钥管理状态接口
 */
export interface KeyManagerState {
    isGenerating: Ref<boolean>;
    error: Ref<string | null>;
    keys: Ref<Record<string, string | RSAKeyPair>>;
}
/**
 * 密钥管理操作接口
 */
export interface KeyManagerActions {
    generateAESKey: (keySize?: 128 | 192 | 256) => Promise<string | null>;
    generateRSAKeyPair: (keySize?: 1024 | 2048 | 3072 | 4096) => Promise<RSAKeyPair | null>;
    generateRandomKey: (length?: number) => Promise<string | null>;
    storeKey: (name: string, key: string | RSAKeyPair) => void;
    getKey: (name: string) => string | RSAKeyPair | null;
    removeKey: (name: string) => boolean;
    exportKeys: () => string;
    importKeys: (keysData: string) => boolean;
    clearError: () => void;
    clearKeys: () => void;
}
/**
 * useKeyManager 返回类型
 */
export interface UseKeyManagerReturn extends KeyManagerState, KeyManagerActions {
    hasError: Ref<boolean>;
    keyCount: Ref<number>;
    keyNames: Ref<string[]>;
    isReady: Ref<boolean>;
}
/**
 * 密钥管理 Hook
 *
 * 提供密钥生成、存储和管理功能
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKeyManager } from '@ldesign/crypto/vue'
 *
 * const {
 *   generateAESKey,
 *   generateRSAKeyPair,
 *   storeKey,
 *   getKey,
 *   keys,
 *   isGenerating
 * } = useKeyManager()
 *
 * const handleGenerateKey = async () => {
 *   const aesKey = await generateAESKey(256)
 *   if (aesKey) {
 *     storeKey('myAESKey', aesKey)
 *   }
 * }
 * </script>
 * ```
 */
export declare function useKeyManager(): UseKeyManagerReturn;
