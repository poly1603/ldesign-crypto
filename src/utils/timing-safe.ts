/**
 * 时序安全工具
 * 
 * 提供抗时序攻击的安全比较函数。时序攻击是一种侧信道攻击，攻击者通过测量
 * 比较操作的执行时间来推断密钥或哈希值的信息。
 * 
 * 原理：
 * - 常规字符串比较（===）在发现第一个不匹配字符时会立即返回
 * - 恒定时间比较会遍历整个字符串，无论在哪里发现不匹配
 * - 使用位运算累积差异，避免提前退出
 * 
 * 安全建议：
 * - 用于比较密码哈希、HMAC、签名等安全敏感数据
 * - 不要用于比较公开数据（会增加不必要的开销）
 * - 确保输入长度相同（长度不同时可以快速返回）
 * 
 * @module utils/timing-safe
 */

/**
 * 恒定时间字符串比较
 * 
 * 比较两个字符串是否相等，执行时间与字符串内容无关，只与长度有关。
 * 用于防止时序攻击。
 * 
 * 工作原理：
 * 1. 如果长度不同，直接返回 false（长度是公开信息）
 * 2. 使用异或运算比较每个字符的 Unicode 码点
 * 3. 将所有差异累积到 result 变量中
 * 4. 最后检查 result 是否为 0（所有字符都相同）
 * 
 * 时间复杂度：O(n)，其中 n 是字符串长度
 * 空间复杂度：O(1)
 * 
 * @param a - 第一个字符串
 * @param b - 第二个字符串
 * @returns 如果字符串相等返回 true，否则返回 false
 * 
 * @example
 * ```typescript
 * // 安全的哈希比较
 * const hash1 = '5d41402abc4b2a76b9719d911017c592'
 * const hash2 = '5d41402abc4b2a76b9719d911017c592'
 * const isEqual = timingSafeEqual(hash1, hash2) // true
 * 
 * // 即使字符串不同，执行时间也相同
 * const hash3 = '0000000000000000000000000000000'
 * const isEqual2 = timingSafeEqual(hash1, hash3) // false，但执行时间与 isEqual 相同
 * ```
 */
export function timingSafeEqual(a: string, b: string): boolean {
  // 长度不同时可以快速返回（长度是公开信息，不泄露内容）
  if (a.length !== b.length) {
    return false
  }

  // 使用位运算累积所有字符的差异
  // result 初始化为 0，如果所有字符都相同，最终仍为 0
  let result = 0

  // 遍历整个字符串，无论是否发现不匹配
  for (let i = 0; i < a.length; i++) {
    // 使用异或运算：相同字符异或结果为 0，不同字符异或结果非 0
    // 使用或运算累积到 result 中：任何位置不匹配都会使 result 非 0
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  // result 为 0 表示所有字符都相同
  return result === 0
}

/**
 * 恒定时间缓冲区比较
 * 
 * 比较两个 Uint8Array 是否相等，用于比较二进制数据。
 * 
 * @param a - 第一个缓冲区
 * @param b - 第二个缓冲区
 * @returns 如果缓冲区内容相等返回 true，否则返回 false
 * 
 * @example
 * ```typescript
 * const buffer1 = new Uint8Array([1, 2, 3, 4, 5])
 * const buffer2 = new Uint8Array([1, 2, 3, 4, 5])
 * const isEqual = timingSafeBufferEqual(buffer1, buffer2) // true
 * ```
 */
export function timingSafeBufferEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}

/**
 * 恒定时间十六进制字符串比较
 * 
 * 专门用于比较十六进制字符串（不区分大小写）。
 * 
 * @param a - 第一个十六进制字符串
 * @param b - 第二个十六进制字符串
 * @returns 如果十六进制字符串相等返回 true，否则返回 false
 * 
 * @example
 * ```typescript
 * const hex1 = 'deadbeef'
 * const hex2 = 'DEADBEEF'
 * const isEqual = timingSafeHexEqual(hex1, hex2) // true（不区分大小写）
 * ```
 */
export function timingSafeHexEqual(a: string, b: string): boolean {
  // 转换为小写以支持不区分大小写的比较
  return timingSafeEqual(a.toLowerCase(), b.toLowerCase())
}

/**
 * 恒定时间 Base64 字符串比较
 * 
 * 用于比较 Base64 编码的数据。
 * 
 * @param a - 第一个 Base64 字符串
 * @param b - 第二个 Base64 字符串
 * @returns 如果 Base64 字符串相等返回 true，否则返回 false
 * 
 * @example
 * ```typescript
 * const b64_1 = 'SGVsbG8gV29ybGQ='
 * const b64_2 = 'SGVsbG8gV29ybGQ='
 * const isEqual = timingSafeBase64Equal(b64_1, b64_2) // true
 * ```
 */
export function timingSafeBase64Equal(a: string, b: string): boolean {
  return timingSafeEqual(a, b)
}

/**
 * 创建时序安全的比较函数
 * 
 * 工厂函数，用于创建带有预处理的安全比较函数。
 * 
 * @param preprocessor - 预处理函数，用于标准化输入（如转小写、去空格等）
 * @returns 时序安全的比较函数
 * 
 * @example
 * ```typescript
 * // 创建不区分大小写的比较函数
 * const caseInsensitiveEqual = createTimingSafeCompare(s => s.toLowerCase())
 * caseInsensitiveEqual('Hello', 'hello') // true
 * 
 * // 创建去除空格的比较函数
 * const trimmedEqual = createTimingSafeCompare(s => s.trim())
 * trimmedEqual('  hello  ', 'hello') // true
 * ```
 */
export function createTimingSafeCompare(
  preprocessor: (input: string) => string,
): (a: string, b: string) => boolean {
  return (a: string, b: string): boolean => {
    return timingSafeEqual(preprocessor(a), preprocessor(b))
  }
}

/**
 * 时序安全性测试工具
 * 
 * 用于测试比较函数是否具有恒定时间特性。
 * 通过多次测量执行时间的标准差来评估。
 * 
 * 注意：此函数仅用于测试和验证，不应在生产代码中使用。
 * 
 * @param compareFunc - 要测试的比较函数
 * @param iterations - 测试迭代次数（默认 10000）
 * @returns 时间统计信息
 * 
 * @internal
 */
export function testTimingSafety(
  compareFunc: (a: string, b: string) => boolean,
  iterations: number = 10000,
): {
  meanTime: number
  stdDeviation: number
  isTimingSafe: boolean
} {
  const times: number[] = []
  const testString1 = 'a'.repeat(32)
  const testString2Match = 'a'.repeat(32)
  const testString2Mismatch = 'b'.repeat(32)

  // 测试匹配情况
  for (let i = 0; i < iterations / 2; i++) {
    const start = performance.now()
    compareFunc(testString1, testString2Match)
    const end = performance.now()
    times.push(end - start)
  }

  // 测试不匹配情况
  for (let i = 0; i < iterations / 2; i++) {
    const start = performance.now()
    compareFunc(testString1, testString2Mismatch)
    const end = performance.now()
    times.push(end - start)
  }

  // 计算平均值和标准差
  const mean = times.reduce((sum, t) => sum + t, 0) / times.length
  const variance
    = times.reduce((sum, t) => sum + (t - mean) ** 2, 0) / times.length
  const stdDev = Math.sqrt(variance)

  // 如果标准差很小（相对于平均值），则认为是时序安全的
  // 阈值设置为 10%（可以根据实际情况调整）
  const isTimingSafe = stdDev / mean < 0.1

  return {
    meanTime: mean,
    stdDeviation: stdDev,
    isTimingSafe,
  }
}


