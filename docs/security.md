# 安全最佳实践

本文档介绍 `@ldesign/crypto` 的安全特性和使用时的最佳实践。

## 安全特性概览

### 1. 时序攻击防护 ⏱️

使用恒定时间比较算法，防止时序攻击：

```typescript
import { timingSafeEqual } from '@ldesign/crypto'

// ❌ 不安全: 普通字符串比较 (可能泄露信息)
if (hash1 === hash2) {
  // ...
}

// ✅ 安全: 恒定时间比较
if (timingSafeEqual(hash1, hash2)) {
  // ...
}
```

**原理**: 无论字符串是否匹配，比较时间始终相同，防止攻击者通过测量响应时间推测密钥。

### 2. 安全内存管理 🔒

敏感数据使用后自动清零：

```typescript
import { SecureMemory } from '@ldesign/crypto'

// 创建安全内存区域
const secureKey = SecureMemory.allocate(32)
secureKey.write('my-secret-key-12345678901234567890')

// 使用密钥
const encrypted = aes.encrypt('data', secureKey.read())

// 自动清零 (作用域结束或手动清理)
secureKey.clear()
// 内存中的密钥被覆盖为零
```

### 3. 密码学安全随机数 (CSPRNG) 🎲

使用密码学安全的随机数生成器：

```typescript
import { RandomUtils } from '@ldesign/crypto'

// ❌ 不安全: Math.random()
const badKey = Math.random().toString(36)

// ✅ 安全: CSPRNG
const goodKey = RandomUtils.generateKey(32)
const salt = RandomUtils.generateSalt(16)
const iv = RandomUtils.generateIV(16)
```

**实现**:
- 浏览器: `crypto.getRandomValues()`
- Node.js: `crypto.randomBytes()`

### 4. 密钥派生 🔑

使用 PBKDF2/scrypt/Argon2 派生密钥：

```typescript
import { KeyDerivation } from '@ldesign/crypto'

// ❌ 不安全: 直接使用密码
const aes1 = createAES('my-password')

// ✅ 安全: 使用密钥派生
const derivedKey = KeyDerivation.pbkdf2(
  'my-password',
  'random-salt',
  {
    iterations: 100000, // 高迭代次数
    keySize: 256,
    hash: 'SHA256'
  }
)
const aes2 = createAES(derivedKey)
```

**推荐参数**:
- PBKDF2: 100,000+ 迭代
- scrypt: N=2^14, r=8, p=1
- Argon2: t=3, m=64MB, p=4

### 5. 认证加密 (AEAD) 🛡️

使用 AES-GCM 或 ChaCha20-Poly1305：

```typescript
import { createAES } from '@ldesign/crypto'

// ❌ 不安全: 仅加密 (CBC 模式)
const aes1 = createAES('key', { mode: 'CBC' })
const encrypted = aes1.encrypt('data')

// ✅ 安全: 认证加密 (GCM 模式)
const aes2 = createAES('key', { mode: 'GCM' })
const encrypted = aes2.encrypt('data')
// 自动生成认证标签，防止篡改
```

### 6. 密钥轮换 🔄

定期更新密钥：

```typescript
import { KeyRotation } from '@ldesign/crypto'

const rotation = new KeyRotation({
  rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
  algorithm: 'AES',
  keySize: 256
})

// 自动轮换密钥
rotation.on('rotate', (newKey, oldKey) => {
  // 使用新密钥重新加密数据
  reencryptData(oldKey, newKey)
})

// 获取当前密钥
const currentKey = rotation.getCurrentKey()
```

### 7. 速率限制 🚦

防止暴力破解：

```typescript
import { RateLimiter } from '@ldesign/crypto'

const limiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15分钟
  blockDuration: 60 * 60 * 1000 // 1小时
})

// 检查是否允许操作
async function verifyPassword(userId, password) {
  if (!limiter.checkLimit(userId)) {
    throw new Error('Too many attempts. Please try again later.')
  }
  
  const isValid = await comparePassword(password)
  
  if (!isValid) {
    limiter.recordFailedAttempt(userId)
    return false
  }
  
  limiter.resetAttempts(userId)
  return true
}
```

## 算法选择指南

### 对称加密

| 场景 | 推荐算法 | 模式 | 密钥长度 |
|------|----------|------|----------|
| 通用 | AES | GCM | 256 bit |
| 高性能 | ChaCha20 | Poly1305 | 256 bit |
| 大文件 | AES | CTR + HMAC | 256 bit |
| 兼容性 | AES | CBC + HMAC | 256 bit |

❌ **不推荐**: DES, 3DES, RC4, ECB 模式

### 非对称加密

| 场景 | 推荐算法 | 密钥长度 | 填充 |
|------|----------|----------|------|
| 加密 | RSA | 2048+ bit | OAEP |
| 签名 | RSA | 2048+ bit | PSS |
| 现代 | Ed25519 | 256 bit | - |
| 密钥交换 | X25519 | 256 bit | - |

