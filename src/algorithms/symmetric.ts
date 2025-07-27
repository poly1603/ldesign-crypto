/**
 * @ldesign/crypto - 对称加密算法实现
 * 支持AES、DES、3DES等主流对称加密算法
 */

import CryptoJS from 'crypto-js'
import type {
  AESMode,
  CryptoPlugin,
  EncodingFormat,
  PaddingMode,
  SymmetricConfig,
} from '../types'
import { CryptoError, CryptoErrorType } from '../types'

/**
 * 对称加密工具类
 */
export class SymmetricCrypto {
  /**
   * AES加密
   */
  static encrypt(data: string, config: SymmetricConfig): string {
    try {
      const {
        key,
        iv,
        mode = 'CBC',
        padding = 'PKCS7',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      // 转换密钥和IV
      const keyWords = this.parseKey(key)
      const ivWords = iv ? CryptoJS.enc.Hex.parse(iv) : CryptoJS.lib.WordArray.random(16)

      // 转换输入数据
      const dataWords = this.parseInput(data, inputEncoding)

      // 配置加密选项
      const options: any = {
        iv: ivWords,
        mode: this.getMode(mode),
        padding: this.getPadding(padding),
      }

      // 执行加密
      const encrypted = CryptoJS.AES.encrypt(dataWords, keyWords, options)

      // 返回结果
      return this.formatOutput(encrypted, outputEncoding, ivWords, mode !== 'ECB')
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `AES encryption failed: ${error}`,
        'AES',
        error,
      )
    }
  }

