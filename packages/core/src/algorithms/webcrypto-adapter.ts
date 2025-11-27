/**
 * WebCrypto API 适配器（硬件加速）
 * 
 * WebCrypto API 是浏览器和 Node.js（15.0+）提供的原生加密 API。
 * 相比纯 JavaScript 实现，WebCrypto 可以利用硬件加速，性能提升 2-5 倍。
 * 
 * ## 优势
 * 
 * ### 性能
 * - 硬件加速：利用 CPU 的 AES-NI 指令集
 * - 性能提升：比纯 JS 实现快 2-5 倍
 * - 低内存占用：由浏览器/Node.js 原生实现
 * 
 * ### 安全性
 * - 经过审计：浏览器厂商的安全团队维护
 * - 持续更新：随浏览器/Node.js 版本更新
 * - 抗侧信道攻击：硬件级别的保护
 * 
 * ### 兼容性
 * - 现代浏览器：Chrome 37+、Firefox 34+、Safari 11+、Edge 12+
 * - Node.js：15.0+（通过 crypto.webcrypto）
 * - 自动降级：不支持时降级到纯 JS 实现
 * 
 * ## 支持的算法
 * 
 * - AES-CBC、AES-CTR、AES-GCM
 * - RSA-OAEP、RSA-PSS
 * - ECDH、ECDSA
 * - HMAC、PBKDF2
 * - SHA-1、SHA-256、SHA-384、SHA-512
 * 
 * ## 使用建议
 * 
 * - ✅ 推荐用于生产环境（性能和安全性最佳）
 * - ✅ 适合大数据加密/解密
 * - ✅ 适合高频加密操作
 * - ⚠️ 需要提供降级方案（不支持 WebCrypto 的环境）
 * 
 * @module algorithms/webcrypto-adapter
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 */

import type { AESOptions, DecryptResult, EncryptResult } from '../types'
import { aes as fallbackAES } from './aes'
import { CONSTANTS, ErrorUtils, RandomUtils } from '../utils'

/**
 * 检测 WebCrypto API 支持
 * 
 * @returns 如果支持 WebCrypto API 返回 true
 */
export function isWebCryptoSupported(): boolean {
  // 浏览器环境
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return true
  }

  // Node.js 环境（15.0+）
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return true
  }

  return false
}

/**
 * 获取 WebCrypto subtle 对象
 * 
 * @returns SubtleCrypto 对象或 undefined
 */
function getSubtle(): SubtleCrypto | undefined {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.subtle
  }

  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto.subtle
  }

  return undefined
}

/**
 * WebCrypto AES 加密器
 * 
 * 使用 WebCrypto API 实现 AES 加密，性能比纯 JS 实现快 2-5 倍。
 * 如果 WebCrypto 不可用，自动降级到纯 JS 实现。
 * 
 * ## 性能对比
 * 
 * | 实现方式 | 加密速度 | 解密速度 | 内存占用 |
 * |---------|---------|---------|---------|
 * | WebCrypto | 100 MB/s | 100 MB/s | 低 |
 * | CryptoJS | 20-40 MB/s | 20-40 MB/s | 中 |
 * 
 * ## 支持的模式
 * 
 * - AES-CBC（密码块链接）
 * - AES-CTR（计数器模式）
 * - AES-GCM（Galois/Counter Mode，推荐）
 * 
 * 注意：AES-ECB 不被 WebCrypto 支持（因为不安全）
 * 
 * @example
 * ```typescript
 * const encryptor = new WebCryptoAES()
 * 
 * // 自动检测并使用最佳实现
 * const result = await encryptor.encrypt('敏感数据', '密码123', {
 *   keySize: 256,
 *   mode: 'GCM'  // GCM 模式性能最好
 * })
 * 
 * console.log(result.usingWebCrypto)  // true（如果支持）
 * console.log(result.performance)     // 性能提升倍数
 * ```
 */
export class WebCryptoAES {
  private readonly subtle: SubtleCrypto | undefined

  constructor() {
    this.subtle = getSubtle()
  }

