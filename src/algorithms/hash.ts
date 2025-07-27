/**
 * @ldesign/crypto - 哈希算法实现
 * 支持MD5、SHA系列等哈希算法
 */

import CryptoJS from 'crypto-js'
import type {
  CryptoPlugin,
  EncodingFormat,
  HashConfig,
  KeyDerivationConfig,
} from '../types'
import { CryptoError, CryptoErrorType } from '../types'

/**
 * 哈希算法工具类
 */
export class HashCrypto {
  /**
   * MD5哈希
   */
  static md5(data: string, config: HashConfig = {}): string {
    try {
      const {
        salt = '',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      const input = salt ? data + salt : data
      const hash = CryptoJS.MD5(input)

      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `MD5 hashing failed: ${error}`,
        'MD5',
        error,
      )
    }
  }

  /**
   * SHA1哈希
   */
  static sha1(data: string, config: HashConfig = {}): string {
    try {
      const {
        salt = '',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      const input = salt ? data + salt : data
      const hash = CryptoJS.SHA1(input)

      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SHA1 hashing failed: ${error}`,
        'SHA1',
        error,
      )
    }
  }

  /**
   * SHA256哈希
   */
  static sha256(data: string, config: HashConfig = {}): string {
    try {
      const {
        salt = '',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      const input = salt ? data + salt : data
      const hash = CryptoJS.SHA256(input)

      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SHA256 hashing failed: ${error}`,
        'SHA256',
        error,
      )
    }
  }

