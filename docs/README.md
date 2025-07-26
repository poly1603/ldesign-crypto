# @ldesign/crypto 文档

欢迎使用 @ldesign/crypto 的完整文档！这是一个功能强大、类型安全的 TypeScript 加密库，专为现代 Web 应用程序设计。

## 📚 文档结构

### 🚀 快速开始
- **[快速开始](./guide/getting-started.md)** - 安装和基础使用
- **[基础使用示例](./examples/basic-usage.md)** - 实用的代码示例

### 📖 完整指南
- **[安装指南](./guide/installation.md)** - 详细的安装和配置说明
- **[基础概念](./guide/concepts.md)** - 核心概念和架构
- **[配置选项](./guide/configuration.md)** - 详细的配置参数
- **[性能监控](./guide/performance.md)** - 性能优化和监控
- **[缓存机制](./guide/caching.md)** - 智能缓存系统
- **[高级功能](./guide/advanced.md)** - 流式加密、密钥管理、零知识证明等
- **[插件开发](./guide/plugin-development.md)** - 扩展和自定义功能
- **[错误处理](./guide/error-handling.md)** - 完善的错误处理机制

### 🔧 API 参考
- **[对称加密](./api/symmetric.md)** - AES、DES、ChaCha20 等算法
- **[非对称加密](./api/asymmetric.md)** - RSA、ECC、ECDH 等算法
- **[哈希算法](./api/hash.md)** - SHA、MD5、HMAC、PBKDF2 等
- **[国密算法](./api/sm-crypto.md)** - SM2、SM3、SM4、SM9 等中国标准
- **[Vue组合式API](./api/vue-composables.md)** - Vue 3 专用接口
- **[类型定义](./api/types.md)** - 完整的 TypeScript 类型

### 🎮 在线演示
- **[加密演练场](./demo/playground.md)** - 交互式加密工具
- **[对称加密演示](./demo/symmetric.md)** - 对称加密实例
- **[国密算法演示](./demo/sm-crypto.md)** - 国密算法实例

### 💡 代码示例
- **[基础使用](./examples/basic-usage.md)** - 基础功能示例
- **[Vue组件](./examples/vue-component.md)** - Vue 3 组件示例

## ✨ 主要特性

### 🔐 全面的加密支持
- **对称加密**: AES、DES、3DES、ChaCha20、SM4
- **非对称加密**: RSA、ECC、ECDH、ECDSA、SM2、SM9
- **哈希算法**: SHA系列、MD5、SM3、BLAKE2
- **密钥派生**: PBKDF2、HKDF、scrypt、Argon2
- **数字签名**: RSA-PSS、ECDSA、EdDSA、SM2-DSA

### 🇨🇳 国密算法支持
- **SM2**: 椭圆曲线公钥密码算法
- **SM3**: 密码杂凑算法
- **SM4**: 分组密码算法
- **SM9**: 标识密码算法

### 🚀 现代化设计
- **TypeScript**: 完整的类型安全
- **Vue 3**: 专用的组合式 API
- **React**: 兼容的 Hook 支持
- **Node.js**: 服务端支持
- **WebAssembly**: 高性能计算

### ⚡ 高性能特性
- **智能缓存**: 多层缓存策略
- **流式处理**: 大文件支持
- **并行计算**: 多线程优化
- **内存管理**: 自动垃圾回收

### 🔧 扩展性
- **插件系统**: 自定义算法和提供者
- **中间件**: 灵活的处理管道
- **提供者**: 硬件、软件、云端支持
- **错误处理**: 完善的错误恢复机制

## 🎯 使用场景

### 🌐 Web 应用
```typescript
import { useSymmetricCrypto } from '@ldesign/crypto'

const { aesEncrypt, aesDecrypt } = useSymmetricCrypto()

// 加密用户数据
const encrypted = await aesEncrypt('sensitive data', {
  key: 'user-key',
  mode: 'GCM'
})
```

### 📱 移动应用
```typescript
import { useSMCrypto } from '@ldesign/crypto'

const { sm4Encrypt, sm4Decrypt } = useSMCrypto()

// 国密加密
const encrypted = await sm4Encrypt('mobile data', {
  key: 'mobile-key',
  mode: 'CBC'
})
```

### 🖥️ 桌面应用
```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto({
  provider: 'hardware', // 使用硬件加速
  cache: { enabled: true }
})

await crypto.init()
```

### 🔒 文件加密
```typescript
import { useFileEncryption } from '@ldesign/crypto'

const { encryptFile, decryptFile } = useFileEncryption()

// 加密文件
const encryptedFile = await encryptFile(file, 'password')
```

## 🛠️ 开发工具

### 📊 性能监控
```typescript
import { usePerformanceMonitor } from '@ldesign/crypto'

const { metrics, startMonitoring } = usePerformanceMonitor()

startMonitoring()
console.log('加密性能:', metrics.value)
```

### 🐛 错误处理
```typescript
import { CryptoError, ErrorCodes } from '@ldesign/crypto'

try {
  await crypto.encrypt(data, options)
} catch (error) {
  if (error instanceof CryptoError) {
    console.log('错误代码:', error.code)
    console.log('错误详情:', error.details)
  }
}
```

### 🔍 调试工具
```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto({
  debug: true,
  performance: { enabled: true }
})
```

## 🌟 最佳实践

### 🔑 密钥管理
- 使用强随机密钥生成
- 实施密钥轮换策略
- 采用分层密钥架构
- 安全存储和传输密钥

### 🛡️ 安全建议
- 选择合适的加密算法
- 使用认证加密模式
- 实施完整性验证
- 定期安全审计

### ⚡ 性能优化
- 启用智能缓存
- 使用流式处理
- 选择硬件加速
- 监控性能指标

### 🔧 错误处理
- 实施重试机制
- 提供降级策略
- 记录详细日志
- 用户友好提示

## 📈 版本信息

- **当前版本**: 1.0.0
- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0
- **Vue**: >= 3.0.0 (可选)
- **React**: >= 16.8.0 (可选)

## 🤝 贡献指南

我们欢迎社区贡献！请查看 [贡献指南](./contributing.md) 了解如何参与项目开发。

### 📝 文档贡献
- 改进现有文档
- 添加新的示例
- 翻译文档
- 报告文档问题

### 💻 代码贡献
- 修复 Bug
- 添加新功能
- 性能优化
- 测试覆盖

## 📞 支持与反馈

- **GitHub Issues**: [报告问题](https://github.com/ldesign/crypto/issues)
- **讨论区**: [参与讨论](https://github.com/ldesign/crypto/discussions)
- **邮件支持**: crypto@ldesign.com
- **文档反馈**: docs@ldesign.com

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](./LICENSE) 文件。

---

**开始探索 @ldesign/crypto 的强大功能吧！** 🚀

从 [快速开始](./guide/getting-started.md) 开始您的加密之旅，或者直接查看 [在线演示](./demo/playground.md) 体验交互式功能。
