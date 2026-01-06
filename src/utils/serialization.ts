/**
 * 加密结果序列化工具
 * 
 * 提供 EncryptResult 的序列化和反序列化功能，支持多种格式。
 * 
 * ## 使用场景
 * 
 * - 存储加密数据到数据库
 * - 通过网络传输加密数据
 * - 在 localStorage/sessionStorage 中存储
 * - 生成可分享的加密文本
 * 
 * ## 支持的格式
 * 
 * - **JSON**：完整的 JSON 格式，包含所有元数据
 * - **Compact**：紧凑格式，使用分隔符连接关键信息
 * - **Base64**：Base64 编码的紧凑格式
 * 
 * @module utils/serialization
 */

import type { DecryptResult, EncryptResult } from '../types'

/**
 * 序列化格式
 */
export type SerializationFormat = 'json' | 'compact' | 'base64'

/**
 * 序列化选项
 */
export interface SerializationOptions {
  /** 序列化格式 */
  format?: SerializationFormat
  /** 是否包含元数据（仅 JSON 格式） */
  includeMetadata?: boolean
  /** 自定义分隔符（仅 compact 格式） */
  separator?: string
}

/**
 * 紧凑格式的加密数据结构
 */
interface CompactEncryptData {
  /** 算法标识 */
  a: string
  /** 密文 */
  d: string
  /** IV */
  i?: string
  /** 模式 */
  m?: string
  /** 密钥长度 */
  k?: number
  /** 盐值 */
  s?: string
  /** 版本 */
  v?: number
}

/**
 * 加密结果序列化器
 * 
 * @example
 * ```typescript
 * import { EncryptResultSerializer } from '@ldesign/crypto'
 * 
 * // 加密
 * const encrypted = aes.encrypt('data', 'key')
 * 
 * // 序列化为 JSON
 * const json = EncryptResultSerializer.serialize(encrypted)
 * 
 * // 序列化为紧凑格式
 * const compact = EncryptResultSerializer.serialize(encrypted, { format: 'compact' })
 * 
 * // 序列化为 Base64
 * const base64 = EncryptResultSerializer.serialize(encrypted, { format: 'base64' })
 * 
 * // 反序列化
 * const restored = EncryptResultSerializer.deserialize(json)
 * const restoredCompact = EncryptResultSerializer.deserialize(compact, { format: 'compact' })
 * ```
 */
export class EncryptResultSerializer {
  /** 当前序列化版本 */
  private static readonly VERSION = 1
  
  /** 默认分隔符 */
  private static readonly DEFAULT_SEPARATOR = '.'

  /**
   * 序列化加密结果
   * 
   * @param result - 加密结果对象
   * @param options - 序列化选项
   * @returns 序列化后的字符串
   */
  static serialize(
    result: EncryptResult,
    options: SerializationOptions = {},
  ): string {
    const format = options.format || 'json'

    switch (format) {
      case 'json':
        return this.serializeToJSON(result, options.includeMetadata ?? true)
      case 'compact':
        return this.serializeToCompact(result, options.separator)
      case 'base64':
        return this.serializeToBase64(result)
      default:
        throw new Error(`Unsupported serialization format: ${format}`)
    }
  }

  /**
   * 反序列化加密结果
   * 
   * @param data - 序列化的字符串
   * @param options - 反序列化选项
   * @returns 加密结果对象
   */
  static deserialize(
    data: string,
    options: SerializationOptions = {},
  ): EncryptResult {
    const format = options.format || this.detectFormat(data)

    switch (format) {
      case 'json':
        return this.deserializeFromJSON(data)
      case 'compact':
        return this.deserializeFromCompact(data, options.separator)
      case 'base64':
        return this.deserializeFromBase64(data)
      default:
        throw new Error(`Unsupported serialization format: ${format}`)
    }
  }

  /**
   * 检测序列化格式
   */
  private static detectFormat(data: string): SerializationFormat {
    // 尝试解析为 JSON
    if (data.startsWith('{')) {
      try {
        JSON.parse(data)
        return 'json'
      } catch {
        // 不是有效 JSON
      }
    }

    // 检查是否为 Base64（以 eyJ 开头表示 Base64 编码的 JSON）
    if (/^[A-Za-z0-9+/]+=*$/.test(data) && data.length > 20) {
      try {
        const decoded = atob(data)
        if (decoded.startsWith('{')) {
          return 'base64'
        }
      } catch {
        // 不是有效 Base64
      }
    }

    // 默认为 compact 格式
    return 'compact'
  }

  /**
   * 序列化为 JSON 格式
   */
  private static serializeToJSON(
    result: EncryptResult,
    includeMetadata: boolean,
  ): string {
    const data: Record<string, unknown> = {
      success: result.success,
      data: result.data,
      algorithm: result.algorithm,
    }

    if (result.iv) data.iv = result.iv
    if (result.mode) data.mode = result.mode
    if (result.keySize) data.keySize = result.keySize
    if (result.salt) data.salt = result.salt
    if (result.error) data.error = result.error

    if (includeMetadata) {
      data._v = this.VERSION
      data._t = Date.now()
    }

    return JSON.stringify(data)
  }

