/**
 * @ldesign/crypto - 单元测试
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { CryptoAPI } from '../src/core/CryptoAPI'
import { SymmetricCrypto } from '../src/algorithms/symmetric'
import { RSACrypto } from '../src/algorithms/asymmetric'
import { HashCrypto } from '../src/algorithms/hash'
import { SM2Crypto, SM3Crypto, SM4Crypto } from '../src/algorithms/sm'

describe('CryptoAPI', () => {
  let crypto: CryptoAPI

  beforeAll(async () => {
    crypto = new CryptoAPI({
      debug: true,
      performance: { enabled: true },
      cache: { enabled: true }
    })
    await crypto.init()
  })

  afterAll(async () => {
    await crypto.destroy()
  })

  describe('对称加密', () => {
    const testData = 'Hello, LDesign Crypto!'
    const key = '1234567890123456' // 16字节密钥

    it('AES加密解密', async () => {
      const config = {
        key: '12345678901234567890123456789012', // 32字节密钥
        mode: 'CBC' as const,
        padding: 'PKCS7' as const
      }

      const encryptResult = await crypto.aesEncrypt(testData, config)
      expect(encryptResult.success).toBe(true)
      expect(encryptResult.data).toBeDefined()

      const decryptResult = await crypto.aesDecrypt(encryptResult.data!, config)
      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('DES加密解密', async () => {
      const config = {
        key: '12345678', // 8字节密钥
        mode: 'CBC' as const
      }

      const encryptResult = await crypto.desEncrypt(testData, config)
      expect(encryptResult.success).toBe(true)

      const decryptResult = await crypto.desDecrypt(encryptResult.data!, config)
      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('3DES加密解密', async () => {
      const config = {
        key: '123456789012345678901234', // 24字节密钥
        mode: 'CBC' as const
      }

      const encryptResult = await crypto.tripleDesEncrypt(testData, config)
      expect(encryptResult.success).toBe(true)

      const decryptResult = await crypto.tripleDesDecrypt(encryptResult.data!, config)
      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })
  })

  describe('非对称加密', () => {
    const testData = 'Hello, RSA!'

    it('RSA密钥生成', async () => {
      const keyPair = await crypto.generateRSAKeyPair(1024) // 使用较小的密钥以加快测试
      expect(keyPair.publicKey).toBeDefined()
      expect(keyPair.privateKey).toBeDefined()
      expect(keyPair.format).toBe('PEM')
    })

    it('RSA加密解密', async () => {
      const keyPair = await crypto.generateRSAKeyPair(1024)
      
      const encryptResult = await crypto.rsaEncrypt(testData, {
        publicKey: keyPair.publicKey
      })
      expect(encryptResult.success).toBe(true)

      const decryptResult = await crypto.rsaDecrypt(encryptResult.data!, {
        privateKey: keyPair.privateKey
      })
      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('RSA签名验证', async () => {
      const keyPair = await crypto.generateRSAKeyPair(1024)
      
      const signature = await crypto.rsaSign(testData, {
        privateKey: keyPair.privateKey
      })
      expect(signature.signature).toBeDefined()

      const verifyResult = await crypto.rsaVerify(testData, signature.signature, {
        publicKey: keyPair.publicKey
      })
      expect(verifyResult.valid).toBe(true)
    })
  })

  describe('哈希算法', () => {
    const testData = 'Hello, Hash!'

    it('MD5哈希', async () => {
      const result = await crypto.md5(testData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBe(32) // MD5输出32个字符
    })

    it('SHA256哈希', async () => {
      const result = await crypto.sha256(testData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBe(64) // SHA256输出64个字符
    })

    it('SHA512哈希', async () => {
      const result = await crypto.sha512(testData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBe(128) // SHA512输出128个字符
    })

    it('PBKDF2密钥派生', async () => {
      const result = await crypto.pbkdf2({
        password: 'password',
        salt: 'salt',
        iterations: 1000,
        keyLength: 32
      })
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBe(64) // 32字节 = 64个hex字符
    })
  })

  describe('国密算法', () => {
    const testData = 'Hello, 国密!'

    it('SM2密钥生成', async () => {
      const keyPair = await crypto.generateSM2KeyPair()
      expect(keyPair.publicKey).toBeDefined()
      expect(keyPair.privateKey).toBeDefined()
      expect(keyPair.format).toBe('HEX')
    })

    it('SM2加密解密', async () => {
      const keyPair = await crypto.generateSM2KeyPair()
      
      const encryptResult = await crypto.sm2Encrypt(testData, {
        publicKey: keyPair.publicKey
      })
      expect(encryptResult.success).toBe(true)

      const decryptResult = await crypto.sm2Decrypt(encryptResult.data!, {
        privateKey: keyPair.privateKey
      })
      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('SM2签名验证', async () => {
      const keyPair = await crypto.generateSM2KeyPair()
      
      const signature = await crypto.sm2Sign(testData, {
        privateKey: keyPair.privateKey
      })
      expect(signature.signature).toBeDefined()

      const verifyResult = await crypto.sm2Verify(testData, signature.signature, {
        publicKey: keyPair.publicKey
      })
      expect(verifyResult.valid).toBe(true)
    })

    it('SM3哈希', async () => {
      const result = await crypto.sm3(testData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBe(64) // SM3输出64个字符
    })

    it('SM4加密解密', async () => {
      const key = crypto.generateKey('SM4')
      const config = { key }

      const encryptResult = await crypto.sm4Encrypt(testData, config)
      expect(encryptResult.success).toBe(true)

      const decryptResult = await crypto.sm4Decrypt(encryptResult.data!, config)
      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })
  })

  describe('工具方法', () => {
    it('生成随机字符串', () => {
      const random1 = crypto.generateRandom({ length: 16, charset: 'hex' })
      expect(random1.length).toBe(16)
      expect(/^[0-9a-f]+$/.test(random1)).toBe(true)

      const random2 = crypto.generateRandom({ length: 20, charset: 'alphanumeric' })
      expect(random2.length).toBe(20)
      expect(/^[A-Za-z0-9]+$/.test(random2)).toBe(true)
    })

    it('生成密钥', () => {
      const aesKey = crypto.generateKey('AES', 256)
      expect(aesKey.length).toBe(64) // 256位 = 64个hex字符

      const desKey = crypto.generateKey('DES')
      expect(desKey.length).toBe(16) // 64位 = 16个hex字符

      const sm4Key = crypto.generateKey('SM4')
      expect(sm4Key.length).toBe(32) // 128位 = 32个hex字符
    })
  })

  describe('性能监控', () => {
    it('获取性能指标', async () => {
      // 执行一些操作
      await crypto.md5('test data')
      await crypto.sha256('test data')

      const metrics = crypto.getPerformanceMetrics()
      expect(typeof metrics).toBe('object')
    })
  })

  describe('缓存功能', () => {
    it('缓存信息', () => {
      const cacheInfo = crypto.getCacheInfo()
      expect(cacheInfo.enabled).toBe(true)
      expect(typeof cacheInfo.size).toBe('number')
    })

    it('清空缓存', () => {
      crypto.clearCache()
      const cacheInfo = crypto.getCacheInfo()
      expect(cacheInfo.size).toBe(0)
    })
  })

  describe('算法支持', () => {
    it('检查支持的算法', () => {
      expect(crypto.isAlgorithmSupported('AES')).toBe(true)
      expect(crypto.isAlgorithmSupported('RSA')).toBe(true)
      expect(crypto.isAlgorithmSupported('SM2')).toBe(true)
      expect(crypto.isAlgorithmSupported('SM3')).toBe(true)
      expect(crypto.isAlgorithmSupported('SM4')).toBe(true)
    })

    it('获取支持的算法列表', () => {
      const algorithms = crypto.getSupportedAlgorithms()
      expect(algorithms).toContain('AES')
      expect(algorithms).toContain('RSA')
      expect(algorithms).toContain('SM2')
      expect(algorithms).toContain('SM3')
      expect(algorithms).toContain('SM4')
    })

    it('获取插件信息', () => {
      const plugins = crypto.getPluginInfo()
      expect(plugins.length).toBeGreaterThan(0)
      expect(plugins.some(p => p.name === 'symmetric')).toBe(true)
      expect(plugins.some(p => p.name === 'asymmetric')).toBe(true)
      expect(plugins.some(p => p.name === 'hash')).toBe(true)
      expect(plugins.some(p => p.name === 'sm')).toBe(true)
    })
  })
})
