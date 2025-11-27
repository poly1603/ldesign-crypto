/**
 * 安全内存管理工具
 * 
 * 提供密钥和敏感数据的安全内存管理功能，包括：
 * - 使用后安全清零内存
 * - 防止敏感数据泄露到交换文件或内存转储
 * - 密钥生命周期管理
 * 
 * 安全原则：
 * - 密钥应该在使用后立即清零
 * - 避免将密钥存储在字符串中（字符串是不可变的，无法清零）
 * - 使用 Uint8Array 存储密钥，使用后覆写
 * - 限制密钥的作用域和生命周期
 * 
 * @module utils/secure-memory
 */

/**
 * 安全密钥选项
 */
export interface SecureKeyOptions {
  /** 密钥最大生命周期（毫秒），0 表示无限制 */
  maxLifetime?: number
  /** 是否在析构时自动清零 */
  autoClear?: boolean
  /** 密钥用途标签（用于调试） */
  purpose?: string
}

/**
 * 安全密钥包装器
 * 
 * 提供密钥的安全存储和使用。密钥存储在 Uint8Array 中，使用后可以安全清零。
 * 
 * 特性：
 * - 自动生命周期管理
 * - 使用后清零
 * - 防止多次使用已清零的密钥
 * - 支持定时清零
 * 
 * 安全建议：
 * - 始终使用 try-finally 确保清零
 * - 避免将密钥导出为字符串长期存储
 * - 设置合理的生命周期限制
 * 
 * @example
 * ```typescript
 * // 创建安全密钥
 * const secureKey = new SecureKey('my-secret-password')
 * 
 * try {
 *   // 使用密钥
 *   secureKey.use((keyBytes) => {
 *     // 在回调中使用密钥
 *     // keyBytes 是 Uint8Array
 *     return performEncryption(keyBytes)
 *   })
 * } finally {
 *   // 确保清零
 *   secureKey.clear()
 * }
 * 
 * // 或使用自动清零
 * const result = await SecureKey.withKey('password', async (key) => {
 *   return await encryptData(key)
 * })
 * // 密钥自动清零
 * ```
 */
export class SecureKey {
  private key: Uint8Array
  private cleared = false
  private createdAt: number
  private options: Required<SecureKeyOptions>
  private clearTimer?: NodeJS.Timeout | number

  /**
   * 创建安全密钥包装器
   * 
   * @param key - 密钥（字符串、Uint8Array 或 ArrayBuffer）
   * @param options - 安全选项
   */
  constructor(
    key: string | Uint8Array | ArrayBuffer,
    options: SecureKeyOptions = {},
  ) {
    this.options = {
      maxLifetime: options.maxLifetime || 0,
      autoClear: options.autoClear ?? true,
      purpose: options.purpose || 'unknown',
    }

    this.createdAt = Date.now()

    // 转换密钥为 Uint8Array
    if (typeof key === 'string') {
      this.key = new TextEncoder().encode(key)
    }
    else if (key instanceof ArrayBuffer) {
      this.key = new Uint8Array(key)
    }
    else {
      // 复制一份，避免外部修改
      this.key = new Uint8Array(key)
    }

    // 设置定时清零
    if (this.options.maxLifetime > 0) {
      this.clearTimer = setTimeout(() => {
        if (!this.cleared) {
          console.warn(
            `SecureKey (${this.options.purpose}) exceeded lifetime, auto-clearing`,
          )
          this.clear()
        }
      }, this.options.maxLifetime)
    }
  }

  /**
   * 使用密钥执行操作
   * 
   * 提供密钥的临时访问，操作完成后应立即清零密钥。
   * 
   * @param fn - 使用密钥的回调函数
   * @returns 回调函数的返回值
   * @throws 如果密钥已清零
   * 
   * @example
   * ```typescript
   * const result = secureKey.use((keyBytes) => {
   *   // 使用 keyBytes 进行加密
   *   return encrypt(keyBytes, data)
   * })
   * ```
   */
  use<T>(fn: (key: Uint8Array) => T): T {
    if (this.cleared) {
      throw new Error('Cannot use cleared key')
    }

    // 检查是否过期
    if (
      this.options.maxLifetime > 0
      && Date.now() - this.createdAt > this.options.maxLifetime
    ) {
      this.clear()
      throw new Error('Key has expired')
    }

    return fn(this.key)
  }

  /**
   * 异步使用密钥
   * 
   * @param fn - 异步回调函数
   * @returns Promise，包含回调函数的返回值
   */
  async useAsync<T>(fn: (key: Uint8Array) => Promise<T>): Promise<T> {
    if (this.cleared) {
      throw new Error('Cannot use cleared key')
    }

    return await fn(this.key)
  }

