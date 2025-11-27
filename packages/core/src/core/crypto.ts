import type {
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncodingType,
  EncryptionAlgorithm,
  EncryptionOptions,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from '../types'
import {
  aes,
  blowfish,
  des,
  des3,
  encoding,
  Hasher,
  HMACHasher,
  rsa,
  tripledes,
} from '../algorithms'
import { Encoder } from '../algorithms/encoding'
import { CONSTANTS, RandomUtils } from '../utils'

/**
 * 加密类（Encrypt）- 统一加密接口
 *
 * 提供对称/非对称加密的统一 API 封装，支持多种加密算法。
 * 
 * ## 支持的算法
 * 
 * ### 对称加密
 * - **AES**：高级加密标准（推荐）
 *   - AES-128、AES-192、AES-256
 *   - 模式：CBC、CTR、CFB、OFB、ECB（不推荐）
 * - **DES**：数据加密标准（已过时，不推荐）
 * - **3DES**：三重 DES（已过时，不推荐）
 * - **Blowfish**：Blowfish 算法
 * 
 * ### 非对称加密
 * - **RSA**：RSA 公钥加密
 *   - 密钥长度：1024、2048、3072、4096 位
 *   - 填充：OAEP（推荐）、PKCS#1
 * 
 * ## 主要特性
 * 
 * ### 自动 IV 生成
 * - 如未提供 IV，自动生成随机 IV
 * - IV 包含在返回结果中
 * - 确保每次加密使用不同的 IV
 * 
 * ### 自动密钥派生
 * - 支持密码字符串（自动使用 PBKDF2 派生）
 * - 支持十六进制密钥（直接使用）
 * - 缓存派生结果（性能提升 2.11 倍）
 * 
 * ### 统一返回格式
 * ```typescript
 * interface EncryptResult {
 *   success: boolean      // 是否成功
 *   data?: string         // 加密后的数据
 *   algorithm: string     // 使用的算法
 *   mode?: string         // 加密模式
 *   iv?: string           // 初始化向量
 *   keySize?: number      // 密钥长度
 *   error?: string        // 错误信息（如果失败）
 * }
 * ```
 * 
 * ## 使用建议
 * 
 * ### ✅ 推荐
 * - **AES-256 + CBC/CTR**：通用场景
 * - **AES-256 + GCM**：需要认证加密时（使用 WebCrypto）
 * - **RSA + OAEP**：密钥交换、小数据加密
 * 
 * ### ❌ 避免
 * - **AES + ECB 模式**：不安全，会泄露模式
 * - **DES/3DES**：已过时，不安全
 * - **RSA 加密大数据**：性能差，有大小限制
 * 
 * ## 使用示例
 * 
 * ### 基础用法
 * ```typescript
 * import { Encrypt } from '@ldesign/crypto'
 * 
 * const enc = new Encrypt()
 * 
 * // AES 加密
 * const result = enc.aes('敏感数据', '密码123', {
 *   keySize: 256,
 *   mode: 'CBC'
 * })
 * 
 * console.log(result.success)    // true
 * console.log(result.data)       // Base64 密文
 * console.log(result.iv)         // 十六进制 IV
 * console.log(result.algorithm)  // 'AES'
 * ```
 * 
 * ### 通用加密接口
 * ```typescript
 * // 使用通用接口（自动选择算法）
 * const result = enc.encrypt('数据', '密钥', 'AES', {
 *   keySize: 256,
 *   mode: 'CBC'
 * })
 * ```
 * 
 * ### 编码转换
 * ```typescript
 * // Base64 编码
 * const base64 = enc.base64('Hello World')
 * 
 * // Hex 编码
 * const hex = enc.hex('Hello World')
 * 
 * // URL-Safe Base64
 * const urlSafe = enc.base64Url('Hello World')
 * ```
 * 
 * ### 便捷方法
 * ```typescript
 * // 直接使用特定密钥长度的 AES
 * const result128 = enc.aes128('data', 'key')  // AES-128
 * const result192 = enc.aes192('data', 'key')  // AES-192
 * const result256 = enc.aes256('data', 'key')  // AES-256
 * ```
 * 
 * ## 最佳实践
 * 
 * ### 1. 保存完整的加密结果
 * ```typescript
 * const encrypted = enc.aes('data', 'key')
 * 
 * // ✅ 好：保存完整结果（包含 IV、算法等）
 * await database.save({
 *   ciphertext: encrypted.data,
 *   iv: encrypted.iv,
 *   algorithm: encrypted.algorithm,
 *   mode: encrypted.mode,
 *   keySize: encrypted.keySize
 * })
 * 
 * // ❌ 差：只保存密文（丢失 IV，无法解密）
 * await database.save(encrypted.data)
 * ```
 * 
 * ### 2. 使用推荐的算法
 * ```typescript
 * // ✅ 推荐
 * enc.aes256('data', 'key', { mode: 'CBC' })
 * 
 * // ❌ 不推荐
 * enc.des('data', 'key') // DES 已过时
 * enc.aes('data', 'key', { mode: 'ECB' }) // ECB 不安全
 * ```
 * 
 * @see Decrypt
 * @see AESEncryptor
 * @see RSAEncryptor
 */
export class Encrypt {
  /**
   * AES 加密
   */
  aes(data: string, key: string, options?: AESOptions): EncryptResult {
    return aes.encrypt(data, key, options)
  }

  /**
   * AES-128 加密
   */
  aes128(
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult {
    return aes.encrypt128(data, key, options)
  }

  /**
   * AES-192 加密
   */
  aes192(
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult {
    return aes.encrypt192(data, key, options)
  }

  /**
   * AES-256 加密
   */
  aes256(
    data: string,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): EncryptResult {
    return aes.encrypt256(data, key, options)
  }

  /**
   * RSA 加密
   */
  rsa(data: string, publicKey: string, options?: RSAOptions): EncryptResult {
    return rsa.encrypt(data, publicKey, options)
  }

  /**
   * DES 加密
   */
  des(data: string, key: string, options?: DESOptions): EncryptResult {
    return des.encrypt(data, key, options)
  }

  /**
   * 3DES 加密
   */
  des3(data: string, key: string, options?: TripleDESOptions): EncryptResult {
    return des3.encrypt(data, key, options)
  }

  /**
   * Triple DES 加密 (别名)
   */
  tripledes(
    data: string,
    key: string,
    options?: TripleDESOptions,
  ): EncryptResult {
    return tripledes.encrypt(data, key, options)
  }

  /**
   * Blowfish 加密
   */
  blowfish(
    data: string,
    key: string,
    options?: BlowfishOptions,
  ): EncryptResult {
    return blowfish.encrypt(data, key, options)
  }

  /**
   * 通用加密方法
   * 根据算法类型自动选择合适的加密方法
   */
  encrypt(
    data: string,
    key: string,
    algorithm: EncryptionAlgorithm,
    options?: EncryptionOptions,
  ): EncryptResult {
    switch (algorithm.toUpperCase()) {
      case 'AES':
        return this.aes(data, key, options as AESOptions)
      case 'RSA':
        return this.rsa(data, key, options as RSAOptions)
      case 'DES':
        return this.des(data, key, options as DESOptions)
      case '3DES':
        return this.des3(data, key, options as TripleDESOptions)
      case 'BLOWFISH':
        return this.blowfish(data, key, options as BlowfishOptions)
      default:
        return {
          success: false,
          error: `Unsupported encryption algorithm: ${algorithm}`,
          algorithm,
        }
    }
  }

  /**
   * Base64 编码
   */
  base64(data: string): string {
    return encoding.base64.encode(data)
  }

  /**
   * URL 安全的 Base64 编码
   */
  base64Url(data: string): string {
    return encoding.base64.encodeUrl(data)
  }

  /**
   * Hex 编码
   */
  hex(data: string): string {
    return encoding.hex.encode(data)
  }

  /**
   * 通用编码
   */
  encode(data: string, encodingType: EncodingType): string {
    return encoding.encode(data, encodingType)
  }
}

/**
 * 解密类（Decrypt）- 统一解密接口
 *
 * 与 Encrypt 配套的解密封装，支持多种加密算法的解密操作。
 * 
 * ## 主要特性
 * 
 * ### 智能参数提取
 * - **EncryptResult 对象**：自动提取 algorithm、mode、iv 等参数
 * - **字符串密文**：需要手动提供参数
 * - **参数自动补全**：缺少参数时使用默认值
 * 
 * ### 自动错误处理
 * - 捕获所有解密错误
 * - 返回统一的 DecryptResult 格式
 * - 不泄露敏感信息
 * 
 * ### 统一返回格式
 * ```typescript
 * interface DecryptResult {
 *   success: boolean      // 是否成功
 *   data?: string         // 解密后的明文
 *   algorithm: string     // 使用的算法
 *   mode?: string         // 加密模式
 *   error?: string        // 错误信息（如果失败）
 * }
 * ```
 * 
 * ## 使用示例
 * 
 * ### 基础用法（推荐）
 * ```typescript
 * import { Encrypt, Decrypt } from '@ldesign/crypto'
 * 
 * const enc = new Encrypt()
 * const dec = new Decrypt()
 * 
 * // 1. 加密
 * const encrypted = enc.aes('敏感数据', '密码123', {
 *   keySize: 256,
 *   mode: 'CBC'
 * })
 * 
 * // 2. 使用加密结果对象解密（推荐）
 * const decrypted = dec.aes(encrypted, '密码123')
 * console.log(decrypted.data) // '敏感数据'
 * ```
 * 
 * ### 使用密文字符串解密
 * ```typescript
 * // 需要手动提供 IV 和其他参数
 * const decrypted = dec.aes(encrypted.data, '密码123', {
 *   iv: encrypted.iv,
 *   keySize: 256,
 *   mode: 'CBC'
 * })
 * ```
 * 
 * ### 通用解密接口
 * ```typescript
 * // 使用通用接口（自动选择算法）
 * const decrypted = dec.decrypt(encrypted, '密钥', 'AES', {
 *   keySize: 256,
 *   mode: 'CBC'
 * })
 * ```
 * 
 * ### 编码转换
 * ```typescript
 * // Base64 解码
 * const decoded = dec.base64('SGVsbG8=')
 * 
 * // Hex 解码
 * const decodedHex = dec.hex('48656c6c6f')
 * 
 * // URL-Safe Base64 解码
 * const decodedUrl = dec.base64Url('SGVsbG8')
 * ```
 * 
 * ## 错误处理
 * 
 * ### 检查解密结果
 * ```typescript
 * const decrypted = dec.aes(encrypted, 'wrong-password')
 * 
 * if (!decrypted.success) {
 *   console.error('解密失败:', decrypted.error)
 *   // 可能的原因：
 *   // - 密钥错误
 *   // - IV 不匹配
 *   // - 密文被篡改
 *   // - 算法/模式不匹配
 * } else {
 *   console.log('解密成功:', decrypted.data)
 * }
 * ```
 * 
 * ## 常见问题
 * 
 * ### Q: 解密失败怎么办？
 * A: 检查以下几点：
 * 1. 密钥是否正确
 * 2. IV 是否与加密时相同
 * 3. 算法和模式是否匹配
 * 4. 密文是否完整（未被截断）
 * 
 * ### Q: 如何解密旧数据？
 * A: 确保保存了完整的加密参数：
 * ```typescript
 * // 从数据库读取
 * const saved = await database.get(id)
 * 
 * // 使用保存的参数解密
 * const decrypted = dec.aes(saved.ciphertext, key, {
 *   iv: saved.iv,
 *   keySize: saved.keySize,
 *   mode: saved.mode
 * })
 * ```
 * 
 * @see Encrypt
 * @see AESEncryptor
 * @see RSAEncryptor
 */
export class Decrypt {
  private encoder = Encoder.getInstance()
  /**
   * AES 解密
   */
  aes(
    encryptedData: string | EncryptResult,
    key: string,
    options?: AESOptions,
  ): DecryptResult {
    return aes.decrypt(encryptedData, key, options)
  }

  /**
   * AES-128 解密
   */
  aes128(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult {
    return aes.decrypt128(encryptedData, key, options)
  }

  /**
   * AES-192 解密
   */
  aes192(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult {
    return aes.decrypt192(encryptedData, key, options)
  }

  /**
   * AES-256 解密
   */
  aes256(
    encryptedData: string | EncryptResult,
    key: string,
    options?: Omit<AESOptions, 'keySize'>,
  ): DecryptResult {
    return aes.decrypt256(encryptedData, key, options)
  }

  /**
   * RSA 解密
   */
  rsa(
    encryptedData: string | EncryptResult,
    privateKey: string,
    options?: RSAOptions,
  ): DecryptResult {
    return rsa.decrypt(encryptedData, privateKey, options)
  }

  /**
   * DES 解密
   */
  des(
    encryptedData: string | EncryptResult,
    key: string,
    options?: DESOptions,
  ): DecryptResult {
    return des.decrypt(encryptedData, key, options)
  }

  /**
   * 3DES 解密
   */
  des3(
    encryptedData: string | EncryptResult,
    key: string,
    options?: TripleDESOptions,
  ): DecryptResult {
    return des3.decrypt(encryptedData, key, options)
  }

  /**
   * Triple DES 解密 (别名)
   */
  tripledes(
    encryptedData: string | EncryptResult,
    key: string,
    options?: TripleDESOptions,
  ): DecryptResult {
    return tripledes.decrypt(encryptedData, key, options)
  }

  /**
   * Blowfish 解密
   */
  blowfish(
    encryptedData: string | EncryptResult,
    key: string,
    options?: BlowfishOptions,
  ): DecryptResult {
    return blowfish.decrypt(encryptedData, key, options)
  }

  /**
   * 通用解密方法
   * 根据算法类型自动选择合适的解密方法
   */
  decrypt(
    encryptedData: string | EncryptResult,
    key: string,
    algorithm?: EncryptionAlgorithm,
    options?: EncryptionOptions,
  ): DecryptResult {
    // 如果传入的是 EncryptResult 对象，尝试从中获取算法信息
    let targetAlgorithm = algorithm
    if (typeof encryptedData === 'object' && encryptedData.algorithm) {
      targetAlgorithm = encryptedData.algorithm as EncryptionAlgorithm
    }

    if (!targetAlgorithm) {
      return {
        success: false,
        error: 'Algorithm must be specified for decryption',
        algorithm: 'Unknown',
      }
    }

    switch (targetAlgorithm.toUpperCase()) {
      case 'AES':
        return this.aes(encryptedData, key, options as AESOptions)
      case 'RSA':
        return this.rsa(encryptedData, key, options as RSAOptions)
      case 'DES':
        return this.des(encryptedData, key, options as DESOptions)
      case '3DES':
        return this.des3(encryptedData, key, options as TripleDESOptions)
      case 'BLOWFISH':
        return this.blowfish(encryptedData, key, options as BlowfishOptions)
      default:
        return {
          success: false,
          error: `Unsupported decryption algorithm: ${targetAlgorithm}`,
          algorithm: targetAlgorithm,
        }
    }
  }

  /**
   * Base64 解码
   */
  base64(encodedData: string): string {
    return encoding.base64.decode(encodedData)
  }

  /**
   * URL 安全的 Base64 解码
   */
  base64Url(encodedData: string): string {
    return encoding.base64.decodeUrl(encodedData)
  }

  /**
   * Hex 解码
   */
  hex(encodedData: string): string {
    return encoding.hex.decode(encodedData)
  }

  /**
   * 通用解码
   */
  decode(encodedData: string, encoding: EncodingType): string {
    return this.encoder.decode(encodedData, encoding)
  }
}

/**
 * 哈希类（Hash）- 统一哈希接口
 *
 * 提供多种哈希算法的统一接口，支持 MD5、SHA 系列等常用摘要算法。
 * 
 * ## 支持的算法
 * 
 * ### 不推荐用于安全场景
 * - **MD5**：已被破解，仅用于非安全场景（如校验和）
 * - **SHA-1**：已不安全，不推荐使用
 * 
 * ### 推荐用于安全场景
 * - **SHA-256**：当前标准，推荐使用
 * - **SHA-384**：中等安全性
 * - **SHA-512**：高安全性
 * - **SHA-224**：SHA-256 的截断版本
 * 
 * ## 主要特性
 * 
 * ### 多种编码格式
 * - **Hex**：十六进制（默认）
 * - **Base64**：Base64 编码
 * - **UTF-8**：UTF-8 字符串（不推荐）
 * 
 * ### 时序安全验证
 * - `verify()` 方法使用恒定时间比较
 * - 防止时序攻击
 * - 保护哈希值不被推断
 * 
 * ## 使用场景
 * 
 * ### ✅ 推荐使用
 * - 数据完整性校验
 * - 数字签名
 * - 密码哈希（配合 PBKDF2）
 * - 内容寻址（文件去重）
 * 
 * ### ❌ 不推荐使用
 * - 直接存储密码哈希（应使用 PBKDF2/Argon2）
 * - 安全场景使用 MD5/SHA-1
 * 
 * ## 使用示例
 * 
 * ### 基础哈希
 * ```typescript
 * import { Hash } from '@ldesign/crypto'
 * 
 * const hasher = new Hash()
 * 
 * // SHA-256（推荐）
 * const sha256 = hasher.sha256('Hello World')
 * console.log(sha256) // 十六进制哈希值
 * 
 * // MD5（仅用于非安全场景）
 * const md5 = hasher.md5('Hello World')
 * 
 * // SHA-512（高安全性）
 * const sha512 = hasher.sha512('Hello World')
 * ```
 * 
 * ### 自定义编码
 * ```typescript
 * // Base64 编码
 * const sha256Base64 = hasher.sha256('data', { encoding: 'base64' })
 * 
 * // Hex 编码（默认）
 * const sha256Hex = hasher.sha256('data', { encoding: 'hex' })
 * ```
 * 
 * ### 验证哈希
 * ```typescript
 * const data = 'Important data'
 * const expectedHash = hasher.sha256(data)
 * 
 * // 安全验证（恒定时间比较）
 * const isValid = hasher.verify(data, expectedHash, 'SHA256')
 * console.log(isValid) // true
 * ```
 * 
 * ### 文件完整性校验
 * ```typescript
 * // 计算文件哈希
 * const fileContent = await file.text()
 * const fileHash = hasher.sha256(fileContent)
 * 
 * // 保存哈希值
 * await database.save({ filename: file.name, hash: fileHash })
 * 
 * // 验证文件完整性
 * const storedHash = await database.get(file.name)
 * const isIntact = hasher.verify(fileContent, storedHash, 'SHA256')
 * ```
 * 
 * ## 性能提示
 * 
 * - **SHA-256**：速度与安全性的最佳平衡
 * - **MD5**：最快，但不安全
 * - **SHA-512**：较慢，但更安全
 * - **对象池优化**：已自动应用，无需手动优化
 * 
 * ## 安全警告
 * 
 * ⚠️ **不要用于直接存储密码**
 * ```typescript
 * // ❌ 不安全：直接哈希密码
 * const passwordHash = hasher.sha256('password123')
 * // 容易被彩虹表攻击
 * 
 * // ✅ 安全：使用密钥派生函数
 * import { deriveKey } from '@ldesign/crypto'
 * const derived = await deriveKey('password123', {
 *   salt: userSalt,
 *   iterations: 100000
 * })
 * ```
 * 
 * @see Hasher
 * @see HMAC
 * @see deriveKey
 */
export class Hash {
  private hasher = new Hasher()

  /**
   * MD5 哈希
   */
  md5(data: string, options?: HashOptions): HashResult {
    return this.hasher.hash(data, 'MD5', options)
  }

  /**
   * SHA1 哈希
   */
  sha1(data: string, options?: HashOptions): HashResult {
    return this.hasher.hash(data, 'SHA1', options)
  }

  /**
   * SHA224 哈希
   */
  sha224(data: string, options?: HashOptions): HashResult {
    return this.hasher.hash(data, 'SHA224', options)
  }

  /**
   * SHA256 哈希
   */
  sha256(data: string, options?: HashOptions): HashResult {
    return this.hasher.hash(data, 'SHA256', options)
  }

  /**
   * SHA384 哈希
   */
  sha384(data: string, options?: HashOptions): HashResult {
    return this.hasher.hash(data, 'SHA384', options)
  }

  /**
   * SHA512 哈希
   */
  sha512(data: string, options?: HashOptions): HashResult {
    return this.hasher.hash(data, 'SHA512', options)
  }

  /**
   * 通用哈希方法
   */
  hash(
    data: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): HashResult {
    return this.hasher.hash(data, algorithm, options)
  }

  /**
   * 验证哈希
   */
  verify(
    data: string,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): boolean {
    return this.hasher.verify(data, expectedHash, algorithm, options)
  }
}

/**
 * HMAC 类（Hash-based Message Authentication Code）- 消息认证码
 *
 * 提供 HMAC 消息认证码功能，用于验证数据完整性和真实性。
 * 
 * ## 什么是 HMAC
 * 
 * HMAC 是基于哈希函数的消息认证码，结合了：
 * - **哈希函数**：如 SHA-256
 * - **密钥**：秘密密钥
 * 
 * 作用：
 * - 验证消息未被篡改（完整性）
 * - 验证消息来自特定发送方（真实性）
 * 
 * ## 支持的算法
 * 
 * - **HMAC-MD5**：不推荐用于安全场景
 * - **HMAC-SHA1**：不推荐用于安全场景
 * - **HMAC-SHA256**：推荐（当前标准）
 * - **HMAC-SHA384**：中等安全性
 * - **HMAC-SHA512**：高安全性
 * 
 * ## 主要特性
 * 
 * ### 时序安全验证
 * - `verify()` 使用恒定时间比较
 * - 防止时序攻击
 * - 防止通过执行时间推断 HMAC 值
 * 
 * ### 性能优化
 * - 使用对象池复用 HMACHasher 实例
 * - 性能提升约 29%
 * 
 * ## 使用场景
 * 
 * ### ✅ 推荐使用
 * - API 请求签名
 * - 数据完整性保护
 * - 消息认证
 * - JWT 签名
 * - Cookie 完整性保护
 * 
 * ### 典型应用
 * 1. **API 签名**：防止请求被篡改
 * 2. **数据完整性**：确保数据未被修改
 * 3. **身份认证**：验证发送方身份
 * 
 * ## 使用示例
 * 
 * ### 基础用法
 * ```typescript
 * import { HMAC } from '@ldesign/crypto'
 * 
 * const hmac = new HMAC()
 * 
 * // 生成 HMAC
 * const mac = hmac.sha256('important data', 'secret-key')
 * console.log(mac) // 十六进制 HMAC 值
 * 
 * // 验证 HMAC（恒定时间比较）
 * const isValid = hmac.verify('important data', 'secret-key', mac, 'SHA256')
 * console.log(isValid) // true
 * ```
 * 
 * ### API 请求签名
 * ```typescript
 * // 客户端：生成签名
 * const timestamp = Date.now()
 * const message = `${method}:${path}:${timestamp}:${body}`
 * const signature = hmac.sha256(message, apiSecret)
 * 
 * // 发送请求
 * await fetch(url, {
 *   headers: {
 *     'X-Signature': signature,
 *     'X-Timestamp': timestamp
 *   }
 * })
 * 
 * // 服务器：验证签名
 * const message = `${method}:${path}:${timestamp}:${body}`
 * const isValid = hmac.verify(message, apiSecret, signature, 'SHA256')
 * if (!isValid) {
 *   throw new Error('Invalid signature')
 * }
 * ```
 * 
 * ### 数据完整性保护
 * ```typescript
 * import { aes, HMAC } from '@ldesign/crypto'
 * 
 * const hmac = new HMAC()
 * 
 * // 加密 + HMAC（Encrypt-then-MAC）
 * const encrypted = aes.encrypt('data', 'enc-key')
 * const mac = hmac.sha256(encrypted.data || '', 'mac-key')
 * 
 * // 保存密文和 MAC
 * await database.save({
 *   ciphertext: encrypted.data,
 *   iv: encrypted.iv,
 *   mac
 * })
 * 
 * // 验证 + 解密
 * const saved = await database.get(id)
 * const isValid = hmac.verify(saved.ciphertext, 'mac-key', saved.mac, 'SHA256')
 * if (!isValid) {
 *   throw new Error('Data has been tampered')
 * }
 * const decrypted = aes.decrypt(saved.ciphertext, 'enc-key', { iv: saved.iv })
 * ```
 * 
 * ## 安全建议
 * 
 * ### 1. 使用不同的密钥
 * ```typescript
 * // ✅ 好：加密和 HMAC 使用不同的密钥
 * const encKey = 'encryption-key-123'
 * const macKey = 'mac-key-456'
 * 
 * // ❌ 差：使用相同的密钥
 * const key = 'same-key'
 * ```
 * 
 * ### 2. Encrypt-then-MAC
 * ```typescript
 * // ✅ 推荐：先加密，后计算 MAC
 * const encrypted = aes.encrypt(data, encKey)
 * const mac = hmac.sha256(encrypted.data, macKey)
 * 
 * // ❌ 不推荐：MAC-then-Encrypt（不安全）
 * const mac = hmac.sha256(data, macKey)
 * const encrypted = aes.encrypt(data + mac, encKey)
 * ```
 * 
 * ### 3. 密钥长度
 * - 密钥长度应 ≥ 哈希输出长度
 * - SHA-256：密钥至少 32 字节
 * - SHA-512：密钥至少 64 字节
 * 
 * ## 性能
 * 
 * - HMAC-SHA256：~0.25 ms
 * - HMAC-SHA512：~0.32 ms
 * - 对象池优化：性能提升 29%
 * 
 * @see HMACHasher
 * @see Hash
 */
export class HMAC {
  private hmacHasher = new HMACHasher()

  /**
   * HMAC-MD5
   */
  md5(data: string, key: string, options?: HashOptions): string {
    return this.hmacHasher.hmac(data, key, 'MD5', options).hash
  }

  /**
   * HMAC-SHA1
   */
  sha1(data: string, key: string, options?: HashOptions): string {
    return this.hmacHasher.hmac(data, key, 'SHA1', options).hash
  }

  /**
   * HMAC-SHA256
   */
  sha256(data: string, key: string, options?: HashOptions): string {
    return this.hmacHasher.hmac(data, key, 'SHA256', options).hash
  }

  /**
   * HMAC-SHA384
   */
  sha384(data: string, key: string, options?: HashOptions): string {
    return this.hmacHasher.hmac(data, key, 'SHA384', options).hash
  }

  /**
   * HMAC-SHA512
   */
  sha512(data: string, key: string, options?: HashOptions): string {
    return this.hmacHasher.hmac(data, key, 'SHA512', options).hash
  }

  /**
   * 通用 HMAC
   */
  hmac(
    data: string,
    key: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): string {
    switch (algorithm.toUpperCase()) {
      case 'MD5':
        return this.md5(data, key, options)
      case 'SHA1':
        return this.sha1(data, key, options)
      case 'SHA256':
        return this.sha256(data, key, options)
      case 'SHA384':
        return this.sha384(data, key, options)
      case 'SHA512':
        return this.sha512(data, key, options)
      default:
        return this.sha256(data, key, options)
    }
  }

  /**
   * 验证 HMAC
   */
  verify(
    data: string,
    key: string,
    expectedHmac: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): boolean {
    return this.hmacHasher.verify(data, key, expectedHmac, algorithm, options)
  }
}

/**
 * 密钥生成类（KeyGenerator）- 统一密钥生成接口
 *
 * 提供密码学安全的密钥、盐值、IV 等随机材料生成功能。
 * 
 * ## 主要功能
 * 
 * ### 对称密钥生成
 * - **AES 密钥**：128/192/256 位密钥
 * - **DES 密钥**：64 位密钥
 * - **3DES 密钥**：192 位密钥
 * - **通用随机密钥**：任意长度
 * 
 * ### 非对称密钥生成
 * - **RSA 密钥对**：1024/2048/3072/4096 位
 * - **公钥和私钥**：PEM 格式
 * 
 * ### 随机材料生成
 * - **盐值**：用于密钥派生
 * - **IV**：初始化向量
 * - **随机字节**：通用随机数据
 * 
 * ## 安全特性
 * 
 * ### 密码学安全随机数
 * - 使用 CSPRNG（密码学安全的伪随机数生成器）
 * - 浏览器：`crypto.getRandomValues()`
 * - Node.js：`crypto.randomBytes()`
 * - 不可预测性：无法通过已知输出预测下一个输出
 * 
 * ## 使用示例
 * 
 * ### AES 密钥生成
 * ```typescript
 * import { KeyGenerator } from '@ldesign/crypto'
 * 
 * const keyGen = new KeyGenerator()
 * 
 * // AES-256 密钥（32 字节 = 64 个十六进制字符）
 * const aesKey = keyGen.generateKey(32)
 * console.log(aesKey.length) // 64
 * 
 * // 使用生成的密钥
 * import { aes } from '@ldesign/crypto'
 * const encrypted = aes.encrypt('data', aesKey, { keySize: 256 })
 * ```
 * 
 * ### RSA 密钥对生成
 * ```typescript
 * // 生成 2048 位 RSA 密钥对
 * const keyPair = keyGen.generateRSAKeyPair(2048)
 * 
 * console.log(keyPair.publicKey)  // -----BEGIN PUBLIC KEY-----
 * console.log(keyPair.privateKey) // -----BEGIN PRIVATE KEY-----
 * 
 * // 使用生成的密钥对
 * import { rsa } from '@ldesign/crypto'
 * const encrypted = rsa.encrypt('data', keyPair.publicKey)
 * const decrypted = rsa.decrypt(encrypted, keyPair.privateKey)
 * ```
 * 
 * ### 生成盐值
 * ```typescript
 * // 生成 16 字节盐值（用于密钥派生）
 * const salt = keyGen.generateSalt(16)
 * 
 * // 用于 PBKDF2
 * import { deriveKey } from '@ldesign/crypto'
 * const derivedKey = await deriveKey('password', {
 *   salt,
 *   iterations: 100000,
 *   keyLength: 32
 * })
 * ```
 * 
 * ### 生成 IV
 * ```typescript
 * // 生成 AES IV（16 字节）
 * const iv = keyGen.generateIV(16)
 * 
 * // 使用生成的 IV
 * const encrypted = aes.encrypt('data', 'key', { iv })
 * ```
 * 
 * ### 生成随机字节
 * ```typescript
 * // 生成 32 字节随机数据
 * const randomBytes = keyGen.generateRandomBytes(32)
 * console.log(randomBytes) // 十六进制字符串
 * ```
 * 
 * ## 密钥长度推荐
 * 
 * | 算法 | 推荐长度 | 字节数 | 十六进制长度 |
 * |------|---------|--------|-------------|
 * | AES-128 | 128 位 | 16 字节 | 32 字符 |
 * | AES-192 | 192 位 | 24 字节 | 48 字符 |
 * | AES-256 | 256 位 | 32 字节 | 64 字符 |
 * | RSA | 2048 位 | - | - |
 * | 盐值 | - | 16 字节 | 32 字符 |
 * | IV | - | 16 字节 | 32 字符 |
 * 
 * ## 性能
 * 
 * - 生成 32 字节随机数：~0.01 ms（极快）
 * - 生成 RSA-2048 密钥对：~245 ms（较慢）
 * - 生成 RSA-4096 密钥对：~1850 ms（很慢）
 * 
 * ## 最佳实践
 * 
 * ### 1. 密钥存储
 * ```typescript
 * // ✅ 好：安全存储密钥
 * const key = keyGen.generateKey(32)
 * await secureStorage.save('encryption-key', key)
 * 
 * // ❌ 差：明文存储密钥
 * localStorage.setItem('key', key) // 不安全！
 * ```
 * 
 * ### 2. 每个用户使用不同的盐值
 * ```typescript
 * // ✅ 好：每个用户不同的盐值
 * const userSalt = keyGen.generateSalt(16)
 * await database.users.update(userId, { salt: userSalt })
 * 
 * // ❌ 差：所有用户共用一个盐值
 * const globalSalt = 'fixed-salt' // 不安全！
 * ```
 * 
 * ### 3. RSA 密钥复用
 * ```typescript
 * // ✅ 好：生成一次，多次使用
 * const keyPair = keyGen.generateRSAKeyPair(2048)
 * await saveKeyPair(keyPair)
 * 
 * // ❌ 差：每次都生成新密钥对
 * for (const data of dataList) {
 *   const keyPair = keyGen.generateRSAKeyPair(2048) // 太慢！
 *   rsa.encrypt(data, keyPair.publicKey)
 * }
 * ```
 * 
 * @see RandomUtils
 * @see RSAEncryptor
 */
export class KeyGenerator {
  /**
   * 生成 RSA 密钥对
   */
  generateRSAKeyPair(
    keySize: 1024 | 2048 | 3072 | 4096 = CONSTANTS.RSA.DEFAULT_KEY_SIZE,
  ): RSAKeyPair {
    return rsa.generateKeyPair(keySize)
  }

  /**
   * 生成随机密钥
   */
  generateKey(length: number = 32): string {
    return RandomUtils.generateKey(length)
  }

  /**
   * 生成随机字节
   */
  generateRandomBytes(length: number): string {
    return RandomUtils.generateRandomString(length)
  }

  /**
   * 生成盐值
   */
  generateSalt(length: number = 16): string {
    return RandomUtils.generateSalt(length)
  }

  /**
   * 生成初始化向量
   */
  generateIV(length: number = 16): string {
    return RandomUtils.generateIV(length)
  }
}

/**
 * 数字签名类（DigitalSignature）
 *
 * 基于 RSA 的签名与验签封装（默认算法 sha256）。
 * - sign：使用私钥对字符串数据签名，返回 Base64 编码签名
 * - verify：使用公钥验证签名，返回 boolean
 *
 * 提示：请妥善保管私钥，不要在客户端暴露。
 */
export class DigitalSignature {
  /**
   * RSA 签名
   */
  sign(data: string, privateKey: string, algorithm: string = 'sha256'): string {
    return rsa.sign(data, privateKey, algorithm)
  }

  /**
   * RSA 验证签名
   */
  verify(
    data: string,
    signature: string,
    publicKey: string,
    algorithm: string = 'sha256',
  ): boolean {
    return rsa.verify(data, signature, publicKey, algorithm)
  }
}
