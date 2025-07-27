# @ldesign/crypto

🔐 功能完整的加解密模块，支持主流加密算法和中国国密算法

## ✨ 特性

### 🎯 核心功能
- **对称加密**: AES、DES、3DES等主流算法
- **非对称加密**: RSA、ECC椭圆曲线加密
- **哈希算法**: MD5、SHA系列、HMAC等
- **国密算法**: SM2、SM3、SM4完整支持
- **数字签名**: RSA签名、SM2签名
- **密钥管理**: 密钥生成、格式转换、验证

### 🚀 高级特性
- **性能监控**: 实时监控加密操作性能
- **智能缓存**: 自动缓存计算结果，提升性能
- **插件架构**: 模块化设计，支持自定义算法
- **错误处理**: 完善的错误处理和异常捕获
- **TypeScript**: 完整的类型定义和智能提示

### 🎨 框架集成
- **Vue 3**: 完整的组合式API支持
- **通用API**: 不依赖特定框架，可用于任何项目
- **浏览器兼容**: 支持现代浏览器和Node.js环境

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/crypto

# 使用 npm
npm install @ldesign/crypto

# 使用 yarn
yarn add @ldesign/crypto
```

## 🚀 快速开始

### 基础使用

```typescript
import { createCrypto } from '@ldesign/crypto'

// 创建加密实例
const crypto = createCrypto({
  debug: true,
  performance: { enabled: true },
  cache: { enabled: true }
})

// 初始化
await crypto.init()

// AES加密
const aesResult = await crypto.aesEncrypt('Hello World', {
  key: '12345678901234567890123456789012', // 32字节密钥
  mode: 'CBC',
  padding: 'PKCS7'
})

console.log('加密结果:', aesResult.data)

// AES解密
const decryptResult = await crypto.aesDecrypt(aesResult.data!, {
  key: '12345678901234567890123456789012',
  mode: 'CBC',
  padding: 'PKCS7'
})

console.log('解密结果:', decryptResult.data)
```

### Vue 3 集成

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import LDesignCrypto from '@ldesign/crypto'

const app = createApp(App)

// 安装插件
app.use(LDesignCrypto, {
  debug: true,
  performance: { enabled: true }
})

app.mount('#app')
```

```vue
<!-- 组件中使用 -->
<script setup lang="ts">
import { ref } from 'vue'
import { useSymmetricCrypto } from '@ldesign/crypto'

const { isLoading, error, result, encrypt } = useSymmetricCrypto()

const data = ref('Hello World')

function handleEncrypt() {
  encrypt(data.value, {
    key: '12345678901234567890123456789012',
    mode: 'CBC'
  })
}
</script>

<template>
  <div>
    <input v-model="data" placeholder="输入要加密的数据">
    <button :disabled="isLoading" @click="encrypt">
      {{ isLoading ? '加密中...' : '加密' }}
    </button>
    <div v-if="result">
      加密结果: {{ result }}
    </div>
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>
```

## 📚 主要API

### 🔒 对称加密
```typescript
// AES加密/解密
await crypto.aesEncrypt(data, { key, mode: 'CBC' })
await crypto.aesDecrypt(encrypted, { key, mode: 'CBC' })

// DES/3DES加密/解密
await crypto.desEncrypt(data, { key })
await crypto.tripleDesEncrypt(data, { key })
```

### 🔑 非对称加密
```typescript
// RSA密钥生成
const keyPair = await crypto.generateRSAKeyPair(2048)

// RSA加密/解密
await crypto.rsaEncrypt(data, { publicKey })
await crypto.rsaDecrypt(encrypted, { privateKey })

// RSA签名/验签
const signature = await crypto.rsaSign(data, { privateKey })
const verified = await crypto.rsaVerify(data, signature, { publicKey })
```

### 🔍 哈希算法
```typescript
// 基础哈希
await crypto.md5('Hello World')
await crypto.sha256('Hello World')
await crypto.sha512('Hello World')

// 带盐值哈希
await crypto.sha256('Hello World', { salt: 'mysalt' })

// PBKDF2密钥派生
await crypto.pbkdf2({
  password: 'mypassword',
  salt: 'mysalt',
  iterations: 10000,
  keyLength: 32
})
```

### 🇨🇳 国密算法
```typescript
// SM2椭圆曲线加密
const sm2KeyPair = await crypto.generateSM2KeyPair()
await crypto.sm2Encrypt(data, { publicKey: sm2KeyPair.publicKey })
await crypto.sm2Decrypt(encrypted, { privateKey: sm2KeyPair.privateKey })

// SM3哈希
await crypto.sm3('Hello World')

// SM4分组密码
const sm4Key = crypto.generateKey('SM4')
await crypto.sm4Encrypt(data, { key: sm4Key })
await crypto.sm4Decrypt(encrypted, { key: sm4Key })
```

