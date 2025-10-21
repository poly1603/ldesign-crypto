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

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./core/index.cjs');
var index$1 = require('./utils/index.cjs');
var passwordStrength = require('./utils/password-strength.cjs');
var performanceMonitor = require('./utils/performance-monitor.cjs');
var aes = require('./algorithms/aes.cjs');
var blowfish = require('./algorithms/blowfish.cjs');
var des = require('./algorithms/des.cjs');
var encoding = require('./algorithms/encoding.cjs');
var hash = require('./algorithms/hash.cjs');
var rsa = require('./algorithms/rsa.cjs');
var tripledes = require('./algorithms/tripledes.cjs');
var benchmark = require('./utils/benchmark.cjs');
var compression = require('./utils/compression.cjs');
var errors = require('./utils/errors.cjs');
var keyDerivation = require('./utils/key-derivation.cjs');
var keyRotation = require('./utils/key-rotation.cjs');
var objectPool = require('./utils/object-pool.cjs');
var rateLimiter = require('./utils/rate-limiter.cjs');
var secureStorage = require('./utils/secure-storage.cjs');
var workerPool = require('./workers/worker-pool.cjs');
var performance = require('./core/performance.cjs');
var manager = require('./core/manager.cjs');
var authenticatedEncryption = require('./core/authenticated-encryption.cjs');
var chain = require('./core/chain.cjs');
var crypto = require('./core/crypto.cjs');
var lruCache = require('./utils/lru-cache.cjs');

const LDesignCrypto = {
  // === 核心功能 ===
  encrypt: index.encrypt,
  decrypt: index.decrypt,
  hash: hash.hash,
  hmac: hash.hmac,
  keyGenerator: index.keyGenerator,
  digitalSignature: index.digitalSignature,
  // === 管理器 ===
  manager: index.cryptoManager,
  CryptoManager: manager.CryptoManager,
  PerformanceOptimizer: performance.PerformanceOptimizer,
  // === 算法实现 ===
  algorithms: {
    aes: aes.aes,
    rsa: rsa.rsa,
    des: des.des,
    des3: tripledes.des3,
    tripledes: tripledes.tripledes,
    blowfish: blowfish.blowfish
  },
  // === 编码工具 ===
  encoding: {
    base64: encoding.base64,
    hex: encoding.hex,
    encoding: encoding.encoding
  },
  // === 工具函数 ===
  utils: {
    StringUtils: index$1.StringUtils,
    RandomUtils: index$1.RandomUtils,
    ValidationUtils: index$1.ValidationUtils,
    ErrorUtils: index$1.ErrorUtils
  },
  // === 常量 ===
  constants: index$1.CONSTANTS,
  // === 版本信息 ===
  version: "0.1.0",
  name: "@ldesign/crypto"
};
Object.assign(LDesignCrypto, {
  // 密码强度检测
  PasswordStrengthChecker: passwordStrength.PasswordStrengthChecker,
  // 性能监控
  PerformanceMonitor: performanceMonitor.PerformanceMonitor
});

