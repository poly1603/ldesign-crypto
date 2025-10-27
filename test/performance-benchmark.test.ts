/**
 * 性能基准测试
 * 
 * 用于测量和比较各种加密算法的性能。
 * 运行后会生成性能报告，用于：
 * - 验证优化效果
 * - 对比不同算法的性能
 * - 检测性能回归
 * 
 * @module test/performance-benchmark
 */

import { describe, expect, it } from 'vitest'
import { aes, hash, hmac, rsa } from '../src'
import { webcrypto } from '../src/algorithms/webcrypto-adapter'

/**
 * 性能测试结果
 */
interface BenchmarkResult {
  name: string
  iterations: number
  totalTime: number
  averageTime: number
  opsPerSecond: number
  minTime: number
  maxTime: number
}

/**
 * 运行性能测试
 * 
 * @param name - 测试名称
 * @param fn - 测试函数
 * @param iterations - 迭代次数
 * @returns 性能测试结果
 */
async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = 1000,
): Promise<BenchmarkResult> {
  const times: number[] = []

  // 预热
  for (let i = 0; i < Math.min(10, iterations); i++) {
    await fn()
  }

  // 正式测试
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await fn()
    const end = performance.now()
    times.push(end - start)
  }

  const totalTime = times.reduce((sum, t) => sum + t, 0)
  const averageTime = totalTime / iterations
  const opsPerSecond = 1000 / averageTime
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    opsPerSecond,
    minTime,
    maxTime,
  }
}

/**
 * 格式化性能结果
 */
function formatResult(result: BenchmarkResult): string {
  return `
  ${result.name}:
    迭代次数: ${result.iterations}
    总耗时: ${result.totalTime.toFixed(2)} ms
    平均耗时: ${result.averageTime.toFixed(4)} ms
    每秒操作数: ${result.opsPerSecond.toFixed(2)} ops/s
    最小耗时: ${result.minTime.toFixed(4)} ms
    最大耗时: ${result.maxTime.toFixed(4)} ms
  `
}

