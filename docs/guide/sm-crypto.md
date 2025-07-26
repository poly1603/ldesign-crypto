# 国密算法

中国国家密码管理局制定的商用密码算法，包括 SM2、SM3、SM4 等，适用于符合国家标准的应用场景。

## SM2 椭圆曲线公钥密码算法

SM2 是基于椭圆曲线的公钥密码算法，可用于数字签名、密钥交换和公钥加密。

### 密钥生成

```typescript
// 生成 SM2 密钥对
const keyPair = await crypto.generateSM2KeyPair()

console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)
console.log('格式:', keyPair.format) // 'HEX'
```

### 公钥加密

```typescript
// SM2 公钥加密
const encrypted = await crypto.sm2Encrypt('Hello SM2', {
  publicKey: keyPair.publicKey,
  outputEncoding: 'hex'
})

if (encrypted.success) {
  console.log('加密结果:', encrypted.data)
  console.log('执行时间:', encrypted.duration + 'ms')
}
```

### 私钥解密

```typescript
// SM2 私钥解密
const decrypted = await crypto.sm2Decrypt(encrypted.data!, {
  privateKey: keyPair.privateKey,
  inputEncoding: 'hex'
})

if (decrypted.success) {
  console.log('解密结果:', decrypted.data) // "Hello SM2"
}
```

### 数字签名

```typescript
// SM2 数字签名
const signature = await crypto.sm2Sign('重要文档内容', {
  privateKey: keyPair.privateKey,
  userId: '1234567812345678' // 用户标识，可选
})

console.log('签名值:', signature.signature)
console.log('签名算法:', signature.algorithm) // 'SM2-SM3'
```

### 签名验证

```typescript
// SM2 签名验证
const verified = await crypto.sm2Verify('重要文档内容', signature.signature, {
  publicKey: keyPair.publicKey,
  userId: '1234567812345678'
})

console.log('验证结果:', verified.valid) // true/false
```

### 高级配置

```typescript
// 完整的 SM2 配置
const sm2Config = {
  publicKey: keyPair.publicKey,
  privateKey: keyPair.privateKey,
  userId: '1234567812345678',        // 用户标识
  curve: 'sm2p256v1',               // 椭圆曲线参数
  inputEncoding: 'utf8',            // 输入编码
  outputEncoding: 'hex'             // 输出编码
}
```

## SM3 密码杂凑算法

SM3 是中国国家标准的密码杂凑算法，输出长度为 256 位。

### 基础哈希

```typescript
// SM3 哈希计算
const hash = await crypto.sm3('Hello SM3')

if (hash.success) {
  console.log('SM3 哈希:', hash.data)
  console.log('长度:', hash.data!.length) // 64个字符 (256位)
}
```

### 带盐值哈希

```typescript
// 带盐值的 SM3 哈希
const saltedHash = await crypto.sm3('Hello SM3', {
  salt: 'my-salt-value',
  outputEncoding: 'base64'
})

console.log('带盐 SM3:', saltedHash.data)
```

### SM3 HMAC

```typescript
// SM3 HMAC (需要使用底层 API)
import { SM3Crypto } from '@ldesign/crypto'

const hmacResult = SM3Crypto.hmac('Hello World', 'secret-key', {
  outputEncoding: 'hex'
})

console.log('SM3 HMAC:', hmacResult)
```

## SM4 分组密码算法

SM4 是中国国家标准的分组密码算法，分组长度和密钥长度均为 128 位。

### 密钥生成

```typescript
// 生成 SM4 密钥
const sm4Key = crypto.generateKey('SM4')
console.log('SM4 密钥:', sm4Key) // 32个字符 (128位)

// 或者使用底层 API
import { SM4Crypto } from '@ldesign/crypto'
const key = SM4Crypto.generateKey()
```

### ECB 模式加密

```typescript
// SM4-ECB 加密
const encrypted = await crypto.sm4Encrypt('Hello SM4', {
  key: sm4Key,
  mode: 'ECB',
  outputEncoding: 'hex'
})

// SM4-ECB 解密
const decrypted = await crypto.sm4Decrypt(encrypted.data!, {
  key: sm4Key,
  mode: 'ECB',
  inputEncoding: 'hex'
})

console.log('解密结果:', decrypted.data) // "Hello SM4"
```

### CBC 模式加密

