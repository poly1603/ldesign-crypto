/**
 * 核心模块导出
 *
 * 提供统一的核心功能访问接口，包括：
 * - 核心功能类和实例
 * - 管理器和性能优化工具
 * - 类型定义
 */
import { Decrypt, DigitalSignature, Encrypt, Hash, HMAC, KeyGenerator } from './crypto';
import { CryptoManager } from './manager';
export { aes, base64, blowfish, des, des3, encoding, hash, hex, hmac, rsa, tripledes, } from '../algorithms';
export type { AESOptions, BlowfishOptions, DecryptResult, DESOptions, EncodingType, EncryptResult, HashAlgorithm, HashOptions, HashResult, HMACAlgorithm, KeyGenerationOptions, RSAKeyPair, RSAOptions, TripleDESOptions, } from '../types';
export { AuthenticatedEncryption, authenticatedEncryption, decryptJSONWithAuth, decryptWithAuth, encryptJSONWithAuth, encryptWithAuth, } from './authenticated-encryption';
export type { AuthenticatedDecryptResult, AuthenticatedEncryptionOptions, AuthenticatedEncryptResult, } from './authenticated-encryption';
export declare const encrypt: Encrypt;
export declare const decrypt: Decrypt;
export declare const hashInstance: Hash;
export declare const hmacInstance: HMAC;
export declare const keyGenerator: KeyGenerator;
export declare const digitalSignature: DigitalSignature;
export declare const cryptoManager: CryptoManager;
export { chain, CryptoChain, decryptFromBase64, decryptJSON, encryptJSON, encryptToBase64, hashPassword, } from './chain';
export { Decrypt, DigitalSignature, Encrypt, Hash, HMAC, KeyGenerator, } from './crypto';
export { type CryptoConfig, CryptoManager } from './manager';
export { PerformanceOptimizer } from './performance';
export type { BatchOperation, BatchResult, CacheStats, PerformanceMetrics, PerformanceOptimizerConfig, } from './performance';
