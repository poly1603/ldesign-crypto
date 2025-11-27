/**
 * WebAssembly 加密加速模块
 * 
 * 提供高性能的 WebAssembly 实现，用于加速计算密集型的加密操作
 * 
 * 特性：
 * - 自动检测 WebAssembly 支持
 * - 优雅降级到 JavaScript 实现
 * - 异步加载和初始化
 * - 内存安全管理
 * 
 * @module
 */

import type { DecryptResult, EncryptResult } from '../types'
import { AESEncryptor } from '../algorithms/aes'
import { performanceMonitor } from '../utils/performance-monitor'

/**
 * WebAssembly 模块接口
 */
export interface CryptoWasmModule {
  /** AES 加密 */
  aes_encrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array
  /** AES 解密 */
  aes_decrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array
  /** SHA256 哈希 */
  sha256(data: Uint8Array): Uint8Array
  /** PBKDF2 密钥派生 */
  pbkdf2(password: Uint8Array, salt: Uint8Array, iterations: number): Uint8Array
  /** 分配内存 */
  malloc(size: number): number
  /** 释放内存 */
  free(ptr: number): void
  /** 内存视图 */
  memory: WebAssembly.Memory
}

/**
 * WebAssembly 支持检测
 */
export class WasmSupport {
  private static _isSupported: boolean | null = null

  /**
   * 检测浏览器是否支持 WebAssembly
   */
  static isSupported(): boolean {
    if (WasmSupport._isSupported !== null) {
      return WasmSupport._isSupported
    }

    try {
      // 检查 WebAssembly 全局对象
      if (typeof WebAssembly === 'undefined') {
        WasmSupport._isSupported = false
        return false
      }

      // 检查实例化能力
      const module = new WebAssembly.Module(
        new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      )

      if (module instanceof WebAssembly.Module) {
        WasmSupport._isSupported = true
        return true
      }

      WasmSupport._isSupported = false
      return false
    } catch {
      WasmSupport._isSupported = false
      return false
    }
  }

  /**
   * 检测是否支持 SIMD
   */
  static supportsSIMD(): boolean {
    try {
      return WebAssembly.validate(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, 0x03,
        0x02, 0x01, 0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00,
        0x41, 0x00, 0xfd, 0x0f, 0x0b
      ]))
    } catch {
      return false
    }
  }
}

/**
 * WebAssembly 加密管理器
 * 
 * @example
 * ```typescript
 * const wasmCrypto = new CryptoWasm()
 * 
 * // 初始化
 * await wasmCrypto.initialize()
 * 
 * // 使用 WebAssembly 加速的 AES
 * const encrypted = await wasmCrypto.aesEncrypt('data', 'key')
 * 
 * // 使用 WebAssembly 加速的 SHA256
 * const hash = await wasmCrypto.sha256('data')
 * ```
 */
export class CryptoWasm {
  private module: CryptoWasmModule | null = null
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  // 降级实现
  private aesEncryptor = new AESEncryptor()

  /**
   * 初始化 WebAssembly 模块
   */
  async initialize(): Promise<void> {
    // 避免重复初始化
    if (this.isInitialized) {
      return
    }

    // 如果正在初始化，等待完成
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._initialize()
    return this.initPromise
  }

  /**
   * 实际的初始化逻辑
   */
  private async _initialize(): Promise<void> {
    if (!WasmSupport.isSupported()) {
      console.warn('WebAssembly is not supported, using JavaScript fallback')
      this.isInitialized = true
      return
    }

    try {
      // 加载 WebAssembly 模块
      // 注意：实际项目中需要提供真实的 WASM 文件路径
      const wasmUrl = new URL('./crypto.wasm', import.meta.url)
      const response = await fetch(wasmUrl)
      const wasmBuffer = await response.arrayBuffer()

      // 实例化模块
      const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
        env: {
          // 导入必要的环境函数
          memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
          abort: (msg: number, file: number, line: number, col: number) => {
            console.error('WASM abort:', { msg, file, line, col })
          },
        },
      })

      this.module = wasmModule.instance.exports as unknown as CryptoWasmModule
      this.isInitialized = true

