# 🇨🇳 国密算法演示

体验中国国家密码标准算法：SM2椭圆曲线公钥密码、SM3密码杂凑算法、SM4分组密码算法。

<SMCryptoDemo />

## 国密算法介绍

### SM2 椭圆曲线公钥密码算法

SM2是基于椭圆曲线的公钥密码算法，由国家密码管理局于2010年12月发布。

**特点:**
- 🔐 **安全性高**: 基于椭圆曲线离散对数难题
- ⚡ **效率优秀**: 相比RSA具有更高的安全强度/密钥长度比
- 🎯 **功能完整**: 支持数字签名、密钥协商、公钥加密
- 🇨🇳 **自主可控**: 中国自主设计的密码算法

**应用场景:**
- 数字证书和PKI系统
- 电子签名和身份认证
- 安全通信和密钥交换
- 金融交易和电子支付

### SM3 密码杂凑算法

SM3是中国国家标准的密码杂凑算法，输出长度为256位。

**特点:**
- 🔍 **输出固定**: 256位哈希值
- 🛡️ **抗碰撞**: 具有强抗碰撞性
- ⚡ **性能优秀**: 计算效率高
- 🔒 **单向性**: 不可逆的哈希函数

**应用场景:**
- 数据完整性校验
- 数字签名的消息摘要
- 密码存储和验证
- 区块链和数字货币

### SM4 分组密码算法

SM4是中国国家标准的分组密码算法，分组长度和密钥长度均为128位。

**特点:**
- 🔐 **对称加密**: 加密解密使用相同密钥
- ⚡ **高效率**: 适合大量数据加密
- 🔒 **安全性**: 128位密钥提供足够安全强度
- 🎯 **标准化**: 国家标准GB/T 32907-2016

**应用场景:**
- 大数据量的加密传输
- 文件和数据库加密
- VPN和安全通信
- 物联网设备加密

## 算法对比

### 与国际算法对比

| 特性 | SM2 | RSA | ECC |
|------|-----|-----|-----|
| 密钥长度 | 256位 | 2048位+ | 256位 |
| 安全强度 | 128位 | 112位 | 128位 |
| 签名速度 | 快 | 慢 | 快 |
| 验签速度 | 快 | 快 | 中等 |
| 密钥生成 | 快 | 慢 | 快 |

| 特性 | SM3 | SHA-256 | MD5 |
|------|-----|---------|-----|
| 输出长度 | 256位 | 256位 | 128位 |
| 安全性 | 高 | 高 | 低 |
| 性能 | 优秀 | 优秀 | 快 |
| 标准 | 国密 | 国际 | 已废弃 |

| 特性 | SM4 | AES | DES |
|------|-----|-----|-----|
| 密钥长度 | 128位 | 128/192/256位 | 64位 |
| 分组长度 | 128位 | 128位 | 64位 |
| 安全性 | 高 | 高 | 低 |
| 性能 | 优秀 | 优秀 | 快 |

## 实际应用案例

### 电子政务系统

```typescript
class EGovernmentCrypto {
  private sm2KeyPair: KeyPair
  private sm4Key: string

  constructor() {
    this.init()
  }

  private async init() {
    // 生成SM2密钥对用于身份认证
    this.sm2KeyPair = await crypto.generateSM2KeyPair()
    // 生成SM4密钥用于数据加密
    this.sm4Key = crypto.generateKey('SM4')
  }

  // 公文加密
  async encryptDocument(content: string, userId: string) {
    // 1. 使用SM4加密文档内容
    const encrypted = await crypto.sm4Encrypt(content, {
      key: this.sm4Key,
      mode: 'CBC'
    })

    // 2. 计算SM3摘要
    const digest = await crypto.sm3(content)

    // 3. 使用SM2对摘要进行签名
    const signature = await crypto.sm2Sign(digest.data!, {
      privateKey: this.sm2KeyPair.privateKey,
      userId
    })

    return {
      encryptedContent: encrypted.data,
      digest: digest.data,
      signature: signature.signature,
      timestamp: new Date().toISOString()
    }
  }

  // 公文解密验证
  async decryptAndVerify(encryptedDoc: any, userId: string) {
    // 1. 解密文档
    const decrypted = await crypto.sm4Decrypt(encryptedDoc.encryptedContent, {
      key: this.sm4Key,
      mode: 'CBC'
    })

    // 2. 重新计算摘要
    const digest = await crypto.sm3(decrypted.data!)

    // 3. 验证摘要是否一致
    if (digest.data !== encryptedDoc.digest) {
      throw new Error('文档完整性校验失败')
    }

    // 4. 验证数字签名
    const verified = await crypto.sm2Verify(encryptedDoc.digest, encryptedDoc.signature, {
      publicKey: this.sm2KeyPair.publicKey,
      userId
    })

    if (!verified.valid) {
      throw new Error('数字签名验证失败')
    }

    return {
      content: decrypted.data,
      verified: true,
      timestamp: encryptedDoc.timestamp
    }
  }
}
```