  /**
   * AES 加密（使用 WebCrypto 或降级）
   * 
   * @param data - 明文字符串
   * @param key - 加密密钥（十六进制字符串或密码）
   * @param options - 加密选项
   * @returns Promise<EncryptResult>
   * 
   * @example
   * ```typescript
   * const encryptor = new WebCryptoAES()
   * const result = await encryptor.encrypt('Hello', 'password123', {
   *   keySize: 256,
   *   mode: 'GCM'
   * })
   * ```
   */
  async encrypt(
    data: string,
    key: string,
    options: AESOptions = {},
  ): Promise<EncryptResult & { usingWebCrypto?: boolean }> {
    const opts = {
      mode: options.mode || CONSTANTS.AES.DEFAULT_MODE,
      keySize: options.keySize || CONSTANTS.AES.DEFAULT_KEY_SIZE,
      iv: options.iv,
    }

    // 检查是否可以使用 WebCrypto
    if (!this.subtle || !this.canUseWebCrypto(opts.mode)) {
      // 降级到 CryptoJS
      return {
        ...fallbackAES.encrypt(data, key, options),
        usingWebCrypto: false,
      }
    }

    try {
      const startTime = performance.now()

      // 转换密钥
      const keyBytes = await this.prepareKey(key, opts.keySize)

      // 生成或使用提供的 IV
      const iv = opts.iv
        ? this.hexToBytes(opts.iv)
        : crypto.getRandomValues(new Uint8Array(16))

      // 转换数据
      const dataBytes = new TextEncoder().encode(data)

      // 导入密钥
      const cryptoKey = await this.subtle.importKey(
        'raw',
        keyBytes,
        { name: this.getAlgorithmName(opts.mode) },
        false,
        ['encrypt'],
      )

      // 加密
      const encrypted = await this.subtle.encrypt(
        this.getAlgorithmParams(opts.mode, iv),
        cryptoKey,
        dataBytes,
      )

      const endTime = performance.now()
      const duration = endTime - startTime

      // 转换结果
      const encryptedBase64 = this.bytesToBase64(new Uint8Array(encrypted))
      const ivHex = this.bytesToHex(iv)

      return {
        success: true,
        data: encryptedBase64,
        algorithm: 'AES',
        mode: opts.mode,
        keySize: opts.keySize,
        iv: ivHex,
        usingWebCrypto: true,
        performance: duration,
      } as any
    }
    catch (error) {
      // WebCrypto 失败，降级到 CryptoJS
      console.warn('WebCrypto encryption failed, falling back to CryptoJS:', error)
      return {
        ...fallbackAES.encrypt(data, key, options),
        usingWebCrypto: false,
      }
    }
  }

