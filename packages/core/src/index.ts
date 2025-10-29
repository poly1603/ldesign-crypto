/**
 * @ldesign/crypto-core
 * 
 * Framework-agnostic crypto core package
 * Provides encryption, decryption, hashing, and key management
 */

// === 核心功能 ===
export {
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
  type Encrypt,
  type Decrypt,
  type Hash,
  type HMAC,
  type KeyGenerator,
  type DigitalSignature,
} from './core'

// === 算法实现 ===
export {
  aes,
  rsa,
  des,
  des3,
  tripledes,
  blowfish,
  base64,
  hex,
  encoding,
  type AESEncryptor,
  type RSAEncryptor,
  type DESEncryptor,
  type TripleDESEncryptor,
  type BlowfishEncryptor,
  type Encoder,
  type Hasher,
  type HMACHasher,
} from './algorithms'

// === 管理器 ===
export {
  cryptoManager,
  CryptoManager,
  PerformanceOptimizer,
  type CryptoConfig,
  type PerformanceOptimizerConfig,
  type PerformanceMetrics,
  type CacheStats,
  type BatchOperation,
  type BatchResult,
} from './core/manager'

// === 认证加密 ===
export {
  authenticatedEncryption,
  AuthenticatedEncryption,
  type AuthenticatedEncryptionOptions,
  type AuthenticatedEncryptResult,
  type AuthenticatedDecryptResult,
} from './core/authenticated-encryption'

// === 链式 API ===
export {
  chain,
  CryptoChain,
} from './core/chain'

// === 便捷函数 ===
export {
  encryptToBase64,
  decryptFromBase64,
  encryptJSON,
  decryptJSON,
  encryptWithAuth,
  decryptWithAuth,
  encryptJSONWithAuth,
  decryptJSONWithAuth,
  hashPassword,
} from './core/crypto'

// === 类型定义 ===
export type {
  // 加密相关
  EncryptionAlgorithm,
  EncryptionOptions,
  EncryptResult,
  DecryptResult,

  // 哈希相关
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  HMACOptions,

  // AES
  AESOptions,
  AESMode,
  AESKeySize,

  // RSA
  RSAOptions,
  RSAKeyPair,
  RSAKeyFormat,

  // DES
  DESOptions,
  TripleDESOptions,

  // Blowfish
  BlowfishOptions,

  // 编码
  EncodingType,

  // 密钥生成
  KeyGenerationOptions,

  // 接口
  IEncryptor,
  IHasher,
  IHMACer,
  IEncoder,
  IKeyGenerator,
} from './types'

// === 版本信息 ===
export const version = '2.0.0'
export const name = '@ldesign/crypto-core'


