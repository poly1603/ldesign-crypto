/**
 * @ldesign/crypto - 全面的加解密库
 *
 * 主要功能模块：
 * - 算法实现：AES、RSA、DES、3DES、Blowfish 等
 * - 哈希算法：MD5、SHA 系列、HMAC
 * - 编码算法：Base64、Hex
 * - 核心功能：统一的加解密接口
 * - 工具函数：验证、随机数生成等
 * - 性能优化：缓存、批量处理等
 */
/**
 * 默认导出对象，提供所有核心功能的便捷访问
 *
 * @example
 * ```typescript
 * import crypto from '@ldesign/crypto'
 *
 * // 使用加密功能
 * const encrypted = crypto.encrypt.aes('data', 'key')
 * const decrypted = crypto.decrypt.aes(encrypted, 'key')
 *
 * // 使用哈希功能
 * const hash = crypto.hash.sha256('data')
 *
 * // 使用算法实现
 * const result = crypto.aes.encrypt('data', 'key')
 * ```
 */
import { CryptoManager, PerformanceOptimizer } from './core';
import { ErrorUtils, RandomUtils, StringUtils, ValidationUtils } from './utils';
export { aes, AESEncryptor, base64, blowfish, BlowfishEncryptor, des, des3, DESEncryptor, Encoder, encoding, Hasher, hex, HMACHasher, rsa, RSAEncryptor, tripledes, TripleDESEncryptor, } from './algorithms';
export { AuthenticatedEncryption, authenticatedEncryption, chain, CryptoChain, CryptoManager, cryptoManager, Decrypt, decrypt, decryptFromBase64, decryptJSON, decryptJSONWithAuth, decryptWithAuth, DigitalSignature, digitalSignature, Encrypt, encrypt, encryptJSON, encryptJSONWithAuth, encryptToBase64, encryptWithAuth, Hash, hash, hashPassword, HMAC, hmac, KeyGenerator, keyGenerator, PerformanceOptimizer, } from './core';
export type { AuthenticatedDecryptResult, AuthenticatedEncryptionOptions, AuthenticatedEncryptResult, BatchOperation, BatchResult, CacheStats, CryptoConfig, PerformanceMetrics, PerformanceOptimizerConfig, } from './core';
export { type FileDecryptionOptions, type FileEncryptionOptions, type IStreamDecryptor, type IStreamEncryptor, type IStreamProcessor, type StreamDecryptionOptions, type StreamDecryptionResult, type StreamEncryptionOptions, type StreamEncryptionResult, type StreamProgress, } from './stream';
export type { AESKeySize, AESMode, AESOptions, BlowfishOptions, DecryptResult, DESOptions, EncodingType, EncryptionAlgorithm, EncryptionOptions, EncryptResult, HashAlgorithm, HashOptions, HashResult, HMACAlgorithm, HMACOptions, IEncoder, IEncryptor, IHasher, IHMACer, IKeyGenerator, KeyGenerationOptions, RSAKeyFormat, RSAKeyPair, RSAOptions, TripleDESOptions, } from './types';
export { CONSTANTS, ErrorUtils, LRUCache, type LRUCacheOptions, RandomUtils, StringUtils, ValidationUtils, } from './utils';
export { Benchmark, type BenchmarkOptions, type BenchmarkResult, type BenchmarkSuite, compareBenchmark, createBenchmark, quickBenchmark, } from './utils/benchmark';
export { compress, type CompressionOptions, type CompressionResult, DataCompressor, decompress, type DecompressionResult, } from './utils/compression';
export { CryptoError, CryptoErrorCode, CryptoErrorFactory, DecryptionError, EncodingError, EncryptionError, ErrorHandler, HashError, KeyManagementError, RateLimitError, StorageError, ValidationError, } from './utils/errors';
export { deriveKey, generateSalt, KeyDerivation, type KeyDerivationOptions, type KeyDerivationResult, verifyKey, } from './utils/key-derivation';
export { createKeyRotation, type EncryptedDataMetadata, type KeyInfo, KeyRotation, type ReencryptionResult, } from './utils/key-rotation';
export { acquireDecryptResult, acquireEncryptResult, clearAllPools, createDecryptFailure, createDecryptSuccess, createEncryptFailure, createEncryptSuccess, DecryptResultPool, EncryptResultPool, getAllPoolStats, globalDecryptResultPool, globalEncryptResultPool, ObjectPool, type ObjectPoolOptions, type ObjectPoolStats, releaseDecryptResult, releaseEncryptResult, } from './utils/object-pool';
export { type PasswordAnalysis, PasswordStrength, PasswordStrengthChecker, } from './utils/password-strength';
export { type AlgorithmStats, type OperationStats, type PerformanceMetric, PerformanceMonitor, type PerformanceMonitorConfig, type PerformanceReport, type TimeSeriesData, } from './utils/performance-monitor';
export { createFixedWindowLimiter, createSlidingWindowLimiter, createTokenBucketLimiter, RateLimiter, type RateLimiterOptions, type RateLimitStatus, type RateLimitStrategy, } from './utils/rate-limiter';
export { createSecureStorage, SecureStorage, type SecureStorageOptions, } from './utils/secure-storage';
export { destroyGlobalWorkerPool, getGlobalWorkerPool, type WorkerMessage, WorkerPool, type WorkerPoolOptions, type WorkerPoolStats, type WorkerResponse, } from './workers';
declare const LDesignCrypto: {
    encrypt: import("./core").Encrypt;
    decrypt: import("./core").Decrypt;
    hash: {
        md5: (data: string, options?: import("./types").HashOptions) => string;
        sha1: (data: string, options?: import("./types").HashOptions) => string;
        sha224: (data: string, options?: import("./types").HashOptions) => string;
        sha256: (data: string, options?: import("./types").HashOptions) => string;
        sha384: (data: string, options?: import("./types").HashOptions) => string;
        sha512: (data: string, options?: import("./types").HashOptions) => string;
        hash: (data: string, algorithm?: import("./types").HashAlgorithm, options?: import("./types").HashOptions) => string;
        verify: (data: string, expectedHash: string, algorithm?: import("./types").HashAlgorithm, options?: import("./types").HashOptions) => boolean;
    };
    hmac: {
        md5: (data: string, key: string, options?: import("./types").HashOptions) => string;
        sha1: (data: string, key: string, options?: import("./types").HashOptions) => string;
        sha256: (data: string, key: string, options?: import("./types").HashOptions) => string;
        sha384: (data: string, key: string, options?: import("./types").HashOptions) => string;
        sha512: (data: string, key: string, options?: import("./types").HashOptions) => string;
        verify: (data: string, key: string, expectedHmac: string, algorithm?: import("./types").HashAlgorithm, options?: import("./types").HashOptions) => boolean;
    };
    keyGenerator: import("./core").KeyGenerator;
    digitalSignature: import("./core").DigitalSignature;
    manager: CryptoManager;
    CryptoManager: typeof CryptoManager;
    PerformanceOptimizer: typeof PerformanceOptimizer;
    algorithms: {
        aes: {
            encrypt: (data: string, key: string, options?: import("./types").AESOptions) => import("./types").EncryptResult;
            decrypt: (encryptedData: string | import("./types").EncryptResult, key: string, options?: import("./types").AESOptions) => import("./types").DecryptResult;
            encrypt128: (data: string, key: string, options?: Omit<import("./types").AESOptions, "keySize">) => import("./types").EncryptResult;
            encrypt192: (data: string, key: string, options?: Omit<import("./types").AESOptions, "keySize">) => import("./types").EncryptResult;
            encrypt256: (data: string, key: string, options?: Omit<import("./types").AESOptions, "keySize">) => import("./types").EncryptResult;
            decrypt128: (encryptedData: string | import("./types").EncryptResult, key: string, options?: Omit<import("./types").AESOptions, "keySize">) => import("./types").DecryptResult;
            decrypt192: (encryptedData: string | import("./types").EncryptResult, key: string, options?: Omit<import("./types").AESOptions, "keySize">) => import("./types").DecryptResult;
            decrypt256: (encryptedData: string | import("./types").EncryptResult, key: string, options?: Omit<import("./types").AESOptions, "keySize">) => import("./types").DecryptResult;
        };
        rsa: {
            generateKeyPair: (keySize?: 1024 | 2048 | 3072 | 4096) => import("./types").RSAKeyPair;
            encrypt: (data: string, publicKey: string, options?: import("./types").RSAOptions) => import("./types").EncryptResult;
            decrypt: (encryptedData: string | import("./types").EncryptResult, privateKey: string, options?: import("./types").RSAOptions) => import("./types").DecryptResult;
            sign: (data: string, privateKey: string, algorithm?: string) => string;
            verify: (data: string, signature: string, publicKey: string, algorithm?: string) => boolean;
        };
        des: {
            encrypt: (data: string, key: string, options?: import("./types").DESOptions) => import("./types").EncryptResult;
            decrypt: (encryptedData: string | import("./types").EncryptResult, key: string, options?: import("./types").DESOptions) => import("./types").DecryptResult;
            generateKey: () => string;
        };
        des3: {
            encrypt: (data: string, key: string, options?: import("./types").TripleDESOptions) => import("./types").EncryptResult;
            decrypt: (encryptedData: string | import("./types").EncryptResult, key: string, options?: import("./types").TripleDESOptions) => import("./types").DecryptResult;
            generateKey: () => string;
        };
        tripledes: {
            encrypt: (data: string, key: string, options?: import("./types").TripleDESOptions) => import("./types").EncryptResult;
            decrypt: (encryptedData: string | import("./types").EncryptResult, key: string, options?: import("./types").TripleDESOptions) => import("./types").DecryptResult;
            generateKey: () => string;
        };
        blowfish: {
            encrypt: (data: string, key: string, options?: import("./types").BlowfishOptions) => import("./types").EncryptResult;
            decrypt: (encryptedData: string | import("./types").EncryptResult, key: string, options?: import("./types").BlowfishOptions) => import("./types").DecryptResult;
            generateKey: (length?: number) => string;
        };
    };
    encoding: {
        base64: {
            encode: (data: string) => string;
            decode: (encodedData: string) => string;
            encodeUrl: (data: string) => string;
            decodeUrl: (encodedData: string) => string;
        };
        hex: {
            encode: (data: string) => string;
            decode: (encodedData: string) => string;
        };
        encoding: {
            base64: {
                encode: (data: string) => string;
                decode: (encodedData: string) => string;
                encodeUrl: (data: string) => string;
                decodeUrl: (encodedData: string) => string;
            };
            hex: {
                encode: (data: string) => string;
                decode: (encodedData: string) => string;
            };
            encode: (data: string, encoding: import("./types").EncodingType) => string;
            decode: (encodedData: string, encoding: import("./types").EncodingType) => string;
        };
    };
    utils: {
        StringUtils: typeof StringUtils;
        RandomUtils: typeof RandomUtils;
        ValidationUtils: typeof ValidationUtils;
        ErrorUtils: typeof ErrorUtils;
    };
    constants: {
        readonly AES: {
            readonly KEY_SIZES: readonly [128, 192, 256];
            readonly MODES: readonly ["CBC", "ECB", "CFB", "OFB", "CTR", "GCM"];
            readonly DEFAULT_MODE: "CBC";
            readonly DEFAULT_KEY_SIZE: 256;
            readonly IV_LENGTH: 16;
        };
        readonly RSA: {
            readonly KEY_SIZES: readonly [1024, 2048, 3072, 4096];
            readonly DEFAULT_KEY_SIZE: 2048;
        };
        readonly HASH: {
            readonly ALGORITHMS: readonly ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512"];
        };
        readonly HMAC: {
            readonly ALGORITHMS: readonly ["HMAC-MD5", "HMAC-SHA1", "HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"];
        };
        readonly ENCODING: {
            readonly TYPES: readonly ["base64", "hex", "utf8"];
            readonly DEFAULT: "hex";
        };
    };
    version: string;
    name: string;
};
export default LDesignCrypto;