  /**
   * 从 JSON 反序列化
   */
  private static deserializeFromJSON(json: string): EncryptResult {
    try {
      const data = JSON.parse(json)
      return {
        success: data.success ?? true,
        data: data.data,
        algorithm: data.algorithm || 'AES',
        iv: data.iv,
        mode: data.mode,
        keySize: data.keySize,
        salt: data.salt,
        error: data.error,
      }
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  /**
   * 序列化为紧凑格式
   * 格式: algorithm.ciphertext.iv.mode.keySize
   */
  private static serializeToCompact(
    result: EncryptResult,
    separator = this.DEFAULT_SEPARATOR,
  ): string {
    const compact: CompactEncryptData = {
      a: result.algorithm,
      d: result.data || '',
      v: this.VERSION,
    }

    if (result.iv) compact.i = result.iv
    if (result.mode) compact.m = result.mode
    if (result.keySize) compact.k = result.keySize
    if (result.salt) compact.s = result.salt

    // 使用简化的 JSON 格式，然后用分隔符连接
    const parts = [
      compact.a,
      compact.d,
      compact.i || '',
      compact.m || '',
      String(compact.k || ''),
    ]

    return parts.join(separator)
  }

  /**
   * 从紧凑格式反序列化
   */
  private static deserializeFromCompact(
    data: string,
    separator = this.DEFAULT_SEPARATOR,
  ): EncryptResult {
    const parts = data.split(separator)

    if (parts.length < 2) {
      throw new Error('Invalid compact format: not enough parts')
    }

    return {
      success: true,
      algorithm: parts[0] || 'AES',
      data: parts[1],
      iv: parts[2] || undefined,
      mode: parts[3] || undefined,
      keySize: parts[4] ? Number.parseInt(parts[4], 10) : undefined,
    }
  }

  /**
   * 序列化为 Base64 格式
   */
  private static serializeToBase64(result: EncryptResult): string {
    const json = this.serializeToJSON(result, false)
    return btoa(json)
  }

  /**
   * 从 Base64 反序列化
   */
  private static deserializeFromBase64(base64: string): EncryptResult {
    try {
      const json = atob(base64)
      return this.deserializeFromJSON(json)
    } catch (error) {
      throw new Error(`Failed to decode Base64: ${error instanceof Error ? error.message : 'Invalid Base64'}`)
    }
  }

  /**
   * 验证序列化数据的完整性
   * 
   * @param data - 序列化的字符串
   * @param options - 选项
   * @returns 是否有效
   */
  static validate(data: string, options: SerializationOptions = {}): boolean {
    try {
      const result = this.deserialize(data, options)
      return result.success !== undefined && result.algorithm !== undefined
    } catch {
      return false
    }
  }

  /**
   * 获取序列化数据的信息（不解密）
   * 
   * @param data - 序列化的字符串
   * @returns 元数据信息
   */
  static getInfo(data: string): {
    algorithm?: string
    mode?: string
    keySize?: number
    hasIV: boolean
    format: SerializationFormat
  } {
    const format = this.detectFormat(data)
    
    try {
      const result = this.deserialize(data, { format })
      return {
        algorithm: result.algorithm,
        mode: result.mode,
        keySize: result.keySize,
        hasIV: !!result.iv,
        format,
      }
    } catch {
      return {
        hasIV: false,
        format,
      }
    }
  }
}

/**
 * 便捷函数：序列化加密结果
 * 
 * @param result - 加密结果
 * @param format - 序列化格式
 * @returns 序列化后的字符串
 */
export function serializeEncryptResult(
  result: EncryptResult,
  format: SerializationFormat = 'json',
): string {
  return EncryptResultSerializer.serialize(result, { format })
}

/**
 * 便捷函数：反序列化加密结果
 * 
 * @param data - 序列化的字符串
 * @param format - 序列化格式（可选，自动检测）
 * @returns 加密结果对象
 */
export function deserializeEncryptResult(
  data: string,
  format?: SerializationFormat,
): EncryptResult {
  return EncryptResultSerializer.deserialize(data, { format })
}

/**
 * 便捷函数：将加密结果转换为可存储的字符串
 * 
 * @param result - 加密结果
 * @returns Base64 编码的字符串
 */
export function encryptResultToString(result: EncryptResult): string {
  return EncryptResultSerializer.serialize(result, { format: 'base64' })
}

/**
 * 便捷函数：从字符串恢复加密结果
 * 
 * @param str - Base64 编码的字符串
 * @returns 加密结果对象
 */
export function stringToEncryptResult(str: string): EncryptResult {
  return EncryptResultSerializer.deserialize(str)
}
