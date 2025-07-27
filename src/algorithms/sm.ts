/**
 * @ldesign/crypto - 中国国密算法实现
 * 支持SM2、SM3、SM4等国密算法
 */

import * as smCrypto from 'sm-crypto'
import type {
  CryptoPlugin,
  EncodingFormat,
  HashConfig,
  KeyPair,
  SM2Config,
  SM4Config,
  SignatureResult,
  VerifyResult,
} from '../types'
import { CryptoError, CryptoErrorType } from '../types'

const { sm2, sm3, sm4 } = smCrypto

/**
 * SM2椭圆曲线公钥密码算法
 */
export class SM2Crypto {
  /**
   * 生成SM2密钥对
   */
  static generateKeyPair(): KeyPair {
    try {
      const keypair = sm2.generateKeyPairHex()

      return {
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        format: 'HEX',
      }
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.KEY_GENERATION_FAILED,
        `SM2 key generation failed: ${error}`,
        'SM2',
        error,
      )
    }
  }

  /**
   * SM2公钥加密
   */
  static encrypt(data: string, config: SM2Config): string {
    try {
      const {
        publicKey,
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      if (!publicKey) {
        throw new Error('Public key is required for SM2 encryption')
      }

      // SM2加密
      const encrypted = sm2.doEncrypt(data, publicKey, 1) // 1表示C1C3C2模式

      return this.formatOutput(encrypted, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SM2 encryption failed: ${error}`,
        'SM2',
        error,
      )
    }
  }

  /**
   * SM2私钥解密
   */
  static decrypt(encryptedData: string, config: SM2Config): string {
    try {
      const {
        privateKey,
        inputEncoding = 'hex',
        outputEncoding = 'utf8',
      } = config

      if (!privateKey) {
        throw new Error('Private key is required for SM2 decryption')
      }

      // SM2解密
      const decrypted = sm2.doDecrypt(encryptedData, privateKey, 1) // 1表示C1C3C2模式

      return decrypted
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.DECRYPTION_FAILED,
        `SM2 decryption failed: ${error}`,
        'SM2',
        error,
      )
    }
  }

  /**
   * SM2数字签名
   */
  static sign(data: string, config: SM2Config): SignatureResult {
    try {
      const {
        privateKey,
        userId = '1234567812345678', // 默认用户标识
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      if (!privateKey) {
        throw new Error('Private key is required for SM2 signing')
      }

      // SM2签名
      const signature = sm2.doSignature(data, privateKey, {
        hash: true,
        userId,
      })

      return {
        signature: this.formatOutput(signature, outputEncoding),
        algorithm: 'SM2-SM3',
        encoding: outputEncoding,
      }
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.SIGNATURE_FAILED,
        `SM2 signing failed: ${error}`,
        'SM2',
        error,
      )
    }
  }

  /**
   * SM2签名验证
   */
  static verify(data: string, signature: string, config: SM2Config): VerifyResult {
    try {
      const {
        publicKey,
        userId = '1234567812345678',
        inputEncoding = 'utf8',
      } = config

      if (!publicKey) {
        throw new Error('Public key is required for SM2 verification')
      }

      // SM2验签
      const valid = sm2.doVerifySignature(data, signature, publicKey, {
        hash: true,
        userId,
      })

      return { valid }
    }
 catch (error) {
      return {
        valid: false,
        error: `SM2 verification failed: ${error}`,
      }
    }
  }

  /**
   * 获取公钥点坐标
   */
  static getPublicKeyFromPrivate(privateKey: string): string {
    try {
      return sm2.getPublicKeyFromPrivateKey(privateKey)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.INVALID_KEY,
        `Failed to derive public key: ${error}`,
        'SM2',
        error,
      )
    }
  }

  /**
   * 格式化输出
   */
  private static formatOutput(data: string, encoding: EncodingFormat): string {
    switch (encoding) {
      case 'hex':
        return data
      case 'base64':
        return Buffer.from(data, 'hex').toString('base64')
      case 'utf8':
        return Buffer.from(data, 'hex').toString('utf8')
      case 'binary':
        return Buffer.from(data, 'hex').toString('binary')
      default:
        return data
    }
  }
}

/**
 * SM3密码杂凑算法
 */
export class SM3Crypto {
  /**
   * SM3哈希
   */
  static hash(data: string, config: HashConfig = {}): string {
    try {
      const {
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      // SM3哈希计算
      const hash = sm3(data)

      return this.formatOutput(hash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SM3 hashing failed: ${error}`,
        'SM3',
        error,
      )
    }
  }

  /**
   * SM3 HMAC
   */
  static hmac(data: string, key: string, config: HashConfig = {}): string {
    try {
      const { outputEncoding = 'hex' } = config

      // 实现SM3 HMAC
      const ipad = Buffer.alloc(64, 0x36)
      const opad = Buffer.alloc(64, 0x5C)

      // 处理密钥
      let keyBuffer = Buffer.from(key, 'utf8')
      if (keyBuffer.length > 64) {
        keyBuffer = Buffer.from(sm3(keyBuffer.toString('hex')), 'hex')
      }
      if (keyBuffer.length < 64) {
        const temp = Buffer.alloc(64)
        keyBuffer.copy(temp)
        keyBuffer = temp
      }

      // 计算内部哈希
      for (let i = 0; i < 64; i++) {
        ipad[i] ^= keyBuffer[i]
        opad[i] ^= keyBuffer[i]
      }

      const innerHash = sm3(Buffer.concat([ipad, Buffer.from(data, 'utf8')]).toString('hex'))
      const outerHash = sm3(Buffer.concat([opad, Buffer.from(innerHash, 'hex')]).toString('hex'))

      return this.formatOutput(outerHash, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SM3 HMAC failed: ${error}`,
        'SM3',
        error,
      )
    }
  }

  /**
   * 格式化输出
   */
  private static formatOutput(hash: string, encoding: EncodingFormat): string {
    switch (encoding) {
      case 'hex':
        return hash
      case 'base64':
        return Buffer.from(hash, 'hex').toString('base64')
      case 'utf8':
        return Buffer.from(hash, 'hex').toString('utf8')
      case 'binary':
        return Buffer.from(hash, 'hex').toString('binary')
      default:
        return hash
    }
  }
}

/**
 * SM4分组密码算法
 */
export class SM4Crypto {
  /**
   * SM4加密
   */
  static encrypt(data: string, config: SM4Config): string {
    try {
      const {
        key,
        mode = 'ECB',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      let encrypted: string

      if (mode === 'ECB') {
        // ECB模式
        encrypted = sm4.encrypt(data, key)
      }
 else {
        // CBC模式
        const { iv } = config
        if (!iv) {
          throw new Error('IV is required for CBC mode')
        }
        encrypted = sm4.encrypt(data, key, { mode: 'cbc', iv })
      }

      return this.formatOutput(encrypted, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `SM4 encryption failed: ${error}`,
        'SM4',
        error,
      )
    }
  }

  /**
   * SM4解密
   */
  static decrypt(encryptedData: string, config: SM4Config): string {
    try {
      const {
        key,
        mode = 'ECB',
        inputEncoding = 'hex',
        outputEncoding = 'utf8',
      } = config

      let decrypted: string

      if (mode === 'ECB') {
        // ECB模式
        decrypted = sm4.decrypt(encryptedData, key)
      }
 else {
        // CBC模式
        const { iv } = config
        if (!iv) {
          throw new Error('IV is required for CBC mode')
        }
        decrypted = sm4.decrypt(encryptedData, key, { mode: 'cbc', iv })
      }

      return decrypted
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.DECRYPTION_FAILED,
        `SM4 decryption failed: ${error}`,
        'SM4',
        error,
      )
    }
  }

  /**
   * 生成SM4密钥
   */
  static generateKey(): string {
    try {
      // 生成128位随机密钥
      const key = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)).join('')

      return key
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.KEY_GENERATION_FAILED,
        `SM4 key generation failed: ${error}`,
        'SM4',
        error,
      )
    }
  }

  /**
   * 格式化输出
   */
  private static formatOutput(data: string, encoding: EncodingFormat): string {
    switch (encoding) {
      case 'hex':
        return data
      case 'base64':
        return Buffer.from(data, 'hex').toString('base64')
      case 'utf8':
        return Buffer.from(data, 'hex').toString('utf8')
      case 'binary':
        return Buffer.from(data, 'hex').toString('binary')
      default:
        return data
    }
  }
}

/**
 * 国密算法工具类
 */
export class SMUtils {
  /**
   * 验证SM2密钥格式
   */
  static validateSM2Key(key: string, type: 'public' | 'private'): boolean {
    try {
      if (type === 'public') {
        // 公钥应该是130个字符（04 + 64字节坐标）
        return /^04[0-9a-f]{128}$/i.test(key)
      }
 else {
        // 私钥应该是64个字符（32字节）
        return /^[0-9a-f]{64}$/i.test(key)
      }
    }
 catch {
      return false
    }
  }

  /**
   * 验证SM4密钥格式
   */
  static validateSM4Key(key: string): boolean {
    try {
      // SM4密钥应该是32个字符（16字节）
      return /^[0-9a-f]{32}$/i.test(key)
    }
 catch {
      return false
    }
  }

  /**
   * 转换密钥格式
   */
  static convertKeyFormat(key: string, from: EncodingFormat, to: EncodingFormat): string {
    try {
      let buffer: Buffer

      switch (from) {
        case 'hex':
          buffer = Buffer.from(key, 'hex')
          break
        case 'base64':
          buffer = Buffer.from(key, 'base64')
          break
        case 'utf8':
          buffer = Buffer.from(key, 'utf8')
          break
        case 'binary':
          buffer = Buffer.from(key, 'binary')
          break
        default:
          throw new Error(`Unsupported source encoding: ${from}`)
      }

      switch (to) {
        case 'hex':
          return buffer.toString('hex')
        case 'base64':
          return buffer.toString('base64')
        case 'utf8':
          return buffer.toString('utf8')
        case 'binary':
          return buffer.toString('binary')
        default:
          throw new Error(`Unsupported target encoding: ${to}`)
      }
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.INVALID_KEY,
        `Key format conversion failed: ${error}`,
        'SM2',
        error,
      )
    }
  }
}

/**
 * 国密算法插件
 */
export const SMPlugin: CryptoPlugin = {
  name: 'sm',
  algorithms: ['SM2', 'SM3', 'SM4'],

  async init() {
    console.log('[SMPlugin] Initialized - 国密算法支持已启用')
  },

  async destroy() {
    console.log('[SMPlugin] Destroyed')
  },
}
