import type { EncodingType, IEncoder } from '../types'
import CryptoJS from 'crypto-js'
import { ErrorUtils, ValidationUtils } from '../utils'

/**
 * 编码器（单例模式）
 * 
 * 提供字符串与常见编码格式之间的转换功能。
 * 
 * ## 主要特性
 * 
 * ### 支持的编码格式
 * - **Base64**：标准 Base64 编码（RFC 4648）
 * - **Base64 URL-Safe**：URL 安全的 Base64 编码
 * - **Hex**：十六进制编码
 * - **UTF-8**：默认字符编码
 * 
 * ### 性能优化
 * - **单例模式**：全局共享一个实例，避免重复创建
 * - **原生 API 优先**：浏览器环境优先使用 btoa/atob（更快）
 * - **自动降级**：不支持时降级到 CryptoJS 实现
 * 
 * ### 兼容性
 * - **浏览器**：支持现代浏览器和 IE11+
 * - **Node.js**：完全支持
 * - **React Native**：支持
 * 
 * ## 使用场景
 * 
 * - ✅ 加密结果的文本表示（Base64）
 * - ✅ 密钥和 IV 的十六进制表示
 * - ✅ URL 参数传递（URL-Safe Base64）
 * - ✅ 二进制数据的文本存储
 * 
 * ## 重要提示
 * 
 * ⚠️ **编码不是加密**
 * - Base64 和 Hex 仅仅是编码方式，**不提供任何安全性**
 * - 编码后的数据可以轻易解码
 * - 如需保护数据，必须先加密再编码
 * 
 * ## 使用示例
 * 
 * ### 基础编码/解码
 * ```typescript
 * import { encoding } from '@ldesign/crypto'
 * 
 * // Base64 编码
 * const base64 = encoding.encode('Hello 世界', 'base64')
 * console.log(base64) // 'SGVsbG8g5LiW55WM'
 * 
 * // Base64 解码
 * const decoded = encoding.decode(base64, 'base64')
 * console.log(decoded) // 'Hello 世界'
 * 
 * // Hex 编码
 * const hex = encoding.encode('Hello', 'hex')
 * console.log(hex) // '48656c6c6f'
 * 
 * // Hex 解码
 * const decodedHex = encoding.decode(hex, 'hex')
 * console.log(decodedHex) // 'Hello'
 * ```
 * 
 * ### 便捷函数
 * ```typescript
 * import { base64, hex } from '@ldesign/crypto'
 * 
 * // Base64
 * const encoded = base64.encode('Hello')
 * const decoded = base64.decode(encoded)
 * 
 * // URL-Safe Base64
 * const urlSafe = base64.encodeUrl('Hello World')
 * const decodedUrl = base64.decodeUrl(urlSafe)
 * 
 * // Hex
 * const hexEncoded = hex.encode('Hello')
 * const hexDecoded = hex.decode(hexEncoded)
 * ```
 * 
 * ### 加密结果编码
 * ```typescript
 * import { aes, base64 } from '@ldesign/crypto'
 * 
 * // 1. 加密（已经是 Base64 格式）
 * const encrypted = aes.encrypt('敏感数据', 'password')
 * console.log(encrypted.data) // Base64 密文
 * 
 * // 2. 如需转换为 Hex
 * const hexCiphertext = hex.encode(encrypted.data || '')
 * 
 * // 3. 解码回 Base64
 * const base64Ciphertext = hex.decode(hexCiphertext)
 * const decrypted = aes.decrypt(base64Ciphertext, 'password')
 * ```
 * 
 * ### URL 传参
 * ```typescript
 * import { base64 } from '@ldesign/crypto'
 * 
 * // URL-Safe 编码（不含 +/= 字符）
 * const token = base64.encodeUrl('user:password')
 * const url = `https://api.example.com/auth?token=${token}`
 * 
 * // 解码
 * const decoded = base64.decodeUrl(token)
 * console.log(decoded) // 'user:password'
 * ```
 * 
 * ## 技术细节
 * 
 * ### Base64 编码原理
 * - 将 3 个字节（24 位）转换为 4 个 Base64 字符
 * - 字符集：A-Z, a-z, 0-9, +, /
 * - 填充字符：=（用于补齐到 4 的倍数）
 * 
 * ### Hex 编码原理
 * - 将每个字节转换为 2 个十六进制字符
 * - 字符集：0-9, a-f（或 A-F）
 * - 编码后长度 = 原始长度 × 2
 * 
 * ### 性能对比
 * | 编码方式 | 编码速度 | 空间效率 | 可读性 |
 * |----------|---------|---------|--------|
 * | Base64 | 快 | 133% | 中 |
 * | Hex | 快 | 200% | 高 |
 * | UTF-8 | 最快 | 100% | 低（二进制） |
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc4648
 */
export class Encoder implements IEncoder {
  private static instance: Encoder | null = null

  /**
   * 获取单例实例
   */
  static getInstance(): Encoder {
    if (!Encoder.instance) {
      Encoder.instance = new Encoder()
    }
    return Encoder.instance
  }

