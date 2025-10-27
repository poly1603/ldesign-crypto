# 介绍

`@ldesign/crypto` 是一个功能强大、类型安全的现代加密库，专为现代 Web 应用和 Node.js 环境设计。它提供了多种加密算法、哈希函数和编码方式，并且具有出色的性能和安全性。

## 特性概览

### 🔐 丰富的加密算法

支持多种主流加密算法：

- **对称加密**: AES、DES、3DES、Blowfish、ChaCha20、XSalsa20
- **非对称加密**: RSA (支持 PKCS1、OAEP 填充)
- **认证加密**: AES-GCM、ChaCha20-Poly1305

### 🔑 完整的哈希函数

提供多种哈希算法：

- **经典哈希**: MD5、SHA-1
- **SHA-2 系列**: SHA-224、SHA-256、SHA-384、SHA-512
- **现代哈希**: BLAKE2b、BLAKE2s
- **消息认证**: HMAC (支持所有哈希算法)
- **密钥派生**: PBKDF2、HKDF、scrypt、Argon2

### ⚡ 卓越的性能

v2.0 带来显著的性能提升：

| 优化项 | 性能提升 | 说明 |
|--------|----------|------|
| WebCrypto 加速 | 2-2.44x | AES 等算法使用硬件加速 |
| 对象池优化 | 31% | 哈希函数性能提升 |
| 密钥派生缓存 | 2.11x | 重复加密场景优化 |
| 批量并行处理 | 40-60% | 多任务并行执行 |
| 内存优化 | 43% | 内存占用大幅降低 |

### 💾 流式处理

支持大文件加密解密：

- 恒定内存占用 (< 50MB)
- 支持 GB 级文件
- 进度回调
- 流式 API

### 🛡️ 安全增强

遵循安全最佳实践：

- **时序攻击防护**: 恒定时间比较
- **安全内存管理**: 密钥自动清零
- **随机数生成**: CSPRNG (密码学安全伪随机数)
- **密钥轮换**: 自动密钥更新
- **速率限制**: 防止暴力破解

### 🎯 类型安全

完整的 TypeScript 支持：

- 所有 API 都有类型定义
- 智能提示和自动补全
- 编译时类型检查
- 详细的 JSDoc 注释

### 🔧 框架集成

#### Vue 3 集成

提供完整的 Vue 3 支持：

```typescript
// Composition API
import { useEncryption, useHash } from '@ldesign/crypto/vue'

// 插件系统
import { createCryptoPlugin } from '@ldesign/crypto/vue'
app.use(createCryptoPlugin())
```

#### React 支持

虽然没有专门的 React 集成，但所有 API 都是框架无关的，可以直接在 React 中使用：

```typescript
import { createAES } from '@ldesign/crypto'
import { useState } from 'react'

function App() {
  const [encrypted, setEncrypted] = useState('')
  const aes = createAES('secret-key')
  
  const encrypt = (text) => {
    setEncrypted(aes.encrypt(text))
  }
  
  return <button onClick={() => encrypt('hello')}>加密</button>
}
```

### 📦 模块化设计

支持多种导入方式：

```typescript
// 完整导入
import * as crypto from '@ldesign/crypto'

// 按需导入
import { createAES, hash } from '@ldesign/crypto'

// 子路径导入
import { AES } from '@ldesign/crypto/algorithms/aes'
import { KeyManager } from '@ldesign/crypto/core'
```

Tree-shaking 友好，只打包使用的代码。

### 🌐 跨平台

统一的 API，支持多种环境：

- **浏览器**: 支持所有现代浏览器
- **Node.js**: 14+ 版本
- **Web Workers**: 后台线程加密
- **SSR**: 服务端渲染兼容

### 🧪 高质量代码

严格的质量保证：

- **440+ 测试用例**: 全面的单元测试和集成测试
- **88%+ 覆盖率**: 代码覆盖率高
- **E2E 测试**: Playwright 端到端测试
- **性能基准**: 持续的性能监控

## 适用场景

`@ldesign/crypto` 适用于多种场景：

### 1. 数据加密存储

```typescript
import { createAES } from '@ldesign/crypto'

// 加密敏感数据
const aes = createAES(userKey)
const encrypted = aes.encrypt(JSON.stringify(userData))
localStorage.setItem('userData', encrypted)

// 解密数据
const decrypted = aes.decrypt(localStorage.getItem('userData'))
const userData = JSON.parse(decrypted)
```

### 2. 密码管理

```typescript
import { hash } from '@ldesign/crypto'

// 密码哈希 (使用 PBKDF2)
const hashedPassword = hash.pbkdf2(password, salt, {
  iterations: 100000,
  keySize: 256
})

// 密码验证 (时序安全)
const isValid = hash.timingSafeEqual(hashedPassword, storedHash)
```

### 3. API 签名

```typescript
import { hash } from '@ldesign/crypto'

// 生成签名
const signature = hash.hmac(requestBody, apiSecret, 'sha256')

// 验证签名
const isValid = signature === receivedSignature
```

### 4. 文件加密

```typescript
import { FileEncryptor } from '@ldesign/crypto/stream'

// 加密大文件
const encryptor = new FileEncryptor('my-secret-key')
await encryptor.encryptFile(
  inputFile,
  outputFile,
  (progress) => console.log(`进度: ${progress}%`)
)
```

### 5. 数字签名

```typescript
import { createRSA } from '@ldesign/crypto'

// 生成密钥对
const rsa = createRSA()
const { publicKey, privateKey } = rsa.generateKeyPair()

// 签名
const signature = rsa.sign(message, privateKey)

// 验证
const isValid = rsa.verify(message, signature, publicKey)
```

## 浏览器兼容性

| 浏览器 | 版本 | WebCrypto | 备注 |
|--------|------|-----------|------|
| Chrome | 90+ | ✅ | 完整支持 |
| Firefox | 88+ | ✅ | 完整支持 |
| Safari | 14+ | ✅ | 完整支持 |
| Edge | 90+ | ✅ | 完整支持 |
| IE | ❌ | ❌ | 不支持 |

::: tip
在不支持 WebCrypto 的环境中，会自动回退到纯 JavaScript 实现，功能不受影响。
:::

## Node.js 兼容性

- **Node.js 14+**: 完整支持
- **Node.js 12**: 部分功能受限
- **Node.js 10 及以下**: 不支持

## 许可证

MIT License - 可自由用于商业和开源项目。

## 下一步

- [安装](./installation) - 了解如何安装和配置
- [快速开始](./quick-start) - 5 分钟上手教程
- [API 文档](/api/) - 完整的 API 参考
- [示例代码](/examples/) - 丰富的示例代码

