# 非对称加密 API

非对称加密使用一对密钥：公钥用于加密和验证签名，私钥用于解密和生成签名。

## RSA 算法

### generateRSAKeyPair()

生成 RSA 密钥对。

```typescript
generateRSAKeyPair(keySize: number): Promise<KeyPair>
```

#### 参数

- **keySize**: `number` - 密钥长度（位），支持 1024、2048、4096

#### 返回值

```typescript
interface KeyPair {
  publicKey: string // PEM 格式的公钥
  privateKey: string // PEM 格式的私钥
}
```

#### 示例

```typescript
// 生成 2048 位 RSA 密钥对（推荐）
const keyPair = await crypto.generateRSAKeyPair(2048)
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 生成 4096 位密钥对（高安全性）
const strongKeyPair = await crypto.generateRSAKeyPair(4096)
```

### rsaEncrypt()

使用 RSA 公钥加密数据。

```typescript
rsaEncrypt(data: string | ArrayBuffer, options: RSAEncryptOptions): Promise<CryptoResult>
```

#### 参数

```typescript
interface RSAEncryptOptions {
  publicKey: string // PEM 格式的公钥
  padding?: 'PKCS1' | 'OAEP' // 填充方式，默认 'OAEP'
  hashAlgorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512' // OAEP 哈希算法
}
```

#### 示例

```typescript
const keyPair = await crypto.generateRSAKeyPair(2048)
const plaintext = 'Hello RSA!'

// 使用 OAEP 填充（推荐）
const encrypted = await crypto.rsaEncrypt(plaintext, {
  publicKey: keyPair.publicKey,
  padding: 'OAEP',
  hashAlgorithm: 'SHA-256'
})

console.log('加密结果:', encrypted.data)
```

### rsaDecrypt()

使用 RSA 私钥解密数据。

```typescript
rsaDecrypt(encryptedData: string, options: RSADecryptOptions): Promise<CryptoResult>
```

#### 参数

```typescript
interface RSADecryptOptions {
  privateKey: string // PEM 格式的私钥
  padding?: 'PKCS1' | 'OAEP'
  hashAlgorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512'
}
```

#### 示例

```typescript
// 解密数据
const decrypted = await crypto.rsaDecrypt(encrypted.data, {
  privateKey: keyPair.privateKey,
  padding: 'OAEP',
  hashAlgorithm: 'SHA-256'
})

console.log('解密结果:', decrypted.data)
```

### rsaSign()

使用 RSA 私钥生成数字签名。

```typescript
rsaSign(data: string | ArrayBuffer, options: RSASignOptions): Promise<SignatureResult>
```

#### 参数

```typescript
interface RSASignOptions {
  privateKey: string // PEM 格式的私钥
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512' // 哈希算法，默认 'SHA-256'
  saltLength?: number // PSS 填充的盐长度
}
```

#### 返回值

```typescript
interface SignatureResult {
  signature: string // Base64 编码的签名
  algorithm: string // 使用的算法
}
```

#### 示例

```typescript
const message = 'Important document'

// 生成数字签名
const signature = await crypto.rsaSign(message, {
  privateKey: keyPair.privateKey,
  algorithm: 'SHA-256'
})

console.log('数字签名:', signature.signature)
```

### rsaVerify()

使用 RSA 公钥验证数字签名。

```typescript
rsaVerify(data: string | ArrayBuffer, signature: string, options: RSAVerifyOptions): Promise<VerifyResult>
```

#### 参数

```typescript
interface RSAVerifyOptions {
  publicKey: string // PEM 格式的公钥
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512'
  saltLength?: number
}
```

#### 返回值

```typescript
interface VerifyResult {
  valid: boolean // 签名是否有效
  algorithm: string // 使用的算法
}
```

#### 示例

```typescript
// 验证数字签名
const verified = await crypto.rsaVerify(message, signature.signature, {
  publicKey: keyPair.publicKey,
  algorithm: 'SHA-256'
})

console.log('签名验证:', verified.valid ? '✅ 有效' : '❌ 无效')
```

## ECC 椭圆曲线加密

### generateECCKeyPair()

生成 ECC 密钥对。

```typescript
generateECCKeyPair(curve: string): Promise<KeyPair>
```

#### 参数

- **curve**: `string` - 椭圆曲线名称
  - `'P-256'` - 256位曲线（推荐）
  - `'P-384'` - 384位曲线
  - `'P-521'` - 521位曲线

#### 示例

```typescript
// 生成 P-256 密钥对
const eccKeyPair = await crypto.generateECCKeyPair('P-256')

// 生成 P-384 密钥对（更高安全性）
const strongEccKeyPair = await crypto.generateECCKeyPair('P-384')
```

### eccEncrypt()

使用 ECC 公钥加密数据。

```typescript
eccEncrypt(data: string | ArrayBuffer, options: ECCEncryptOptions): Promise<CryptoResult>
```

#### 参数

```typescript
interface ECCEncryptOptions {
  publicKey: string // PEM 格式的公钥
  curve?: string // 椭圆曲线名称
}
```

