/**
 * 密钥验证工具
 * 
 * 提供密钥强度检测、格式验证和安全建议功能。
 * 
 * ## 功能
 * 
 * - **格式验证**：检查密钥格式是否正确（Hex、Base64 等）
 * - **长度验证**：确保密钥长度符合算法要求
 * - **熵值估算**：评估密钥的随机性
 * - **安全建议**：提供改进密钥安全性的建议
 * 
 * @module utils/key-validation
 */

import type { AESKeySize, EncryptionAlgorithm } from '../types'

/**
 * 密钥类型
 */
export type KeyType = 'password' | 'hex' | 'base64' | 'raw'

/**
 * 密钥验证结果
 */
export interface KeyValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 检测到的密钥类型 */
  type: KeyType
  /** 密钥长度（字节） */
  lengthBytes: number
  /** 密钥长度（位） */
  lengthBits: number
  /** 估算的熵值（位） */
  entropy: number
  /** 强度等级 */
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
  /** 安全警告 */
  warnings: string[]
  /** 安全建议 */
  suggestions: string[]
  /** 是否适合指定算法 */
  suitableFor: {
    aes128: boolean
    aes192: boolean
    aes256: boolean
    des: boolean
    tripledes: boolean
    rsa: boolean
  }
}

/**
 * 密钥验证选项
 */
export interface KeyValidationOptions {
  /** 目标算法 */
  algorithm?: EncryptionAlgorithm
  /** 目标密钥长度（位） */
  targetBits?: number
  /** 是否严格模式（严格检查格式） */
  strict?: boolean
}

/**
 * 密钥验证器
 * 
 * @example
 * ```typescript
 * import { KeyValidator } from '@ldesign/crypto'
 * 
 * // 验证密码
 * const result = KeyValidator.validate('my-password-123')
 * console.log(result.strength) // 'fair'
 * console.log(result.warnings) // ['Password is relatively short']
 * 
 * // 验证十六进制密钥
 * const hexResult = KeyValidator.validate('0123456789abcdef0123456789abcdef')
 * console.log(hexResult.type) // 'hex'
 * console.log(hexResult.suitableFor.aes128) // true
 * 
 * // 检查是否适合 AES-256
 * const suitable = KeyValidator.isSuitableFor(
 *   '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
 *   'AES',
 *   256
 * )
 * ```
 */
export class KeyValidator {
  /**
   * 验证密钥
   * 
   * @param key - 密钥
   * @param options - 验证选项
   * @returns 验证结果
   */
  static validate(key: string, options: KeyValidationOptions = {}): KeyValidationResult {
    const type = this.detectType(key)
    const lengthBytes = this.getByteLength(key, type)
    const lengthBits = lengthBytes * 8
    const entropy = this.estimateEntropy(key, type)
    const strength = this.calculateStrength(entropy, lengthBits)
    const warnings = this.generateWarnings(key, type, lengthBits, entropy, options)
    const suggestions = this.generateSuggestions(key, type, lengthBits, entropy, options)

    return {
      valid: warnings.filter(w => w.startsWith('CRITICAL')).length === 0,
      type,
      lengthBytes,
      lengthBits,
      entropy,
      strength,
      warnings,
      suggestions,
      suitableFor: {
        aes128: lengthBits >= 128 || (type === 'password' && entropy >= 80),
        aes192: lengthBits >= 192 || (type === 'password' && entropy >= 100),
        aes256: lengthBits >= 256 || (type === 'password' && entropy >= 128),
        des: lengthBits >= 56,
        tripledes: lengthBits >= 168 || (type === 'password' && entropy >= 100),
        rsa: type === 'password' || lengthBits >= 256,
      },
    }
  }

