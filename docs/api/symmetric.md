# 对称加密 API

对称加密使用相同的密钥进行加密和解密，适合大量数据的快速加密。

## AES 加密

### aesEncrypt()

使用 AES 算法加密数据。

```typescript
aesEncrypt(data: string | ArrayBuffer, options: AESEncryptOptions): Promise<CryptoResult>
```

#### 参数

- **data**: `string | ArrayBuffer` - 要加密的数据
- **options**: `AESEncryptOptions` - 加密选项

```typescript
interface AESEncryptOptions {
  key: string // 加密密钥（十六进制字符串）
  mode?: 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR' | 'GCM' // 加密模式，默认 'CBC'
  iv?: string // 初始向量（十六进制），CBC/CFB/OFB/CTR/GCM 模式需要
  padding?: 'PKCS7' | 'PKCS5' | 'ZeroPadding' | 'NoPadding' // 填充方式，默认 'PKCS7'
  tagLength?: number // GCM 模式的标签长度，默认 128
  additionalData?: string // GCM 模式的附加认证数据
}
```

#### 返回值

```typescript
interface CryptoResult {
  success: boolean
  data?: string // 加密后的数据（十六进制）
  iv?: string // 使用的初始向量
  tag?: string // GCM 模式的认证标签
  error?: string // 错误信息
}
```

#### 示例

```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto()
await crypto.init()

// 基础 AES-256-CBC 加密
const key = crypto.generateKey('AES', 256)
const result = await crypto.aesEncrypt('Hello World', {
  key,
  mode: 'CBC'
})

console.log('加密结果:', result.data)
console.log('IV:', result.iv)

// AES-256-GCM 认证加密
const gcmResult = await crypto.aesEncrypt('Sensitive data', {
  key,
  mode: 'GCM',
  additionalData: 'metadata'
})

console.log('GCM 加密:', gcmResult.data)
console.log('认证标签:', gcmResult.tag)

// 自定义 IV 的加密
const customIV = crypto.generateRandom({ length: 32, charset: 'hex' })
const customResult = await crypto.aesEncrypt('Custom IV data', {
  key,
  mode: 'CBC',
  iv: customIV
})
```

### aesDecrypt()

使用 AES 算法解密数据。

```typescript
aesDecrypt(encryptedData: string, options: AESDecryptOptions): Promise<CryptoResult>
```

#### 参数

- **encryptedData**: `string` - 要解密的数据（十六进制字符串）
- **options**: `AESDecryptOptions` - 解密选项

```typescript
interface AESDecryptOptions {
  key: string // 解密密钥
  mode?: 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
  iv?: string // 初始向量（与加密时相同）
  padding?: 'PKCS7' | 'PKCS5' | 'ZeroPadding' | 'NoPadding'
  tag?: string // GCM 模式的认证标签
  additionalData?: string // GCM 模式的附加认证数据
}
```

#### 示例

```typescript
// 解密 CBC 模式数据
const decrypted = await crypto.aesDecrypt(result.data, {
  key,
  mode: 'CBC',
  iv: result.iv
})

console.log('解密结果:', decrypted.data)

// 解密 GCM 模式数据
const gcmDecrypted = await crypto.aesDecrypt(gcmResult.data, {
  key,
  mode: 'GCM',
  tag: gcmResult.tag,
  additionalData: 'metadata'
})
```

## DES 加密

### desEncrypt()

使用 DES 算法加密数据（不推荐用于新项目）。

```typescript
desEncrypt(data: string | ArrayBuffer, options: DESEncryptOptions): Promise<CryptoResult>
```

#### 参数

```typescript
interface DESEncryptOptions {
  key: string // 8字节密钥（十六进制）
  mode?: 'ECB' | 'CBC' // 加密模式，默认 'CBC'
  iv?: string // 初始向量（8字节十六进制）
  padding?: 'PKCS7' | 'PKCS5' | 'ZeroPadding'
}
```

#### 示例