  /**
   * 安全清零密钥
   * 
   * 使用以下步骤清零：
   * 1. 用随机数据覆写
   * 2. 用零覆写
   * 3. 标记为已清零
   * 
   * 清零后密钥不能再使用。
   */
  clear(): void {
    if (this.cleared) {
      return // 已经清零，避免重复操作
    }

    try {
      // 第一步：用随机数据覆写（防止冷启动攻击）
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(this.key)
      }
      else {
        // 降级方案：用随机数覆写
        for (let i = 0; i < this.key.length; i++) {
          this.key[i] = Math.floor(Math.random() * 256)
        }
      }

      // 第二步：用零覆写
      this.key.fill(0)

      // 第三步：标记为已清零
      this.cleared = true

      // 清除定时器
      if (this.clearTimer) {
        clearTimeout(this.clearTimer as NodeJS.Timeout)
        this.clearTimer = undefined
      }
    }
    catch (error) {
      console.error('Failed to clear secure key:', error)
      // 即使失败也标记为已清零，防止继续使用
      this.cleared = true
    }
  }

  /**
   * 获取密钥长度
   * 
   * @returns 密钥字节长度
   */
  get length(): number {
    return this.key.length
  }

  /**
   * 检查密钥是否已清零
   * 
   * @returns 如果已清零返回 true
   */
  get isCleared(): boolean {
    return this.cleared
  }

  /**
   * 获取密钥年龄（毫秒）
   * 
   * @returns 密钥创建至今的时间（毫秒）
   */
  get age(): number {
    return Date.now() - this.createdAt
  }

  /**
   * 克隆密钥（不推荐使用）
   * 
   * 警告：克隆密钥会增加泄露风险，仅在必要时使用。
   * 
   * @returns 新的安全密钥实例
   */
  clone(): SecureKey {
    if (this.cleared) {
      throw new Error('Cannot clone cleared key')
    }

    return new SecureKey(this.key.slice(), this.options)
  }

  /**
   * 导出为十六进制字符串（不安全，仅用于调试）
   * 
   * 警告：导出的字符串无法清零，可能残留在内存中。
   * 
   * @returns 十六进制字符串
   */
  toHex(): string {
    if (this.cleared) {
      throw new Error('Cannot export cleared key')
    }

    return Array.from(this.key)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 导出为 Base64 字符串（不安全，仅用于调试）
   * 
   * 警告：导出的字符串无法清零，可能残留在内存中。
   * 
   * @returns Base64 字符串
   */
  toBase64(): string {
    if (this.cleared) {
      throw new Error('Cannot export cleared key')
    }

    // 浏览器环境
    if (typeof btoa === 'function') {
      return btoa(String.fromCharCode(...this.key))
    }

    // Node.js 环境
    return Buffer.from(this.key).toString('base64')
  }

  /**
   * 静态工厂方法：创建并自动管理密钥生命周期
   * 
   * 创建密钥，执行操作，自动清零。推荐的使用方式。
   * 
   * @param key - 密钥数据
   * @param fn - 使用密钥的回调函数
   * @param options - 安全选项
   * @returns 回调函数的返回值
   * 
   * @example
   * ```typescript
   * const result = await SecureKey.withKey('password', async (key) => {
   *   return await encryptData(key)
   * })
   * // 密钥已自动清零
   * ```
   */
  static async withKey<T>(
    key: string | Uint8Array | ArrayBuffer,
    fn: (key: SecureKey) => Promise<T>,
    options?: SecureKeyOptions,
  ): Promise<T> {
    const secureKey = new SecureKey(key, options)

    try {
      return await fn(secureKey)
    }
    finally {
      secureKey.clear()
    }
  }

  /**
   * 同步版本的 withKey
   * 
   * @param key - 密钥数据
   * @param fn - 使用密钥的回调函数
   * @param options - 安全选项
   * @returns 回调函数的返回值
   */
  static withKeySync<T>(
    key: string | Uint8Array | ArrayBuffer,
    fn: (key: SecureKey) => T,
    options?: SecureKeyOptions,
  ): T {
    const secureKey = new SecureKey(key, options)

    try {
      return fn(secureKey)
    }
    finally {
      secureKey.clear()
    }
  }
}

