# @ldesign/crypto

一个功能强大、类型安全的现代加密库，支持多种加密算法、哈希函数和编码方式，专为现代 Web 应用和 Node.js 环境设计。

> 🎉 **v2.0 重磅更新**：性能提升 25-35%，内存优化 43%，新增硬件加速和流式处理！  
> 📚 [查看升级指南](./UPGRADE_GUIDE_v2.0.md) | [快速参考](./QUICK_REFERENCE.md) | [优化报告](./FINAL_OPTIMIZATION_SUMMARY.md)

## ✨ 特性

### 核心功能
- 🔐 **多种加密算法**：AES、RSA、DES、3DES、Blowfish、ChaCha20、XSalsa20
- 🔑 **丰富的哈希函数**：MD5、SHA1、SHA224、SHA256、SHA384、SHA512、HMAC、BLAKE2b
- 📝 **编码方式**：Base64、Hex、URL-safe Base64
- 🎯 **TypeScript 支持**：完整的类型定义和智能提示
- 🌐 **跨平台**：支持浏览器和 Node.js 环境

### v2.0 新特性 ✨
- ⚡ **硬件加速**：集成 WebCrypto API，性能提升 2-2.44 倍
- 💾 **流式处理**：支持 GB 级文件，内存恒定 < 50MB
- 🛡️ **时序攻击防护**：恒定时间比较，消除时序攻击风险
- 🔒 **安全内存管理**：密钥使用后自动清零，防止泄漏
- 📊 **性能监控**：实时缓存统计和性能指标

### 性能优化
- ⚡ **对象池优化**：哈希函数性能提升 31%
- ⚡ **密钥派生缓存**：重复加密性能提升 2.11 倍
- ⚡ **批量并行处理**：批量操作性能提升 40-60%
- 💾 **内存优化**：内存占用减少 43%
- 🚀 **LRU 缓存**：自动过期清理，内存受控

### 开发体验
- 📚 **完整中文文档**：1750+ 行详细注释
- 🔧 **Vue 3 集成**：提供 Composition API 钩子和插件系统
- 📦 **模块化设计**：按需导入，Tree-shaking 友好
- 🧪 **完整测试**：440+ 测试用例，覆盖率 88%+

## 安装

```bash
# 使用 pnpm
pnpm add @ldesign/crypto

# 使用 npm
npm install @ldesign/crypto

# 使用 yarn
yarn add @ldesign/crypto
```

## 快速开始

### 基础用法

```typescript
import { aes, encoding, hash, hmac } from '@ldesign/crypto'

// AES 加密
const encrypted = aes.encrypt('Hello World', 'secret-key')
console.log(encrypted.success) // true
console.log(encrypted.data) // 加密后的数据
console.log(encrypted.algorithm) // 'AES'
console.log(encrypted.mode) // 'CBC'
console.log(encrypted.keySize) // 256

// AES 解密
const decrypted = aes.decrypt(encrypted, 'secret-key')
console.log(decrypted.success) // true
console.log(decrypted.data) // 'Hello World'

// 哈希（默认 Hex 编码字符串）
const sha256 = hash.sha256('Hello World')
console.log(sha256) // SHA256 哈希值（hex）

// HMAC（单独的 hmac 模块）
const mac = hmac.sha256('Hello World', 'secret-key')
console.log(mac) // HMAC 值（hex）

// Base64 编码
const encoded = encoding.encode('Hello World', 'base64')
console.log(encoded) // 'SGVsbG8gV29ybGQ='

const decoded = encoding.decode(encoded, 'base64')
console.log(decoded) // 'Hello World'
```

### 高级用法

#### 不同密钥长度的 AES 加密

```typescript
import { aes } from '@ldesign/crypto'

// AES-128
const encrypted128 = aes.encrypt('Hello World', 'secret-key', { keySize: 128 })

// AES-192
const encrypted192 = aes.encrypt('Hello World', 'secret-key', { keySize: 192 })

// AES-256 (默认)
const encrypted256 = aes.encrypt('Hello World', 'secret-key', { keySize: 256 })
```

#### 不同加密模式

```typescript
import { aes } from '@ldesign/crypto'

// CBC 模式 (默认)
const cbcEncrypted = aes.encrypt('Hello World', 'secret-key', { mode: 'CBC' })

// ECB 模式
const ecbEncrypted = aes.encrypt('Hello World', 'secret-key', { mode: 'ECB' })

// CFB 模式
const cfbEncrypted = aes.encrypt('Hello World', 'secret-key', { mode: 'CFB' })
```

