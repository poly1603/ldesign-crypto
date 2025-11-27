/**
 * @ldesign/crypto-core - 懒加载入口
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
  const { encrypt } = await import('./core')
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
  const { decrypt } = await import('./core')
  return decrypt.decrypt(encryptedData, key, algorithm, options)
}

/**
 * 懒加载的哈希函数
 */
export async function hash(
  data: string,
  algorithm: HashAlgorithm = 'SHA256'
): Promise<string> {
  const { hashInstance } = await import('./core')
  return hashInstance.hash(data, algorithm).hash
}

/**
 * 懒加载的 HMAC 函数
 */
export async function hmac(
  data: string,
  key: string,
  algorithm: HashAlgorithm = 'SHA256'
): Promise<string> {
  const { hmacInstance } = await import('./core')
  switch (algorithm) {
    case 'MD5':
      return hmacInstance.md5(data, key)
    case 'SHA1':
      return hmacInstance.sha1(data, key)
    case 'SHA256':
      return hmacInstance.sha256(data, key)
    case 'SHA384':
      return hmacInstance.sha384(data, key)
    case 'SHA512':
      return hmacInstance.sha512(data, key)
    default:
      return hmacInstance.sha256(data, key)
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
    const { encrypt, decrypt } = await import('./core')
    // 重新加密: 先用旧密钥解密,再用新密钥加密
    const decryptResult = await decrypt.decrypt(encryptedData, oldKey)
    if (decryptResult.success && decryptResult.data) {
      return encrypt.encrypt(decryptResult.data, newKey, 'AES')
    }
    throw new Error('Key rotation failed')
  },
}

/**
 * 懒加载的性能监控
 */
export const performance = {
  async getMetrics(): Promise<any> {
    const { PerformanceMonitor } = await import('./utils/performance-monitor')
    const monitor = new PerformanceMonitor()
    return monitor.generateReport()
  },

  async getCacheStats(): Promise<any> {
    const { cryptoManager } = await import('./core')
    return cryptoManager.getCacheStats()
  },

  async benchmark(algorithm?: string): Promise<any> {
    // 简单性能基准测试
    const { aes } = await import('./algorithms')
    const start = Date.now()
    const iterations = 100
    
    for (let i = 0; i < iterations; i++) {
      await aes.encrypt('test data', 'test key')
    }
    
    const end = Date.now()
    const avgTime = (end - start) / iterations
    
    return {
      algorithm: algorithm || 'AES',
      iterations,
      totalTime: end - start,
      avgTime,
      opsPerSecond: 1000 / avgTime,
    }
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
  worker,
  wasm,
  utils,
  keyManager,
  performance,
  preload,
  getVersion,
  getSupportedAlgorithms,
}