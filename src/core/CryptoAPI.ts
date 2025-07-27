/**
 * @ldesign/crypto - 统一加密API
 * 提供简单易用的加密接口
 */

import { SymmetricCrypto, SymmetricPlugin } from '../algorithms/symmetric'
import { AsymmetricPlugin, RSACrypto } from '../algorithms/asymmetric'
import { HashCrypto, HashPlugin } from '../algorithms/hash'
import { SM2Crypto, SM3Crypto, SM4Crypto, SMPlugin } from '../algorithms/sm'
import type {
  AsymmetricConfig,
  CryptoManagerConfig,
  CryptoResult,
  HashConfig,
  KeyDerivationConfig,
  KeyPair,
  RandomConfig,
  SM2Config,
  SM4Config,
  SignatureResult,
  SymmetricConfig,
  VerifyResult,
} from '../types'
import { CryptoError, CryptoErrorType } from '../types'
import { CryptoManager } from './CryptoManager'

/**
 * 统一加密API类
 */
export class CryptoAPI extends CryptoManager {
  constructor(config: CryptoManagerConfig = {}) {
    super(config)
  }

  /**
   * 初始化API（自动注册所有插件）
   */
  async init(): Promise<void> {
    // 注册所有内置插件
    await this.registerPlugin(SymmetricPlugin)
    await this.registerPlugin(AsymmetricPlugin)
    await this.registerPlugin(HashPlugin)
    await this.registerPlugin(SMPlugin)

    await super.init()
  }

  // ==================== 对称加密 ====================

