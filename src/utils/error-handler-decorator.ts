/**
 * 错误处理装饰器
 * 
 * 提供统一的错误处理装饰器，减少重复的 try-catch 代码。
 * 
 * ## 主要功能
 * 
 * ### 自动错误捕获
 * - 自动捕获方法中抛出的错误
 * - 转换为标准的结果格式
 * - 记录错误日志（可选）
 * 
 * ### 错误类型转换
 * - 将各种错误转换为统一格式
 * - 不泄露敏感信息
 * - 提供有用的错误消息
 * 
 * ## 使用场景
 * 
 * - 加密/解密方法
 * - 哈希计算方法
 * - 任何可能抛出错误的方法
 * 
 * @module utils/error-handler-decorator
 */

import type { DecryptResult, EncryptResult } from '../types'
import { ErrorUtils } from './index'

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  /** 算法名称（用于错误消息） */
  algorithm?: string
  /** 操作类型：'encrypt' | 'decrypt' | 'hash' */
  operation?: 'encrypt' | 'decrypt' | 'hash'
  /** 是否记录错误日志 */
  logError?: boolean
  /** 默认返回值（错误时） */
  defaultValue?: any
}

/**
 * 加密操作错误处理装饰器
 * 
 * 用于加密方法，自动捕获错误并返回标准的 EncryptResult。
 * 
 * @param options - 错误处理选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class MyEncryptor {
 *   @withEncryptErrorHandling({ algorithm: 'AES' })
 *   encrypt(data: string, key: string): EncryptResult {
 *     // 核心加密逻辑，不需要 try-catch
 *     return { success: true, data: encrypted, algorithm: 'AES' }
 *   }
 * }
 * ```
 */
export function withEncryptErrorHandling(options: ErrorHandlerOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]): EncryptResult {
      try {
        const result = originalMethod.apply(this, args)
        return result
      }
      catch (error) {
        if (options.logError) {
          console.error(`[${options.algorithm || 'Unknown'}] Encryption error:`, error)
        }

        const errorMessage
          = error instanceof Error ? error.message : 'Unknown encryption error'

        return {
          success: false,
          data: '',
          algorithm: options.algorithm || 'Unknown',
          error: errorMessage,
        }
      }
    }

    return descriptor
  }
}

/**
 * 解密操作错误处理装饰器
 * 
 * 用于解密方法，自动捕获错误并返回标准的 DecryptResult。
 * 
 * @param options - 错误处理选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class MyEncryptor {
 *   @withDecryptErrorHandling({ algorithm: 'AES' })
 *   decrypt(encryptedData: string, key: string): DecryptResult {
 *     // 核心解密逻辑，不需要 try-catch
 *     return { success: true, data: decrypted, algorithm: 'AES' }
 *   }
 * }
 * ```
 */
export function withDecryptErrorHandling(options: ErrorHandlerOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]): DecryptResult {
      try {
        const result = originalMethod.apply(this, args)
        return result
      }
      catch (error) {
        if (options.logError) {
          console.error(`[${options.algorithm || 'Unknown'}] Decryption error:`, error)
        }

        const errorMessage
          = error instanceof Error ? error.message : 'Unknown decryption error'

        return {
          success: false,
          data: '',
          algorithm: options.algorithm || 'Unknown',
          error: errorMessage,
        }
      }
    }

    return descriptor
  }
}

/**
 * 通用错误处理装饰器
 * 
 * 用于任何方法，自动捕获错误并记录日志。
 * 
 * @param options - 错误处理选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @withErrorHandling({ logError: true })
 *   processData(data: string): string {
 *     // 可能抛出错误的逻辑
 *     return processedData
 *   }
 * }
 * ```
 */
export function withErrorHandling(options: ErrorHandlerOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      try {
        return originalMethod.apply(this, args)
      }
      catch (error) {
        if (options.logError) {
          console.error(`[${propertyKey}] Error:`, error)
        }

        // 如果提供了默认值，返回默认值
        if (options.defaultValue !== undefined) {
          return options.defaultValue
        }

        // 否则重新抛出错误
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 异步错误处理装饰器
 * 
 * 用于异步方法，自动捕获 Promise 错误。
 * 
 * @param options - 错误处理选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @withAsyncErrorHandling({ algorithm: 'WebCrypto' })
 *   async encrypt(data: string): Promise<EncryptResult> {
 *     // 异步加密逻辑
 *     return { success: true, data: encrypted, algorithm: 'WebCrypto' }
 *   }
 * }
 * ```
 */
export function withAsyncErrorHandling(options: ErrorHandlerOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      }
      catch (error) {
        if (options.logError) {
          console.error(`[${propertyKey}] Async error:`, error)
        }

        if (options.defaultValue !== undefined) {
          return options.defaultValue
        }

        throw error
      }
    }

    return descriptor
  }
}

/**
 * 创建统一的错误结果
 * 
 * 辅助函数，用于在 catch 块中创建标准的错误结果。
 * 
 * @param error - 捕获的错误
 * @param algorithm - 算法名称
 * @param operation - 操作类型
 * @returns 标准的错误结果
 * 
 * @example
 * ```typescript
 * try {
 *   // 加密逻辑
 * } catch (error) {
 *   return createErrorResult(error, 'AES', 'encrypt')
 * }
 * ```
 */
export function createErrorResult(
  error: unknown,
  algorithm: string,
  operation: 'encrypt' | 'decrypt',
): EncryptResult | DecryptResult {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'

  if (operation === 'encrypt') {
    return {
      success: false,
      data: '',
      algorithm,
      error: errorMessage,
    }
  }
  else {
    return {
      success: false,
      data: '',
      algorithm,
      error: errorMessage,
    }
  }
}

/**
 * 安全的错误消息过滤
 * 
 * 过滤敏感信息，防止泄露密钥、密码等。
 * 
 * @param error - 原始错误
 * @returns 安全的错误消息
 * 
 * @example
 * ```typescript
 * try {
 *   encrypt(data, 'secret-key-123')
 * } catch (error) {
 *   const safeMessage = sanitizeErrorMessage(error)
 *   // 不会包含 'secret-key-123'
 * }
 * ```
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unknown error'
  }

  let message = error.message

  // 移除可能的敏感信息
  const patterns = [
    /key[:\s=]+[^\s]+/gi, // 密钥
    /password[:\s=]+[^\s]+/gi, // 密码
    /secret[:\s=]+[^\s]+/gi, // 秘密
    /token[:\s=]+[^\s]+/gi, // 令牌
  ]

  for (const pattern of patterns) {
    message = message.replace(pattern, '[REDACTED]')
  }

  return message
}

