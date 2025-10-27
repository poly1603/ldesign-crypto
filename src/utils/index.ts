import type { EncodingType } from '../types'
import CryptoJS from 'crypto-js'

export * from './advanced-validation'

/**
 * 字符串转换工具
 *
 * 提供字符串与常见编码（Base64、Hex、UTF-8）之间的转换便捷方法。
 * 
 * ## 主要功能
 * 
 * ### 编码转换
 * - **UTF-8 ⇄ Base64**：字符串与 Base64 相互转换
 * - **UTF-8 ⇄ Hex**：字符串与十六进制相互转换
 * - **WordArray ⇄ String**：CryptoJS WordArray 与字符串转换
 * 
 * ### 使用场景
 * - 密钥和 IV 的格式转换
 * - 加密结果的编码转换
 * - 二进制数据的文本表示
 * 
 * ## 使用示例
 * 
 * ```typescript
 * import { StringUtils } from '@ldesign/crypto'
 * 
 * // 字符串转 Base64
 * const base64 = StringUtils.stringToBase64('Hello 世界')
 * console.log(base64) // 'SGVsbG8g5LiW55WM'
 * 
 * // Base64 转字符串
 * const str = StringUtils.base64ToString(base64)
 * console.log(str) // 'Hello 世界'
 * 
 * // 字符串转 Hex
 * const hex = StringUtils.stringToHex('Hello')
 * console.log(hex) // '48656c6c6f'
 * 
 * // Hex 转字符串
 * const str2 = StringUtils.hexToString(hex)
 * console.log(str2) // 'Hello'
 * ```
 */
export class StringUtils {
  /**
   * 字符串转 WordArray
   * @param str 输入的 UTF-8 字符串
   * @returns CryptoJS 的 WordArray 表示
   */
  static stringToWordArray(str: string): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Utf8.parse(str)
  }

  /**
   * WordArray 转字符串
   * @param wordArray CryptoJS WordArray
   * @returns UTF-8 字符串
   */
  static wordArrayToString(wordArray: CryptoJS.lib.WordArray): string {
    return CryptoJS.enc.Utf8.stringify(wordArray)
  }

  /**
   * 字符串转 Base64
   * @param str 输入 UTF-8 字符串
   * @returns Base64 字符串
   */
  static stringToBase64(str: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str))
  }

  /**
   * Base64 转字符串
   * @param base64 Base64 字符串
   * @returns UTF-8 字符串
   */
  static base64ToString(base64: string): string {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64))
  }

  /**
   * 字符串转 Hex
   * @param str 输入 UTF-8 字符串
   * @returns 十六进制字符串
   */
  static stringToHex(str: string): string {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(str))
  }

  /**
   * Hex 转字符串
   * @param hex 十六进制字符串
   * @returns UTF-8 字符串
   */
  static hexToString(hex: string): string {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(hex))
  }

  /**
   * 根据编码类型转换字符串
   * @param str 输入 UTF-8 字符串
   * @param encoding 'base64' | 'hex' | 'utf8'
   */
  static encodeString(str: string, encoding: EncodingType): string {
    switch (encoding) {
      case 'base64':
        return this.stringToBase64(str)
      case 'hex':
        return this.stringToHex(str)
      case 'utf8':
      default:
        return str
    }
  }

  /**
   * 根据编码类型解码字符串
   * @param encodedStr 已编码的字符串
   * @param encoding 'base64' | 'hex' | 'utf8'
   */
  static decodeString(encodedStr: string, encoding: EncodingType): string {
    switch (encoding) {
      case 'base64':
        return this.base64ToString(encodedStr)
      case 'hex':
        return this.hexToString(encodedStr)
      case 'utf8':
      default:
        return encodedStr
    }
  }
}