      console.log('WebAssembly crypto module initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize WebAssembly module:', error)
      this.isInitialized = true // 标记为已初始化，使用降级方案
    }
  }

  /**
   * AES 加密（WebAssembly 加速）
   */
  async aesEncrypt(
    data: string,
    key: string,
    options?: { keySize?: number; mode?: string; iv?: string }
  ): Promise<EncryptResult> {
    await this.initialize()

    const operationId = `wasm_aes_encrypt_${Date.now()}`
    performanceMonitor.startOperation(operationId, 'AES')

    try {
      if (!this.module) {
        // 降级到 JavaScript 实现
        return this.aesEncryptor.encrypt(data, key, options)
      }

      // 转换数据为 Uint8Array
      const dataBytes = new TextEncoder().encode(data)
      const keyBytes = new TextEncoder().encode(key).slice(0, options?.keySize ? options.keySize / 8 : 32)
      const ivBytes = options?.iv
        ? this.hexToBytes(options.iv)
        : crypto.getRandomValues(new Uint8Array(16))

      // 分配 WASM 内存
      const dataPtr = this.module.malloc(dataBytes.length)
      const keyPtr = this.module.malloc(keyBytes.length)
      const ivPtr = this.module.malloc(ivBytes.length)
      const resultPtr = this.module.malloc(dataBytes.length + 16) // 额外空间用于填充

      try {
        // 复制数据到 WASM 内存
        const memory = new Uint8Array(this.module.memory.buffer)
        memory.set(dataBytes, dataPtr)
        memory.set(keyBytes, keyPtr)
        memory.set(ivBytes, ivPtr)

        // 执行加密
        const encryptedBytes = this.module.aes_encrypt(
          new Uint8Array(memory.buffer, dataPtr, dataBytes.length),
          new Uint8Array(memory.buffer, keyPtr, keyBytes.length),
          new Uint8Array(memory.buffer, ivPtr, ivBytes.length)
        )

        // 转换结果为 Base64
        const encrypted = btoa(String.fromCharCode(...encryptedBytes))

        performanceMonitor.endOperation(
          operationId,
          'wasm_aes_encrypt',
          true,
          dataBytes.length
        )

        return {
          success: true,
          data: encrypted,
          algorithm: 'AES',
          mode: options?.mode || 'CBC',
          keySize: options?.keySize || 256,
          iv: this.bytesToHex(ivBytes),
        }
      } finally {
        // 清理内存
        this.module.free(dataPtr)
        this.module.free(keyPtr)
        this.module.free(ivPtr)
        this.module.free(resultPtr)
      }
    } catch (error) {
      performanceMonitor.endOperation(
        operationId,
        'wasm_aes_encrypt',
        false,
        0,
        error instanceof Error ? error.message : 'Unknown error'
      )

      // 降级到 JavaScript 实现
      return this.aesEncryptor.encrypt(data, key, options)
    }
  }

  /**
   * AES 解密（WebAssembly 加速）
   */
  async aesDecrypt(
    encryptedData: string | EncryptResult,
    key: string,
    options?: { keySize?: number; mode?: string; iv?: string }
  ): Promise<DecryptResult> {
    await this.initialize()

    if (!this.module) {
      // 降级到 JavaScript 实现
      return this.aesEncryptor.decrypt(encryptedData, key, options)
    }

    // 实现类似加密的逻辑
    // 这里省略具体实现，实际项目中需要完整实现

    return this.aesEncryptor.decrypt(encryptedData, key, options)
  }

  /**
   * SHA256 哈希（WebAssembly 加速）
   */
  async sha256(data: string): Promise<string> {
    await this.initialize()

    if (!this.module) {
      // 降级到 JavaScript 实现
      const { hash } = await import('../algorithms/hash')
      return hash.sha256(data)
    }

    const dataBytes = new TextEncoder().encode(data)
    const dataPtr = this.module.malloc(dataBytes.length)
    const resultPtr = this.module.malloc(32) // SHA256 输出 32 字节

    try {
      // 复制数据到 WASM 内存
      const memory = new Uint8Array(this.module.memory.buffer)
      memory.set(dataBytes, dataPtr)

      // 执行哈希
      const hashBytes = this.module.sha256(
        new Uint8Array(memory.buffer, dataPtr, dataBytes.length)
      )

      // 转换为十六进制
      return this.bytesToHex(hashBytes)
    } finally {
      this.module.free(dataPtr)
      this.module.free(resultPtr)
    }
  }

  /**
   * PBKDF2 密钥派生（WebAssembly 加速）
   */
  async pbkdf2(
    password: string,
    salt: string,
    iterations: number = 100000
  ): Promise<string> {
    await this.initialize()

    if (!this.module) {
      // 降级到 JavaScript 实现
      const { deriveKey } = await import('../utils/key-derivation')
      const result = await deriveKey(password, { salt, iterations })
      return result.key
    }

    const passwordBytes = new TextEncoder().encode(password)
    const saltBytes = new TextEncoder().encode(salt)

    const passwordPtr = this.module.malloc(passwordBytes.length)
    const saltPtr = this.module.malloc(saltBytes.length)
    const resultPtr = this.module.malloc(32) // 256-bit key

    try {
      const memory = new Uint8Array(this.module.memory.buffer)
      memory.set(passwordBytes, passwordPtr)
      memory.set(saltBytes, saltPtr)

      const keyBytes = this.module.pbkdf2(
        new Uint8Array(memory.buffer, passwordPtr, passwordBytes.length),
        new Uint8Array(memory.buffer, saltPtr, saltBytes.length),
        iterations
      )

      return this.bytesToHex(keyBytes)
    } finally {
      this.module.free(passwordPtr)
      this.module.free(saltPtr)
      this.module.free(resultPtr)
    }
  }

  /**
   * 获取性能提升比例
   */
  async benchmark(): Promise<{ jsTime: number; wasmTime: number; speedup: number }> {
    const testData = 'a'.repeat(1024 * 10) // 10KB 测试数据
    const testKey = 'test-key-1234567890'

    // JavaScript 性能测试
    const jsStart = performance.now()
    for (let i = 0; i < 100; i++) {
      await this.aesEncryptor.encrypt(testData, testKey)
    }
    const jsTime = performance.now() - jsStart

    // WebAssembly 性能测试
    const wasmStart = performance.now()
    for (let i = 0; i < 100; i++) {
      await this.aesEncrypt(testData, testKey)
    }
    const wasmTime = performance.now() - wasmStart

    return {
      jsTime,
      wasmTime,
      speedup: jsTime / wasmTime,
    }
  }

  /**
   * 工具函数：字节数组转十六进制
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 工具函数：十六进制转字节数组
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return bytes
  }

  /**
   * 是否已初始化
   */
  get initialized(): boolean {
    return this.isInitialized
  }

  /**
   * 是否使用 WebAssembly
   */
  get usingWasm(): boolean {
    return this.module !== null
  }
}

// 导出全局实例
export const cryptoWasm = new CryptoWasm()

/**
 * 便捷函数：使用 WebAssembly 加速的 AES 加密
 */
export async function aesEncryptWasm(
  data: string,
  key: string,
  options?: { keySize?: number; mode?: string; iv?: string }
): Promise<EncryptResult> {
  return cryptoWasm.aesEncrypt(data, key, options)
}

/**
 * 便捷函数：使用 WebAssembly 加速的 AES 解密
 */
export async function aesDecryptWasm(
  encryptedData: string | EncryptResult,
  key: string,
  options?: { keySize?: number; mode?: string; iv?: string }
): Promise<DecryptResult> {
  return cryptoWasm.aesDecrypt(encryptedData, key, options)
}

/**
 * 便捷函数：使用 WebAssembly 加速的 SHA256
 */
export async function sha256Wasm(data: string): Promise<string> {
  return cryptoWasm.sha256(data)
}

/**
 * 便捷函数：使用 WebAssembly 加速的 PBKDF2
 */
export async function pbkdf2Wasm(
  password: string,
  salt: string,
  iterations?: number
): Promise<string> {
  return cryptoWasm.pbkdf2(password, salt, iterations)
}