```typescript
// SM4-CBC 加密 (需要 IV)
const encrypted = await crypto.sm4Encrypt('Hello SM4', {
  key: sm4Key,
  mode: 'CBC',
  iv: '12345678901234567890123456789012', // 32个字符 (128位)
  outputEncoding: 'base64'
})

// SM4-CBC 解密
const decrypted = await crypto.sm4Decrypt(encrypted.data!, {
  key: sm4Key,
  mode: 'CBC',
  iv: '12345678901234567890123456789012',
  inputEncoding: 'base64'
})
```

## 实际应用示例

### 电子签名系统

```typescript
class DigitalSignatureSystem {
  private keyPair: KeyPair
  
  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair
  }
  
  // 签署文档
  async signDocument(content: string, userId: string) {
    // 先计算文档的 SM3 哈希
    const hashResult = await crypto.sm3(content)
    if (!hashResult.success) {
      throw new Error('文档哈希计算失败')
    }
    
    // 对哈希值进行 SM2 签名
    const signature = await crypto.sm2Sign(hashResult.data!, {
      privateKey: this.keyPair.privateKey,
      userId
    })
    
    return {
      content,
      hash: hashResult.data,
      signature: signature.signature,
      userId,
      timestamp: new Date().toISOString()
    }
  }
  
  // 验证文档签名
  async verifyDocument(signedDoc: any) {
    // 重新计算文档哈希
    const hashResult = await crypto.sm3(signedDoc.content)
    if (!hashResult.success || hashResult.data !== signedDoc.hash) {
      return { valid: false, reason: '文档内容已被篡改' }
    }
    
    // 验证签名
    const verified = await crypto.sm2Verify(signedDoc.hash, signedDoc.signature, {
      publicKey: this.keyPair.publicKey,
      userId: signedDoc.userId
    })
    
    return {
      valid: verified.valid,
      reason: verified.valid ? '签名有效' : '签名无效'
    }
  }
}

// 使用示例
const keyPair = await crypto.generateSM2KeyPair()
const signatureSystem = new DigitalSignatureSystem(keyPair)

const document = "重要合同内容..."
const signedDoc = await signatureSystem.signDocument(document, "USER001")
const verification = await signatureSystem.verifyDocument(signedDoc)

console.log('签名验证:', verification.valid)
```

### 数据加密传输

```typescript
class SecureDataTransfer {
  private sm4Key: string
  
  constructor() {
    this.sm4Key = crypto.generateKey('SM4')
  }
  
  // 加密数据包
  async encryptPacket(data: object) {
    const jsonData = JSON.stringify(data)
    
    // 使用 SM4 加密数据
    const encrypted = await crypto.sm4Encrypt(jsonData, {
      key: this.sm4Key,
      mode: 'CBC',
      outputEncoding: 'base64'
    })
    
    // 计算数据完整性校验
    const hash = await crypto.sm3(jsonData)
    
    return {
      encryptedData: encrypted.data,
      integrity: hash.data,
      timestamp: Date.now()
    }
  }
  
  // 解密数据包
  async decryptPacket(packet: any) {
    // 解密数据
    const decrypted = await crypto.sm4Decrypt(packet.encryptedData, {
      key: this.sm4Key,
      mode: 'CBC',
      inputEncoding: 'base64'
    })
    
    if (!decrypted.success) {
      throw new Error('数据解密失败')
    }
    
    // 验证完整性
    const hash = await crypto.sm3(decrypted.data!)
    if (hash.data !== packet.integrity) {
      throw new Error('数据完整性校验失败')
    }
    
    return JSON.parse(decrypted.data!)
  }
}
```

### 密钥交换协议

```typescript
class SM2KeyExchange {
  private keyPair: KeyPair
  
  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair
  }
  
  // 生成会话密钥
  async generateSessionKey(peerPublicKey: string): Promise<string> {
    // 使用 SM2 进行密钥协商 (简化版本)
    const sharedSecret = await this.deriveSharedSecret(peerPublicKey)
    
    // 使用 SM3 派生会话密钥
    const sessionKey = await crypto.sm3(sharedSecret + 'session-key-salt')
    
    return sessionKey.data!.substring(0, 32) // 取前32个字符作为SM4密钥
  }
  
  private async deriveSharedSecret(peerPublicKey: string): Promise<string> {
    // 实际应用中需要实现完整的 SM2 密钥协商协议
    // 这里简化为使用私钥和对方公钥生成共享密钥
    const combined = this.keyPair.privateKey + peerPublicKey
    const hash = await crypto.sm3(combined)
    return hash.data!
  }
}
```

## 国密算法工具

### 密钥格式验证