#### 密钥生成

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成随机密钥
const key32 = RandomUtils.generateKey(32) // 32字节密钥 (64个十六进制字符)
const key16 = RandomUtils.generateKey(16) // 16字节密钥 (32个十六进制字符)

// 生成随机盐值
const salt = RandomUtils.generateSalt(16)

// 生成随机IV
const iv = RandomUtils.generateIV(16)
```

#### 数据完整性验证

```typescript
import { hmac } from '@ldesign/crypto'

const data = 'Important data'
const secretKey = 'verification-key'

// 生成 HMAC 用于验证数据完整性
const mac = hmac.sha256(data, secretKey)

// 验证数据完整性
const isValid = hmac.verify(data, secretKey, mac, 'SHA256')
console.log(isValid) // true
```

### Vue 3 集成

#### 基础 Composition API

```typescript
// 使用 Composition API
import { useCrypto, useHash } from '@ldesign/crypto/vue'

export default {
  setup() {
    const { encrypt, decrypt } = useCrypto()
    const { md5, sha256 } = useHash()

    const handleEncrypt = () => {
      const result = encrypt.aes('data', 'key')
      console.log(result)
    }

    return {
      handleEncrypt,
    }
  },
}
```

#### 便捷的组合式函数

```vue
<script setup>
import { useEncryption, useKeyManager, useHash } from '@ldesign/crypto/vue'

// 简单的加密解密
const encryption = useEncryption()

const handleEncrypt = async () => {
  const encrypted = await encryption.encryptText('Hello World', 'myPassword')
  console.log('加密结果:', encrypted)

  const decrypted = await encryption.decryptText(encrypted, 'myPassword')
  console.log('解密结果:', decrypted)
}

// 密钥管理
const keyManager = useKeyManager()

const generateKeys = async () => {
  // 生成 AES 密钥
  const aesKey = await keyManager.generateAESKey(256)
  if (aesKey) {
    keyManager.storeKey('myAESKey', aesKey)
  }

  // 生成 RSA 密钥对
  const rsaKeyPair = await keyManager.generateRSAKeyPair(2048)
  if (rsaKeyPair) {
    keyManager.storeKey('myRSAKey', rsaKeyPair)
  }
}

// 哈希计算
const hash = useHash()

const calculateHash = async () => {
  const sha256Hash = await hash.sha256('Hello World')
  console.log('SHA256:', sha256Hash)
}
</script>
```

#### 插件方式

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// 使用插件
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin)
app.mount('#app')

// 在组件中使用
export default {
  mounted() {
    const encrypted = this.$crypto.encrypt.aes('data', 'key')
    console.log(encrypted)
  },
}
```

## 支持的算法

### 对称加密
- **AES**：AES-128, AES-192, AES-256（推荐）
- **AES-GCM**：认证加密（AEAD），TLS 1.3 默认算法
- **DES**：已过时，不推荐
- **3DES**：已过时，不推荐
- **Blowfish**：安全但较慢

### 非对称加密
- **RSA**：1024/2048/3072/4096 位

### 哈希算法
- **MD5**：仅用于非安全场景
- **SHA-1**：已不安全，不推荐
- **SHA-256**：推荐
- **SHA-384/SHA-512**：高安全性

### 消息认证码
- HMAC-MD5, HMAC-SHA1, HMAC-SHA256, HMAC-SHA384, HMAC-SHA512

### 编码
- Base64, URL-Safe Base64, Hex

## 文档

- 本地文档：在本包目录运行 `pnpm docs:dev` 启动文档站点
- 构建预览：`pnpm docs:build && pnpm docs:preview`

## 示例

查看 `examples/` 目录获取完整的使用示例:

- `examples/vanilla/` - 原生 JavaScript 示例
- `examples/vue/` - Vue 3 集成示例

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 端到端测试
pnpm test:e2e