❌ **不推荐**: RSA < 2048 bit, PKCS1 v1.5

### 哈希函数

| 场景 | 推荐算法 | 输出长度 |
|------|----------|----------|
| 通用 | SHA-256 | 256 bit |
| 高安全 | SHA-512 | 512 bit |
| 现代 | BLAKE2b | 256-512 bit |
| 密码 | Argon2 | 256 bit |

❌ **不推荐**: MD5, SHA-1 (除非仅用于校验和)

## 密码存储最佳实践

### 1. 使用强密钥派生函数

```typescript
import { KeyDerivation } from '@ldesign/crypto'

// ✅ 推荐: Argon2 (最佳)
const hash = await KeyDerivation.argon2(password, salt, {
  type: 'argon2id',
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4
})

// ✅ 备选: scrypt
const hash = await KeyDerivation.scrypt(password, salt, {
  N: 16384, // 2^14
  r: 8,
  p: 1,
  keySize: 32
})

// ⚠️ 最低要求: PBKDF2
const hash = await KeyDerivation.pbkdf2(password, salt, {
  iterations: 310000, // OWASP 2023 推荐
  keySize: 32,
  hash: 'SHA256'
})
```

### 2. 密码存储格式

```typescript
// PHC 字符串格式
// $argon2id$v=19$m=65536,t=3,p=4$salt$hash

interface PasswordHash {
  algorithm: 'argon2id' | 'scrypt' | 'pbkdf2'
  version: string
  params: {
    memoryCost?: number
    timeCost?: number
    parallelism?: number
    iterations?: number
  }
  salt: string
  hash: string
}

// 存储示例
function hashPassword(password: string): string {
  const salt = RandomUtils.generateSalt(16)
  const hash = KeyDerivation.argon2(password, salt, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  })
  
  return `$argon2id$v=19$m=65536,t=3,p=4$${salt}$${hash}`
}

// 验证示例
function verifyPassword(password: string, stored: string): boolean {
  const parsed = parsePasswordHash(stored)
  const hash = KeyDerivation.argon2(password, parsed.salt, parsed.params)
  return timingSafeEqual(hash, parsed.hash)
}
```

## 常见安全陷阱

### ❌ 1. 使用 ECB 模式

```typescript
// ❌ 危险: ECB 模式不安全
const aes = createAES('key', { mode: 'ECB' })
// 相同明文产生相同密文，泄露模式信息

// ✅ 安全: 使用 GCM 或 CBC
const aes = createAES('key', { mode: 'GCM' })
```

### ❌ 2. 固定 IV

```typescript
// ❌ 危险: 使用固定 IV
const iv = 'fixed-iv-value'
const aes = createAES('key', { iv })

// ✅ 安全: 每次生成随机 IV
const aes = createAES('key') // 自动生成随机 IV
```

### ❌ 3. 密钥硬编码

```typescript
// ❌ 危险: 硬编码密钥
const key = 'my-secret-key'

// ✅ 安全: 从环境变量读取
const key = process.env.ENCRYPTION_KEY
if (!key) throw new Error('ENCRYPTION_KEY not set')
```

### ❌ 4. 不验证密文完整性

```typescript
// ❌ 危险: 仅解密，不验证
const decrypted = aes.decrypt(ciphertext)

// ✅ 安全: 使用 AEAD 或 HMAC
const aes = createAES('key', { mode: 'GCM' }) // 自动验证
// 或
const { data, verified } = decryptWithAuth(ciphertext, encKey, macKey)
if (!verified) throw new Error('Authentication failed')
```

### ❌ 5. 使用弱密码

```typescript
// ❌ 危险: 弱密码
const key = 'password123'

// ✅ 安全: 强密码 + 密钥派生
const password = 'correct-horse-battery-staple' // 强密码
const salt = RandomUtils.generateSalt(16)
const key = KeyDerivation.pbkdf2(password, salt, { iterations: 100000 })
```

## 密钥管理

### 1. 密钥生成

```typescript
import { KeyManager } from '@ldesign/crypto'

const keyManager = new KeyManager({
  masterKey: process.env.MASTER_KEY, // 主密钥
  derivePath: 'app/encryption' // 派生路径
})

// 生成数据加密密钥
const dek = keyManager.generateDataKey('user-data')

// 使用密钥加密密钥 (KEK) 保护
const wrappedKey = keyManager.wrapKey(dek)

// 存储包装后的密钥 (安全)
await storage.save('wrapped_key', wrappedKey)
```

### 2. 密钥存储

```typescript
// ❌ 不安全: 明文存储
localStorage.setItem('key', key)

// ✅ 安全: 使用 SecureStorage
import { SecureStorage } from '@ldesign/crypto'

const storage = new SecureStorage({
  masterPassword: 'user-password',
  derivation: 'pbkdf2',
  iterations: 100000
})

// 加密存储
await storage.set('encryption_key', key)

// 解密读取
const key = await storage.get('encryption_key')
```