/**
 * 随机数生成工具（密码学安全）
 * 
 * 提供密码学安全的随机数生成功能，用于生成密钥、盐值、IV 等。
 * 
 * ## 主要特性
 * 
 * ### 密码学安全
 * - **CSPRNG**：使用密码学安全的伪随机数生成器
 * - **浏览器**：使用 `crypto.getRandomValues()`
 * - **Node.js**：使用 `crypto.randomBytes()`
 * - **不可预测**：无法通过已知输出预测下一个输出
 * 
 * ### 支持的格式
 * - **WordArray**：CryptoJS 原生格式
 * - **十六进制**：可读的十六进制字符串
 * - **Base64**：紧凑的 Base64 字符串
 * 
 * ## 安全警告
 * 
 * ⚠️ **不要使用 Math.random()**
 * ```typescript
 * // ❌ 不安全：Math.random() 不是密码学安全的
 * const key = Math.random().toString(36) // 可预测！
 * 
 * // ✅ 安全：使用 RandomUtils
 * const key = RandomUtils.generateKey(32) // 密码学安全
 * ```
 * 
 * ## 使用示例
 * 
 * ### 生成密钥
 * ```typescript
 * import { RandomUtils } from '@ldesign/crypto'
 * 
 * // AES-256 密钥（32 字节 = 64 个十六进制字符）
 * const aesKey = RandomUtils.generateKey(32)
 * console.log(aesKey.length) // 64
 * 
 * // AES-128 密钥（16 字节 = 32 个十六进制字符）
 * const aesKey128 = RandomUtils.generateKey(16)
 * console.log(aesKey128.length) // 32
 * ```
 * 
 * ### 生成 IV
 * ```typescript
 * // AES IV（16 字节）
 * const iv = RandomUtils.generateIV(16)
 * console.log(iv.length) // 32（十六进制）
 * 
 * // 使用生成的 IV
 * import { aes } from '@ldesign/crypto'
 * const encrypted = aes.encrypt('data', 'key', { iv })
 * ```
 * 
 * ### 生成盐值
 * ```typescript
 * // 密码哈希盐值（16 字节）
 * const salt = RandomUtils.generateSalt(16)
 * 
 * // 用于密钥派生
 * import { deriveKey } from '@ldesign/crypto'
 * const derivedKey = await deriveKey('password', {
 *   salt,
 *   iterations: 100000
 * })
 * ```
 * 
 * ### 不同编码格式
 * ```typescript
 * // 十六进制（默认）
 * const hexRandom = RandomUtils.generateRandomString(16, 'hex')
 * 
 * // Base64
 * const base64Random = RandomUtils.generateRandomString(16, 'base64')
 * 
 * // WordArray（CryptoJS 原生）
 * const wordArray = RandomUtils.generateRandomBytes(16)
 * ```
 * 
 * ## 技术细节
 * 
 * ### 熵源
 * - **浏览器**：使用操作系统的熵池
 * - **Node.js**：使用 /dev/urandom 或 CryptGenRandom
 * - **熵质量**：满足密码学安全要求
 * 
 * ### 性能
 * - 生成 32 字节随机数：~0.01 ms
 * - 无性能瓶颈（直接调用系统 API）
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 */
export class RandomUtils {
  /**
   * 生成随机字节
   * @param length 字节长度
   */
  static generateRandomBytes(length: number): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(length)
  }

  /**
   * 生成随机字符串
   * @param length 字节长度（将被转换为不同编码的字符串）
   * @param encoding 输出编码类型：'base64' | 'hex' | 'utf8'（默认 hex）
   */
  static generateRandomString(
    length: number,
    encoding: EncodingType = 'hex',
  ): string {
    const randomBytes = this.generateRandomBytes(length)
    switch (encoding) {
      case 'base64':
        return CryptoJS.enc.Base64.stringify(randomBytes)
      case 'hex':
        return CryptoJS.enc.Hex.stringify(randomBytes)
      case 'utf8':
        return CryptoJS.enc.Utf8.stringify(randomBytes)
      default:
        return CryptoJS.enc.Hex.stringify(randomBytes)
    }
  }

  /**
   * 生成盐值
   * @param length 盐值字节长度（默认 16）
   * @returns 十六进制字符串
   */
  static generateSalt(length: number = 16): string {
    return this.generateRandomString(length, 'hex')
  }

  /**
   * 生成初始化向量 (IV)
   * @param length IV 字节长度（默认 16）
   * @returns 十六进制字符串
   */
  static generateIV(length: number = 16): string {
    return this.generateRandomString(length, 'hex')
  }

  /**
   * 生成随机密钥
   * @param length 期望的字节长度，返回的十六进制字符串长度为 length * 2
   * @returns 十六进制字符串
   */
  static generateKey(length: number = 32): string {
    // length 是字节长度，生成对应的十六进制字符串（长度为 length * 2）
    return this.generateRandomString(length, 'hex')
  }
}

