/**
 * @ldesign/crypto - 懒加载入口
 * 
 * 提供按需加载的 API，减少初始包体积
 * 
 * @module
 */

import type {
  DecryptResult,
  EncryptionAlgorithm,
  EncryptResult,
  HashAlgorithm,
  RSAKeyPair,
} from './types'

/**
 * 懒加载的加密函数
 */
export async function encrypt(
  data: string,
  key: string,
  algorithm: EncryptionAlgorithm = 'AES',
  options?: Record<string, unknown>
): Promise<EncryptResult> {
  const { encrypt } = await import('./core/crypto')
  return encrypt.encrypt(data, key, algorithm, options)
}

/**
 * 懒加载的解密函数
 */
export async function decrypt(
  encryptedData: string | EncryptResult,
  key: string,
  algorithm?: EncryptionAlgorithm,
  options?: Record<string, unknown>
): Promise<DecryptResult> {
  const { decrypt } = await import('./core/crypto')
  return decrypt.decrypt(encryptedData, key, algorithm, options)
}

/**
 * 懒加载的哈希函数
 */
export async function hash(
  data: string,
  algorithm: HashAlgorithm = 'SHA256'
): Promise<string> {
  const { hash } = await import('./core/crypto')
  return hash.hash(data, algorithm).hash
}

/**
 * 懒加载的 HMAC 函数
 */
export async function hmac(
  data: string,
  key: string,
  algorithm: HashAlgorithm = 'SHA256'
): Promise<string> {
  const { hmac } = await import('./core/crypto')
  switch (algorithm) {
    case 'MD5':
      return hmac.md5(data, key)
    case 'SHA1':
      return hmac.sha1(data, key)
    case 'SHA256':
      return hmac.sha256(data, key)
    case 'SHA384':
      return hmac.sha384(data, key)
    case 'SHA512':
      return hmac.sha512(data, key)
    default:
      return hmac.sha256(data, key)
  }
}

/**
 * 懒加载的 AES 加密
 */
export const aes = {
  async encrypt(data: string, key: string, options?: Record<string, unknown>): Promise<EncryptResult> {
    const { aes } = await import('./algorithms')
    return aes.encrypt(data, key, options)
  },

  async decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Record<string, unknown>
  ): Promise<DecryptResult> {
    const { aes } = await import('./algorithms')
    return aes.decrypt(encryptedData, key, options)
  },
}

/**
 * 懒加载的 RSA 加密
 */
export const rsa = {
  async encrypt(data: string, publicKey: string): Promise<EncryptResult> {
    const { rsa } = await import('./algorithms')
    return rsa.encrypt(data, publicKey)
  },

  async decrypt(encryptedData: string | EncryptResult, privateKey: string): Promise<DecryptResult> {
    const { rsa } = await import('./algorithms')
    return rsa.decrypt(encryptedData, privateKey)
  },

  async generateKeyPair(bits: 1024 | 2048 | 3072 | 4096 = 2048): Promise<RSAKeyPair> {
    const { rsa } = await import('./algorithms')
    return rsa.generateKeyPair(bits)
  },
}

/**
 * 懒加载的批量处理器
 */
export const batch = {
  async encrypt(operations: any[], options?: any): Promise<any[]> {
    const { batchProcessor } = await import('./core/batch-processor')
    return batchProcessor.batchEncrypt(operations, options)
  },

  async decrypt(operations: any[], options?: any): Promise<any[]> {
    const { batchProcessor } = await import('./core/batch-processor')
    return batchProcessor.batchDecrypt(operations, options)
  },
}

/**
 * 懒加载的 Worker 管理器
 */
export const worker = {
  async encrypt(
    data: string,
    key: string,
    algorithm: string = 'AES',
    options?: any
  ): Promise<EncryptResult> {
    const { workerCryptoManager } = await import('./core/worker-crypto-manager')
    return workerCryptoManager.encrypt(data, key, algorithm, options)
  },

  async decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    algorithm?: string,
    options?: any
  ): Promise<DecryptResult> {
    const { workerCryptoManager } = await import('./core/worker-crypto-manager')
    return workerCryptoManager.decrypt(encryptedData, key, algorithm, options)
  },

  async warmup(): Promise<void> {
    const { workerCryptoManager } = await import('./core/worker-crypto-manager')
    return workerCryptoManager.warmup()
  },
}

/**
 * 懒加载的 WebAssembly 模块
 */