```typescript
// DES 加密（仅用于兼容性）
const desKey = crypto.generateKey('DES') // 生成64位DES密钥
const desResult = await crypto.desEncrypt('Legacy data', {
  key: desKey,
  mode: 'CBC'
})
```

### desDecrypt()

使用 DES 算法解密数据。

```typescript
desDecrypt(encryptedData: string, options: DESDecryptOptions): Promise<CryptoResult>
```

## 3DES 加密

### tripleDesEncrypt()

使用 3DES 算法加密数据。

```typescript
tripleDesEncrypt(data: string | ArrayBuffer, options: TripleDESOptions): Promise<CryptoResult>
```

#### 参数

```typescript
interface TripleDESOptions {
  key: string // 24字节密钥（十六进制）
  mode?: 'ECB' | 'CBC'
  iv?: string // 8字节初始向量
  padding?: 'PKCS7' | 'PKCS5' | 'ZeroPadding'
}
```

#### 示例

```typescript
// 3DES 加密
const tripleDesKey = crypto.generateKey('3DES') // 生成192位3DES密钥
const tripleDesResult = await crypto.tripleDesEncrypt('Important data', {
  key: tripleDesKey,
  mode: 'CBC'
})
```

## 密钥生成

### generateKey()

生成对称加密密钥。

```typescript
generateKey(algorithm: 'AES' | 'DES' | '3DES' | 'SM4', keySize?: number): string
```

#### 参数

- **algorithm**: 算法类型
- **keySize**: 密钥长度（位）
  - AES: 128, 192, 256（默认256）
  - DES: 64（固定）
  - 3DES: 192（固定）
  - SM4: 128（固定）

#### 示例

```typescript
// 生成不同算法的密钥
const aes128Key = crypto.generateKey('AES', 128) // 32字符十六进制
const aes256Key = crypto.generateKey('AES', 256) // 64字符十六进制
const desKey = crypto.generateKey('DES') // 16字符十六进制
const tripleDesKey = crypto.generateKey('3DES') // 48字符十六进制
const sm4Key = crypto.generateKey('SM4') // 32字符十六进制

console.log('AES-256 密钥:', aes256Key)
console.log('密钥长度:', aes256Key.length, '字符')
```

## 批量操作

### batchEncrypt()

批量加密多个数据。

```typescript
batchEncrypt(dataList: string[], options: BatchEncryptOptions): Promise<CryptoResult[]>
```

#### 参数

```typescript
interface BatchEncryptOptions {
  algorithm: 'AES' | 'DES' | '3DES' | 'SM4'
  key: string
  mode?: string
  parallel?: boolean // 是否并行处理，默认 true
}
```

#### 示例

```typescript
// 批量加密
const dataList = ['data1', 'data2', 'data3', 'data4']
const batchResults = await crypto.batchEncrypt(dataList, {
  algorithm: 'AES',
  key: aes256Key,
  mode: 'CBC',
  parallel: true
})

batchResults.forEach((result, index) => {
  console.log(`数据${index + 1}加密结果:`, result.data)
})
```

### batchDecrypt()

批量解密多个数据。

```typescript
batchDecrypt(encryptedList: string[], options: BatchDecryptOptions): Promise<CryptoResult[]>
```

## 流式加密

### createCipher()

创建流式加密器。

```typescript
createCipher(algorithm: string, options: CipherOptions): StreamCipher
```

#### 示例

```typescript
// 创建流式加密器
const cipher = crypto.createCipher('AES', {
  key: aes256Key,
  mode: 'CBC'
})

// 逐步加密数据
cipher.update('First chunk of data')
cipher.update('Second chunk of data')
cipher.update('Final chunk of data')

// 获取最终结果
const finalResult = cipher.finalize()
console.log('流式加密结果:', finalResult)

// 重置加密器以便重新使用
cipher.reset()
```

### createDecipher()

创建流式解密器。

```typescript
createDecipher(algorithm: string, options: DecipherOptions): StreamDecipher
```

## 密钥验证

### validateKey()

验证密钥格式和长度。

```typescript
validateKey(key: string, algorithm: string, keySize?: number): boolean
```

#### 示例

