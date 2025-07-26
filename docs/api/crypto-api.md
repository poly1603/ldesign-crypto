# CryptoAPI

`CryptoAPI` 是 @ldesign/crypto 的核心类，提供了统一的加密操作接口。

## 创建实例

### createCrypto(config?)

创建一个新的 CryptoAPI 实例。

```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto({
  debug: true,
  performance: { enabled: true },
  cache: { enabled: true }
})
```

**参数:**
- `config` (可选): [CryptoManagerConfig](#cryptomanagerconfig) - 配置选项

**返回值:** `CryptoAPI` 实例

## 初始化

### init()

初始化加密API，加载所有内置插件。

```typescript
await crypto.init()
```

**返回值:** `Promise<void>`

## 对称加密

### aesEncrypt(data, config)

AES 加密。

```typescript
const result = await crypto.aesEncrypt('Hello World', {
  key: '12345678901234567890123456789012',
  mode: 'CBC',
  padding: 'PKCS7'
})
```

**参数:**
- `data`: `string` - 待加密数据
- `config`: [SymmetricConfig](#symmetricconfig) - 加密配置

**返回值:** `Promise<CryptoResult>`

### aesDecrypt(encryptedData, config)

AES 解密。

```typescript
const result = await crypto.aesDecrypt(encryptedData, {
  key: '12345678901234567890123456789012',
  mode: 'CBC',
  padding: 'PKCS7'
})
```

**参数:**
- `encryptedData`: `string` - 加密数据
- `config`: [SymmetricConfig](#symmetricconfig) - 解密配置

**返回值:** `Promise<CryptoResult>`

### desEncrypt(data, config)

DES 加密。

```typescript
const result = await crypto.desEncrypt('Hello World', {
  key: '12345678'
})
```

### desDecrypt(encryptedData, config)

DES 解密。

### tripleDesEncrypt(data, config)

3DES 加密。

### tripleDesDecrypt(encryptedData, config)

3DES 解密。

## 非对称加密

### generateRSAKeyPair(keySize?)

生成 RSA 密钥对。

```typescript
const keyPair = await crypto.generateRSAKeyPair(2048)
```

**参数:**
- `keySize` (可选): `number` - 密钥长度，默认 2048

**返回值:** `Promise<KeyPair>`

### rsaEncrypt(data, config)

RSA 公钥加密。

```typescript
const result = await crypto.rsaEncrypt('Hello RSA', {
  publicKey: keyPair.publicKey
})
```

**参数:**
- `data`: `string` - 待加密数据
- `config`: [AsymmetricConfig](#asymmetricconfig) - 加密配置

**返回值:** `Promise<CryptoResult>`

### rsaDecrypt(encryptedData, config)

RSA 私钥解密。

### rsaSign(data, config)

RSA 数字签名。

```typescript
const signature = await crypto.rsaSign('Hello World', {
  privateKey: keyPair.privateKey
})
```

**返回值:** `Promise<SignatureResult>`

### rsaVerify(data, signature, config)

RSA 签名验证。

```typescript
const verified = await crypto.rsaVerify('Hello World', signature.signature, {
  publicKey: keyPair.publicKey
})
```

**返回值:** `Promise<VerifyResult>`

## 哈希算法

### md5(data, config?)

MD5 哈希。

```typescript
const result = await crypto.md5('Hello World')
```

### sha1(data, config?)

SHA-1 哈希。

### sha256(data, config?)

SHA-256 哈希。

```typescript
const result = await crypto.sha256('Hello World', {
  salt: 'mysalt'
})
```

### sha512(data, config?)

SHA-512 哈希。

### pbkdf2(config)

PBKDF2 密钥派生。

```typescript
const result = await crypto.pbkdf2({
  password: 'mypassword',
  salt: 'mysalt',
  iterations: 10000,
  keyLength: 32
})
```

**参数:**
- `config`: [KeyDerivationConfig](#keyderivationconfig) - 密钥派生配置

## 国密算法

### generateSM2KeyPair()

生成 SM2 密钥对。

```typescript
const keyPair = await crypto.generateSM2KeyPair()
```

**返回值:** `Promise<KeyPair>`

### sm2Encrypt(data, config)

SM2 加密。

```typescript
const result = await crypto.sm2Encrypt('Hello SM2', {
  publicKey: keyPair.publicKey
})
```

### sm2Decrypt(encryptedData, config)

SM2 解密。

### sm2Sign(data, config)

SM2 数字签名。

### sm2Verify(data, signature, config)

SM2 签名验证。

### sm3(data, config?)

SM3 哈希。

```typescript
const result = await crypto.sm3('Hello SM3')
```

### sm4Encrypt(data, config)

SM4 加密。

```typescript
const result = await crypto.sm4Encrypt('Hello SM4', {
  key: sm4Key
})
```

### sm4Decrypt(encryptedData, config)

SM4 解密。

## 工具方法

### generateRandom(config)

生成随机字符串。

```typescript
const random = crypto.generateRandom({
  length: 32,
  charset: 'hex'
})
```

**参数:**
- `config`: [RandomConfig](#randomconfig) - 随机数配置

**返回值:** `string`

### generateKey(algorithm, keySize?)

生成密钥。

```typescript
const aesKey = crypto.generateKey('AES', 256)
const sm4Key = crypto.generateKey('SM4')
```

**参数:**
- `algorithm`: `'AES' | 'DES' | '3DES' | 'SM4'` - 算法类型
- `keySize` (可选): `number` - 密钥长度

**返回值:** `string`

## 管理方法

### getPerformanceMetrics(operation?)

获取性能指标。

```typescript
const metrics = crypto.getPerformanceMetrics()
const aesMetrics = crypto.getPerformanceMetrics('aes_encrypt')
```

### clearCache()

清空缓存。

```typescript
crypto.clearCache()
```

### getCacheInfo()

获取缓存信息。

```typescript
const info = crypto.getCacheInfo()
// { size: 10, enabled: true }
```

### isAlgorithmSupported(algorithm)

检查算法是否支持。

```typescript
const supported = crypto.isAlgorithmSupported('SM2')
```

### getSupportedAlgorithms()

获取支持的算法列表。

```typescript
const algorithms = crypto.getSupportedAlgorithms()
// ['AES', 'RSA', 'SM2', 'SM3', 'SM4', ...]
```

### destroy()

销毁实例，清理资源。

```typescript
await crypto.destroy()
```

## 类型定义

### CryptoManagerConfig

```typescript
interface CryptoManagerConfig {
  defaultEncoding?: EncodingFormat
  performance?: PerformanceConfig
  cache?: CacheConfig
  debug?: boolean
  plugins?: CryptoPlugin[]
}
```

### SymmetricConfig

```typescript
interface SymmetricConfig {
  key: string
  iv?: string
  mode?: AESMode
  padding?: PaddingMode
  inputEncoding?: EncodingFormat
  outputEncoding?: EncodingFormat
}
```

### AsymmetricConfig

```typescript
interface AsymmetricConfig {
  publicKey?: string
  privateKey?: string
  padding?: RSAPadding
  keySize?: number
  inputEncoding?: EncodingFormat
  outputEncoding?: EncodingFormat
}
```

### CryptoResult

```typescript
interface CryptoResult {
  success: boolean
  data?: string
  error?: string
  algorithm?: CryptoAlgorithm
  duration?: number
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: string
  privateKey: string
  format?: 'PEM' | 'DER' | 'HEX'
}
```

### RandomConfig

```typescript
interface RandomConfig {
  length: number
  charset?: 'hex' | 'base64' | 'alphanumeric' | 'numeric'
  includeSymbols?: boolean
}
```

### KeyDerivationConfig

```typescript
interface KeyDerivationConfig {
  password: string
  salt: string
  iterations: number
  keyLength: number
  hashAlgorithm?: 'SHA1' | 'SHA256' | 'SHA512'
}
```

## 示例

### 完整的加密流程

```typescript
import { createCrypto } from '@ldesign/crypto'

async function encryptionExample() {
  // 创建实例
  const crypto = createCrypto({
    debug: true,
    performance: { enabled: true }
  })
  
  await crypto.init()
  
  // AES 加密
  const aesKey = crypto.generateKey('AES', 256)
  const encrypted = await crypto.aesEncrypt('敏感数据', {
    key: aesKey,
    mode: 'CBC'
  })
  
  // RSA 签名
  const rsaKeys = await crypto.generateRSAKeyPair(2048)
  const signature = await crypto.rsaSign('敏感数据', {
    privateKey: rsaKeys.privateKey
  })
  
  // 验证签名
  const verified = await crypto.rsaVerify('敏感数据', signature.signature, {
    publicKey: rsaKeys.publicKey
  })
  
  console.log('加密成功:', encrypted.success)
  console.log('签名验证:', verified.valid)
  
  // 清理
  await crypto.destroy()
}
```