```typescript
import { SMUtils } from '@ldesign/crypto'

// 验证 SM2 密钥格式
const isValidPublicKey = SMUtils.validateSM2Key(publicKey, 'public')
const isValidPrivateKey = SMUtils.validateSM2Key(privateKey, 'private')

// 验证 SM4 密钥格式
const isValidSM4Key = SMUtils.validateSM4Key(sm4Key)

console.log('SM2 公钥有效:', isValidPublicKey)
console.log('SM2 私钥有效:', isValidPrivateKey)
console.log('SM4 密钥有效:', isValidSM4Key)
```

### 密钥格式转换

```typescript
// 转换密钥编码格式
const hexKey = 'abcdef1234567890...'
const base64Key = SMUtils.convertKeyFormat(hexKey, 'hex', 'base64')
const utf8Key = SMUtils.convertKeyFormat(base64Key, 'base64', 'utf8')

console.log('Base64 密钥:', base64Key)
console.log('UTF8 密钥:', utf8Key)
```

## 性能特点

国密算法的性能特点：

| 算法 | 操作 | 性能 | 适用场景 |
|------|------|------|----------|
| SM2 | 密钥生成 | 中等 | 数字签名、密钥交换 |
| SM2 | 加密/解密 | 较慢 | 小数据量加密 |
| SM2 | 签名/验签 | 中等 | 数字签名验证 |
| SM3 | 哈希计算 | 快速 | 数据完整性校验 |
| SM4 | 加密/解密 | 快速 | 大数据量加密 |

### 性能优化建议

```typescript
// 1. 缓存密钥对，避免重复生成
const keyPairCache = new Map<string, KeyPair>()

async function getCachedKeyPair(userId: string): Promise<KeyPair> {
  if (!keyPairCache.has(userId)) {
    const keyPair = await crypto.generateSM2KeyPair()
    keyPairCache.set(userId, keyPair)
  }
  return keyPairCache.get(userId)!
}

// 2. 批量操作
async function batchSM3Hash(dataList: string[]) {
  return Promise.all(
    dataList.map(data => crypto.sm3(data))
  )
}

// 3. 使用合适的算法组合
// SM4 用于大数据加密，SM2 用于密钥交换，SM3 用于完整性校验
```

## 合规性说明

### 适用场景

国密算法适用于以下场景：

1. **政府机构**: 政务系统、电子政务平台
2. **金融行业**: 银行系统、支付平台、金融数据保护
3. **电信运营商**: 通信加密、用户数据保护
4. **重要基础设施**: 电力、交通、医疗等关键信息系统
5. **企业应用**: 需要符合国家密码标准的商业系统

### 标准依据

- **GM/T 0003-2012**: SM2椭圆曲线公钥密码算法
- **GM/T 0004-2012**: SM3密码杂凑算法  
- **GM/T 0002-2012**: SM4分组密码算法

### 使用建议

```typescript
// ✅ 推荐的国密算法组合
class NationalCryptoSuite {
  async encryptData(data: string, publicKey: string) {
    // 1. 生成随机 SM4 密钥
    const sm4Key = crypto.generateKey('SM4')
    
    // 2. 使用 SM4 加密数据
    const encryptedData = await crypto.sm4Encrypt(data, {
      key: sm4Key,
      mode: 'CBC'
    })
    
    // 3. 使用 SM2 加密 SM4 密钥
    const encryptedKey = await crypto.sm2Encrypt(sm4Key, {
      publicKey
    })
    
    // 4. 计算 SM3 完整性校验
    const hash = await crypto.sm3(data)
    
    return {
      encryptedData: encryptedData.data,
      encryptedKey: encryptedKey.data,
      integrity: hash.data
    }
  }
}
```

## 错误处理

```typescript
import { CryptoError, CryptoErrorType } from '@ldesign/crypto'

try {
  const result = await crypto.sm2Encrypt(data, config)
} catch (error) {
  if (error instanceof CryptoError) {
    switch (error.type) {
      case CryptoErrorType.INVALID_KEY:
        console.error('SM2 密钥格式无效')
        break
      case CryptoErrorType.ENCRYPTION_FAILED:
        console.error('SM2 加密失败')
        break
      default:
        console.error('国密算法错误:', error.message)
    }
  }
}
```

## 下一步

- 体验 [在线演示](/demo/sm-crypto) 测试国密算法
- 查看 [API 文档](/api/sm-crypto) 了解详细接口
- 学习 [最佳实践](/examples/sm-application) 实际应用案例
- 了解 [性能优化](/guide/performance) 提升运行效率