exports.cryptoManager = index.cryptoManager;
exports.decrypt = index.decrypt;
exports.digitalSignature = index.digitalSignature;
exports.encrypt = index.encrypt;
exports.keyGenerator = index.keyGenerator;
exports.CONSTANTS = index$1.CONSTANTS;
exports.ErrorUtils = index$1.ErrorUtils;
exports.RandomUtils = index$1.RandomUtils;
exports.StringUtils = index$1.StringUtils;
exports.ValidationUtils = index$1.ValidationUtils;
Object.defineProperty(exports, "PasswordStrength", {
    enumerable: true,
    get: function () { return passwordStrength.PasswordStrength; }
});
exports.PasswordStrengthChecker = passwordStrength.PasswordStrengthChecker;
exports.PerformanceMonitor = performanceMonitor.PerformanceMonitor;
exports.AESEncryptor = aes.AESEncryptor;
exports.aes = aes.aes;
exports.BlowfishEncryptor = blowfish.BlowfishEncryptor;
exports.blowfish = blowfish.blowfish;
exports.DESEncryptor = des.DESEncryptor;
exports.des = des.des;
exports.Encoder = encoding.Encoder;
exports.base64 = encoding.base64;
exports.encoding = encoding.encoding;
exports.hex = encoding.hex;
exports.HMACHasher = hash.HMACHasher;
exports.Hasher = hash.Hasher;
exports.hash = hash.hash;
exports.hmac = hash.hmac;
exports.RSAEncryptor = rsa.RSAEncryptor;
exports.rsa = rsa.rsa;
exports.TripleDESEncryptor = tripledes.TripleDESEncryptor;
exports.des3 = tripledes.des3;
exports.tripledes = tripledes.tripledes;
exports.Benchmark = benchmark.Benchmark;
exports.compareBenchmark = benchmark.compareBenchmark;
exports.createBenchmark = benchmark.createBenchmark;
exports.quickBenchmark = benchmark.quickBenchmark;
exports.DataCompressor = compression.DataCompressor;
exports.compress = compression.compress;
exports.decompress = compression.decompress;
exports.CryptoError = errors.CryptoError;
Object.defineProperty(exports, "CryptoErrorCode", {
    enumerable: true,
    get: function () { return errors.CryptoErrorCode; }
});
exports.CryptoErrorFactory = errors.CryptoErrorFactory;
exports.DecryptionError = errors.DecryptionError;
exports.EncodingError = errors.EncodingError;
exports.EncryptionError = errors.EncryptionError;
exports.ErrorHandler = errors.ErrorHandler;
exports.HashError = errors.HashError;
exports.KeyManagementError = errors.KeyManagementError;
exports.RateLimitError = errors.RateLimitError;
exports.StorageError = errors.StorageError;
exports.ValidationError = errors.ValidationError;
exports.KeyDerivation = keyDerivation.KeyDerivation;
exports.deriveKey = keyDerivation.deriveKey;
exports.generateSalt = keyDerivation.generateSalt;
exports.verifyKey = keyDerivation.verifyKey;
exports.KeyRotation = keyRotation.KeyRotation;
exports.createKeyRotation = keyRotation.createKeyRotation;
exports.DecryptResultPool = objectPool.DecryptResultPool;
exports.EncryptResultPool = objectPool.EncryptResultPool;
exports.ObjectPool = objectPool.ObjectPool;
exports.acquireDecryptResult = objectPool.acquireDecryptResult;
exports.acquireEncryptResult = objectPool.acquireEncryptResult;
exports.clearAllPools = objectPool.clearAllPools;
exports.createDecryptFailure = objectPool.createDecryptFailure;
exports.createDecryptSuccess = objectPool.createDecryptSuccess;
exports.createEncryptFailure = objectPool.createEncryptFailure;
exports.createEncryptSuccess = objectPool.createEncryptSuccess;
exports.getAllPoolStats = objectPool.getAllPoolStats;
exports.globalDecryptResultPool = objectPool.globalDecryptResultPool;
exports.globalEncryptResultPool = objectPool.globalEncryptResultPool;
exports.releaseDecryptResult = objectPool.releaseDecryptResult;
exports.releaseEncryptResult = objectPool.releaseEncryptResult;
exports.RateLimiter = rateLimiter.RateLimiter;
exports.createFixedWindowLimiter = rateLimiter.createFixedWindowLimiter;
exports.createSlidingWindowLimiter = rateLimiter.createSlidingWindowLimiter;
exports.createTokenBucketLimiter = rateLimiter.createTokenBucketLimiter;
exports.SecureStorage = secureStorage.SecureStorage;
exports.createSecureStorage = secureStorage.createSecureStorage;
exports.WorkerPool = workerPool.WorkerPool;
exports.destroyGlobalWorkerPool = workerPool.destroyGlobalWorkerPool;
exports.getGlobalWorkerPool = workerPool.getGlobalWorkerPool;
exports.PerformanceOptimizer = performance.PerformanceOptimizer;
exports.CryptoManager = manager.CryptoManager;
exports.AuthenticatedEncryption = authenticatedEncryption.AuthenticatedEncryption;
exports.authenticatedEncryption = authenticatedEncryption.authenticatedEncryption;
exports.decryptJSONWithAuth = authenticatedEncryption.decryptJSONWithAuth;
exports.decryptWithAuth = authenticatedEncryption.decryptWithAuth;
exports.encryptJSONWithAuth = authenticatedEncryption.encryptJSONWithAuth;
exports.encryptWithAuth = authenticatedEncryption.encryptWithAuth;
exports.CryptoChain = chain.CryptoChain;
exports.chain = chain.chain;
exports.decryptFromBase64 = chain.decryptFromBase64;
exports.decryptJSON = chain.decryptJSON;
exports.encryptJSON = chain.encryptJSON;
exports.encryptToBase64 = chain.encryptToBase64;
exports.hashPassword = chain.hashPassword;
exports.Decrypt = crypto.Decrypt;
exports.DigitalSignature = crypto.DigitalSignature;
exports.Encrypt = crypto.Encrypt;
exports.HMAC = crypto.HMAC;
exports.Hash = crypto.Hash;
exports.KeyGenerator = crypto.KeyGenerator;
exports.LRUCache = lruCache.LRUCache;
exports.default = LDesignCrypto;
//# sourceMappingURL=index.cjs.map
