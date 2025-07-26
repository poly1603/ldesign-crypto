# 快速开始

欢迎使用 @ldesign/crypto！这是一个功能完整的加解密模块，支持主流加密算法和中国国密算法。

## 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/crypto
```

```bash [npm]
npm install @ldesign/crypto
```

```bash [yarn]
yarn add @ldesign/crypto
```

:::

## 基础使用

### 1. 创建加密实例

```typescript
import { createCrypto } from '@ldesign/crypto'

// 创建加密实例
const crypto = createCrypto({
  debug: true,                    // 启用调试模式
  performance: { enabled: true }, // 启用性能监控
  cache: { enabled: true }        // 启用缓存
})

// 初始化
await crypto.init()
```

### 2. 对称加密 (AES)

```typescript
// AES-256 加密
const result = await crypto.aesEncrypt('Hello World', {
  key: '12345678901234567890123456789012', // 32字节密钥
  mode: 'CBC',
  padding: 'PKCS7'
})

console.log('加密结果:', result.data)
console.log('执行时间:', result.duration + 'ms')

// AES-256 解密
const decrypted = await crypto.aesDecrypt(result.data!, {
  key: '12345678901234567890123456789012',
  mode: 'CBC',
  padding: 'PKCS7'
})

console.log('解密结果:', decrypted.data) // "Hello World"
```

### 3. 非对称加密 (RSA)

```typescript
// 生成RSA密钥对
const keyPair = await crypto.generateRSAKeyPair(2048)

// 公钥加密
const encrypted = await crypto.rsaEncrypt('Hello RSA', {
  publicKey: keyPair.publicKey
})

// 私钥解密
const decrypted = await crypto.rsaDecrypt(encrypted.data!, {
  privateKey: keyPair.privateKey
})

console.log('解密结果:', decrypted.data) // "Hello RSA"
```

### 4. 哈希算法

```typescript
// SHA-256 哈希
const hash = await crypto.sha256('Hello Hash')
console.log('SHA-256:', hash.data)

// 带盐值的哈希
const saltedHash = await crypto.sha256('Hello Hash', {
  salt: 'mysalt'
})
console.log('带盐SHA-256:', saltedHash.data)

// PBKDF2 密钥派生
const derivedKey = await crypto.pbkdf2({
  password: 'mypassword',
  salt: 'mysalt',
  iterations: 10000,
  keyLength: 32
})
console.log('派生密钥:', derivedKey.data)
```

### 5. 国密算法

```typescript
// SM2 椭圆曲线加密
const sm2KeyPair = await crypto.generateSM2KeyPair()

const sm2Encrypted = await crypto.sm2Encrypt('Hello SM2', {
  publicKey: sm2KeyPair.publicKey
})

const sm2Decrypted = await crypto.sm2Decrypt(sm2Encrypted.data!, {
  privateKey: sm2KeyPair.privateKey
})

// SM3 哈希
const sm3Hash = await crypto.sm3('Hello SM3')
console.log('SM3哈希:', sm3Hash.data)

// SM4 分组密码
const sm4Key = crypto.generateKey('SM4')
const sm4Encrypted = await crypto.sm4Encrypt('Hello SM4', {
  key: sm4Key
})

const sm4Decrypted = await crypto.sm4Decrypt(sm4Encrypted.data!, {
  key: sm4Key
})
```

## Vue 3 集成

### 1. 安装插件

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignCrypto from '@ldesign/crypto'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(LDesignCrypto, {
  debug: true,
  performance: { enabled: true }
})

app.mount('#app')
```

### 2. 使用组合式API

```vue
<template>
  <div>
    <input v-model="data" placeholder="输入要加密的数据" />
    <button @click="handleEncrypt" :disabled="isLoading">
      {{ isLoading ? '加密中...' : '加密' }}
    </button>
    <div v-if="result">加密结果: {{ result }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSymmetricCrypto } from '@ldesign/crypto'

const { isLoading, error, result, encrypt } = useSymmetricCrypto()

const data = ref('Hello World')

const handleEncrypt = () => {
  encrypt(data.value, {
    key: '12345678901234567890123456789012',
    mode: 'CBC'
  }, 'AES')
}
</script>
```

## 工具方法

```typescript
// 生成随机字符串
const randomHex = crypto.generateRandom({
  length: 32,
  charset: 'hex'
})

// 生成密钥
const aesKey = crypto.generateKey('AES', 256)
const sm4Key = crypto.generateKey('SM4')

// 性能监控
const metrics = crypto.getPerformanceMetrics()
console.log('性能指标:', metrics)

// 缓存管理
const cacheInfo = crypto.getCacheInfo()
crypto.clearCache()
```

## 错误处理

```typescript
import { CryptoError, CryptoErrorType } from '@ldesign/crypto'

try {
  const result = await crypto.aesEncrypt(data, config)
} catch (error) {
  if (error instanceof CryptoError) {
    switch (error.type) {
      case CryptoErrorType.INVALID_KEY:
        console.log('密钥无效')
        break
      case CryptoErrorType.ENCRYPTION_FAILED:
        console.log('加密失败')
        break
      default:
        console.log('其他错误:', error.message)
    }
  }
}
```

## 配置选项

```typescript
const crypto = createCrypto({
  // 默认编码格式
  defaultEncoding: 'hex',
  
  // 性能监控
  performance: {
    enabled: true,        // 启用性能监控
    detailed: true,       // 详细监控信息
    threshold: 100        // 性能阈值(ms)
  },
  
  // 缓存配置
  cache: {
    enabled: true,        // 启用缓存
    maxSize: 1000,        // 最大缓存条目数
    ttl: 300000          // 缓存过期时间(ms)
  },
  
  // 调试模式
  debug: true
})
```

## 下一步

- 📚 查看 [API 文档](/api/crypto-api) 了解详细的API参考
- 🎮 体验 [在线演示](/demo/playground) 实时测试各种算法
- 📖 阅读 [算法指南](/guide/symmetric) 深入了解各种加密算法
- 🔧 学习 [高级功能](/guide/performance) 如性能监控和插件开发

## 常见问题

### Q: 如何选择合适的加密算法？
A: 推荐使用 AES-256、RSA-2048、SHA-256 等强加密算法。国密算法适用于符合国家标准的场景。

### Q: 密钥应该如何管理？
A: 使用强随机数生成器生成密钥，定期轮换，安全存储，避免在代码中硬编码。

### Q: 性能如何优化？
A: 启用缓存机制，复用加密实例，使用批量操作，选择合适的算法和参数。

::: tip 提示
想要更直观的体验？试试我们的 [在线演示](/demo/playground)，你可以实时测试各种加密算法！
:::
