/**
 * @ldesign/crypto
 * 功能完整的加解密模块，支持主流加密算法和中国国密算法
 */

// 核心类型
export * from './types'

// 核心API
export { CryptoAPI } from './core/CryptoAPI'
export { CryptoManager } from './core/CryptoManager'

// 导入用于默认导出
import { CryptoAPI } from './core/CryptoAPI'

// 算法实现
export { AsymmetricPlugin, ECCCrypto, KeyUtils, RSACrypto } from './algorithms/asymmetric'
export { HashCrypto, HashPlugin, PasswordStrength } from './algorithms/hash'
export { SM2Crypto, SM3Crypto, SM4Crypto, SMPlugin, SMUtils } from './algorithms/sm'
export { SymmetricCrypto, SymmetricPlugin } from './algorithms/symmetric'

// Vue 3集成
export * from './vue'

// 便捷创建函数
export function createCrypto(config = {}) {
  return new CryptoAPI(config)
}

// 默认导出
const LDesignCrypto = {
  CryptoAPI,
  createCrypto,
  install: (app: any, config = {}) => {
    const { install } = require('./vue')
    return install(app, config)
  }
}

export default LDesignCrypto
