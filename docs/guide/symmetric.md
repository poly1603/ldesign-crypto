# 对称加密

对称加密使用相同的密钥进行加密和解密，具有速度快、效率高的特点，适合大量数据的加密。

## 支持的算法

### AES (Advanced Encryption Standard)

AES 是目前最广泛使用的对称加密算法，安全性高，性能优秀。

```typescript
// AES-256 加密
const result = await crypto.aesEncrypt('Hello World', {
  key: '12345678901234567890123456789012', // 32字节密钥 (256位)
  mode: 'CBC',
  padding: 'PKCS7',
  iv: '1234567890123456' // 16字节初始向量
})

// AES-256 解密
const decrypted = await crypto.aesDecrypt(result.data!, {
  key: '12345678901234567890123456789012',
  mode: 'CBC',
  padding: 'PKCS7',
  iv: '1234567890123456'
})
```

**支持的密钥长度:**
- AES-128: 16字节 (128位)
- AES-192: 24字节 (192位)  
- AES-256: 32字节 (256位) ✅ 推荐

**支持的加密模式:**
- `ECB`: 电子密码本模式 (不推荐)
- `CBC`: 密码块链接模式 ✅ 推荐
- `CFB`: 密码反馈模式
- `OFB`: 输出反馈模式
- `CTR`: 计数器模式
- `GCM`: 伽罗瓦/计数器模式 ✅ 推荐 (认证加密)

### DES (Data Encryption Standard)

DES 是较老的加密标准，密钥长度较短，仅用于兼容性支持。

```typescript
// DES 加密
const result = await crypto.desEncrypt('Hello World', {
  key: '12345678', // 8字节密钥 (64位)
  mode: 'CBC'
})

// DES 解密
const decrypted = await crypto.desDecrypt(result.data!, {
  key: '12345678',
  mode: 'CBC'
})
```

::: warning 安全警告
DES 使用 64位密钥，安全性较低，不推荐用于新项目。仅用于兼容旧系统。
:::

### 3DES (Triple DES)

3DES 是 DES 的改进版本，使用三重加密提高安全性。

```typescript
// 3DES 加密
const result = await crypto.tripleDesEncrypt('Hello World', {
  key: '123456789012345678901234', // 24字节密钥 (192位)
  mode: 'CBC'
})

// 3DES 解密
const decrypted = await crypto.tripleDesDecrypt(result.data!, {
  key: '123456789012345678901234',
  mode: 'CBC'
})
```

::: warning 性能提示
3DES 性能较低，推荐使用 AES 替代。
:::

## 密钥管理

### 密钥生成

```typescript
// 生成 AES 密钥
const aes128Key = crypto.generateKey('AES', 128) // 32个字符 (16字节)
const aes192Key = crypto.generateKey('AES', 192) // 48个字符 (24字节)
const aes256Key = crypto.generateKey('AES', 256) // 64个字符 (32字节)

// 生成 DES 密钥
const desKey = crypto.generateKey('DES') // 16个字符 (8字节)

// 生成 3DES 密钥
const tripleDesKey = crypto.generateKey('3DES') // 48个字符 (24字节)
```

### 密钥格式

密钥支持多种格式：

```typescript
// 十六进制字符串 (推荐)
const hexKey = '0123456789abcdef0123456789abcdef'

// UTF-8 字符串
const utf8Key = 'my-secret-key-32-characters-long'

// Base64 编码
const base64Key = 'MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY='
```

### 初始向量 (IV)

对于 CBC、CFB、OFB 等模式，需要提供初始向量：

```typescript
// 自动生成 IV (推荐)
const result = await crypto.aesEncrypt('Hello World', {
  key: aesKey,
  mode: 'CBC'
  // IV 会自动生成并包含在加密结果中
})

// 手动指定 IV
const result = await crypto.aesEncrypt('Hello World', {
  key: aesKey,
  mode: 'CBC',
  iv: '1234567890123456' // 16字节 IV
})
```

## 编码格式

支持多种输入和输出编码格式：

```typescript
const result = await crypto.aesEncrypt('Hello World', {
  key: aesKey,
  mode: 'CBC',
  inputEncoding: 'utf8',    // 输入编码
  outputEncoding: 'base64'  // 输出编码
})

// 支持的编码格式:
// - 'utf8': UTF-8 字符串
// - 'hex': 十六进制字符串
// - 'base64': Base64 编码
// - 'binary': 二进制字符串
```

## 实际应用示例

### 文件加密