  /**
   * 检查密钥是否适合指定算法
   * 
   * @param key - 密钥
   * @param algorithm - 算法
   * @param keySize - 密钥长度（位）
   * @returns 是否适合
   */
  static isSuitableFor(
    key: string,
    algorithm: EncryptionAlgorithm,
    keySize?: number,
  ): boolean {
    const result = this.validate(key, { algorithm, targetBits: keySize })

    switch (algorithm.toUpperCase()) {
      case 'AES':
        switch (keySize) {
          case 128:
            return result.suitableFor.aes128
          case 192:
            return result.suitableFor.aes192
          case 256:
          default:
            return result.suitableFor.aes256
        }
      case 'DES':
        return result.suitableFor.des
      case '3DES':
        return result.suitableFor.tripledes
      case 'RSA':
        return result.suitableFor.rsa
      default:
        return result.valid
    }
  }

  /**
   * 生成安全密钥
   * 
   * @param algorithm - 算法
   * @param keySize - 密钥长度（位）
   * @returns 十六进制密钥
   */
  static generateSecureKey(algorithm: EncryptionAlgorithm, keySize?: number): string {
    let bytes: number

    switch (algorithm.toUpperCase()) {
      case 'AES':
        bytes = (keySize || 256) / 8
        break
      case 'DES':
        bytes = 8
        break
      case '3DES':
        bytes = 24
        break
      default:
        bytes = 32
    }

    // 使用密码学安全随机数
    const array = new Uint8Array(bytes)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array)
    } else {
      // 降级到 Math.random（不安全，仅用于开发）
      for (let i = 0; i < bytes; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }

    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 检测密钥类型
   */
  private static detectType(key: string): KeyType {
    // 检查是否为有效的十六进制
    if (/^[0-9a-f]+$/i.test(key) && key.length % 2 === 0 && key.length >= 16) {
      return 'hex'
    }

    // 检查是否为有效的 Base64
    if (/^[A-Za-z0-9+/]+=*$/.test(key) && key.length >= 16) {
      try {
        const decoded = atob(key)
        if (decoded.length >= 8) {
          return 'base64'
        }
      } catch {
        // 不是有效 Base64
      }
    }

    // 默认为密码
    return 'password'
  }

  /**
   * 获取密钥字节长度
   */
  private static getByteLength(key: string, type: KeyType): number {
    switch (type) {
      case 'hex':
        return key.length / 2
      case 'base64':
        try {
          return atob(key).length
        } catch {
          return key.length * 3 / 4
        }
      case 'password':
      case 'raw':
      default:
        // UTF-8 编码长度
        return new TextEncoder().encode(key).length
    }
  }

  /**
   * 估算密钥熵值
   * 
   * 熵值表示密钥的随机性/不可预测性，单位是位。
   * 熵值越高，密钥越难被猜测或暴力破解。
   */
  private static estimateEntropy(key: string, type: KeyType): number {
    if (type === 'hex') {
      // 十六进制密钥：每个字符 4 位熵
      return key.length * 4
    }

    if (type === 'base64') {
      // Base64 密钥：每个字符约 6 位熵
      return key.length * 6
    }

    // 密码熵估算
    return this.estimatePasswordEntropy(key)
  }

  /**
   * 估算密码熵值
   */
  private static estimatePasswordEntropy(password: string): number {
    let charsetSize = 0

    // 检查字符集
    if (/[a-z]/.test(password)) charsetSize += 26
    if (/[A-Z]/.test(password)) charsetSize += 26
    if (/[0-9]/.test(password)) charsetSize += 10
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32
    if (/[^\x00-\x7F]/.test(password)) charsetSize += 100 // Unicode

    if (charsetSize === 0) charsetSize = 26 // 默认

    // 基础熵 = log2(charsetSize) * length
    let entropy = Math.log2(charsetSize) * password.length

    // 扣除常见模式的熵
    entropy -= this.detectCommonPatterns(password)

    return Math.max(0, Math.round(entropy))
  }

  /**
   * 检测常见模式并返回应扣除的熵值
   */
  private static detectCommonPatterns(password: string): number {
    let penalty = 0

    // 连续字符
    if (/(.)\1{2,}/.test(password)) {
      penalty += 10
    }

    // 常见单词
    const commonWords = ['password', 'admin', 'user', 'login', '123456', 'qwerty']
    for (const word of commonWords) {
      if (password.toLowerCase().includes(word)) {
        penalty += 20
      }
    }

    // 键盘模式
    const keyboardPatterns = ['qwerty', 'asdf', '1234', 'zxcv']
    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        penalty += 15
      }
    }

    // 日期模式
    if (/\d{4}[-/]?\d{2}[-/]?\d{2}/.test(password)) {
      penalty += 10
    }

    return penalty
  }

  /**
   * 计算强度等级
   */
  private static calculateStrength(
    entropy: number,
    lengthBits: number,
  ): 'weak' | 'fair' | 'good' | 'strong' | 'excellent' {
    // 对于直接密钥，使用位长度
    // 对于密码，使用熵值
    const effectiveStrength = Math.max(entropy, lengthBits / 2)

    if (effectiveStrength < 40) return 'weak'
    if (effectiveStrength < 60) return 'fair'
    if (effectiveStrength < 80) return 'good'
    if (effectiveStrength < 128) return 'strong'
    return 'excellent'
  }

  /**
   * 生成警告信息
   */
  private static generateWarnings(
    key: string,
    type: KeyType,
    lengthBits: number,
    entropy: number,
    options: KeyValidationOptions,
  ): string[] {
    const warnings: string[] = []

    // 长度警告
    if (type === 'password') {
      if (key.length < 8) {
        warnings.push('CRITICAL: Password is too short (minimum 8 characters recommended)')
      } else if (key.length < 12) {
        warnings.push('Password is relatively short (12+ characters recommended)')
      }

      // 熵值警告
      if (entropy < 40) {
        warnings.push('CRITICAL: Password has very low entropy (easily guessable)')
      } else if (entropy < 60) {
        warnings.push('Password entropy is below recommended level')
      }

      // 字符集警告
      if (!/[A-Z]/.test(key)) {
        warnings.push('Password lacks uppercase letters')
      }
      if (!/[0-9]/.test(key)) {
        warnings.push('Password lacks numbers')
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(key)) {
        warnings.push('Password lacks special characters')
      }
    } else {
      // 直接密钥长度检查
      if (options.targetBits && lengthBits < options.targetBits) {
        warnings.push(`Key length (${lengthBits} bits) is less than target (${options.targetBits} bits)`)
      }

      if (lengthBits < 128) {
        warnings.push('Key length is below 128 bits (considered weak for modern standards)')
      }
    }

    return warnings
  }

  /**
   * 生成改进建议
   */
  private static generateSuggestions(
    key: string,
    type: KeyType,
    lengthBits: number,
    entropy: number,
    options: KeyValidationOptions,
  ): string[] {
    const suggestions: string[] = []

    if (type === 'password') {
      if (key.length < 16) {
        suggestions.push('Consider using a longer password (16+ characters)')
      }

      if (entropy < 80) {
        suggestions.push('Use a mix of uppercase, lowercase, numbers, and special characters')
        suggestions.push('Consider using a passphrase (multiple random words)')
      }

      suggestions.push('Consider using a password manager to generate and store strong passwords')
    } else {
      if (lengthBits < 256 && options.algorithm === 'AES') {
        suggestions.push('Consider using AES-256 for maximum security')
      }

      suggestions.push('Use cryptographically secure random number generators for key generation')
    }

    return suggestions
  }
}

/**
 * 便捷函数：验证密钥
 */
export function validateKey(key: string, options?: KeyValidationOptions): KeyValidationResult {
  return KeyValidator.validate(key, options)
}

/**
 * 便捷函数：检查密钥是否适合算法
 */
export function isKeySuitableFor(
  key: string,
  algorithm: EncryptionAlgorithm,
  keySize?: number,
): boolean {
  return KeyValidator.isSuitableFor(key, algorithm, keySize)
}

/**
 * 便捷函数：生成安全密钥
 */
export function generateSecureKey(
  algorithm: EncryptionAlgorithm = 'AES',
  keySize?: number,
): string {
  return KeyValidator.generateSecureKey(algorithm, keySize)
}