### 🛠️ 工具方法
```typescript
// 生成随机字符串
crypto.generateRandom({ length: 32, charset: 'hex' })

// 生成密钥
crypto.generateKey('AES', 256)
crypto.generateKey('SM4')

// 性能监控
crypto.getPerformanceMetrics()
crypto.clearCache()
```

## 🎨 Vue 3 组合式 API

### useSymmetricCrypto - 对称加密
```typescript
import { useSymmetricCrypto } from '@ldesign/crypto'

const {
  isLoading, // 加载状态
  error, // 错误信息
  result, // 操作结果
  encrypt, // 加密方法
  decrypt // 解密方法
} = useSymmetricCrypto()

// 使用示例
await encrypt('Hello World', { key: 'mykey' }, 'AES')
await decrypt(encryptedData, { key: 'mykey' }, 'AES')
```

### useAsymmetricCrypto - 非对称加密
```typescript
import { useAsymmetricCrypto } from '@ldesign/crypto'

const {
  isLoading,
  error,
  result,
  keyPair, // 生成的密钥对
  generateKeyPair, // 生成密钥对
  encrypt,
  decrypt,
  sign, // 数字签名
  verify // 验证签名
} = useAsymmetricCrypto()

// 使用示例
await generateKeyPair('RSA', 2048)
await encrypt(data, { publicKey: keyPair.value.publicKey }, 'RSA')
```

### useHash - 哈希算法
```typescript
import { useHash } from '@ldesign/crypto'

const {
  isLoading,
  error,
  result,
  hash // 哈希计算
} = useHash()

// 使用示例
await hash('Hello World', 'SHA256', { salt: 'mysalt' })
```

### useSM - 国密算法
```typescript
import { useSM } from '@ldesign/crypto'

const {
  isLoading,
  error,
  result,
  keyPair,
  generateSM2KeyPair, // 生成SM2密钥对
  sm2Encrypt, // SM2加密
  sm2Decrypt, // SM2解密
  sm3Hash, // SM3哈希
  sm4Encrypt, // SM4加密
  sm4Decrypt // SM4解密
} = useSM()
```

## ⚙️ 配置选项

```typescript
const crypto = createCrypto({
  // 默认编码格式
  defaultEncoding: 'hex',

  // 性能监控配置
  performance: {
    enabled: true, // 启用性能监控
    detailed: true, // 详细监控信息
    threshold: 100 // 性能阈值(ms)，超过会发出警告
  },

  // 缓存配置
  cache: {
    enabled: true, // 启用缓存
    maxSize: 1000, // 最大缓存条目数
    ttl: 300000 // 缓存过期时间(ms)
  },

  // 调试模式
  debug: true,

  // 自定义插件
  plugins: [
    // 可以添加自定义插件
  ]
})
```

## 🔧 高级用法

### 错误处理
```typescript
import { CryptoError, CryptoErrorType } from '@ldesign/crypto'

try {
  const result = await crypto.aesEncrypt(data, config)
}
 catch (error) {
  if (error instanceof CryptoError) {
    console.log('错误类型:', error.type)
    console.log('算法:', error.algorithm)
    console.log('详细信息:', error.details)

    switch (error.type) {
      case CryptoErrorType.INVALID_KEY:
        console.log('密钥无效')
        break
      case CryptoErrorType.ENCRYPTION_FAILED:
        console.log('加密失败')
        break
      case CryptoErrorType.DECRYPTION_FAILED:
        console.log('解密失败')
        break
    }
  }
}
```

### 自定义插件
```typescript
import type { CryptoPlugin } from '@ldesign/crypto'

const customPlugin: CryptoPlugin = {
  name: 'custom-algorithm',
  algorithms: ['CUSTOM'],

  async init() {
    console.log('自定义插件初始化')
  },

  async destroy() {
    console.log('自定义插件销毁')
  }
}

// 注册插件
await crypto.registerPlugin(customPlugin)
```

### 性能优化建议
```typescript
// ✅ 推荐：复用加密实例
const crypto = createCrypto()
await crypto.init()

// ✅ 推荐：启用缓存提升性能
const crypto = createCrypto({
  cache: { enabled: true, maxSize: 1000 }
})

// ✅ 推荐：批量操作
const results = await Promise.all([
  crypto.sha256('data1'),
  crypto.sha256('data2'),
  crypto.sha256('data3')
])

// ✅ 推荐：使用强密钥
const key = crypto.generateKey('AES', 256) // 256位密钥
```

## 🛡️ 安全建议

### 密钥管理最佳实践
- ✅ 使用强随机数生成器生成密钥
- ✅ 定期轮换密钥
- ✅ 安全存储私钥，避免泄露
- ❌ 不要在代码中硬编码密钥
- ❌ 不要在日志中输出密钥信息

### 算法选择建议
- ✅ **推荐**: AES-256、RSA-2048、SHA-256、SM2/SM3/SM4
- ⚠️ **谨慎使用**: DES、3DES、MD5、SHA-1
- ❌ **不推荐**: RC4、弱密钥长度