#### 示例

```typescript
const eccKeyPair = await crypto.generateECCKeyPair('P-256')
const plaintext = 'Hello ECC!'

const encrypted = await crypto.eccEncrypt(plaintext, {
  publicKey: eccKeyPair.publicKey
})
```

### eccDecrypt()

使用 ECC 私钥解密数据。

```typescript
eccDecrypt(encryptedData: string, options: ECCDecryptOptions): Promise<CryptoResult>
```

### ecdsaSign()

使用 ECDSA 生成数字签名。

```typescript
ecdsaSign(data: string | ArrayBuffer, options: ECDSASignOptions): Promise<SignatureResult>
```

#### 参数

```typescript
interface ECDSASignOptions {
  privateKey: string // PEM 格式的私钥
  algorithm?: 'SHA-256' | 'SHA-384' | 'SHA-512'
  curve?: string // 椭圆曲线名称
}
```

#### 示例

```typescript
const message = 'Message to sign'

// ECDSA 签名
const signature = await crypto.ecdsaSign(message, {
  privateKey: eccKeyPair.privateKey,
  algorithm: 'SHA-256'
})
```

### ecdsaVerify()

使用 ECDSA 验证数字签名。

```typescript
ecdsaVerify(data: string | ArrayBuffer, signature: string, options: ECDSAVerifyOptions): Promise<VerifyResult>
```

## 密钥协商

### ecdh()

执行 ECDH 密钥协商。

```typescript
ecdh(privateKey: string, publicKey: string): Promise<string>
```

#### 参数

- **privateKey**: `string` - 己方私钥（PEM 格式）
- **publicKey**: `string` - 对方公钥（PEM 格式）

#### 返回值

- `Promise<string>` - 共享密钥（十六进制字符串）

#### 示例

```typescript
// Alice 和 Bob 进行密钥协商
const aliceKeyPair = await crypto.generateECCKeyPair('P-256')
const bobKeyPair = await crypto.generateECCKeyPair('P-256')

// Alice 计算共享密钥
const aliceSharedKey = await crypto.ecdh(
  aliceKeyPair.privateKey,
  bobKeyPair.publicKey
)

// Bob 计算共享密钥
const bobSharedKey = await crypto.ecdh(
  bobKeyPair.privateKey,
  aliceKeyPair.publicKey
)

// 验证共享密钥相同
console.log('密钥协商成功:', aliceSharedKey === bobSharedKey)

// 使用共享密钥进行对称加密
const sessionData = 'Secret session data'
const encrypted = await crypto.aesEncrypt(sessionData, {
  key: aliceSharedKey,
  mode: 'GCM'
})
```

## 密钥格式转换

### exportKey()

导出密钥为指定格式。

```typescript
exportKey(key: CryptoKey | string, format: 'PEM' | 'DER' | 'JWK'): string | ArrayBuffer
```

#### 示例

```typescript
const keyPair = await crypto.generateRSAKeyPair(2048)

// 导出为 PEM 格式
const publicKeyPEM = crypto.exportKey(keyPair.publicKey, 'PEM')
const privateKeyPEM = crypto.exportKey(keyPair.privateKey, 'PEM')

// 导出为 JWK 格式
const publicKeyJWK = crypto.exportKey(keyPair.publicKey, 'JWK')
console.log('JWK 公钥:', JSON.stringify(publicKeyJWK, null, 2))
```

### importKey()

从指定格式导入密钥。

```typescript
importKey(keyData: string | ArrayBuffer, format: 'PEM' | 'DER' | 'JWK', type: 'public' | 'private'): CryptoKey
```

#### 示例

```typescript
// 从 PEM 格式导入
const importedPublicKey = crypto.importKey(publicKeyPEM, 'PEM', 'public')
const importedPrivateKey = crypto.importKey(privateKeyPEM, 'PEM', 'private')

// 从 JWK 格式导入
const jwkKey = crypto.importKey(publicKeyJWK, 'JWK', 'public')
```

## 混合加密系统

### hybridEncrypt()

混合加密：使用 RSA 加密 AES 密钥，AES 加密数据。

```typescript
hybridEncrypt(data: string | ArrayBuffer, publicKey: string): Promise<HybridResult>
```

#### 返回值

```typescript
interface HybridResult {
  encryptedData: string // AES 加密的数据
  encryptedKey: string // RSA 加密的 AES 密钥
  iv: string // AES 初始向量
  tag?: string // GCM 认证标签
}
```

#### 示例

```typescript
const keyPair = await crypto.generateRSAKeyPair(2048)
const largeData = 'Very large amount of data...'.repeat(1000)

// 混合加密
const hybridResult = await crypto.hybridEncrypt(largeData, keyPair.publicKey)

console.log('加密数据:', `${hybridResult.encryptedData.substring(0, 100)}...`)
console.log('加密密钥:', hybridResult.encryptedKey)
```

### hybridDecrypt()

混合解密：使用 RSA 解密 AES 密钥，AES 解密数据。

