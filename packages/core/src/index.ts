/**
 * @ldesign/crypto-core - 框架无关的加密核心库
 *
 * 主要功能模块：
 * - 算法实现：AES、RSA、DES、3DES、Blowfish 等
 * - 哈希算法：MD5、SHA 系列、HMAC
 * - 编码算法：Base64、Hex
 * - 核心功能：统一的加解密接口
 * - 工具函数：验证、随机数生成等
 * - 性能优化：缓存、批量处理等
 * - 高级特性：Workers、WASM、Stream处理
 */

// === 环境检测 ===
export * from './utils/env-detect'

// === 类型定义模块 ===
export type {
  AESKeySize,
  AESMode,
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncodingType,
  EncryptionAlgorithm,
  EncryptionOptions,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  HMACOptions,
  IEncoder,
  IEncryptor,
  IHasher,
  IHMACer,
  IKeyGenerator,
  KeyGenerationOptions,
  RSAKeyFormat,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from './types'

// === 算法实现模块 ===
export {
  // AES 算法
  AESEncryptor,
  aes,
  base64,
  // Blowfish 算法
  BlowfishEncryptor,
  blowfish,
  // ChaCha20-Poly1305 AEAD
  ChaCha20Poly1305Encryptor,
  chacha20poly1305,
  des,
  des3,
  // DES 系列算法
  DESEncryptor,
  // 编码算法
  Encoder,
  encoding,
  // 哈希算法
  Hasher,
  hash,
  hex,
  HMACHasher,
  hmac,
  // WebCrypto API 适配器
  isWebCryptoSupported,
  rsa,
  // RSA 算法
  RSAEncryptor,
  tripledes,
  TripleDESEncryptor,
  webcrypto,
  WebCryptoAES,
} from './algorithms'

export type {
  ChaCha20Poly1305EncryptResult,
  ChaCha20Poly1305Options,
} from './algorithms'

// === 核心功能模块 ===
export {
  // 认证加密
  AuthenticatedEncryption,
  authenticatedEncryption,
  // 链式调用 API
  chain,
  CryptoChain,
  // 核心功能类
  Decrypt,
  decrypt,
  decryptFromBase64,
  decryptJSON,
  decryptJSONWithAuth,
  decryptWithAuth,
  DigitalSignature,
  digitalSignature,
  Encrypt,
  encrypt,
  encryptJSON,
  encryptJSONWithAuth,
  encryptToBase64,
  encryptWithAuth,
  Hash,
  hash as hashInstance,
  hashPassword,
  HMAC,
  hmac as hmacInstance,
  KeyGenerator,
  keyGenerator,
  // 核心管理器
  CryptoManager,
  cryptoManager,
  // 性能优化
  PerformanceOptimizer,
} from './core'

export type {
  AuthenticatedDecryptResult,
  AuthenticatedEncryptionOptions,
  AuthenticatedEncryptResult,
  BatchOperation,
  BatchResult,
  CacheStats,
  CryptoConfig,
  PerformanceMetrics,
  PerformanceOptimizerConfig,
} from './core'

// === 工具函数模块 ===
export {
  CONSTANTS,
  ErrorUtils,
  LRUCache,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from './utils'

export type { LRUCacheOptions } from './utils'

// === 安全工具 ===
export {
  clearBuffer,
  clearString,
  MemoryCleaner,
  SecureKey,
  withSecureScope,
  withSecureScopeSync,
} from './utils/secure-memory'

export type { SecureKeyOptions } from './utils/secure-memory'

export {
  createTimingSafeCompare,
  testTimingSafety,
  timingSafeBase64Equal,
  timingSafeBufferEqual,
  timingSafeEqual,
  timingSafeHexEqual,
} from './utils/timing-safe'

// === 错误处理工具 ===
export {
  createErrorResult,
  sanitizeErrorMessage,
  withAsyncErrorHandling,
  withDecryptErrorHandling,
  withEncryptErrorHandling,
  withErrorHandling,
} from './utils/error-handler-decorator'

export type { ErrorHandlerOptions } from './utils/error-handler-decorator'

// === 性能基准测试 ===
export {
  Benchmark,
  compareBenchmark,
  createBenchmark,
  quickBenchmark,
} from './utils/benchmark'

export type {
  BenchmarkOptions,
  BenchmarkResult,
  BenchmarkSuite,
} from './utils/benchmark'

// === 数据压缩 ===
export {
  compress,
  DataCompressor,
  decompress,
} from './utils/compression'

export type {
  CompressionOptions,
  CompressionResult,
  DecompressionResult,
} from './utils/compression'

// === 错误处理 ===
export {
  CryptoError,
  CryptoErrorCode,
  CryptoErrorFactory,
  DecryptionError,
  EncodingError,
  EncryptionError,
  ErrorHandler,
  HashError,
  KeyManagementError,
  RateLimitError,
  StorageError,
  ValidationError,
} from './utils/errors'

// === 密钥派生 ===
export {
  deriveKey,
  generateSalt,
  KeyDerivation,
  verifyKey,
} from './utils/key-derivation'

export type {
  KeyDerivationOptions,
  KeyDerivationResult,
} from './utils/key-derivation'

// === 密钥轮换 ===
export {
  createKeyRotation,
  KeyRotation,
} from './utils/key-rotation'

export type {
  EncryptedDataMetadata,
  KeyInfo,
  ReencryptionResult,
} from './utils/key-rotation'

// === 对象池 ===
export {
  acquireDecryptResult,
  acquireEncryptResult,
  clearAllPools,
  createDecryptFailure,
  createDecryptSuccess,
  createEncryptFailure,
  createEncryptSuccess,
  DecryptResultPool,
  EncryptResultPool,
  getAllPoolStats,
  globalDecryptResultPool,
  globalEncryptResultPool,
  ObjectPool,
  releaseDecryptResult,
  releaseEncryptResult,
} from './utils/object-pool'

export type {
  ObjectPoolOptions,
  ObjectPoolStats,
} from './utils/object-pool'

// === 密码强度检测 ===
export {
  PasswordStrength,
  PasswordStrengthChecker,
} from './utils/password-strength'

export type { PasswordAnalysis } from './utils/password-strength'

// === 性能监控 ===
export { PerformanceMonitor } from './utils/performance-monitor'

export type {
  AlgorithmStats,
  OperationStats,
  PerformanceMetric,
  PerformanceMonitorConfig,
  PerformanceReport,
  TimeSeriesData,
} from './utils/performance-monitor'

// === 限流器 ===
export {
  createFixedWindowLimiter,
  createSlidingWindowLimiter,
  createTokenBucketLimiter,
  RateLimiter,
} from './utils/rate-limiter'

export type {
  RateLimiterOptions,
  RateLimitStatus,
  RateLimitStrategy,
} from './utils/rate-limiter'

// === 安全存储 ===
export {
  createSecureStorage,
  SecureStorage,
} from './utils/secure-storage'

export type { SecureStorageOptions } from './utils/secure-storage'

// === Worker 线程池 ===
export {
  destroyGlobalWorkerPool,
  getGlobalWorkerPool,
  WorkerPool,
} from './workers'

export type {
  WorkerMessage,
  WorkerPoolOptions,
  WorkerPoolStats,
  WorkerResponse,
} from './workers'

// === 流式加密 ===
export type {
  FileDecryptionOptions,
  FileEncryptionOptions,
  IStreamDecryptor,
  IStreamEncryptor,
  IStreamProcessor,
  StreamDecryptionOptions,
  StreamDecryptionResult,
  StreamEncryptionOptions,
  StreamEncryptionResult,
  StreamProgress,
} from './stream'

// === WASM 加速 (懒加载) ===
// WASM 模块通过懒加载方式提供，避免影响初始加载性能
// 使用方式：import { cryptoWasm } from '@ldesign/crypto-core/wasm/crypto-wasm'

// === 默认导出 ===
export { default } from './core'