### 金融支付系统

```typescript
class FinancialCrypto {
  // 交易数据加密
  async encryptTransaction(transaction: any) {
    // 1. 序列化交易数据
    const transactionData = JSON.stringify(transaction)

    // 2. 生成随机SM4密钥
    const sessionKey = crypto.generateKey('SM4')

    // 3. 使用SM4加密交易数据
    const encryptedData = await crypto.sm4Encrypt(transactionData, {
      key: sessionKey,
      mode: 'CBC'
    })

    // 4. 计算交易摘要
    const hash = await crypto.sm3(transactionData)

    return {
      encryptedData: encryptedData.data,
      sessionKey,
      hash: hash.data,
      timestamp: Date.now()
    }
  }

  // 生成交易签名
  async signTransaction(transactionHash: string, privateKey: string, userId: string) {
    const signature = await crypto.sm2Sign(transactionHash, {
      privateKey,
      userId
    })

    return signature.signature
  }

  // 验证交易签名
  async verifyTransaction(transactionHash: string, signature: string, publicKey: string, userId: string) {
    const verified = await crypto.sm2Verify(transactionHash, signature, {
      publicKey,
      userId
    })

    return verified.valid
  }
}
```

## 性能测试

### 基准测试结果

基于现代浏览器的性能测试：

| 操作 | 数据大小 | 平均耗时 | 吞吐量 |
|------|----------|----------|--------|
| SM2密钥生成 | - | ~50ms | 20对/秒 |
| SM2加密 | 1KB | ~12ms | 83KB/秒 |
| SM2解密 | 1KB | ~8ms | 125KB/秒 |
| SM2签名 | 32B | ~15ms | 67次/秒 |
| SM2验签 | 32B | ~10ms | 100次/秒 |
| SM3哈希 | 1MB | ~12ms | 83MB/秒 |
| SM4加密 | 1MB | ~18ms | 56MB/秒 |
| SM4解密 | 1MB | ~16ms | 63MB/秒 |

### 性能优化建议

```typescript
// 1. 密钥复用
const keyPairCache = new Map()
async function getOrCreateKeyPair(userId: string) {
  if (!keyPairCache.has(userId)) {
    keyPairCache.set(userId, await crypto.generateSM2KeyPair())
  }
  return keyPairCache.get(userId)
}

// 2. 批量处理
async function batchSM3(dataList: string[]) {
  return Promise.all(dataList.map(data => crypto.sm3(data)))
}

// 3. 流式处理大文件
async function encryptLargeFile(file: File) {
  const chunkSize = 1024 * 1024 // 1MB chunks
  const sm4Key = crypto.generateKey('SM4')
  const chunks = []

  for (let i = 0; i < file.size; i += chunkSize) {
    const chunk = file.slice(i, i + chunkSize)
    const chunkData = await chunk.text()
    const encrypted = await crypto.sm4Encrypt(chunkData, {
      key: sm4Key,
      mode: 'CBC'
    })
    chunks.push(encrypted.data)
  }

  return { chunks, key: sm4Key }
}
```

## 合规性指南

### 法规要求

根据《中华人民共和国密码法》和相关标准：

1. **关键信息基础设施**: 必须使用商用密码进行保护
2. **政务信息系统**: 应当使用商用密码进行保护
3. **金融机构**: 核心业务系统应使用国密算法
4. **电信运营商**: 网络安全防护应采用商用密码

### 实施建议

```typescript
// 合规的国密算法实现
class ComplianceCrypto {
  // 数据分类加密
  async encryptByLevel(data: string, level: 'public' | 'internal' | 'confidential' | 'secret') {
    switch (level) {
      case 'public':
        // 公开数据可以使用国际算法
        return crypto.aesEncrypt(data, { key: this.getAESKey(), mode: 'CBC' })

      case 'internal':
      case 'confidential':
      case 'secret':
        // 内部及以上级别必须使用国密算法
        return crypto.sm4Encrypt(data, { key: this.getSM4Key(), mode: 'CBC' })
    }
  }

  // 身份认证必须使用国密
  async authenticateUser(userId: string, challenge: string) {
    const keyPair = await this.getUserSM2KeyPair(userId)
    return crypto.sm2Sign(challenge, {
      privateKey: keyPair.privateKey,
      userId
    })
  }
}
```

## 常见问题

### Q: 国密算法与国际算法可以混用吗？
A: 可以，但需要根据数据敏感级别选择。敏感数据建议使用国密算法。

### Q: SM2的安全强度如何？
A: SM2-256的安全强度相当于RSA-3072，具有很高的安全性。

### Q: 国密算法的性能如何？
A: SM2比RSA更高效，SM3与SHA-256性能相当，SM4与AES性能相近。

### Q: 如何选择合适的国密算法组合？
A: 推荐组合：SM2用于密钥交换和数字签名，SM4用于数据加密，SM3用于完整性校验。

<script setup>
import SMCryptoDemo from '../.vitepress/components/SMCryptoDemo.vue'
</script>
