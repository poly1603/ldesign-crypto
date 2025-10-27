# 加密安全最佳实践指南

## 目录

- [概述](#概述)
- [算法选择](#算法选择)
- [密钥管理](#密钥管理)
- [IV 和 Nonce 管理](#iv-和-nonce-管理)
- [常见安全陷阱](#常见安全陷阱)
- [安全检查清单](#安全检查清单)
- [实战案例](#实战案例)

---

## 概述

加密是保护敏感数据的重要手段，但**错误的使用可能比不加密更危险**。本指南提供了使用 `@ldesign/crypto` 时的安全最佳实践，帮助您避免常见的安全陷阱。

### 核心原则

1. **使用现代算法**：优先使用 AES-256、SHA-256/SHA-512
2. **正确的密钥管理**：永远不要硬编码密钥
3. **每次加密使用新的 IV**：避免 IV 重复使用
4. **完整性保护**：使用 HMAC 或 AEAD 认证加密
5. **定期更新**：及时更新库版本，修复安全漏洞

---

## 算法选择

### 对称加密

#### ✅ 推荐

```typescript
import { aes } from '@ldesign/crypto'

// 1. AES-256 + CBC 模式（通用场景）
const encrypted = aes.encrypt('敏感数据', 'password', {
  keySize: 256,
  mode: 'CBC'
})

// 2. AES-256 + GCM 模式（需要认证加密时）
// 注意：CryptoJS 不直接支持 GCM，使用 WebCrypto API
import { webcrypto } from '@ldesign/crypto'
const result = await webcrypto.aes.encrypt('数据', 'password', {
  keySize: 256,
  mode: 'GCM'
})

// 3. ChaCha20-Poly1305（现代、高性能）
import { chacha20poly1305 } from '@ldesign/crypto'
// 需要额外安装 @noble/ciphers
```

#### ❌ 避免

```typescript
// ❌ 不要使用 ECB 模式（会泄露模式）
aes.encrypt('data', 'key', { mode: 'ECB' }) // 不安全！

// ❌ 不要使用 AES-128（除非有特殊性能需求）
aes.encrypt('data', 'key', { keySize: 128 }) // 相对较弱

// ❌ 不要使用 DES/3DES（已过时）
import { des } from '@ldesign/crypto'
des.encrypt('data', 'key') // 已过时，不安全！
```

### 哈希算法

#### ✅ 推荐

```typescript
import { hash } from '@ldesign/crypto'

// 1. SHA-256（通用场景）
const sha256Hash = hash.sha256('data')

// 2. SHA-512（高安全性场景）
const sha512Hash = hash.sha512('data')

// 3. 密码哈希（使用 PBKDF2）
import { deriveKey } from '@ldesign/crypto'
const derivedKey = await deriveKey('password', {
  iterations: 100000,  // OWASP 2023 推荐
  keyLength: 32,
  algorithm: 'PBKDF2-SHA256'
})
```

#### ❌ 避免

```typescript
// ❌ 不要用 MD5 存储密码（已破解）
hash.md5('password') // 不安全！

// ❌ 不要用 SHA-1（已不安全）
hash.sha1('data') // 避免使用
```

---

## 密钥管理

### ✅ 正确的密钥管理

#### 1. 不要硬编码密钥

```typescript
// ❌ 错误：硬编码密钥
const key = 'my-secret-key-123' // 不要这样做！
const encrypted = aes.encrypt('data', key)

// ✅ 正确：从环境变量或安全存储获取
const key = process.env.ENCRYPTION_KEY || ''
if (!key) {
  throw new Error('ENCRYPTION_KEY not set')
}
const encrypted = aes.encrypt('data', key)
```

#### 2. 使用足够强度的密钥

```typescript
import { RandomUtils } from '@ldesign/crypto'

// ✅ 正确：生成强随机密钥
const key = RandomUtils.generateKey(32) // 256 位
console.log(`密钥长度: ${key.length} 字符 (${key.length / 2} 字节)`)

// ✅ 正确：使用密钥派生函数
import { deriveKey } from '@ldesign/crypto'
const derivedKey = await deriveKey('user-password', {
  salt: 'unique-salt-per-user',
  iterations: 100000,
  keyLength: 32
})
```

#### 3. 密钥轮换

```typescript
import { KeyRotation } from '@ldesign/crypto'

const keyRotation = new KeyRotation({
  rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 天
})

// 生成新密钥
const newKey = await keyRotation.rotateKey('old-key')

// 重新加密数据
const reencrypted = await keyRotation.reencryptData(
  encryptedData,
  'old-key',
  newKey
)
```

#### 4. 安全清零密钥

```typescript
import { SecureKey } from '@ldesign/crypto'

// ✅ 正确：使用 SecureKey 自动清零
await SecureKey.withKey('password', async (secureKey) => {
  return secureKey.use((keyBytes) => {
    // 使用密钥
    return aes.encrypt('data', keyBytes.toString())
  })
})
// 密钥自动清零，不会残留在内存中
```

### ❌ 常见错误

```typescript
// ❌ 错误：将密钥记录到日志
console.log('Encryption key:', key) // 不要这样做！

// ❌ 错误：将密钥存储在客户端
localStorage.setItem('encryptionKey', key) // 危险！

// ❌ 错误：通过 URL 传递密钥
fetch(`/api/data?key=${key}`) // 密钥会被记录在日志中！

// ❌ 错误：使用相同密钥加密所有数据
// 应该为不同用户/场景使用不同的密钥
```

---

## IV 和 Nonce 管理

### IV（初始化向量）

#### ✅ 正确使用 IV

```typescript
import { aes, RandomUtils } from '@ldesign/crypto'

// ✅ 正确：每次加密生成新的随机 IV
function encryptData(plaintext: string, key: string) {
  const iv = RandomUtils.generateIV(16) // 生成新 IV
  const encrypted = aes.encrypt(plaintext, key, {
    keySize: 256,
    mode: 'CBC',
    iv  // 使用新 IV
  })
  
  // IV 可以公开存储，但必须与密文绑定
  return {
    ciphertext: encrypted.data,
    iv: encrypted.iv
  }
}

// 解密时使用相同的 IV
function decryptData(ciphertext: string, iv: string, key: string) {
  return aes.decrypt(ciphertext, key, {
    iv,
    keySize: 256,
    mode: 'CBC'
  })
}
```

#### ❌ 常见错误

```typescript
// ❌ 错误：重复使用相同的 IV
const fixedIV = '1234567890abcdef' // 不要这样做！
aes.encrypt('data1', 'key', { iv: fixedIV })
aes.encrypt('data2', 'key', { iv: fixedIV }) // 危险：IV 重复！

// ❌ 错误：使用可预测的 IV
const iv = Date.now().toString(16) // 可预测，不安全！

// ❌ 错误：不存储 IV
const encrypted = aes.encrypt('data', 'key')
// 没有保存 encrypted.iv，将无法解密！
```

### Nonce（用于 GCM、ChaCha20 等）

```typescript
// ✅ 正确：使用计数器或随机 nonce
import { chacha20poly1305 } from '@ldesign/crypto'

let counter = 0n

function encryptWithCounter(plaintext: string, key: string) {
  counter++
  const nonce = counter.toString(16).padStart(24, '0') // 96 位
  return chacha20poly1305.encrypt(plaintext, key, { nonce })
}

// ✅ 正确：使用随机 nonce（确保足够长）
function encryptWithRandom(plaintext: string, key: string) {
  const nonce = chacha20poly1305.generateNonce() // 96 位
  return chacha20poly1305.encrypt(plaintext, key, { nonce })
}
```

---

## 常见安全陷阱

### 1. 时序攻击

#### ❌ 不安全的哈希比较

```typescript
// ❌ 不安全：使用 === 比较哈希
function verifyPassword(password: string, storedHash: string): boolean {
  const hash = hash.sha256(password)
  return hash === storedHash // 时序攻击风险！
}
```

#### ✅ 安全的哈希比较

```typescript
import { hash, timingSafeEqual } from '@ldesign/crypto'

// ✅ 安全：使用恒定时间比较
function verifyPassword(password: string, storedHash: string): boolean {
  const passwordHash = hash.sha256(password)
  return timingSafeEqual(passwordHash, storedHash) // 安全！
}

// ✅ 更好：使用库的内置 verify
function verifyPasswordBetter(password: string, storedHash: string): boolean {
  return hash.verify(password, storedHash, 'SHA256') // 内置恒定时间比较
}
```

### 2. 缺少完整性保护

#### ❌ 仅加密，不验证完整性

```typescript
// ❌ 不安全：没有完整性保护
const encrypted = aes.encrypt('important data', 'key')
// 攻击者可能篡改密文，解密时无法检测
```

#### ✅ 使用 HMAC 保护完整性

```typescript
import { aes, hmac } from '@ldesign/crypto'

// ✅ 安全：Encrypt-then-MAC
function encryptWithIntegrity(plaintext: string, encKey: string, macKey: string) {
  // 1. 加密
  const encrypted = aes.encrypt(plaintext, encKey, { keySize: 256 })
  
  // 2. 计算 HMAC
  const mac = hmac.sha256(encrypted.data || '', macKey)
  
  return {
    ciphertext: encrypted.data,
    iv: encrypted.iv,
    mac
  }
}

function decryptWithIntegrity(
  ciphertext: string,
  iv: string,
  mac: string,
  encKey: string,
  macKey: string
) {
  // 1. 验证 HMAC
  const isValid = hmac.verify(ciphertext, macKey, mac, 'SHA256')
  if (!isValid) {
    throw new Error('Data integrity check failed')
  }
  
  // 2. 解密
  return aes.decrypt(ciphertext, encKey, { iv, keySize: 256 })
}
```

#### ✅ 更好：使用 AEAD（认证加密）

```typescript
import { webcrypto } from '@ldesign/crypto'

// ✅ 最佳：使用 GCM 模式（自带认证）
const encrypted = await webcrypto.aes.encrypt('data', 'key', {
  keySize: 256,
  mode: 'GCM'
})
// GCM 自动提供完整性和认证
```

### 3. 不安全的随机数生成

```typescript
// ❌ 不安全：使用 Math.random()
function generateKey() {
  return Math.random().toString(36) // 不安全！
}

// ✅ 安全：使用密码学安全的随机数生成器
import { RandomUtils } from '@ldesign/crypto'

function generateKeySecure() {
  return RandomUtils.generateKey(32) // 使用 crypto.getRandomValues
}
```

---

## 安全检查清单

在发布加密功能前，请检查以下项目：

### 算法和参数

- [ ] 使用 AES-256（而非 AES-128 或 DES）
- [ ] 避免使用 ECB 模式
- [ ] 使用 SHA-256/SHA-512（避免 MD5/SHA-1）
- [ ] 密码哈希使用 PBKDF2（迭代次数 ≥ 100,000）

### 密钥管理

- [ ] 密钥不在代码中硬编码
- [ ] 密钥来自环境变量或安全存储
- [ ] 密钥长度足够（AES-256 = 32 字节）
- [ ] 实施密钥轮换策略
- [ ] 密钥使用后安全清零

### IV 和 Nonce

- [ ] 每次加密生成新的随机 IV
- [ ] IV 与密文一起存储
- [ ] Nonce 不重复使用（计数器或随机）

### 完整性和认证

- [ ] 使用 HMAC 保护数据完整性
- [ ] 或使用 AEAD（如 GCM）
- [ ] 验证失败时拒绝解密

### 错误处理

- [ ] 不泄露敏感信息到错误消息
- [ ] 不泄露密钥、IV 到日志
- [ ] 统一的错误响应（避免时序攻击）

### 测试

- [ ] 单元测试覆盖所有加密路径
- [ ] 测试解密失败场景
- [ ] 测试数据篡改检测
- [ ] 性能测试（避免 DoS）

---

## 实战案例

### 案例 1：用户密码加密存储

```typescript
import { deriveKey, SecureKey, hash, timingSafeEqual, RandomUtils } from '@ldesign/crypto'

// 注册时
async function registerUser(username: string, password: string) {
  // 1. 生成随机盐值（每个用户不同）
  const salt = RandomUtils.generateSalt(16)
  
  // 2. 使用 PBKDF2 派生密钥
  const derivedKey = await deriveKey(password, {
    salt,
    iterations: 100000,
    keyLength: 32,
    algorithm: 'PBKDF2-SHA256'
  })
  
  // 3. 存储派生密钥和盐值
  await database.users.create({
    username,
    passwordHash: derivedKey.key,
    salt: derivedKey.salt
  })
}

// 登录时
async function loginUser(username: string, password: string): Promise<boolean> {
  // 1. 获取用户的盐值
  const user = await database.users.findOne({ username })
  if (!user) return false
  
  // 2. 使用相同的盐值派生密钥
  const derivedKey = await deriveKey(password, {
    salt: user.salt,
    iterations: 100000,
    keyLength: 32,
    algorithm: 'PBKDF2-SHA256'
  })
  
  // 3. 使用恒定时间比较
  return timingSafeEqual(derivedKey.key, user.passwordHash)
}
```

### 案例 2：文件加密存储

```typescript
import { aes, hmac, RandomUtils, SecureKey } from '@ldesign/crypto'

async function encryptFile(file: File, userPassword: string) {
  // 1. 派生加密密钥
  const encKey = await deriveKey(userPassword, {
    salt: 'file-encryption-key',
    iterations: 100000,
    keyLength: 32
  })
  
  // 2. 派生 MAC 密钥（使用不同的盐值）
  const macKey = await deriveKey(userPassword, {
    salt: 'file-mac-key',
    iterations: 100000,
    keyLength: 32
  })
  
  // 3. 生成 IV
  const iv = RandomUtils.generateIV(16)
  
  // 4. 加密文件内容
  const fileContent = await file.text()
  const encrypted = aes.encrypt(fileContent, encKey.key, {
    keySize: 256,
    mode: 'CBC',
    iv
  })
  
  // 5. 计算 HMAC
  const mac = hmac.sha256(encrypted.data || '', macKey.key)
  
  // 6. 组合结果
  return {
    filename: file.name,
    encrypted: encrypted.data,
    iv: encrypted.iv,
    mac,
    algorithm: 'AES-256-CBC',
    timestamp: Date.now()
  }
}

async function decryptFile(encryptedData: any, userPassword: string) {
  // 1. 派生密钥
  const encKey = await deriveKey(userPassword, {
    salt: 'file-encryption-key',
    iterations: 100000,
    keyLength: 32
  })
  
  const macKey = await deriveKey(userPassword, {
    salt: 'file-mac-key',
    iterations: 100000,
    keyLength: 32
  })
  
  // 2. 验证 HMAC
  const isValid = hmac.verify(
    encryptedData.encrypted,
    macKey.key,
    encryptedData.mac,
    'SHA256'
  )
  
  if (!isValid) {
    throw new Error('File integrity check failed - file may be corrupted or tampered')
  }
  
  // 3. 解密
  return aes.decrypt(encryptedData.encrypted, encKey.key, {
    iv: encryptedData.iv,
    keySize: 256,
    mode: 'CBC'
  })
}
```

### 案例 3：API 请求签名

```typescript
import { hmac, timingSafeEqual } from '@ldesign/crypto'

// 客户端：签名请求
function signRequest(method: string, path: string, body: string, apiSecret: string) {
  const timestamp = Date.now()
  const message = `${method}:${path}:${timestamp}:${body}`
  const signature = hmac.sha256(message, apiSecret)
  
  return {
    timestamp,
    signature
  }
}

// 服务器：验证签名
function verifyRequest(
  method: string,
  path: string,
  body: string,
  timestamp: number,
  signature: string,
  apiSecret: string
): boolean {
  // 1. 检查时间戳（防止重放攻击）
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000
  if (Math.abs(now - timestamp) > fiveMinutes) {
    return false
  }
  
  // 2. 重新计算签名
  const message = `${method}:${path}:${timestamp}:${body}`
  const expectedSignature = hmac.sha256(message, apiSecret)
  
  // 3. 恒定时间比较
  return timingSafeEqual(signature, expectedSignature)
}
```

---

## 更多资源

- [OWASP 加密存储备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST 加密标准](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [密码学危险曲线](https://cr.yp.to/talks.html)

## 获取帮助

如果您有安全问题或发现漏洞，请通过安全邮件联系我们，不要公开披露。