# 文档开发
pnpm docs:dev
```

## 导出结构

- ESM（推荐）
  - 命名导出：
    ```ts path=null start=null
    import { aes, rsa, hash, hmac, encoding } from '@ldesign/crypto'
    ```
  - 命名空间导入：
    ```ts path=null start=null
    import * as LDesignCrypto from '@ldesign/crypto'
    // 例如：LDesignCrypto.aes.encrypt('data', 'key')
    ```
- CommonJS（需要在 CJS 环境）
  ```js path=null start=null
  const Crypto = require('@ldesign/crypto')
  const result = Crypto.aes.encrypt('data', 'key')
  ```

## API 总览

- AES（对称加密）
  - `aes.encrypt(data, key, options?)` → `{ success, data?, iv?, algorithm, mode, keySize, error? }`
  - `aes.decrypt(input, key, options?)` → `{ success, data?, error? }`
  - 便捷方法：`aes128/aes192/aes256`（对应 keySize 128/192/256）
  - 常用可选项：`{ keySize?: 128|192|256, mode?: 'CBC'|'ECB'|'CFB'|'OFB'|'CTR', iv?: string }`
- RSA（非对称加密）
  - `rsa.generateKeyPair(bits = 2048)` → `{ publicKey, privateKey }`
  - `rsa.encrypt(data, publicKey, options?)` / `rsa.decrypt(input, privateKey, options?)`
  - 常用可选项：`{ padding?: 'OAEP'|'PKCS1', hashAlgorithm?: 'SHA256'|'SHA1' }`
- Hash（哈希）
  - `hash.md5/sha1/sha224/sha256/sha384/sha512(data, { encoding?: 'hex'|'base64' } = { encoding:'hex' })`
  - `hash.verify(data, expected, algorithm)` 常数时间比较
- HMAC（消息认证码）
  - `hmac.md5/sha1/sha256/sha384/sha512(message, key, { encoding?: 'hex'|'base64' })`
  - `hmac.verify(message, key, mac, 'SHA256' | ... )`
- 编码
  - `encoding.encode(text, 'base64' | 'hex')` / `encoding.decode(text, 'base64' | 'hex')`
  - 便捷：`encrypt.base64/base64Url/hex`，`decrypt.base64/base64Url/hex`（如在示例中所示）
- 随机/密钥工具（名称视导出可能为 keyGenerator 或 RandomUtils）
  - `generateKey(lengthBytes)`、`generateIV(lengthBytes)`、`generateSalt(lengthBytes)`
- 数字签名
  - `digitalSignature.sign(data, privateKey, 'SHA256' | ... )`
  - `digitalSignature.verify(data, signature, publicKey, 'SHA256' | ... )`
- 统一管理器（如有暴露）
  - `cryptoManager.batchEncrypt(ops)` / `cryptoManager.batchDecrypt(ops)`（批量与并行）

> 注：以上为概要，具体入参与返回结构请以源码与类型声明为准。

## v2.1 新功能

### WebCrypto 硬件加速

自动使用浏览器/Node.js 的 WebCrypto API，性能提升 2-5 倍：

```typescript
import { webcrypto, isWebCryptoSupported } from '@ldesign/crypto'

// 检查是否支持 WebCrypto
if (isWebCryptoSupported()) {
  // 使用 WebCrypto 加密（自动降级）
  const result = await webcrypto.aes.encrypt('data', 'key', {
    keySize: 256,
    mode: 'GCM'  // 推荐使用 GCM 模式
  })
  console.log(result.usingWebCrypto) // true
}
```

### AES-GCM 认证加密

AES-GCM 同时提供加密和完整性验证：

```typescript
import { webcrypto } from '@ldesign/crypto'

// 加密（包含认证标签）
const encrypted = await webcrypto.gcm.encrypt('敏感数据', 'password', {
  keySize: 256,
  additionalData: 'header' // 附加认证数据（可选）
})

// 解密（自动验证认证标签）
const decrypted = await webcrypto.gcm.decrypt(encrypted, 'password')
if (decrypted.authVerified) {
  console.log('认证通过:', decrypted.data)
}
```

### 密钥验证

检测密钥强度和安全性：

```typescript
import { validateKey, generateSecureKey } from '@ldesign/crypto'

// 验证密钥
const result = validateKey('my-password-123')
console.log(result.strength)     // 'fair' | 'good' | 'strong' | 'excellent'
console.log(result.entropy)       // 熵值（位）
console.log(result.warnings)      // 安全警告
console.log(result.suggestions)   // 改进建议

// 检查是否适合 AES-256
console.log(result.suitableFor.aes256) // boolean

// 生成安全密钥
const secureKey = generateSecureKey('AES', 256)
console.log(secureKey) // 64 个十六进制字符
```

### 加密结果序列化

方便存储和传输加密数据：

```typescript
import { aes, serializeEncryptResult, deserializeEncryptResult } from '@ldesign/crypto'

// 加密
const encrypted = aes.encrypt('data', 'key')