```typescript
async function encryptFile(fileContent: string, password: string) {
  // 从密码派生密钥
  const keyResult = await crypto.pbkdf2({
    password,
    salt: 'file-encryption-salt',
    iterations: 10000,
    keyLength: 32
  })
  
  if (!keyResult.success) {
    throw new Error('密钥派生失败')
  }
  
  // AES-256-GCM 加密
  const encrypted = await crypto.aesEncrypt(fileContent, {
    key: keyResult.data!,
    mode: 'GCM',
    outputEncoding: 'base64'
  })
  
  return encrypted.data
}

async function decryptFile(encryptedContent: string, password: string) {
  // 派生相同的密钥
  const keyResult = await crypto.pbkdf2({
    password,
    salt: 'file-encryption-salt',
    iterations: 10000,
    keyLength: 32
  })
  
  // 解密
  const decrypted = await crypto.aesDecrypt(encryptedContent, {
    key: keyResult.data!,
    mode: 'GCM',
    inputEncoding: 'base64'
  })
  
  return decrypted.data
}
```

### 数据库字段加密

```typescript
class EncryptedField {
  private key: string
  
  constructor(key: string) {
    this.key = key
  }
  
  async encrypt(value: string): Promise<string> {
    const result = await crypto.aesEncrypt(value, {
      key: this.key,
      mode: 'CBC',
      outputEncoding: 'base64'
    })
    
    if (!result.success) {
      throw new Error('加密失败: ' + result.error)
    }
    
    return result.data!
  }
  
  async decrypt(encryptedValue: string): Promise<string> {
    const result = await crypto.aesDecrypt(encryptedValue, {
      key: this.key,
      mode: 'CBC',
      inputEncoding: 'base64'
    })
    
    if (!result.success) {
      throw new Error('解密失败: ' + result.error)
    }
    
    return result.data!
  }
}

// 使用示例
const emailField = new EncryptedField(process.env.EMAIL_ENCRYPTION_KEY!)
const encryptedEmail = await emailField.encrypt('user@example.com')
const originalEmail = await emailField.decrypt(encryptedEmail)
```

### 会话数据加密

```typescript
class SessionCrypto {
  private sessionKey: string
  
  constructor() {
    // 为每个会话生成唯一密钥
    this.sessionKey = crypto.generateKey('AES', 256)
  }
  
  async encryptSessionData(data: object): Promise<string> {
    const jsonData = JSON.stringify(data)
    
    const result = await crypto.aesEncrypt(jsonData, {
      key: this.sessionKey,
      mode: 'GCM',
      outputEncoding: 'base64'
    })
    
    return result.data!
  }
  
  async decryptSessionData<T>(encryptedData: string): Promise<T> {
    const result = await crypto.aesDecrypt(encryptedData, {
      key: this.sessionKey,
      mode: 'GCM',
      inputEncoding: 'base64'
    })
    
    return JSON.parse(result.data!)
  }
}
```

## 性能优化

### 批量加密

```typescript
async function encryptBatch(dataList: string[], key: string) {
  const results = await Promise.all(
    dataList.map(data => 
      crypto.aesEncrypt(data, { key, mode: 'CBC' })
    )
  )
  
  return results.map(result => result.data)
}
```

### 缓存利用

```typescript
// 启用缓存可以提高重复操作的性能
const crypto = createCrypto({
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 300000 // 5分钟
  }
})
```

## 安全建议

### ✅ 推荐做法

1. **使用强密钥**: 使用 AES-256，密钥长度至少 32 字节
2. **随机 IV**: 每次加密使用不同的随机 IV
3. **认证加密**: 优先使用 GCM 模式，提供完整性保护
4. **密钥派生**: 使用 PBKDF2 从密码派生密钥
5. **安全存储**: 密钥不要硬编码，使用环境变量或密钥管理服务

```typescript
// ✅ 推荐的加密方式
const result = await crypto.aesEncrypt(data, {
  key: crypto.generateKey('AES', 256), // 强密钥
  mode: 'GCM',                         // 认证加密
  outputEncoding: 'base64'
})
```

### ❌ 避免的做法

1. **弱密钥**: 避免使用简单密码或短密钥
2. **固定 IV**: 不要重复使用相同的 IV
3. **ECB 模式**: 不要使用 ECB 模式
4. **明文存储**: 不要在代码中硬编码密钥

```typescript
// ❌ 不安全的做法
const result = await crypto.aesEncrypt(data, {
  key: '123456',        // 弱密钥
  mode: 'ECB',          // 不安全的模式
  iv: '1234567890123456' // 固定 IV
})
```

## 错误处理

```typescript
try {
  const result = await crypto.aesEncrypt(data, config)
  
  if (!result.success) {
    console.error('加密失败:', result.error)
    return
  }
  
  console.log('加密成功:', result.data)
} catch (error) {
  if (error instanceof CryptoError) {
    switch (error.type) {
      case CryptoErrorType.INVALID_KEY:
        console.error('密钥格式无效')
        break
      case CryptoErrorType.ENCRYPTION_FAILED:
        console.error('加密操作失败')
        break
      default:
        console.error('未知错误:', error.message)
    }
  }
}
```

## 下一步

- 了解 [非对称加密](/guide/asymmetric) 的使用方法
- 学习 [哈希算法](/guide/hash) 的应用场景  
- 探索 [国密算法](/guide/sm-crypto) 的特性
- 体验 [在线演示](/demo/playground) 实时测试