### 安全实施示例
```typescript
// ✅ 安全的加密实现
const key = crypto.generateKey('AES', 256) // 强密钥
const result = await crypto.aesEncrypt(data, {
  key,
  mode: 'GCM', // 认证加密模式
  padding: 'PKCS7'
})

// ❌ 不安全的实现
const result = await crypto.desEncrypt(data, {
  key: 'weakkey', // 弱密钥
  mode: 'ECB' // 不安全的模式
})
```

## 🧪 测试和示例

### 运行测试
```bash
# 运行所有测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage

# 运行测试UI
pnpm test:ui
```

### 运行示例
```bash
# 基础使用示例
pnpm tsx examples/basic-usage.ts

# Vue组件示例
# 在Vue项目中导入 examples/CryptoDemo.vue
```

### 性能基准测试
```bash
# 运行性能基准测试
pnpm benchmark
```

## 📊 支持的算法

| 类型 | 算法 | 密钥长度 | 状态 | 说明 |
|------|------|----------|------|------|
| **对称加密** | AES | 128/192/256位 | ✅ | 推荐使用 |
| | DES | 64位 | ⚠️ | 仅兼容性支持 |
| | 3DES | 192位 | ⚠️ | 仅兼容性支持 |
| **非对称加密** | RSA | 1024/2048/4096位 | ✅ | 推荐2048位以上 |
| | ECC | P-256/P-384/P-521 | ✅ | 高效椭圆曲线 |
| **哈希算法** | MD5 | - | ⚠️ | 仅兼容性支持 |
| | SHA-1 | - | ⚠️ | 仅兼容性支持 |
| | SHA-256 | - | ✅ | 推荐使用 |
| | SHA-512 | - | ✅ | 推荐使用 |
| **国密算法** | SM2 | 256位 | ✅ | 国产椭圆曲线 |
| | SM3 | - | ✅ | 国产哈希算法 |
| | SM4 | 128位 | ✅ | 国产分组密码 |

## 🌍 浏览器兼容性

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 88+ | ✅ 完全支持 |
| Firefox | 85+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Edge | 88+ | ✅ 完全支持 |
| Node.js | 16+ | ✅ 完全支持 |

## 📈 性能数据

基于现代浏览器的性能测试结果：

| 操作 | 数据大小 | 平均耗时 | 吞吐量 |
|------|----------|----------|--------|
| AES-256加密 | 1MB | ~15ms | ~67MB/s |
| RSA-2048加密 | 1KB | ~5ms | ~200KB/s |
| SHA-256哈希 | 1MB | ~8ms | ~125MB/s |
| SM2加密 | 1KB | ~12ms | ~83KB/s |
| SM4加密 | 1MB | ~18ms | ~56MB/s |

*测试环境: Chrome 120, Intel i7-12700K, 32GB RAM*

## 🔄 更新日志

### v1.0.0 (2024-01-XX)
- ✨ 初始版本发布
- 🔐 支持主流对称/非对称加密算法
- 🇨🇳 完整的国密算法支持(SM2/SM3/SM4)
- 🎨 Vue 3组合式API集成
- 📊 性能监控和智能缓存
- 🔧 插件化架构设计
- 📚 完整的TypeScript类型定义
- 🧪 全面的单元测试覆盖
- 📖 详细的文档和示例

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发环境设置
```bash
# 克隆项目
git clone https://github.com/ldesign/crypto.git
cd crypto

# 安装依赖
pnpm install

# 运行开发模式
pnpm dev

# 运行测试
pnpm test
```

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建/工具相关

### 报告问题
请在 [GitHub Issues](https://github.com/ldesign/crypto/issues) 中报告问题，包含：
- 详细的问题描述
- 复现步骤
- 环境信息
- 错误日志

## 📞 技术支持

- 📧 邮箱: support@ldesign.com
- 💬 讨论区: [GitHub Discussions](https://github.com/ldesign/crypto/discussions)
- 📖 文档: [在线文档](https://ldesign.com/crypto)
- 🐛 问题反馈: [GitHub Issues](https://github.com/ldesign/crypto/issues)

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)

## 🙏 致谢

感谢以下开源项目的支持：
- [crypto-js](https://github.com/brix/crypto-js) - JavaScript加密库
- [sm-crypto](https://github.com/JuneAndGreen/sm-crypto) - 国密算法实现
- [node-forge](https://github.com/digitalbazaar/forge) - TLS和加密库
- [jsencrypt](https://github.com/travist/jsencrypt) - RSA加密库

## 🔗 相关链接

- [LDesign 官网](https://ldesign.com)
- [API 文档](https://ldesign.com/crypto/api)
- [示例代码](./examples)
- [更新日志](./CHANGELOG.md)
- [贡献指南](./CONTRIBUTING.md)

---

<div align="center">
  <p>🔐 让加密变得简单而安全</p>
  <p>Made with ❤️ by LDesign Team</p>
</div>