export const wasm = {
  async initialize(): Promise<void> {
    const { cryptoWasm } = await import('./wasm/crypto-wasm')
    return cryptoWasm.initialize()
  },

  async aesEncrypt(
    data: string,
    key: string,
    options?: any
  ): Promise<EncryptResult> {
    const { cryptoWasm } = await import('./wasm/crypto-wasm')
    return cryptoWasm.aesEncrypt(data, key, options)
  },

  async aesDecrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options?: any
  ): Promise<DecryptResult> {
    const { cryptoWasm } = await import('./wasm/crypto-wasm')
    return cryptoWasm.aesDecrypt(encryptedData, key, options)
  },

  async sha256(data: string): Promise<string> {
    const { cryptoWasm } = await import('./wasm/crypto-wasm')
    return cryptoWasm.sha256(data)
  },

  async benchmark(): Promise<any> {
    const { cryptoWasm } = await import('./wasm/crypto-wasm')
    return cryptoWasm.benchmark()
  },
}

/**
 * 懒加载的工具函数
 */
export const utils = {
  async generateKey(length: number = 32): Promise<string> {
    const { RandomUtils } = await import('./utils')
    return RandomUtils.generateKey(length)
  },

  async generateIV(length: number = 16): Promise<string> {
    const { RandomUtils } = await import('./utils')
    return RandomUtils.generateIV(length)
  },

  async generateSalt(length: number = 16): Promise<string> {
    const { RandomUtils } = await import('./utils')
    return RandomUtils.generateSalt(length)
  },

  async checkPasswordStrength(password: string): Promise<any> {
    const { PasswordStrengthChecker } = await import('./utils/password-strength')
    const checker = new PasswordStrengthChecker()
    return checker.analyze(password)
  },
}

/**
 * 懒加载的密钥管理
 */
export const keyManager = {
  async deriveKey(password: string, options?: any): Promise<any> {
    const { deriveKey } = await import('./utils/key-derivation')
    return deriveKey(password, options)
  },

  async generateRSAKeyPair(bits?: any): Promise<RSAKeyPair> {
    const { keyGenerator } = await import('./core')
    return keyGenerator.generateRSAKeyPair(bits)
  },

  async rotateKey(encryptedData: string, oldKey: string, newKey: string): Promise<any> {
    const { KeyRotation } = await import('./utils/key-rotation')
    const rotation = new KeyRotation()
    return rotation.rotateKey({ data: encryptedData, keyVersion: '1' }, oldKey, newKey)
  },
}

/**
 * 懒加载的性能监控
 */
export const performance = {
  async getMetrics(): Promise<any> {
    const { performanceMonitor } = await import('./utils/performance-monitor')
    return performanceMonitor.generateReport()
  },

  async getCacheStats(): Promise<any> {
    const { cryptoManager } = await import('./core')
    return cryptoManager.getCacheStats()
  },

  async benchmark(algorithm?: string): Promise<any> {
    const { createBenchmark } = await import('./utils/benchmark')
    return createBenchmark({
      name: algorithm || 'AES',
      iterations: 1000,
    })
  },
}

/**
 * 预加载指定模块
 * 用于提前加载可能会用到的模块
 */
export async function preload(modules: Array<'core' | 'algorithms' | 'worker' | 'wasm' | 'utils'>): Promise<void> {
  const promises = modules.map(async module => {
    switch (module) {
      case 'core':
        await import('./core')
        break
      case 'algorithms':
        await import('./algorithms')
        break
      case 'worker':
        await import('./core/worker-crypto-manager')
        break
      case 'wasm':
        await import('./wasm/crypto-wasm')
        break
      case 'utils':
        await import('./utils')
        break
    }
  })

  await Promise.all(promises)
}

/**
 * 获取包版本信息
 */
export function getVersion(): string {
  return '2.0.0'
}

/**
 * 获取支持的算法列表
 */
export function getSupportedAlgorithms(): {
  encryption: EncryptionAlgorithm[]
  hash: HashAlgorithm[]
} {
  return {
    encryption: ['AES', 'RSA', 'DES', '3DES', 'Blowfish'],
    hash: ['MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512'],
  }
}

export default {
  encrypt,
  decrypt,
  hash,
  hmac,
  aes,
  rsa,
  batch,
  worker,
  wasm,
  utils,
  keyManager,
  performance,
  preload,
  getVersion,
  getSupportedAlgorithms,
}