  /**
   * 私有构造函数，防止外部直接实例化
   */
  private constructor() { }

  /**
   * 编码字符串
   */
  encode(data: string, encoding: EncodingType): string {
    try {
      // 允许空字符串编码
      switch (encoding.toLowerCase()) {
        case 'base64':
          return this.encodeBase64(data)
        case 'hex':
          return this.encodeHex(data)
        case 'utf8':
          return data // UTF-8 是默认编码，无需转换
        default:
          throw ErrorUtils.createEncryptionError(
            `Unsupported encoding type: ${encoding}`,
            'Encoding',
          )
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError(
        'Unknown encoding error',
        'Encoding',
      )
    }
  }

  /**
   * 解码字符串
   */
  decode(encodedData: string, encoding: EncodingType): string {
    try {
      // 允许空字符串解码，空字符串的编码结果解码后应该还是空字符串
      switch (encoding.toLowerCase()) {
        case 'base64':
          return this.decodeBase64(encodedData)
        case 'hex':
          return this.decodeHex(encodedData)
        case 'utf8':
          return encodedData // UTF-8 是默认编码，无需转换
        default:
          throw ErrorUtils.createDecryptionError(
            `Unsupported encoding type: ${encoding}`,
            'Decoding',
          )
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createDecryptionError(
        'Unknown decoding error',
        'Decoding',
      )
    }
  }

  /**
   * Base64 编码
   */
  private encodeBase64(data: string): string {
    try {
      // 优先使用浏览器原生 API
      if (typeof btoa !== 'undefined') {
        return btoa(unescape(encodeURIComponent(data)))
      } else {
        // 使用 CryptoJS 作为后备
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
      }
    } catch {
      throw ErrorUtils.createEncryptionError(
        'Failed to encode Base64',
        'Base64',
      )
    }
  }

  /**
   * Base64 解码
   */
  private decodeBase64(encodedData: string): string {
    try {
      // 验证 Base64 格式
      if (!ValidationUtils.isValidBase64(encodedData)) {
        throw ErrorUtils.createDecryptionError(
          'Invalid Base64 format',
          'Base64',
        )
      }

      // 优先使用浏览器原生 API
      if (typeof atob !== 'undefined') {
        return decodeURIComponent(escape(atob(encodedData)))
      } else {
        // 使用 CryptoJS 作为后备
        return CryptoJS.enc.Utf8.stringify(
          CryptoJS.enc.Base64.parse(encodedData),
        )
      }
    } catch {
      throw ErrorUtils.createDecryptionError(
        'Failed to decode Base64',
        'Base64',
      )
    }
  }

  /**
   * Hex 编码
   */
  private encodeHex(data: string): string {
    try {
      // 使用 CryptoJS
      return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(data))
    } catch {
      throw ErrorUtils.createEncryptionError('Failed to encode Hex', 'Hex')
    }
  }

  /**
   * Hex 解码
   */
  private decodeHex(encodedData: string): string {
    try {
      // 验证 Hex 格式
      if (!ValidationUtils.isValidHex(encodedData)) {
        throw ErrorUtils.createDecryptionError('Invalid Hex format', 'Hex')
      }

      // 使用 CryptoJS
      return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(encodedData))
    } catch {
      throw ErrorUtils.createDecryptionError('Failed to decode Hex', 'Hex')
    }
  }

  /**
   * URL 安全的 Base64 编码
   */
  encodeBase64Url(data: string): string {
    const base64 = this.encodeBase64(data)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * URL 安全的 Base64 解码
   */
  decodeBase64Url(encodedData: string): string {
    // 恢复标准 Base64 格式
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/')

    // 添加必要的填充
    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - padding)
    }

    return this.decodeBase64(base64)
  }
}

/**
 * 编码便捷函数
 * 优化：使用单例实例，避免重复创建
 */
export const encoding = {
  /**
   * Base64 编码
   */
  base64: {
    encode: (data: string): string => {
      return Encoder.getInstance().encode(data, 'base64')
    },
    decode: (encodedData: string): string => {
      return Encoder.getInstance().decode(encodedData, 'base64')
    },
    encodeUrl: (data: string): string => {
      return Encoder.getInstance().encodeBase64Url(data)
    },
    decodeUrl: (encodedData: string): string => {
      return Encoder.getInstance().decodeBase64Url(encodedData)
    },
  },

  /**
   * Hex 编码
   */
  hex: {
    encode: (data: string): string => {
      return Encoder.getInstance().encode(data, 'hex')
    },
    decode: (encodedData: string): string => {
      return Encoder.getInstance().decode(encodedData, 'hex')
    },
  },

  /**
   * 通用编码函数
   */
  encode: (data: string, encoding: EncodingType): string => {
    return Encoder.getInstance().encode(data, encoding)
  },

  /**
   * 通用解码函数
   */
  decode: (encodedData: string, encoding: EncodingType): string => {
    return Encoder.getInstance().decode(encodedData, encoding)
  },
}

/**
 * 向后兼容的别名
 */
export const base64 = encoding.base64
export const hex = encoding.hex