/**
 * 验证工具
 * 
 * 提供各种数据验证功能，用于参数校验和数据格式检查。
 * 
 * ## 主要功能
 * 
 * ### 格式验证
 * - **Base64 验证**：检查是否为有效的 Base64 字符串
 * - **Hex 验证**：检查是否为有效的十六进制字符串
 * - **密钥长度验证**：检查密钥长度是否符合要求
 * 
 * ### 空值检查
 * - **isEmpty**：安全的空值检查（处理 null、undefined、空白字符串）
 * 
 * ## 使用示例
 * 
 * ```typescript
 * import { ValidationUtils } from '@ldesign/crypto'
 * 
 * // 1. 空值检查
 * ValidationUtils.isEmpty('') // true
 * ValidationUtils.isEmpty('  ') // true
 * ValidationUtils.isEmpty('hello') // false
 * ValidationUtils.isEmpty(null) // true
 * 
 * // 2. Base64 验证
 * ValidationUtils.isValidBase64('SGVsbG8=') // true
 * ValidationUtils.isValidBase64('invalid!@#') // false
 * 
 * // 3. Hex 验证
 * ValidationUtils.isValidHex('48656c6c6f') // true
 * ValidationUtils.isValidHex('xyz') // false
 * 
 * // 4. 密钥长度验证
 * ValidationUtils.validateAESKeyLength('12345678', 128) // true/false
 * ```
 * 
 * ## 实际应用
 * 
 * ### 参数验证
 * ```typescript
 * function encrypt(data: string, key: string) {
 *   // 验证参数
 *   if (ValidationUtils.isEmpty(data)) {
 *     throw new Error('Data cannot be empty')
 *   }
 *   
 *   if (ValidationUtils.isEmpty(key)) {
 *     throw new Error('Key cannot be empty')
 *   }
 *   
 *   // 验证密钥格式
 *   if (!ValidationUtils.isValidHex(key)) {
 *     console.warn('Key is not hex, will derive using PBKDF2')
 *   }
 *   
 *   // 继续加密...
 * }
 * ```
 * 
 * ### IV 验证
 * ```typescript
 * function encryptWithIV(data: string, key: string, iv: string) {
 *   // 验证 IV 格式
 *   if (!ValidationUtils.isValidHex(iv)) {
 *     throw new Error('IV must be a hex string')
 *   }
 *   
 *   // 验证 IV 长度（16 字节 = 32 个十六进制字符）
 *   if (iv.length !== 32) {
 *     throw new Error('IV must be 16 bytes (32 hex characters)')
 *   }
 *   
 *   // 继续加密...
 * }
 * ```
 */
export class ValidationUtils {
  /**
   * 验证字符串是否为空
   * @param str 目标字符串
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0
  }

  /**
   * 验证是否为有效的 Base64 字符串
   * 兼容浏览器与 Node 环境（无 atob/btoa 时使用正则与 CryptoJS 校验）
   * @param str Base64 字符串
   */
  static isValidBase64(str: string): boolean {
    if (typeof str !== 'string') { return false }
    // 允许空字符串作为有效 Base64（某些场景下编码空字符串）
    if (str.length === 0) { return true }

    // 基础格式校验：长度为 4 的倍数，允许 0~2 个 '=' 结尾填充
    if (str.length % 4 !== 0) { return false }
    if (!/^[A-Z0-9+/]+={0,2}$/i.test(str)) { return false }

    // 优先尝试浏览器原生 API（若存在）
    try {
      // 在浏览器环境优先使用原生 API
      if (typeof atob === 'function' && typeof btoa === 'function') {
        return btoa(atob(str)) === str
      }
    }
    catch {
      // 若原生 API 失败，继续使用 CryptoJS 进行校验
    }

    // 使用 CryptoJS 进行安全的解析/回写校验
    try {
      const wa = CryptoJS.enc.Base64.parse(str)
      const roundtrip = CryptoJS.enc.Base64.stringify(wa)
      // 去除末尾填充后比较，避免等价的不同填充形式导致误判
      return roundtrip.replace(/=+$/, '') === str.replace(/=+$/, '')
    }
    catch {
      return false
    }
  }

  /**
   * 验证是否为有效的 Hex 字符串
   * @param str 十六进制字符串
   */
  static isValidHex(str: string): boolean {
    // 空字符串是有效的Hex字符串
    if (str === '') { return true }
    return /^[0-9a-f]+$/i.test(str) && str.length % 2 === 0
  }

  /**
   * 验证密钥长度
   * @param key 密钥字符串
   * @param expectedLength 期望字节长度
   */
  static validateKeyLength(key: string, expectedLength: number): boolean {
    return key.length === expectedLength
  }

  /**
   * 验证 AES 密钥长度
   * @param key 明文密钥字符串
   * @param keySize 位数（128/192/256）
   */
  static validateAESKeyLength(key: string, keySize: number): boolean {
    const expectedLength = keySize / 8 // 转换为字节长度
    return key.length >= expectedLength
  }
}