```typescript
hybridDecrypt(hybridData: HybridResult, privateKey: string): Promise<string>
```

#### 示例

```typescript
// 混合解密
const decryptedData = await crypto.hybridDecrypt(hybridResult, keyPair.privateKey)

console.log('解密成功:', decryptedData === largeData)
```

## 证书操作

### generateSelfSignedCertificate()

生成自签名证书。

```typescript
generateSelfSignedCertificate(options: CertificateOptions): Promise<string>
```

#### 参数

```typescript
interface CertificateOptions {
  keyPair: KeyPair // 密钥对
  subject: {
    commonName: string // 通用名称
    organization?: string // 组织
    country?: string // 国家
    state?: string // 州/省
    locality?: string // 城市
  }
  validityDays: number // 有效期（天）
  extensions?: {
    keyUsage?: string[] // 密钥用途
    extKeyUsage?: string[] // 扩展密钥用途
    subjectAltName?: string[] // 主题备用名称
  }
}
```

#### 示例

```typescript
const keyPair = await crypto.generateRSAKeyPair(2048)

const certificate = await crypto.generateSelfSignedCertificate({
  keyPair,
  subject: {
    commonName: 'example.com',
    organization: 'Example Corp',
    country: 'US',
    state: 'California',
    locality: 'San Francisco'
  },
  validityDays: 365,
  extensions: {
    keyUsage: ['digitalSignature', 'keyEncipherment'],
    extKeyUsage: ['serverAuth', 'clientAuth'],
    subjectAltName: ['DNS:example.com', 'DNS:www.example.com']
  }
})

console.log('自签名证书:', certificate)
```

### verifyCertificate()

验证证书。

```typescript
verifyCertificate(certificate: string, options?: VerifyCertificateOptions): Promise<CertificateVerifyResult>
```

#### 参数

```typescript
interface VerifyCertificateOptions {
  checkExpiry?: boolean // 检查过期时间
  checkSignature?: boolean // 检查签名
  trustedCAs?: string[] // 受信任的 CA 证书
}

interface CertificateVerifyResult {
  valid: boolean // 证书是否有效
  errors: string[] // 验证错误
  subject: any // 证书主题
  issuer: any // 证书颁发者
  validFrom: Date // 有效期开始
  validTo: Date // 有效期结束
}
```

## 性能优化

### 批量操作

```typescript
// 批量生成密钥对
async function generateMultipleKeyPairs(count: number) {
  const promises = Array.from({ length: count }, () =>
    crypto.generateRSAKeyPair(2048))
  return Promise.all(promises)
}

// 批量签名
async function batchSign(messages: string[], privateKey: string) {
  return Promise.all(
    messages.map(message =>
      crypto.rsaSign(message, { privateKey, algorithm: 'SHA-256' })
    )
  )
}
```

### 密钥缓存

```typescript
class AsymmetricKeyManager {
  private keyPairs = new Map<string, KeyPair>()

  async getOrCreateKeyPair(name: string, algorithm: 'RSA' | 'ECC', keySize: number | string) {
    const cacheKey = `${name}-${algorithm}-${keySize}`

    if (!this.keyPairs.has(cacheKey)) {
      let keyPair: KeyPair

      if (algorithm === 'RSA') {
        keyPair = await crypto.generateRSAKeyPair(keySize as number)
      }
 else {
        keyPair = await crypto.generateECCKeyPair(keySize as string)
      }

      this.keyPairs.set(cacheKey, keyPair)
    }

    return this.keyPairs.get(cacheKey)!
  }

  removeKeyPair(name: string) {
    const keysToRemove = Array.from(this.keyPairs.keys())
      .filter(key => key.startsWith(`${name}-`))

    keysToRemove.forEach(key => this.keyPairs.delete(key))
  }
}
```

## 安全建议

### 密钥长度选择

| 算法 | 最小长度 | 推荐长度 | 高安全性 | 等效对称密钥强度 |
|------|----------|----------|----------|------------------|
| RSA | 2048位 | 2048位 | 4096位 | 112位 |
| ECC P-256 | 256位 | 256位 | 384位 | 128位 |
| ECC P-384 | 384位 | 384位 | 521位 | 192位 |

### 最佳实践

```typescript
// ✅ 正确：使用强密钥和安全填充
const keyPair = await crypto.generateRSAKeyPair(2048)
const encrypted = await crypto.rsaEncrypt(data, {
  publicKey: keyPair.publicKey,
  padding: 'OAEP',
  hashAlgorithm: 'SHA-256'
})

// ❌ 错误：使用弱密钥和不安全填充
const weakKeyPair = await crypto.generateRSAKeyPair(1024) // 不安全
const weakEncrypted = await crypto.rsaEncrypt(data, {
  publicKey: weakKeyPair.publicKey,
  padding: 'PKCS1' // 不推荐
})
```

## 下一步

- 查看 [哈希算法 API](/api/hash) 文档
- 了解 [国密算法 API](/api/sm-crypto) 的特色功能
- 学习 [Vue 组合式 API](/api/vue-composables) 的用法