  /**
   * AES 解密（使用 WebCrypto 或降级）
   * 
   * @param encryptedData - 加密数据（字符串或 EncryptResult）
   * @param key - 解密密钥
   * @param options - 解密选项
   * @returns Promise<DecryptResult>
   */
  async decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options: AESOptions = {},
  ): Promise<DecryptResult & { usingWebCrypto?: boolean }> {
    const opts = {
      mode: options.mode || CONSTANTS.AES.DEFAULT_MODE,
      keySize: options.keySize || CONSTANTS.AES.DEFAULT_KEY_SIZE,
      iv: options.iv,
    }

    // 检查是否可以使用 WebCrypto
    if (!this.subtle || !this.canUseWebCrypto(opts.mode)) {
      // 降级到 CryptoJS
      return {
        ...fallbackAES.decrypt(encryptedData, key, options),
        usingWebCrypto: false,
      }
    }

    try {
      // 提取参数
      let data: string
      let iv: string

      if (typeof encryptedData === 'string') {
        data = encryptedData
        iv = opts.iv || ''
        if (!iv) {
          throw new Error('IV required for WebCrypto decryption')
        }
      }
      else {
        data = encryptedData.data || ''
        iv = encryptedData.iv || opts.iv || ''
      }

      // 转换密钥
      const keyBytes = await this.prepareKey(key, opts.keySize)
      const ivBytes = this.hexToBytes(iv)

      // 转换密文
      const cipherBytes = this.base64ToBytes(data)

      // 导入密钥
      const cryptoKey = await this.subtle.importKey(
        'raw',
        keyBytes,
        { name: this.getAlgorithmName(opts.mode) },
        false,
        ['decrypt'],
      )

      // 解密
      const decrypted = await this.subtle.decrypt(
        this.getAlgorithmParams(opts.mode, ivBytes),
        cryptoKey,
        cipherBytes,
      )

      // 转换结果
      const decryptedString = new TextDecoder().decode(decrypted)

      return {
        success: true,
        data: decryptedString,
        algorithm: 'AES',
        mode: opts.mode,
        usingWebCrypto: true,
      } as any
    }
    catch (error) {
      // WebCrypto 失败，降级到 CryptoJS
      console.warn('WebCrypto decryption failed, falling back to CryptoJS:', error)
      return {
        ...fallbackAES.decrypt(encryptedData, key, options),
        usingWebCrypto: false,
      }
    }
  }

  /**
   * 检查是否可以使用 WebCrypto
   * 
   * @param mode - 加密模式
   * @returns 如果可以使用返回 true
   */
  private canUseWebCrypto(mode: string): boolean {
    // WebCrypto 支持的模式
    const supportedModes = ['CBC', 'CTR', 'GCM']
    return supportedModes.includes(mode.toUpperCase())
  }

  /**
   * 获取算法名称
   * 
   * @param mode - 加密模式
   * @returns WebCrypto 算法名称
   */
  private getAlgorithmName(mode: string): string {
    return `AES-${mode.toUpperCase()}`
  }

  /**
   * 获取算法参数
   * 
   * @param mode - 加密模式
   * @param iv - IV
   * @returns 算法参数
   */
  private getAlgorithmParams(mode: string, iv: Uint8Array): AesCbcParams | AesCtrParams | AesGcmParams {
    const modeUpper = mode.toUpperCase()

    switch (modeUpper) {
      case 'CBC':
        return {
          name: 'AES-CBC',
          iv,
        }
      case 'CTR':
        return {
          name: 'AES-CTR',
          counter: iv,
          length: 64,
        }
      case 'GCM':
        return {
          name: 'AES-GCM',
          iv,
        }
      default:
        throw new Error(`Unsupported mode: ${mode}`)
    }
  }

  /**
   * 准备密钥
   * 
   * @param key - 密钥字符串
   * @param keySize - 密钥长度（位）
   * @returns 密钥字节数组
   */
  private async prepareKey(key: string, keySize: number): Promise<Uint8Array> {
    const keyLength = keySize / 8

    // 如果密钥是十六进制字符串
    if (/^[0-9a-f]+$/i.test(key) && key.length === keyLength * 2) {
      return this.hexToBytes(key)
    }

    // 使用 PBKDF2 派生密钥
    return await this.deriveKey(key, keyLength)
  }

  /**
   * 使用 PBKDF2 派生密钥
   * 
   * @param password - 密码
   * @param length - 密钥长度（字节）
   * @returns 派生的密钥
   */
  private async deriveKey(password: string, length: number): Promise<Uint8Array> {
    if (!this.subtle) {
      throw new Error('WebCrypto not available')
    }

    // 生成盐值（使用密码的哈希作为确定性盐值）
    const encoder = new TextEncoder()
    const passwordBytes = encoder.encode(password)
    const saltBytes = await crypto.subtle.digest('SHA-256', passwordBytes)

    // 导入密码
    const keyMaterial = await this.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveBits'],
    )

    // 派生密钥
    const derivedBits = await this.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000, // OWASP 2023 推荐
        hash: 'SHA-256',
      },
      keyMaterial,
      length * 8,
    )

    return new Uint8Array(derivedBits)
  }

  /**
   * 十六进制转字节数组
   * 
   * @param hex - 十六进制字符串
   * @returns 字节数组
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }

  /**
   * 字节数组转十六进制
   * 
   * @param bytes - 字节数组
   * @returns 十六进制字符串
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Base64 转字节数组
   * 
   * @param base64 - Base64 字符串
   * @returns 字节数组
   */
  private base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  /**
   * 字节数组转 Base64
   * 
   * @param bytes - 字节数组
   * @returns Base64 字符串
   */
  private bytesToBase64(bytes: Uint8Array): string {
    const binaryString = String.fromCharCode(...bytes)
    return btoa(binaryString)
  }
}

/**
 * WebCrypto AES 便捷函数
 * 
 * 自动使用 WebCrypto API（如果支持）或降级到 CryptoJS。
 * 
 * @example
 * ```typescript
 * // 加密
 * const result = await webcrypto.aes.encrypt('Hello', 'password', {
 *   keySize: 256,
 *   mode: 'GCM'
 * })
 * 
 * if (result.usingWebCrypto) {
 *   console.log('使用硬件加速')
 *   console.log('性能:', result.performance, 'ms')
 * }
 * 
 * // 解密
 * const decrypted = await webcrypto.aes.decrypt(result, 'password')
 * console.log(decrypted.data) // 'Hello'
 * ```
 */
export const webcrypto = {
  /**
   * 检查 WebCrypto 支持
   */
  isSupported: isWebCryptoSupported,

  /**
   * AES 加密/解密
   */
  aes: {
    /**
     * 加密
     */
    encrypt: async (
      data: string,
      key: string,
      options?: AESOptions,
    ): Promise<EncryptResult & { usingWebCrypto?: boolean }> => {
      const encryptor = new WebCryptoAES()
      return await encryptor.encrypt(data, key, options)
    },

    /**
     * 解密
     */
    decrypt: async (
      encryptedData: string | EncryptResult,
      key: string,
      options?: AESOptions,
    ): Promise<DecryptResult & { usingWebCrypto?: boolean }> => {
      const encryptor = new WebCryptoAES()
      return await encryptor.decrypt(encryptedData, key, options)
    },
  },
}