describe('性能基准测试', () => {
  const testData = 'Hello World! This is a test string for encryption.'
  const testKey = 'test-password-123'
  const iterations = 100 // 降低迭代次数以加快测试速度

  describe('AES 加密性能', () => {
    it('AES-256 加密性能', async () => {
      const result = await benchmark(
        'AES-256 加密',
        () => {
          aes.encrypt(testData, testKey, { keySize: 256 })
        },
        iterations,
      )

      console.log(formatResult(result))

      // 断言：平均加密时间应小于 10ms
      expect(result.averageTime).toBeLessThan(10)
      // 断言：每秒应至少完成 100 次操作
      expect(result.opsPerSecond).toBeGreaterThan(100)
    })

    it('AES-128 vs AES-256 性能对比', async () => {
      const result128 = await benchmark(
        'AES-128 加密',
        () => {
          aes.encrypt(testData, testKey, { keySize: 128 })
        },
        iterations,
      )

      const result256 = await benchmark(
        'AES-256 加密',
        () => {
          aes.encrypt(testData, testKey, { keySize: 256 })
        },
        iterations,
      )

      console.log('\n=== AES-128 vs AES-256 对比 ===')
      console.log(formatResult(result128))
      console.log(formatResult(result256))

      // 性能差异应在合理范围内（256 位应该慢但不超过 2 倍）
      expect(result256.averageTime / result128.averageTime).toBeLessThan(2)
    })

    it('AES 解密性能', async () => {
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })

      const result = await benchmark(
        'AES-256 解密',
        () => {
          aes.decrypt(encrypted, testKey)
        },
        iterations,
      )

      console.log(formatResult(result))
      expect(result.averageTime).toBeLessThan(10)
    })
  })

  describe('哈希算法性能', () => {
    it('SHA-256 哈希性能', async () => {
      const result = await benchmark(
        'SHA-256 哈希',
        () => {
          hash.sha256(testData)
        },
        iterations,
      )

      console.log(formatResult(result))
      // 哈希应该非常快（<1ms）
      expect(result.averageTime).toBeLessThan(1)
    })

    it('哈希算法对比（MD5 vs SHA256 vs SHA512）', async () => {
      const resultMD5 = await benchmark(
        'MD5 哈希',
        () => {
          hash.md5(testData)
        },
        iterations,
      )

      const resultSHA256 = await benchmark(
        'SHA-256 哈希',
        () => {
          hash.sha256(testData)
        },
        iterations,
      )

      const resultSHA512 = await benchmark(
        'SHA-512 哈希',
        () => {
          hash.sha512(testData)
        },
        iterations,
      )

      console.log('\n=== 哈希算法对比 ===')
      console.log(formatResult(resultMD5))
      console.log(formatResult(resultSHA256))
      console.log(formatResult(resultSHA512))

      // 所有哈希算法都应该很快
      expect(resultMD5.averageTime).toBeLessThan(1)
      expect(resultSHA256.averageTime).toBeLessThan(1)
      expect(resultSHA512.averageTime).toBeLessThan(1)
    })
  })

  describe('HMAC 性能', () => {
    it('HMAC-SHA256 性能', async () => {
      const result = await benchmark(
        'HMAC-SHA256',
        () => {
          hmac.sha256(testData, testKey)
        },
        iterations,
      )

      console.log(formatResult(result))
      expect(result.averageTime).toBeLessThan(1)
    })
  })

  describe('RSA 性能', () => {
    // RSA 很慢，减少迭代次数
    const rsaIterations = 10

    it('RSA 密钥生成性能', async () => {
      const result = await benchmark(
        'RSA-2048 密钥生成',
        () => {
          rsa.generateKeyPair(2048)
        },
        rsaIterations,
      )

      console.log(formatResult(result))
      // RSA 密钥生成很慢，但应该在合理范围内
      expect(result.averageTime).toBeLessThan(1000) // 1 秒
    })

    it('RSA 加密/解密性能', async () => {
      const keyPair = rsa.generateKeyPair(2048)
      const shortData = 'Hello'

      const encryptResult = await benchmark(
        'RSA-2048 加密',
        () => {
          rsa.encrypt(shortData, keyPair.publicKey)
        },
        rsaIterations,
      )

      const encrypted = rsa.encrypt(shortData, keyPair.publicKey)

      const decryptResult = await benchmark(
        'RSA-2048 解密',
        () => {
          rsa.decrypt(encrypted, keyPair.privateKey)
        },
        rsaIterations,
      )

      console.log('\n=== RSA 性能 ===')
      console.log(formatResult(encryptResult))
      console.log(formatResult(decryptResult))

      expect(encryptResult.averageTime).toBeLessThan(100)
      expect(decryptResult.averageTime).toBeLessThan(100)
    })
  })

  describe('WebCrypto API 性能对比', () => {
    it('WebCrypto vs CryptoJS AES 性能对比', async () => {
      // CryptoJS 实现
      const cryptojsResult = await benchmark(
        'CryptoJS AES-256',
        () => {
          aes.encrypt(testData, testKey, { keySize: 256 })
        },
        iterations,
      )

      // WebCrypto 实现
      const webcryptoResult = await benchmark(
        'WebCrypto AES-256',
        async () => {
          await webcrypto.aes.encrypt(testData, testKey, { keySize: 256, mode: 'CTR' })
        },
        iterations,
      )

      console.log('\n=== WebCrypto vs CryptoJS 对比 ===')
      console.log(formatResult(cryptojsResult))
      console.log(formatResult(webcryptoResult))

      // WebCrypto 应该更快（但如果不支持会降级，所以不强制）
      const speedup = cryptojsResult.averageTime / webcryptoResult.averageTime
      console.log(`\nWebCrypto 加速比: ${speedup.toFixed(2)}x`)
    })
  })

  describe('对象池优化效果', () => {
    it('哈希函数对象池优化效果', async () => {
      // 多次调用以测试对象池效果
      const result = await benchmark(
        '哈希函数（对象池优化）',
        () => {
          hash.sha256(testData)
          hash.md5(testData)
          hash.sha512(testData)
        },
        iterations,
      )

      console.log(formatResult(result))

      // 对象池优化后应该很快
      expect(result.averageTime).toBeLessThan(3)
    })
  })

  describe('内存占用测试', () => {
    it('大量加密操作的内存占用', async () => {
      const largData = 'x'.repeat(10000) // 10KB 数据
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0

      // 执行 1000 次加密
      for (let i = 0; i < 1000; i++) {
        aes.encrypt(largData, testKey, { keySize: 256 })
      }

      const endMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = endMemory - startMemory

      console.log(`\n内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)

      // 内存增长应控制在合理范围内（<10MB）
      if (memoryIncrease > 0) {
        expect(memoryIncrease / 1024 / 1024).toBeLessThan(10)
      }
    })
  })
})

describe('性能回归检测', () => {
  it('AES 加密性能不应退化', async () => {
    const testData = 'Performance test data'
    const testKey = 'test-key-123'

    const result = await benchmark(
      'AES-256 回归测试',
      () => {
        aes.encrypt(testData, testKey, { keySize: 256 })
      },
      100,
    )

    // 基准：AES-256 加密应在 5ms 内完成
    expect(result.averageTime).toBeLessThan(5)

    console.log('\n=== 性能回归检测 ===')
    console.log(formatResult(result))
    console.log('✅ 性能符合预期，无回归')
  })
})