// 序列化为 JSON
const json = serializeEncryptResult(encrypted, 'json')

// 序列化为 Base64（更紧凑）
const base64 = serializeEncryptResult(encrypted, 'base64')

// 反序列化（自动检测格式）
const restored = deserializeEncryptResult(json)
```

## 性能优化

### 缓存机制

本库内置了高性能的 LRU 缓存机制，可显著提升重复操作的性能：

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 获取缓存统计
const stats = cryptoManager.getCacheStats()
console.log('缓存命中率:', stats.hitRate)
console.log('缓存大小:', stats.size)
console.log('缓存命中次数:', stats.hits)
console.log('缓存未命中次数:', stats.misses)

// 获取性能指标
const metrics = cryptoManager.getPerformanceMetrics()
console.log('每秒操作数:', metrics.operationsPerSecond)
console.log('平均延迟:', metrics.averageLatency, 'ms')
console.log('内存使用:', metrics.memoryUsage, 'bytes')
console.log('缓存命中率:', metrics.cacheHitRate)

// 清理过期缓存
const cleaned = cryptoManager.cleanupCache()
console.log(`清理了 ${cleaned} 个过期缓存项`)

// 完全清空缓存
cryptoManager.clearCache()
```

### 性能特性

- **密钥派生缓存**: PBKDF2 密钥派生结果自动缓存，重复使用相同密钥时性能提升 **2.11x**
- **LRU 缓存**: O(1) 时间复杂度的缓存读写，自动淘汰最久未使用的项
- **自动过期**: 缓存项默认 5 分钟过期，防止内存泄漏
- **内存优化**: 大量加密操作内存增长控制在 4MB 以内

### 性能配置

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

const optimizer = new PerformanceOptimizer({
  maxCacheSize: 1000,        // 最大缓存数量
  cacheTTL: 5 * 60 * 1000,   // 5 分钟过期
  enableCache: true,          // 启用缓存
  maxOperationTimes: 1000,    // 最大操作时间记录数
})
```

详细的性能优化说明请查看 [OPTIMIZATION.md](./OPTIMIZATION.md)。

## 安全建议（强烈推荐阅读）

- 算法选择
  - 避免在生产使用 ECB；首选 AES-256（CBC/CTR）与 RSA-OAEP + SHA-256
  - 避免将 MD5/SHA-1 用于安全场景；首选 SHA-256/384/512
- IV/Nonce
  - CBC/CTR/CFB/OFB 等模式请每次加密使用新的随机 IV，不要复用
  - IV 可公开存储，但必须与对应密文绑定
- 密钥管理
  - 不要在代码中硬编码密钥；通过安全存储或环境变量注入
  - 使用足够长度与熵的密钥；定期轮换
- 完整性与认证
  - 对敏感数据同时使用 HMAC 进行完整性校验或采用 AEAD（若后续提供）
  - 比较摘要/签名时使用常数时间比较（库已提供 verify）
- 编码误区
  - Base64/Hex 仅是编码，不提供安全性
- 其他
  - 处理失败（success=false 或抛错）时不要泄漏过多错误细节
  - 注意浏览器与 Node 环境差异，必要时使用 polyfill/降级实现

## 性能基准

在典型硬件上的性能测试结果：

| 操作 | CryptoJS | WebCrypto | 提升 |
|------|---------|-----------|---------|
| AES-256-CBC 加密 (1KB) | ~2.1ms | ~0.8ms | **2.6x** |
| AES-256-GCM 加密 (1KB) | N/A | ~0.6ms | - |
| SHA-256 哈希 (1KB) | ~0.3ms | ~0.1ms | **3x** |
| PBKDF2 密钥派生 | ~120ms | ~45ms | **2.7x** |
| RSA-2048 加密 | ~15ms | ~8ms | **1.9x** |

> 测试环境：Chrome 120, Intel Core i7, 16GB RAM

## 常见问题（FAQ）

### 解密失败常见原因？
- 密钥错误
- IV 不匹配
- 加密模式/参数不一致
- 密文被截断或篡改

### 如何在前端安全使用？
- 避免在客户端存储长期有效的密钥
- 使用临时密钥与后端协商
- 使用 HTTPS 保护传输

### WebCrypto 不可用怎么办？
本库会自动降级到 CryptoJS 实现，无需额外配置。

### RSA 能加密大数据吗？
不适合。请使用“混合加密”（RSA 加密对称密钥，对称密钥加密大数据）。

## 变更日志

请查看根目录的 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

MIT License
