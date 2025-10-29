/**
 * @ldesign/crypto-core/core
 * 核心加密功能模块
 */

// 导出核心加密类和实例
export { Encrypt, encrypt } from './crypto'
export { Decrypt, decrypt } from './crypto'
export { Hash, hash } from './crypto'
export { HMAC, hmac } from './crypto'
export { KeyGenerator, keyGenerator } from './crypto'
export { DigitalSignature, digitalSignature } from './crypto'

// 导出便捷函数
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
} from './crypto'

// 导出管理器
export { CryptoManager, cryptoManager } from './manager'
export { PerformanceOptimizer } from './performance'

// 导出认证加密
export {
  AuthenticatedEncryption,
  authenticatedEncryption,
} from './authenticated-encryption'

// 导出链式API
export { CryptoChain, chain } from './chain'

// 导出类型
export type {
  CryptoConfig,
  PerformanceOptimizerConfig,
  PerformanceMetrics,
  CacheStats,
  BatchOperation,
  BatchResult,
  AuthenticatedEncryptionOptions,
  AuthenticatedEncryptResult,
  AuthenticatedDecryptResult,
} from './types'

