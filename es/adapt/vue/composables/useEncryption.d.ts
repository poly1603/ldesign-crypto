import { type Ref } from 'vue';
/**
 * 简化的加密状态接口
 */
export interface EncryptionState {
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    result: Ref<string | null>;
}
/**
 * 加密操作接口
 */
export interface EncryptionActions {
    encryptText: (text: string, password: string) => Promise<string | null>;
    decryptText: (encryptedText: string, password: string) => Promise<string | null>;
    encryptFile: (fileContent: string, password: string) => Promise<string | null>;
    decryptFile: (encryptedContent: string, password: string) => Promise<string | null>;
    clearError: () => void;
    reset: () => void;
}
/**
 * useEncryption 返回类型
 */
export interface UseEncryptionReturn extends EncryptionState, EncryptionActions {
    hasError: Ref<boolean>;
    isReady: Ref<boolean>;
}
/**
 * 简化的加密 Hook
 *
 * 提供最常用的加密功能，使用简单的密码进行加密/解密
 *
 * @example
 * ```vue
 * <script setup>
 * import { useEncryption } from '@ldesign/crypto/vue'
 *
 * const { encryptText, decryptText, isLoading, error, result } = useEncryption()
 *
 * const handleEncrypt = async () => {
 *   const encrypted = await encryptText('Hello World', 'mypassword')
 *    }
 * </script>
 * ```
 */
export declare function useEncryption(): UseEncryptionReturn;