  /**
   * SHA512哈希
   */
  static sha512(data: string, config: HashConfig = {}): string {
    try {
      const {
        salt = '',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      const input = salt ? data + salt : data
      const hash = CryptoJS.SHA512(input)

      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SHA512 hashing failed: ${error}`,
        'SHA512',
        error,
      )
    }
  }

  /**
   * HMAC-MD5
   */
  static hmacMD5(data: string, key: string, config: HashConfig = {}): string {
    try {
      const { outputEncoding = 'hex' } = config
      const hash = CryptoJS.HmacMD5(data, key)
      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `HMAC-MD5 failed: ${error}`,
        'MD5',
        error,
      )
    }
  }

  /**
   * HMAC-SHA1
   */
  static hmacSHA1(data: string, key: string, config: HashConfig = {}): string {
    try {
      const { outputEncoding = 'hex' } = config
      const hash = CryptoJS.HmacSHA1(data, key)
      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `HMAC-SHA1 failed: ${error}`,
        'SHA1',
        error,
      )
    }
  }

  /**
   * HMAC-SHA256
   */
  static hmacSHA256(data: string, key: string, config: HashConfig = {}): string {
    try {
      const { outputEncoding = 'hex' } = config
      const hash = CryptoJS.HmacSHA256(data, key)
      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `HMAC-SHA256 failed: ${error}`,
        'SHA256',
        error,
      )
    }
  }

  /**
   * HMAC-SHA512
   */
  static hmacSHA512(data: string, key: string, config: HashConfig = {}): string {
    try {
      const { outputEncoding = 'hex' } = config
      const hash = CryptoJS.HmacSHA512(data, key)
      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `HMAC-SHA512 failed: ${error}`,
        'SHA512',
        error,
      )
    }
  }

  /**
   * PBKDF2密钥派生
   */
  static pbkdf2(config: KeyDerivationConfig): string {
    try {
      const {
        password,
        salt,
        iterations = 10000,
        keyLength = 32,
        hashAlgorithm = 'SHA256',
      } = config

      let hash: any
      switch (hashAlgorithm) {
        case 'SHA1':
          hash = CryptoJS.algo.SHA1
          break
        case 'SHA256':
          hash = CryptoJS.algo.SHA256
          break
        case 'SHA512':
          hash = CryptoJS.algo.SHA512
          break
        default:
          hash = CryptoJS.algo.SHA256
      }

      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: keyLength / 4, // CryptoJS使用32位字为单位
        iterations,
        hasher: hash,
      })

      return key.toString(CryptoJS.enc.Hex)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.KEY_GENERATION_FAILED,
        `PBKDF2 key derivation failed: ${error}`,
        'SHA256',
        error,
      )
    }
  }

  /**
   * 文件哈希（分块处理大文件）
   */
  static async hashFile(
    file: File | Blob,
    algorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' = 'SHA256',
    chunkSize: number = 1024 * 1024, // 1MB
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        let offset = 0
        let hasher: any

        // 选择哈希算法
        switch (algorithm) {
          case 'MD5':
            hasher = CryptoJS.algo.MD5.create()
            break
          case 'SHA1':
            hasher = CryptoJS.algo.SHA1.create()
            break
          case 'SHA256':
            hasher = CryptoJS.algo.SHA256.create()
            break
          case 'SHA512':
            hasher = CryptoJS.algo.SHA512.create()
            break
          default:
            hasher = CryptoJS.algo.SHA256.create()
        }

        const readNextChunk = () => {
          if (offset >= file.size) {
            // 完成哈希计算
            const hash = hasher.finalize()
            resolve(hash.toString(CryptoJS.enc.Hex))
            return
          }

          const chunk = file.slice(offset, offset + chunkSize)
          reader.readAsArrayBuffer(chunk)
        }

        reader.onload = (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
          hasher.update(wordArray)
          offset += chunkSize
          readNextChunk()
        }

        reader.onerror = () => {
          reject(new CryptoError(
            CryptoErrorType.ENCRYPTION_FAILED,
            'File reading failed during hashing',
            algorithm,
          ))
        }

        readNextChunk()
      }
 catch (error) {
        reject(new CryptoError(
          CryptoErrorType.ENCRYPTION_FAILED,
          `File hashing failed: ${error}`,
          algorithm,
          error,
        ))
      }
    })
  }

  /**
   * 验证哈希值
   */
  static verifyHash(
    data: string,
    expectedHash: string,
    algorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA512',
    config: HashConfig = {},
  ): boolean {
    try {
      let actualHash: string

      switch (algorithm) {
        case 'MD5':
          actualHash = this.md5(data, config)
          break
        case 'SHA1':
          actualHash = this.sha1(data, config)
          break
        case 'SHA256':
          actualHash = this.sha256(data, config)
          break
        case 'SHA512':
          actualHash = this.sha512(data, config)
          break
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      return actualHash.toLowerCase() === expectedHash.toLowerCase()
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.VERIFICATION_FAILED,
        `Hash verification failed: ${error}`,
        algorithm,
        error,
      )
    }
  }

  /**
   * 生成随机盐值
   */
  static generateSalt(length: number = 16): string {
    const salt = CryptoJS.lib.WordArray.random(length)
    return salt.toString(CryptoJS.enc.Hex)
  }

  /**
   * 格式化输出
   */
  private static formatOutput(hash: CryptoJS.lib.WordArray, encoding: EncodingFormat): string {
    switch (encoding) {
      case 'hex':
        return hash.toString(CryptoJS.enc.Hex)
      case 'base64':
        return hash.toString(CryptoJS.enc.Base64)
      case 'utf8':
        return hash.toString(CryptoJS.enc.Utf8)
      case 'binary':
        return hash.toString(CryptoJS.enc.Latin1)
      default:
        return hash.toString(CryptoJS.enc.Hex)
    }
  }
}

/**
 * 密码强度检测
 */
export class PasswordStrength {
  /**
   * 检测密码强度
   */
  static check(password: string): {
    score: number
    level: 'weak' | 'medium' | 'strong' | 'very-strong'
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []

    // 长度检查
    if (password.length >= 8)
score += 1
    else suggestions.push('密码长度至少8位')

    if (password.length >= 12)
score += 1
    else suggestions.push('建议密码长度12位以上')

    // 字符类型检查
    if (/[a-z]/.test(password))
score += 1
    else suggestions.push('包含小写字母')

    if (/[A-Z]/.test(password))
score += 1
    else suggestions.push('包含大写字母')

    if (/\d/.test(password))
score += 1
    else suggestions.push('包含数字')

    if (/[^a-z0-9]/i.test(password))
score += 1
    else suggestions.push('包含特殊字符')

    // 复杂度检查
    if (!/(.)\1{2,}/.test(password))
score += 1
    else suggestions.push('避免连续重复字符')

    if (!/123|abc|qwe/i.test(password))
score += 1
    else suggestions.push('避免常见字符序列')

    // 确定强度等级
    let level: 'weak' | 'medium' | 'strong' | 'very-strong'
    if (score <= 3)
level = 'weak'
    else if (score <= 5)
level = 'medium'
    else if (score <= 7)
level = 'strong'
    else level = 'very-strong'

    return { score, level, suggestions }
  }

  /**
   * 生成安全密码
   */
  static generate(
    length: number = 16,
    options: {
      includeUppercase?: boolean
      includeLowercase?: boolean
      includeNumbers?: boolean
      includeSymbols?: boolean
      excludeSimilar?: boolean
    } = {},
  ): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true,
    } = options

    let charset = ''
    if (includeLowercase)
charset += 'abcdefghijklmnopqrstuvwxyz'
    if (includeUppercase)
charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeNumbers)
charset += '0123456789'
    if (includeSymbols)
charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '')
    }

    if (!charset) {
      throw new Error('At least one character type must be included')
    }

    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }

    return password
  }
}

/**
 * 哈希算法插件
 */
export const HashPlugin: CryptoPlugin = {
  name: 'hash',
  algorithms: ['MD5', 'SHA1', 'SHA256', 'SHA512'],

  async init() {
    console.log('[HashPlugin] Initialized')
  },

  async destroy() {
    console.log('[HashPlugin] Destroyed')
  },
}