  /**
   * AES加密
   */
  async aesEncrypt(data: string, config: SymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'aes_encrypt',
      'AES',
      () => SymmetricCrypto.encrypt(data, config),
      { data, config },
    )
  }

  /**
   * AES解密
   */
  async aesDecrypt(encryptedData: string, config: SymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'aes_decrypt',
      'AES',
      () => SymmetricCrypto.decrypt(encryptedData, config),
      { encryptedData, config },
    )
  }

  /**
   * DES加密
   */
  async desEncrypt(data: string, config: SymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'des_encrypt',
      'DES',
      () => SymmetricCrypto.encryptDES(data, config),
      { data, config },
    )
  }

  /**
   * DES解密
   */
  async desDecrypt(encryptedData: string, config: SymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'des_decrypt',
      'DES',
      () => SymmetricCrypto.decryptDES(encryptedData, config),
      { encryptedData, config },
    )
  }

  /**
   * 3DES加密
   */
  async tripleDesEncrypt(data: string, config: SymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      '3des_encrypt',
      '3DES',
      () => SymmetricCrypto.encrypt3DES(data, config),
      { data, config },
    )
  }

  /**
   * 3DES解密
   */
  async tripleDesDecrypt(encryptedData: string, config: SymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      '3des_decrypt',
      '3DES',
      () => SymmetricCrypto.decrypt3DES(encryptedData, config),
      { encryptedData, config },
    )
  }

  // ==================== 非对称加密 ====================

  /**
   * 生成RSA密钥对
   */
  async generateRSAKeyPair(keySize: number = 2048): Promise<KeyPair> {
    try {
      return RSACrypto.generateKeyPair(keySize)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.KEY_GENERATION_FAILED,
        `RSA key generation failed: ${error}`,
        'RSA',
        error,
      )
    }
  }

  /**
   * RSA加密
   */
  async rsaEncrypt(data: string, config: AsymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'rsa_encrypt',
      'RSA',
      () => RSACrypto.encrypt(data, config),
      { data, config },
    )
  }

  /**
   * RSA解密
   */
  async rsaDecrypt(encryptedData: string, config: AsymmetricConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'rsa_decrypt',
      'RSA',
      () => RSACrypto.decrypt(encryptedData, config),
      { encryptedData, config },
    )
  }

  /**
   * RSA签名
   */
  async rsaSign(data: string, config: AsymmetricConfig): Promise<SignatureResult> {
    try {
      return RSACrypto.sign(data, config)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.SIGNATURE_FAILED,
        `RSA signing failed: ${error}`,
        'RSA',
        error,
      )
    }
  }

  /**
   * RSA验签
   */
  async rsaVerify(data: string, signature: string, config: AsymmetricConfig): Promise<VerifyResult> {
    try {
      return RSACrypto.verify(data, signature, config)
    }
 catch (error) {
      return {
        valid: false,
        error: `RSA verification failed: ${error}`,
      }
    }
  }

  // ==================== 哈希算法 ====================

  /**
   * MD5哈希
   */
  async md5(data: string, config: HashConfig = {}): Promise<CryptoResult> {
    return this.executeOperation(
      'md5',
      'MD5',
      () => HashCrypto.md5(data, config),
      { data, config },
    )
  }

  /**
   * SHA1哈希
   */
  async sha1(data: string, config: HashConfig = {}): Promise<CryptoResult> {
    return this.executeOperation(
      'sha1',
      'SHA1',
      () => HashCrypto.sha1(data, config),
      { data, config },
    )
  }

  /**
   * SHA256哈希
   */
  async sha256(data: string, config: HashConfig = {}): Promise<CryptoResult> {
    return this.executeOperation(
      'sha256',
      'SHA256',
      () => HashCrypto.sha256(data, config),
      { data, config },
    )
  }

  /**
   * SHA512哈希
   */
  async sha512(data: string, config: HashConfig = {}): Promise<CryptoResult> {
    return this.executeOperation(
      'sha512',
      'SHA512',
      () => HashCrypto.sha512(data, config),
      { data, config },
    )
  }

  /**
   * PBKDF2密钥派生
   */
  async pbkdf2(config: KeyDerivationConfig): Promise<CryptoResult> {
    return this.executeOperation(
      'pbkdf2',
      'SHA256',
      () => HashCrypto.pbkdf2(config),
      { config },
    )
  }

  // ==================== 国密算法 ====================

  /**
   * 生成SM2密钥对
   */
  async generateSM2KeyPair(): Promise<KeyPair> {
    try {
      return SM2Crypto.generateKeyPair()
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
   * SM2加密
   */
  async sm2Encrypt(data: string, config: SM2Config): Promise<CryptoResult> {
    return this.executeOperation(
      'sm2_encrypt',
      'SM2',
      () => SM2Crypto.encrypt(data, config),
      { data, config },
    )
  }

  /**
   * SM2解密
   */
  async sm2Decrypt(encryptedData: string, config: SM2Config): Promise<CryptoResult> {
    return this.executeOperation(
      'sm2_decrypt',
      'SM2',
      () => SM2Crypto.decrypt(encryptedData, config),
      { encryptedData, config },
    )
  }

  /**
   * SM2签名
   */
  async sm2Sign(data: string, config: SM2Config): Promise<SignatureResult> {
    try {
      return SM2Crypto.sign(data, config)
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
   * SM2验签
   */
  async sm2Verify(data: string, signature: string, config: SM2Config): Promise<VerifyResult> {
    try {
      return SM2Crypto.verify(data, signature, config)
    }
 catch (error) {
      return {
        valid: false,
        error: `SM2 verification failed: ${error}`,
      }
    }
  }

  /**
   * SM3哈希
   */
  async sm3(data: string, config: HashConfig = {}): Promise<CryptoResult> {
    return this.executeOperation(
      'sm3',
      'SM3',
      () => SM3Crypto.hash(data, config),
      { data, config },
    )
  }

  /**
   * SM4加密
   */
  async sm4Encrypt(data: string, config: SM4Config): Promise<CryptoResult> {
    return this.executeOperation(
      'sm4_encrypt',
      'SM4',
      () => SM4Crypto.encrypt(data, config),
      { data, config },
    )
  }

  /**
   * SM4解密
   */
  async sm4Decrypt(encryptedData: string, config: SM4Config): Promise<CryptoResult> {
    return this.executeOperation(
      'sm4_decrypt',
      'SM4',
      () => SM4Crypto.decrypt(encryptedData, config),
      { encryptedData, config },
    )
  }

  // ==================== 工具方法 ====================

  /**
   * 生成随机字符串
   */
  generateRandom(config: RandomConfig): string {
    const { length, charset = 'hex', includeSymbols = false } = config

    let chars = ''
    switch (charset) {
      case 'hex':
        chars = '0123456789abcdef'
        break
      case 'base64':
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        break
      case 'alphanumeric':
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        break
      case 'numeric':
        chars = '0123456789'
        break
    }

    if (includeSymbols && charset === 'alphanumeric') {
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
  }

  /**
   * 生成随机密钥
   */
  generateKey(algorithm: 'AES' | 'DES' | '3DES' | 'SM4', keySize?: number): string {
    switch (algorithm) {
      case 'AES':
        const aesSize = keySize || 256
        return this.generateRandom({ length: aesSize / 4, charset: 'hex' })
      case 'DES':
        return this.generateRandom({ length: 16, charset: 'hex' })
      case '3DES':
        return this.generateRandom({ length: 48, charset: 'hex' })
      case 'SM4':
        return SM4Crypto.generateKey()
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }
}
