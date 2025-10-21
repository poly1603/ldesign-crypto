/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { cryptoManager, digitalSignature, keyGenerator, decrypt, encrypt } from './core/index.js';
import { CONSTANTS, ErrorUtils, ValidationUtils, RandomUtils, StringUtils } from './utils/index.js';
import { PasswordStrengthChecker } from './utils/password-strength.js';
export { PasswordStrength } from './utils/password-strength.js';
import { PerformanceMonitor } from './utils/performance-monitor.js';
import { aes } from './algorithms/aes.js';
export { AESEncryptor } from './algorithms/aes.js';
import { blowfish } from './algorithms/blowfish.js';
export { BlowfishEncryptor } from './algorithms/blowfish.js';
import { des } from './algorithms/des.js';
export { DESEncryptor } from './algorithms/des.js';
import { encoding, hex, base64 } from './algorithms/encoding.js';
export { Encoder } from './algorithms/encoding.js';
import { hmac, hash } from './algorithms/hash.js';
export { HMACHasher, Hasher } from './algorithms/hash.js';
import { rsa } from './algorithms/rsa.js';
export { RSAEncryptor } from './algorithms/rsa.js';
import { tripledes, des3 } from './algorithms/tripledes.js';
export { TripleDESEncryptor } from './algorithms/tripledes.js';
export { Benchmark, compareBenchmark, createBenchmark, quickBenchmark } from './utils/benchmark.js';
export { DataCompressor, compress, decompress } from './utils/compression.js';
export { CryptoError, CryptoErrorCode, CryptoErrorFactory, DecryptionError, EncodingError, EncryptionError, ErrorHandler, HashError, KeyManagementError, RateLimitError, StorageError, ValidationError } from './utils/errors.js';
export { KeyDerivation, deriveKey, generateSalt, verifyKey } from './utils/key-derivation.js';
export { KeyRotation, createKeyRotation } from './utils/key-rotation.js';
export { DecryptResultPool, EncryptResultPool, ObjectPool, acquireDecryptResult, acquireEncryptResult, clearAllPools, createDecryptFailure, createDecryptSuccess, createEncryptFailure, createEncryptSuccess, getAllPoolStats, globalDecryptResultPool, globalEncryptResultPool, releaseDecryptResult, releaseEncryptResult } from './utils/object-pool.js';
export { RateLimiter, createFixedWindowLimiter, createSlidingWindowLimiter, createTokenBucketLimiter } from './utils/rate-limiter.js';
export { SecureStorage, createSecureStorage } from './utils/secure-storage.js';
export { WorkerPool, destroyGlobalWorkerPool, getGlobalWorkerPool } from './workers/worker-pool.js';
import { PerformanceOptimizer } from './core/performance.js';
import { CryptoManager } from './core/manager.js';
export { AuthenticatedEncryption, authenticatedEncryption, decryptJSONWithAuth, decryptWithAuth, encryptJSONWithAuth, encryptWithAuth } from './core/authenticated-encryption.js';
export { CryptoChain, chain, decryptFromBase64, decryptJSON, encryptJSON, encryptToBase64, hashPassword } from './core/chain.js';
export { Decrypt, DigitalSignature, Encrypt, HMAC, Hash, KeyGenerator } from './core/crypto.js';
export { LRUCache } from './utils/lru-cache.js';

const LDesignCrypto = {
  // === 核心功能 ===
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
  // === 管理器 ===
  manager: cryptoManager,
  CryptoManager,
  PerformanceOptimizer,
  // === 算法实现 ===
  algorithms: {
    aes,
    rsa,
    des,
    des3,
    tripledes,
    blowfish
  },
  // === 编码工具 ===
  encoding: {
    base64,
    hex,
    encoding
  },
  // === 工具函数 ===
  utils: {
    StringUtils,
    RandomUtils,
    ValidationUtils,
    ErrorUtils
  },
  // === 常量 ===
  constants: CONSTANTS,
  // === 版本信息 ===
  version: "0.1.0",
  name: "@ldesign/crypto"
};
Object.assign(LDesignCrypto, {
  // 密码强度检测
  PasswordStrengthChecker,
  // 性能监控
  PerformanceMonitor
});

export { CONSTANTS, CryptoManager, ErrorUtils, PasswordStrengthChecker, PerformanceMonitor, PerformanceOptimizer, RandomUtils, StringUtils, ValidationUtils, aes, base64, blowfish, cryptoManager, decrypt, LDesignCrypto as default, des, des3, digitalSignature, encoding, encrypt, hash, hex, hmac, keyGenerator, rsa, tripledes };
//# sourceMappingURL=index.js.map
