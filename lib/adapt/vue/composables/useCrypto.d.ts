import type { AESOptions, DecryptResult, EncryptResult, RSAKeyPair, RSAOptions } from '../../../types';
import { type Ref } from 'vue';
import { decrypt, encrypt, keyGenerator } from '../../../core';
/**
 * 加密状态接口
 */
export interface CryptoState {
    isEncrypting: Ref<boolean>;
    isDecrypting: Ref<boolean>;
    lastError: Ref<string | null>;
    lastResult: Ref<EncryptResult | DecryptResult | null>;
}
/**
 * 加密操作接口
 */
export interface CryptoActions {
    encryptAES: (data: string, key: string, options?: AESOptions) => Promise<EncryptResult>;
    decryptAES: (encryptedData: string | EncryptResult, key: string, options?: AESOptions) => Promise<DecryptResult>;
    encryptRSA: (data: string, publicKey: string, options?: RSAOptions) => Promise<EncryptResult>;
    decryptRSA: (encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions) => Promise<DecryptResult>;
    encodeBase64: (data: string) => Promise<string>;
    decodeBase64: (encodedData: string) => Promise<string>;
    encodeHex: (data: string) => Promise<string>;
    decodeHex: (encodedData: string) => Promise<string>;
    generateRSAKeyPair: (keySize?: number) => Promise<RSAKeyPair>;
    generateKey: (length?: number) => Promise<string>;
    generateSalt: (length?: number) => Promise<string>;
    generateIV: (length?: number) => Promise<string>;
    clearError: () => void;
    reset: () => void;
}
/**
 * useCrypto 返回类型
 */
export interface UseCryptoReturn extends CryptoState, CryptoActions {
    encrypt: typeof encrypt;
    decrypt: typeof decrypt;
    keyGenerator: typeof keyGenerator;
}
/**
 * 加密 Composition API Hook
 */
export declare function useCrypto(): UseCryptoReturn;
