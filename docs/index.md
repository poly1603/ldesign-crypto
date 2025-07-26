---
layout: home

hero:
  name: "@ldesign/crypto"
  text: "功能完整的加解密模块"
  tagline: 支持主流加密算法和中国国密算法，提供简单易用的API
  image:
    src: /logo.svg
    alt: LDesign Crypto
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线演示
      link: /demo/playground
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/crypto

features:
  - icon: 🔐
    title: 主流加密算法
    details: 支持AES、RSA、DES、3DES等主流对称和非对称加密算法，满足各种加密需求
  - icon: 🇨🇳
    title: 国密算法支持
    details: 完整支持SM2、SM3、SM4国密算法，符合中国国家密码标准
  - icon: 🔍
    title: 哈希与签名
    details: 提供MD5、SHA系列哈希算法，支持RSA和SM2数字签名验证
  - icon: 🎨
    title: Vue 3集成
    details: 原生支持Vue 3组合式API，提供响应式的加密操作体验
  - icon: ⚡
    title: 高性能
    details: 内置性能监控和智能缓存，优化加密操作性能
  - icon: 🔧
    title: 插件架构
    details: 模块化设计，支持自定义算法插件，易于扩展
  - icon: 🛡️
    title: 类型安全
    details: 完整的TypeScript类型定义，提供智能提示和类型检查
  - icon: 📚
    title: 详细文档
    details: 完善的文档和示例，包含在线演示和最佳实践指南
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #007bff 30%, #28a745);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #007bff 50%, #28a745 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

## 快速体验

### 安装

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

### 基础使用

```typescript
import { createCrypto } from '@ldesign/crypto'

// 创建加密实例
const crypto = createCrypto()
await crypto.init()

// AES加密
const result = await crypto.aesEncrypt('Hello World', {
  key: '12345678901234567890123456789012',
  mode: 'CBC'
})

console.log('加密结果:', result.data)
```

### Vue 3集成

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignCrypto from '@ldesign/crypto'

const app = createApp(App)
app.use(LDesignCrypto)
```

```vue
<!-- 组件中使用 -->
<script setup>
import { useSymmetricCrypto } from '@ldesign/crypto'

const { encrypt, result, isLoading } = useSymmetricCrypto()

const handleEncrypt = () => {
  encrypt('Hello World', { key: 'mykey' })
}
</script>
```

## 支持的算法

| 类型 | 算法 | 状态 | 说明 |
|------|------|------|------|
| **对称加密** | AES | ✅ | 推荐使用，支持多种模式 |
| | DES/3DES | ⚠️ | 兼容性支持 |
| **非对称加密** | RSA | ✅ | 支持多种密钥长度 |
| | ECC | ✅ | 椭圆曲线加密 |
| **哈希算法** | SHA-256/512 | ✅ | 推荐使用 |
| | MD5/SHA-1 | ⚠️ | 兼容性支持 |
| **国密算法** | SM2 | ✅ | 椭圆曲线公钥密码 |
| | SM3 | ✅ | 密码杂凑算法 |
| | SM4 | ✅ | 分组密码算法 |

## 为什么选择 @ldesign/crypto？

### 🎯 功能完整
提供从基础加密到高级功能的完整解决方案，一个库满足所有加密需求。

### 🚀 易于使用
简洁的API设计，详细的文档和示例，让加密操作变得简单。

### 🛡️ 安全可靠
遵循加密最佳实践，支持国际标准和国密算法。

### 🎨 现代化
原生支持TypeScript和Vue 3，提供现代化的开发体验。

### 📊 高性能
内置性能监控和缓存机制，确保最佳的运行性能。

---

<div class="tip custom-block" style="padding-top: 8px">

想要立即体验？试试我们的 [在线演示](/demo/playground) 🚀

</div>