/**
 * 错误处理工具
 * 
 * 提供统一的错误创建和处理功能，确保错误信息的一致性和安全性。
 * 
 * ## 主要功能
 * 
 * ### 错误创建
 * - **createEncryptionError**：创建加密错误
 * - **createDecryptionError**：创建解密错误
 * - **createHashError**：创建哈希错误
 * - **createValidationError**：创建验证错误
 * 
 * ### 错误处理
 * - **handleError**：统一的错误处理
 * - **自动错误分类**：根据错误类型自动分类
 * - **安全的错误消息**：不泄露敏感信息
 * 
 * ## 安全考虑
 * 
 * ### 不要泄露敏感信息
 * ```typescript
 * // ❌ 不安全：泄露密钥
 * throw new Error(`Encryption failed with key: ${key}`)
 * 
 * // ✅ 安全：不泄露敏感信息
 * throw ErrorUtils.createEncryptionError('Encryption failed', 'AES')
 * ```
 * 
 * ### 统一的错误响应
 * ```typescript
 * // 所有算法返回一致的错误格式
 * const result = aes.encrypt('data', '')
 * if (!result.success) {
 *   console.error(result.error) // 标准化的错误消息
 * }
 * ```
 * 
 * ## 使用示例
 * 
 * ### 创建错误
 * ```typescript
 * import { ErrorUtils } from '@ldesign/crypto'
 * 
 * // 加密错误
 * throw ErrorUtils.createEncryptionError('Invalid key', 'AES')
 * // Error: Encryption Error (AES): Invalid key
 * 
 * // 解密错误
 * throw ErrorUtils.createDecryptionError('Invalid ciphertext', 'RSA')
 * // Error: Decryption Error (RSA): Invalid ciphertext
 * 
 * // 哈希错误
 * throw ErrorUtils.createHashError('Unsupported algorithm', 'MD5')
 * // Error: Hash Error (MD5): Unsupported algorithm
 * ```
 * 
 * ### 错误处理
 * ```typescript
 * try {
 *   const encrypted = aes.encrypt('data', 'key')
 * } catch (error) {
 *   const message = ErrorUtils.handleError(error, 'AES Encryption')
 *   console.error(message)
 * }
 * ```
 * 
 * ## 错误类型
 * 
 * 所有错误都设置了 `name` 属性，便于区分：
 * 
 * ```typescript
 * try {
 *   // ...
 * } catch (error) {
 *   if (error.name === 'EncryptionError') {
 *     console.error('加密失败')
 *   } else if (error.name === 'DecryptionError') {
 *     console.error('解密失败')
 *   }
 * }
 * ```
 */
export class ErrorUtils {
  /**
   * 创建加密错误
   */
  static createEncryptionError(message: string, algorithm?: string): Error {
    const error = new Error(
      `Encryption Error${algorithm ? ` (${algorithm})` : ''}: ${message}`,
    )
    error.name = 'EncryptionError'
    return error
  }

  /**
   * 创建解密错误
   */
  static createDecryptionError(message: string, algorithm?: string): Error {
    const error = new Error(
      `Decryption Error${algorithm ? ` (${algorithm})` : ''}: ${message}`,
    )
    error.name = 'DecryptionError'
    return error
  }

  /**
   * 创建哈希错误
   */
  static createHashError(message: string, algorithm?: string): Error {
    const error = new Error(
      `Hash Error${algorithm ? ` (${algorithm})` : ''}: ${message}`,
    )
    error.name = 'HashError'
    return error
  }

  /**
   * 创建验证错误
   */
  static createValidationError(message: string): Error {
    const error = new Error(`Validation Error: ${message}`)
    error.name = 'ValidationError'
    return error
  }

  /**
   * 处理错误
   */
  static handleError(error: unknown, context?: string): string {
    const message = error instanceof Error ? error.message : String(error)
    return context ? `${context}: ${message}` : message
  }
}

/**
 * 常量定义
 */
export const CONSTANTS = {
  // AES 相关常量
  AES: {
    KEY_SIZES: [128, 192, 256] as const,
    MODES: ['CBC', 'ECB', 'CFB', 'OFB', 'CTR', 'GCM'] as const,
    DEFAULT_MODE: 'CBC' as const,
    DEFAULT_KEY_SIZE: 256 as const,
    IV_LENGTH: 16,
  },

  // RSA 相关常量
  RSA: {
    KEY_SIZES: [1024, 2048, 3072, 4096] as const,
    DEFAULT_KEY_SIZE: 2048 as const,
  },

  // 哈希相关常量
  HASH: {
    ALGORITHMS: [
      'MD5',
      'SHA1',
      'SHA224',
      'SHA256',
      'SHA384',
      'SHA512',
    ] as const,
  },

  // HMAC 相关常量
  HMAC: {
    ALGORITHMS: [
      'HMAC-MD5',
      'HMAC-SHA1',
      'HMAC-SHA256',
      'HMAC-SHA384',
      'HMAC-SHA512',
    ] as const,
  },

  // 编码相关常量
  ENCODING: {
    TYPES: ['base64', 'hex', 'utf8'] as const,
    DEFAULT: 'hex' as const,
  },
} as const

export * from './benchmark'
// 导出新增实用工具
export * from './compression'
export * from './crypto-helpers'
export * from './errors'
export * from './key-derivation'
export * from './key-rotation'
// 导出 LRU 缓存
export { LRUCache, type LRUCacheOptions } from './lru-cache'
export * from './object-pool'
export * from './performance-logger'
export * from './rate-limiter'
export * from './secure-storage'
export * from './secure-memory'
export * from './timing-safe'
export * from './error-handler-decorator'
