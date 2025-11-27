/**
 * 核心模块导出
 *
 * 提供统一的核心功能访问接口，包括：
 * - 核心功能类和实例
 * - 管理器和性能优化工具
 * - 类型定义
 */

// === 核心功能类 ===
// === 核心功能实例 ===
// 创建单例实例，提供便捷的全局访问
import {
  Decrypt,
  DigitalSignature,
  Encrypt,
  Hash,
  HMAC,
  KeyGenerator,
} from './crypto'
import { CryptoManager } from './manager'
import { PerformanceOptimizer } from './performance'

// 导入算法模块用于默认导出
import {
  aes,
  base64,
  blowfish,
  des,
  des3,
  encoding,
  hash,
  hex,
  hmac,
  rsa,
  tripledes,
} from '../algorithms'

// === 重新导出算法模块 ===
// 为了保持向后兼容性，重新导出算法实现
export {
  aes,
  base64,
  blowfish,
  des,
  des3,
  encoding,
  hash,
  hex,
  hmac,
  rsa,
  tripledes,
}

// 重新导出类型
export type {
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncodingType,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  KeyGenerationOptions,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from '../types'

// === 认证加密 ===
export {
  AuthenticatedEncryption,
  authenticatedEncryption,
  decryptJSONWithAuth,
  decryptWithAuth,
  encryptJSONWithAuth,
  encryptWithAuth,
} from './authenticated-encryption'

export type {
  AuthenticatedDecryptResult,
  AuthenticatedEncryptionOptions,
  AuthenticatedEncryptResult,
} from './authenticated-encryption'

export const encrypt = new Encrypt()
export const decrypt = new Decrypt()
export const hashInstance = new Hash()
export const hmacInstance = new HMAC()
export const keyGenerator = new KeyGenerator()
export const digitalSignature = new DigitalSignature()

// 创建默认管理器实例
export const cryptoManager = new CryptoManager({
  defaultAlgorithm: 'AES',
  enableCache: true,
  maxCacheSize: 1000,
  enableParallel: true,
  autoGenerateIV: true,
  keyDerivation: false,
  debug: false,
  logLevel: 'error',
})

// === 链式调用 API ===
export {
  chain,
  CryptoChain,
  decryptFromBase64,
  decryptJSON,
  encryptJSON,
  encryptToBase64,
  hashPassword,
} from './chain'

export {
  Decrypt,
  DigitalSignature,
  Encrypt,
  Hash,
  HMAC,
  KeyGenerator,
} from './crypto'

// === 管理器和性能优化 ===
export { type CryptoConfig, CryptoManager } from './manager'

export { PerformanceOptimizer } from './performance'

export type {
  BatchOperation,
  BatchResult,
  CacheStats,
  PerformanceMetrics,
  PerformanceOptimizerConfig,
} from './performance'

// === 默认导出对象 ===
const LDesignCryptoCore = {
  // 核心功能
  encrypt,
  decrypt,
  hash: hashInstance,
  hmac: hmacInstance,
  keyGenerator,
  digitalSignature,

  // 管理器
  manager: cryptoManager,
  CryptoManager,
  PerformanceOptimizer,

  // 算法实现
  algorithms: {
    aes,
    rsa,
    des,
    des3,
    tripledes,
    blowfish,
  },

  // 编码工具
  encoding: {
    base64,
    hex,
    encoding,
  },

  // 版本信息
  version: '2.0.0',
  name: '@ldesign/crypto-core',
}

export default LDesignCryptoCore
