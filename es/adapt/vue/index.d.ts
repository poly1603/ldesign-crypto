/**
 * Vue 3 适配器模块
 *
 * 为 Vue 3 应用提供深度集成的加密功能，包括：
 * - Composition API Hooks
 * - Vue 插件
 * - 响应式状态管理
 * - 类型安全的 API
 */
export { aes, base64, blowfish, cryptoManager, CryptoManager, decrypt, des, des3, digitalSignature, encoding, encrypt, hash, hex, hmac, keyGenerator, rsa, tripledes, } from '../../core';
export type { CryptoConfig } from '../../core';
export type { AESOptions, BlowfishOptions, DecryptResult, DESOptions, EncodingType, EncryptionAlgorithm, EncryptResult, HashAlgorithm, HashOptions, HashResult, HMACAlgorithm, HMACOptions, KeyGenerationOptions, RSAKeyPair, RSAOptions, TripleDESOptions, } from '../../types';
export { type CryptoActions, type CryptoState, type EncryptionActions, type EncryptionState, type HashActions, type HashState, type KeyManagerActions, type KeyManagerState, type SignatureActions, type SignatureState, useCrypto, type UseCryptoReturn, useEncryption, type UseEncryptionReturn, useHash, type UseHashReturn, useKeyManager, type UseKeyManagerReturn, useSignature, type UseSignatureReturn, } from './composables';
export { createCryptoPlugin, CryptoPlugin, type CryptoPluginOptions, type GlobalCrypto, installCrypto, } from './plugin';
export { CryptoPlugin as default } from './plugin';
