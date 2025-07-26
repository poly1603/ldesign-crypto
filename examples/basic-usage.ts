/**
 * @ldesign/crypto - 基础使用示例
 * 展示各种加密算法的基本用法
 */

import { createCrypto } from '../src'

async function basicUsageExample() {
  console.log('🔐 LDesign Crypto 基础使用示例\n')

  // 创建加密API实例
  const crypto = createCrypto({
    debug: true,
    performance: { enabled: true },
    cache: { enabled: true }
  })

  // 初始化
  await crypto.init()

  try {
    // ==================== 对称加密示例 ====================
    console.log('📊 对称加密示例')
    console.log('='.repeat(50))

    const testData = 'Hello, LDesign Crypto! 这是一个测试消息。'

    // AES加密
    console.log('\n🔒 AES加密测试:')
    const aesKey = crypto.generateKey('AES', 256)
    console.log(`生成的AES密钥: ${aesKey}`)

    const aesConfig = {
      key: aesKey,
      mode: 'CBC' as const,
      padding: 'PKCS7' as const
    }

    const aesEncrypted = await crypto.aesEncrypt(testData, aesConfig)
    if (aesEncrypted.success) {
      console.log(`AES加密结果: ${aesEncrypted.data}`)
      console.log(`加密耗时: ${aesEncrypted.duration}ms`)

      const aesDecrypted = await crypto.aesDecrypt(aesEncrypted.data!, aesConfig)
      if (aesDecrypted.success) {
        console.log(`AES解密结果: ${aesDecrypted.data}`)
        console.log(`解密耗时: ${aesDecrypted.duration}ms`)
        console.log(`✅ AES加密解密成功: ${aesDecrypted.data === testData}`)
      }
    }

    // ==================== 哈希算法示例 ====================
    console.log('\n📊 哈希算法示例')
    console.log('='.repeat(50))

    const hashData = '这是要计算哈希的数据'

    // MD5
    const md5Result = await crypto.md5(hashData)
    if (md5Result.success) {
      console.log(`MD5: ${md5Result.data}`)
    }

    // SHA256
    const sha256Result = await crypto.sha256(hashData)
    if (sha256Result.success) {
      console.log(`SHA256: ${sha256Result.data}`)
    }

    // SHA512
    const sha512Result = await crypto.sha512(hashData)
    if (sha512Result.success) {
      console.log(`SHA512: ${sha512Result.data}`)
    }

    // 带盐值的哈希
    const saltedHash = await crypto.sha256(hashData, { salt: 'mysalt' })
    if (saltedHash.success) {
      console.log(`SHA256 (带盐): ${saltedHash.data}`)
    }

    // ==================== 国密算法示例 ====================
    console.log('\n📊 国密算法示例')
    console.log('='.repeat(50))

    // SM2密钥生成
    console.log('\n🔑 SM2密钥生成:')
    const sm2KeyPair = await crypto.generateSM2KeyPair()
    console.log(`SM2公钥: ${sm2KeyPair.publicKey.substring(0, 50)}...`)
    console.log(`SM2私钥: ${sm2KeyPair.privateKey.substring(0, 50)}...`)

    // SM2加密解密
    console.log('\n🔒 SM2加密解密:')
    const sm2Data = 'SM2加密测试数据'
    const sm2Encrypted = await crypto.sm2Encrypt(sm2Data, {
      publicKey: sm2KeyPair.publicKey
    })

    if (sm2Encrypted.success) {
      console.log(`SM2加密结果: ${sm2Encrypted.data?.substring(0, 100)}...`)

      const sm2Decrypted = await crypto.sm2Decrypt(sm2Encrypted.data!, {
        privateKey: sm2KeyPair.privateKey
      })

      if (sm2Decrypted.success) {
        console.log(`SM2解密结果: ${sm2Decrypted.data}`)
        console.log(`✅ SM2加密解密成功: ${sm2Decrypted.data === sm2Data}`)
      }
    }

    // SM3哈希
    console.log('\n🔒 SM3哈希:')
    const sm3Result = await crypto.sm3('SM3哈希测试数据')
    if (sm3Result.success) {
      console.log(`SM3哈希: ${sm3Result.data}`)
    }

    // SM4加密解密
    console.log('\n🔒 SM4加密解密:')
    const sm4Key = crypto.generateKey('SM4')
    console.log(`生成的SM4密钥: ${sm4Key}`)

    const sm4Data = 'SM4加密测试数据'
    const sm4Encrypted = await crypto.sm4Encrypt(sm4Data, { key: sm4Key })

    if (sm4Encrypted.success) {
      console.log(`SM4加密结果: ${sm4Encrypted.data}`)

      const sm4Decrypted = await crypto.sm4Decrypt(sm4Encrypted.data!, { key: sm4Key })
      if (sm4Decrypted.success) {
        console.log(`SM4解密结果: ${sm4Decrypted.data}`)
        console.log(`✅ SM4加密解密成功: ${sm4Decrypted.data === sm4Data}`)
      }
    }

    // ==================== 工具功能示例 ====================
    console.log('\n📊 工具功能示例')
    console.log('='.repeat(50))

    // 生成随机字符串
    console.log('\n🎲 随机字符串生成:')
    const randomHex = crypto.generateRandom({ length: 32, charset: 'hex' })
    console.log(`随机Hex字符串: ${randomHex}`)

    const randomAlphanumeric = crypto.generateRandom({ length: 16, charset: 'alphanumeric' })
    console.log(`随机字母数字: ${randomAlphanumeric}`)

    // PBKDF2密钥派生
    console.log('\n🔑 PBKDF2密钥派生:')
    const derivedKey = await crypto.pbkdf2({
      password: 'mypassword',
      salt: 'mysalt',
      iterations: 10000,
      keyLength: 32
    })

    if (derivedKey.success) {
      console.log(`派生密钥: ${derivedKey.data}`)
    }

    // ==================== 性能统计 ====================
    console.log('\n📊 性能统计')
    console.log('='.repeat(50))

    const metrics = crypto.getPerformanceMetrics()
    console.log('性能指标:')
    Object.entries(metrics).forEach(([operation, stats]) => {
      console.log(`  ${operation}:`)
      console.log(`    执行次数: ${(stats as any).count}`)
      console.log(`    平均耗时: ${(stats as any).average.toFixed(2)}ms`)
      console.log(`    最小耗时: ${(stats as any).min.toFixed(2)}ms`)
      console.log(`    最大耗时: ${(stats as any).max.toFixed(2)}ms`)
    })

    // 缓存信息
    const cacheInfo = crypto.getCacheInfo()
    console.log(`\n缓存信息: 已启用=${cacheInfo.enabled}, 大小=${cacheInfo.size}`)

    // 支持的算法
    const algorithms = crypto.getSupportedAlgorithms()
    console.log(`\n支持的算法: ${algorithms.join(', ')}`)

    // 插件信息
    const plugins = crypto.getPluginInfo()
    console.log('\n已加载的插件:')
    plugins.forEach(plugin => {
      console.log(`  ${plugin.name}: ${plugin.algorithms.join(', ')}`)
    })

  } catch (error) {
    console.error('❌ 示例执行失败:', error)
  } finally {
    // 清理资源
    await crypto.destroy()
    console.log('\n🎉 示例执行完成!')
  }
}

// 运行示例
basicUsageExample().catch(console.error)

export { basicUsageExample }