```typescript
// 验证密钥
const isValidAES = crypto.validateKey(aes256Key, 'AES', 256)
const isValidDES = crypto.validateKey(desKey, 'DES')

console.log('AES密钥有效:', isValidAES)
console.log('DES密钥有效:', isValidDES)

// 验证无效密钥
const invalidKey = 'invalid-key'
const isInvalid = crypto.validateKey(invalidKey, 'AES', 256)
console.log('无效密钥验证:', isInvalid) // false
```

## 密钥派生

### deriveKey()

从密码派生密钥。

```typescript
deriveKey(password: string, options: KeyDerivationOptions): Promise<string>
```

#### 参数

```typescript
interface KeyDerivationOptions {
  salt: string // 盐值
  iterations: number // 迭代次数
  keyLength: number // 输出密钥长度（字节）
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512' // 哈希算法
}
```

#### 示例

```typescript
// 从密码派生密钥
const password = 'user-password-123'
const salt = crypto.generateRandom({ length: 32, charset: 'hex' })

const derivedKey = await crypto.deriveKey(password, {
  salt,
  iterations: 100000,
  keyLength: 32, // 256位密钥
  algorithm: 'SHA-256'
})

console.log('派生密钥:', derivedKey)

// 使用派生密钥进行加密
const encrypted = await crypto.aesEncrypt('Secret data', {
  key: derivedKey,
  mode: 'CBC'
})
```

## 错误处理

### 常见错误类型

```typescript
// 密钥长度错误
try {
  await crypto.aesEncrypt('data', { key: 'short-key' })
}
 catch (error) {
  console.error('密钥长度错误:', error.message)
}

// 无效的加密模式
try {
  await crypto.aesEncrypt('data', {
    key: validKey,
    mode: 'INVALID' as any
  })
}
 catch (error) {
  console.error('无效模式:', error.message)
}

// GCM 模式缺少标签
try {
  await crypto.aesDecrypt(encryptedData, {
    key: validKey,
    mode: 'GCM'
    // 缺少 tag 参数
  })
}
 catch (error) {
  console.error('GCM解密错误:', error.message)
}
```

### 错误恢复

```typescript
// 带重试的加密函数
async function encryptWithRetry(data: string, options: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await crypto.aesEncrypt(data, options)
    }
 catch (error) {
      if (i === maxRetries - 1)
throw error

      console.warn(`加密失败，重试 ${i + 1}/${maxRetries}:`, error.message)

      // 如果是密钥问题，重新生成密钥
      if (error.message.includes('key')) {
        options.key = crypto.generateKey('AES', 256)
      }

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
```

## 性能优化

### 密钥重用

```typescript
// 密钥缓存管理
class KeyManager {
  private keys = new Map<string, string>()

  getOrCreateKey(name: string, algorithm: string, keySize?: number): string {
    if (!this.keys.has(name)) {
      const key = crypto.generateKey(algorithm as any, keySize)
      this.keys.set(name, key)
    }
    return this.keys.get(name)!
  }

  rotateKey(name: string, algorithm: string, keySize?: number): string {
    const newKey = crypto.generateKey(algorithm as any, keySize)
    this.keys.set(name, newKey)
    return newKey
  }
}

const keyManager = new KeyManager()
const sessionKey = keyManager.getOrCreateKey('session', 'AES', 256)
```

### 并行处理

```typescript
// 并行加密大量数据
async function parallelEncrypt(dataChunks: string[], key: string) {
  const encryptPromises = dataChunks.map(chunk =>
    crypto.aesEncrypt(chunk, { key, mode: 'CBC' })
  )

  return Promise.all(encryptPromises)
}

// 使用示例
const largeData = 'very large data...'.repeat(1000)
const chunks = largeData.match(/.{1,1000}/g) || [] // 分成1000字符的块
const results = await parallelEncrypt(chunks, aes256Key)
```

## 下一步

- 查看 [非对称加密 API](/api/asymmetric) 文档
- 了解 [哈希算法 API](/api/hash) 的用法
- 学习 [国密算法 API](/api/sm-crypto) 的特色功能