  /**
   * AES解密
   */
  static decrypt(encryptedData: string, config: SymmetricConfig): string {
    try {
      const {
        key,
        iv,
        mode = 'CBC',
        padding = 'PKCS7',
        inputEncoding = 'hex',
        outputEncoding = 'utf8',
      } = config

      // 转换密钥
      const keyWords = this.parseKey(key)

      // 解析加密数据和IV
      const { ciphertext, ivWords } = this.parseEncryptedData(encryptedData, iv, inputEncoding, mode !== 'ECB')

      // 配置解密选项
      const options: any = {
        iv: ivWords,
        mode: this.getMode(mode),
        padding: this.getPadding(padding),
      }

      // 执行解密
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWords, options)

      // 返回结果
      return this.formatDecryptedOutput(decrypted, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.DECRYPTION_FAILED,
        `AES decryption failed: ${error}`,
        'AES',
        error,
      )
    }
  }

  /**
   * DES加密
   */
  static encryptDES(data: string, config: SymmetricConfig): string {
    try {
      const {
        key,
        iv,
        mode = 'CBC',
        padding = 'PKCS7',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      const keyWords = CryptoJS.enc.Utf8.parse(key)
      const ivWords = iv ? CryptoJS.enc.Hex.parse(iv) : CryptoJS.lib.WordArray.random(8)
      const dataWords = this.parseInput(data, inputEncoding)

      const options: any = {
        iv: ivWords,
        mode: this.getMode(mode),
        padding: this.getPadding(padding),
      }

      const encrypted = CryptoJS.DES.encrypt(dataWords, keyWords, options)
      return this.formatOutput(encrypted, outputEncoding, ivWords, mode !== 'ECB')
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `DES encryption failed: ${error}`,
        'DES',
        error,
      )
    }
  }

  /**
   * DES解密
   */
  static decryptDES(encryptedData: string, config: SymmetricConfig): string {
    try {
      const {
        key,
        iv,
        mode = 'CBC',
        padding = 'PKCS7',
        inputEncoding = 'hex',
        outputEncoding = 'utf8',
      } = config

      const keyWords = CryptoJS.enc.Utf8.parse(key)
      const { ciphertext, ivWords } = this.parseEncryptedData(encryptedData, iv, inputEncoding, mode !== 'ECB')

      const options: any = {
        iv: ivWords,
        mode: this.getMode(mode),
        padding: this.getPadding(padding),
      }

      const decrypted = CryptoJS.DES.decrypt(ciphertext, keyWords, options)
      return this.formatDecryptedOutput(decrypted, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.DECRYPTION_FAILED,
        `DES decryption failed: ${error}`,
        'DES',
        error,
      )
    }
  }

  /**
   * 3DES加密
   */
  static encrypt3DES(data: string, config: SymmetricConfig): string {
    try {
      const {
        key,
        iv,
        mode = 'CBC',
        padding = 'PKCS7',
        inputEncoding = 'utf8',
        outputEncoding = 'hex',
      } = config

      const keyWords = CryptoJS.enc.Utf8.parse(key)
      const ivWords = iv ? CryptoJS.enc.Hex.parse(iv) : CryptoJS.lib.WordArray.random(8)
      const dataWords = this.parseInput(data, inputEncoding)

      const options: any = {
        iv: ivWords,
        mode: this.getMode(mode),
        padding: this.getPadding(padding),
      }

      const encrypted = CryptoJS.TripleDES.encrypt(dataWords, keyWords, options)
      return this.formatOutput(encrypted, outputEncoding, ivWords, mode !== 'ECB')
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.ENCRYPTION_FAILED,
        `3DES encryption failed: ${error}`,
        '3DES',
        error,
      )
    }
  }

  /**
   * 3DES解密
   */
  static decrypt3DES(encryptedData: string, config: SymmetricConfig): string {
    try {
      const {
        key,
        iv,
        mode = 'CBC',
        padding = 'PKCS7',
        inputEncoding = 'hex',
        outputEncoding = 'utf8',
      } = config

      const keyWords = CryptoJS.enc.Utf8.parse(key)
      const { ciphertext, ivWords } = this.parseEncryptedData(encryptedData, iv, inputEncoding, mode !== 'ECB')

      const options: any = {
        iv: ivWords,
        mode: this.getMode(mode),
        padding: this.getPadding(padding),
      }

      const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, keyWords, options)
      return this.formatDecryptedOutput(decrypted, outputEncoding)
    }
 catch (error) {
      throw new CryptoError(
        CryptoErrorType.DECRYPTION_FAILED,
        `3DES decryption failed: ${error}`,
        '3DES',
        error,
      )
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 解析密钥
   */
  private static parseKey(key: string): CryptoJS.lib.WordArray {
    // 支持多种密钥格式
    if (key.length === 32) {
      // 128位密钥 (hex)
      return CryptoJS.enc.Hex.parse(key)
    }
 else if (key.length === 48) {
      // 192位密钥 (hex)
      return CryptoJS.enc.Hex.parse(key)
    }
 else if (key.length === 64) {
      // 256位密钥 (hex)
      return CryptoJS.enc.Hex.parse(key)
    }
 else {
      // UTF8字符串密钥
      return CryptoJS.enc.Utf8.parse(key)
    }
  }

  /**
   * 解析输入数据
   */
  private static parseInput(data: string, encoding: EncodingFormat): CryptoJS.lib.WordArray {
    switch (encoding) {
      case 'hex':
        return CryptoJS.enc.Hex.parse(data)
      case 'base64':
        return CryptoJS.enc.Base64.parse(data)
      case 'utf8':
        return CryptoJS.enc.Utf8.parse(data)
      case 'binary':
        return CryptoJS.enc.Latin1.parse(data)
      default:
        return CryptoJS.enc.Utf8.parse(data)
    }
  }

  /**
   * 获取加密模式
   */
  private static getMode(mode: AESMode): any {
    switch (mode) {
      case 'ECB':
        return CryptoJS.mode.ECB
      case 'CBC':
        return CryptoJS.mode.CBC
      case 'CFB':
        return CryptoJS.mode.CFB
      case 'OFB':
        return CryptoJS.mode.OFB
      case 'CTR':
        return CryptoJS.mode.CTR
      default:
        return CryptoJS.mode.CBC
    }
  }

  /**
   * 获取填充模式
   */
  private static getPadding(padding: PaddingMode): any {
    switch (padding) {
      case 'PKCS7':
        return CryptoJS.pad.Pkcs7
      case 'PKCS5':
        return CryptoJS.pad.Pkcs7 // PKCS5和PKCS7在块大小为16时相同
      case 'ZeroPadding':
        return CryptoJS.pad.ZeroPadding
      case 'NoPadding':
        return CryptoJS.pad.NoPadding
      default:
        return CryptoJS.pad.Pkcs7
    }
  }

  /**
   * 格式化输出
   */
  private static formatOutput(
    encrypted: CryptoJS.lib.CipherParams,
    encoding: EncodingFormat,
    iv: CryptoJS.lib.WordArray,
    includeIV: boolean,
  ): string {
    let result = encrypted.ciphertext.toString()

    if (includeIV) {
      const ivHex = iv.toString(CryptoJS.enc.Hex)
      result = ivHex + result
    }

    switch (encoding) {
      case 'hex':
        return result
      case 'base64':
        return CryptoJS.enc.Hex.parse(result).toString(CryptoJS.enc.Base64)
      case 'utf8':
        return CryptoJS.enc.Hex.parse(result).toString(CryptoJS.enc.Utf8)
      case 'binary':
        return CryptoJS.enc.Hex.parse(result).toString(CryptoJS.enc.Latin1)
      default:
        return result
    }
  }

  /**
   * 解析加密数据
   */
  private static parseEncryptedData(
    encryptedData: string,
    iv: string | undefined,
    encoding: EncodingFormat,
    hasIV: boolean,
  ): { ciphertext: CryptoJS.lib.CipherParams, ivWords: CryptoJS.lib.WordArray } {
    let dataHex = encryptedData

    // 转换编码格式为hex
    switch (encoding) {
      case 'base64':
        dataHex = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Hex)
        break
      case 'utf8':
        dataHex = CryptoJS.enc.Utf8.parse(encryptedData).toString(CryptoJS.enc.Hex)
        break
      case 'binary':
        dataHex = CryptoJS.enc.Latin1.parse(encryptedData).toString(CryptoJS.enc.Hex)
        break
    }

    let ivWords: CryptoJS.lib.WordArray
    let ciphertextHex: string

    if (hasIV && !iv) {
      // 从数据中提取IV
      ivWords = CryptoJS.enc.Hex.parse(dataHex.substring(0, 32)) // 16字节IV
      ciphertextHex = dataHex.substring(32)
    }
 else if (iv) {
      // 使用提供的IV
      ivWords = CryptoJS.enc.Hex.parse(iv)
      ciphertextHex = dataHex
    }
 else {
      // 无IV模式
      ivWords = CryptoJS.lib.WordArray.create()
      ciphertextHex = dataHex
    }

    const ciphertext = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertextHex),
    })

    return { ciphertext, ivWords }
  }

  /**
   * 格式化解密输出
   */
  private static formatDecryptedOutput(
    decrypted: CryptoJS.lib.WordArray,
    encoding: EncodingFormat,
  ): string {
    switch (encoding) {
      case 'hex':
        return decrypted.toString(CryptoJS.enc.Hex)
      case 'base64':
        return decrypted.toString(CryptoJS.enc.Base64)
      case 'utf8':
        return decrypted.toString(CryptoJS.enc.Utf8)
      case 'binary':
        return decrypted.toString(CryptoJS.enc.Latin1)
      default:
        return decrypted.toString(CryptoJS.enc.Utf8)
    }
  }
}

/**
 * 对称加密插件
 */
export const SymmetricPlugin: CryptoPlugin = {
  name: 'symmetric',
  algorithms: ['AES', 'DES', '3DES'],

  async init() {
    // 插件初始化逻辑
    console.log('[SymmetricPlugin] Initialized')
  },

  async destroy() {
    // 插件销毁逻辑
    console.log('[SymmetricPlugin] Destroyed')
  },
}