### 3. 密钥轮换

```typescript
import { KeyRotation } from '@ldesign/crypto'

// 配置自动轮换
const rotation = new KeyRotation({
  rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90天
  maxKeyAge: 365 * 24 * 60 * 60 * 1000, // 1年
  algorithm: 'AES',
  keySize: 256
})

// 轮换时重新加密数据
rotation.on('rotate', async (newKey, oldKey) => {
  const data = await loadAllEncryptedData()
  
  for (const item of data) {
    // 用旧密钥解密
    const plaintext = aes.decrypt(item.ciphertext, oldKey)
    
    // 用新密钥加密
    const newCiphertext = aes.encrypt(plaintext, newKey)
    
    // 更新存储
    await updateEncryptedData(item.id, newCiphertext, newKey.id)
  }
})
```

## 传输安全

### 1. HTTPS/TLS

```typescript
// ✅ 总是使用 HTTPS
// 加密数据传输前已经在 TLS 层加密

// ⚠️ 额外的应用层加密 (可选，用于端到端加密)
const encrypted = aes.encrypt(data)
await fetch('https://api.example.com/data', {
  method: 'POST',
  body: encrypted
})
```

### 2. API 签名

```typescript
import { hash } from '@ldesign/crypto'

// 生成请求签名
function signRequest(method, path, body, timestamp, apiSecret) {
  const message = `${method}\n${path}\n${timestamp}\n${body}`
  return hash.hmac(message, apiSecret, 'sha256')
}

// 验证请求
function verifyRequest(req, signature, apiSecret) {
  const expected = signRequest(
    req.method,
    req.path,
    req.body,
    req.timestamp,
    apiSecret
  )
  
  return timingSafeEqual(signature, expected)
}
```

## 审计和日志

### 1. 安全事件日志

```typescript
import { SecurityLogger } from '@ldesign/crypto'

const logger = new SecurityLogger({
  logLevel: 'warn',
  sensitiveFields: ['key', 'password', 'token']
})

// 记录加密操作
logger.info('Encryption operation', {
  algorithm: 'AES-256-GCM',
  dataSize: data.length,
  userId: user.id
  // 不记录实际密钥
})

// 记录失败的解密尝试
logger.warn('Decryption failed', {
  reason: 'Invalid key',
  userId: user.id,
  timestamp: Date.now()
})
```

### 2. 安全审计

```typescript
// 定期审计密钥使用
const audit = keyManager.auditKeys()
console.log(audit)
/*
{
  totalKeys: 42,
  expiredKeys: 3,
  soonToExpire: 5,
  rotationNeeded: ['key-abc', 'key-def'],
  recommendations: [
    'Rotate key-abc (age: 367 days)',
    'Review access for key-xyz (unused for 90 days)'
  ]
}
*/
```

## 合规性

### GDPR (欧盟数据保护)

```typescript
// 实现数据加密 (Art. 32)
const encrypted = aes.encrypt(personalData)

// 实现被遗忘权 (Art. 17)
function deleteUserData(userId) {
  // 删除密钥 = 数据无法解密 = 等同删除
  keyManager.deleteKey(`user:${userId}`)
}
```

### HIPAA (美国医疗数据)

```typescript
// 使用 FIPS 140-2 合规算法
const aes = createAES(key, {
  algorithm: 'AES-256-GCM', // FIPS approved
  useWebCrypto: true // 使用平台原生实现
})
```

### PCI DSS (支付卡数据)

```typescript
// 要求: 强加密算法 (AES-256)
// 要求: 密钥管理 (定期轮换)
// 要求: 访问控制 (审计日志)

const cardEncryption = createAES(key, {
  algorithm: 'AES-256-GCM',
  keySize: 256
})

// 加密信用卡号
const encrypted = cardEncryption.encrypt(cardNumber)
```

## 安全检查清单

在部署到生产环境前，请检查：

- [ ] 使用强加密算法 (AES-256-GCM, RSA-2048+)
- [ ] 密钥派生使用高迭代次数 (PBKDF2: 100,000+)
- [ ] 使用密码学安全随机数 (CSPRNG)
- [ ] 密钥不硬编码，从安全存储读取
- [ ] 每次加密使用随机 IV/nonce
- [ ] 使用认证加密 (GCM) 或 HMAC 验证完整性
- [ ] 实现时序攻击防护
- [ ] 敏感数据使用后清零
- [ ] 实现密钥轮换机制
- [ ] 实现速率限制防止暴力破解
- [ ] 使用 HTTPS 传输加密数据
- [ ] 记录安全事件和审计日志
- [ ] 定期更新依赖和安全补丁

## 相关资源

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [安全配置指南](/guide/security)
- [API 文档](/api/)