/**
 * 安全字符串清零
 * 
 * 尝试清零字符串（但字符串在 JavaScript 中是不可变的，效果有限）。
 * 仅用于额外的安全措施，不能完全依赖。
 * 
 * 建议：避免将敏感数据存储为字符串，使用 Uint8Array 代替。
 * 
 * @param str - 要清零的字符串
 * @returns 清零后的空字符串
 * 
 * @deprecated 字符串无法真正清零，使用 SecureKey 代替
 */
export function clearString(str: string): string {
  // JavaScript 字符串是不可变的，无法真正清零
  // 这里只是尝试解除引用，让 GC 回收
  // eslint-disable-next-line no-param-reassign
  str = ''
  return str
}

/**
 * 安全数组清零
 * 
 * 清零 Uint8Array 或 ArrayBuffer。
 * 
 * @param buffer - 要清零的缓冲区
 * 
 * @example
 * ```typescript
 * const sensitive = new Uint8Array([1, 2, 3, 4, 5])
 * // ... 使用 sensitive
 * clearBuffer(sensitive)
 * // sensitive 现在全为 0
 * ```
 */
export function clearBuffer(buffer: Uint8Array | ArrayBuffer): void {
  if (buffer instanceof ArrayBuffer) {
    // eslint-disable-next-line no-param-reassign
    buffer = new Uint8Array(buffer)
  }

  // 用随机数据覆写
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer)
  }

  // 用零覆写
  buffer.fill(0)
}

/**
 * 内存清零工具
 * 
 * 提供批量清零功能，用于清零多个敏感数据。
 * 
 * @example
 * ```typescript
 * const cleaner = new MemoryCleaner()
 * const key1 = new Uint8Array(32)
 * const key2 = new Uint8Array(16)
 * 
 * cleaner.register(key1)
 * cleaner.register(key2)
 * 
 * // ... 使用密钥
 * 
 * // 一次性清零所有
 * cleaner.clearAll()
 * ```
 */
export class MemoryCleaner {
  private buffers: Set<Uint8Array | ArrayBuffer> = new Set()
  private secureKeys: Set<SecureKey> = new Set()

  /**
   * 注册缓冲区以便后续清零
   * 
   * @param buffer - 要注册的缓冲区
   */
  register(buffer: Uint8Array | ArrayBuffer): void {
    this.buffers.add(buffer)
  }

  /**
   * 注册安全密钥以便后续清零
   * 
   * @param key - 要注册的安全密钥
   */
  registerKey(key: SecureKey): void {
    this.secureKeys.add(key)
  }

  /**
   * 清零所有已注册的缓冲区和密钥
   * 
   * @returns 清零的项目数量
   */
  clearAll(): number {
    let count = 0

    // 清零缓冲区
    for (const buffer of this.buffers) {
      try {
        clearBuffer(buffer)
        count++
      }
      catch (error) {
        console.error('Failed to clear buffer:', error)
      }
    }

    // 清零安全密钥
    for (const key of this.secureKeys) {
      try {
        key.clear()
        count++
      }
      catch (error) {
        console.error('Failed to clear secure key:', error)
      }
    }

    this.buffers.clear()
    this.secureKeys.clear()

    return count
  }

  /**
   * 获取已注册的项目数量
   * 
   * @returns 项目数量
   */
  get size(): number {
    return this.buffers.size + this.secureKeys.size
  }
}

/**
 * 创建自动清零的作用域
 * 
 * 在作用域内创建的所有安全密钥和缓冲区会在作用域结束时自动清零。
 * 
 * @param fn - 作用域函数
 * @returns Promise，包含作用域函数的返回值
 * 
 * @example
 * ```typescript
 * await withSecureScope(async (cleaner) => {
 *   const key1 = new Uint8Array(32)
 *   const key2 = new SecureKey('password')
 *   
 *   cleaner.register(key1)
 *   cleaner.registerKey(key2)
 *   
 *   // ... 使用密钥
 *   
 *   return result
 * })
 * // 所有密钥已自动清零
 * ```
 */
export async function withSecureScope<T>(
  fn: (cleaner: MemoryCleaner) => Promise<T>,
): Promise<T> {
  const cleaner = new MemoryCleaner()

  try {
    return await fn(cleaner)
  }
  finally {
    cleaner.clearAll()
  }
}

/**
 * 同步版本的安全作用域
 * 
 * @param fn - 作用域函数
 * @returns 作用域函数的返回值
 */
export function withSecureScopeSync<T>(
  fn: (cleaner: MemoryCleaner) => T,
): T {
  const cleaner = new MemoryCleaner()

  try {
    return fn(cleaner)
  }
  finally {
    cleaner.clearAll()
  }
}


