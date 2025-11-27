# 🔄 Crypto包重构迁移指南

## 📋 概述

本项目已完成从单体结构到monorepo结构的重构,将框架无关的核心代码迁移到`@ldesign/crypto-core`,Vue特定的功能封装在`@ldesign/crypto-vue`中。

## 🏗️ 新的包结构

```
packages/
├── core/              # @ldesign/crypto-core - 框架无关的核心库
│   ├── src/
│   │   ├── algorithms/    # 加密算法实现
│   │   ├── core/          # 核心功能类
│   │   ├── utils/         # 工具函数(含环境检测)
│   │   ├── workers/       # Web Workers支持
│   │   ├── wasm/          # WebAssembly加速
│   │   ├── stream/        # 流式处理
│   │   ├── types/         # TypeScript类型定义
│   │   ├── index.ts       # 主入口
│   │   └── index.lazy.ts  # 懒加载入口
│   └── package.json
│
└── vue/               # @ldesign/crypto-vue - Vue 3框架适配器
    ├── src/
    │   ├── composables/   # Vue组合式函数
    │   ├── plugin.ts      # Vue插件
    │   └── index.ts       # 主入口
    └── package.json
```

## ✨ 新增功能

### 1. 环境检测模块

自动识别运行环境(浏览器/Node.js):

```typescript
import { getEnv, isBrowser, isNode } from '@ldesign/crypto-core'

// 获取环境信息
const env = getEnv()
console.log(env.type) // 'browser' | 'node' | 'worker' | 'unknown'
console.log(env.hasWebCrypto) // 是否支持Web Crypto API
console.log(env.hasNodeCrypto) // 是否支持Node.js crypto模块

// 直接检测
if (isBrowser()) {
  // 浏览器特定代码
}

if (isNode()) {
  // Node.js特定代码
}
```

### 2. 懒加载支持

按需加载模块,减少初始包体积:

```typescript
// 使用懒加载入口
import { encrypt, decrypt, aes, rsa } from '@ldesign/crypto-core/lazy'

// 函数会在首次调用时才加载对应模块
const encrypted = await encrypt('data', 'key', 'AES')
const decrypted = await decrypt(encrypted, 'key')

// 预加载指定模块
import { preload } from '@ldesign/crypto-core/lazy'
await preload(['algorithms', 'utils'])
```

## 📦 使用方式

### 安装

```bash
# 仅使用核心功能(框架无关)
pnpm add @ldesign/crypto-core

# 在Vue项目中使用
pnpm add @ldesign/crypto-vue
```

### 核心包使用

```typescript
// 方式1: 导入具体功能
import { aes, rsa, hash, encrypt, decrypt } from '@ldesign/crypto-core'

// AES加密
const result = aes.encrypt('sensitive data', 'my-secret-key')

// RSA加密
const keyPair = rsa.generateKeyPair(2048)
const encrypted = rsa.encrypt('data', keyPair.publicKey)

// 哈希
const hashed = hash.sha256('password')

// 方式2: 使用默认导出对象
import crypto from '@ldesign/crypto-core'

const encrypted = crypto.algorithms.aes.encrypt('data', 'key')
const hashed = crypto.hash.hash('data', 'SHA256')
```

### Vue包使用

```typescript
// 1. 安装插件
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto-vue'

const app = createApp(App)
app.use(CryptoPlugin)

// 2. 使用组合式函数
import { useCrypto } from '@ldesign/crypto-vue'

export default {
  setup() {
    const { encrypt, decrypt, loading, error } = useCrypto()
    
    const handleEncrypt = async () => {
      const result = await encrypt('data', 'key')
      console.log(result)
    }
    
    return { encrypt, decrypt, loading, error, handleEncrypt }
  }
}

// 3. 使用全局属性
export default {
  mounted() {
    const encrypted = this.$crypto.aes.encrypt('data', 'key')
  }
}
```

## 🔧 导出模块

### @ldesign/crypto-core 导出

```typescript
// 主入口
import * from '@ldesign/crypto-core'

// 子模块入口
import * from '@ldesign/crypto-core/algorithms'
import * from '@ldesign/crypto-core/core'
import * from '@ldesign/crypto-core/utils'
import * from '@ldesign/crypto-core/workers'
import * from '@ldesign/crypto-core/stream'
import * from '@ldesign/crypto-core/types'

// 懒加载入口
import * from '@ldesign/crypto-core/lazy'

// WASM模块(懒加载)
import { cryptoWasm } from '@ldesign/crypto-core/wasm/crypto-wasm'
```

### @ldesign/crypto-vue 导出

```typescript
// 主入口
import { CryptoPlugin, useCrypto, useHash, useEncryption } from '@ldesign/crypto-vue'

// 组合式函数
import { useCrypto } from '@ldesign/crypto-vue/composables'
```

## 🚀 下一步操作

1. **构建packages**
   ```bash
   pnpm build:core
   pnpm build:vue
   ```

2. **运行测试**
   ```bash
   pnpm test
   ```

3. **验证功能**
   - 测试`@ldesign/crypto-core`独立使用
   - 测试`@ldesign/crypto-vue`在Vue项目中的集成

4. **清理旧代码**
   ```bash
   # 确认一切正常后删除src/目录
   rm -rf src/
   ```

## ⚠️ Breaking Changes

### API变更

1. **导入路径变更**
   ```typescript
   // 旧的
   import { aes } from '@ldesign/crypto'
   
   // 新的
   import { aes } from '@ldesign/crypto-core'
   ```

2. **Vue插件变更**
   ```typescript
   // 旧的
   import { CryptoPlugin } from '@ldesign/crypto/vue'
   
   // 新的
   import { CryptoPlugin } from '@ldesign/crypto-vue'
   ```

3. **API调用方式调整**
   ```typescript
   // 旧的
   import { encrypt } from '@ldesign/crypto'
   encrypt.aes('data', 'key')
   
   // 新的
   import { aes } from '@ldesign/crypto-core'
   aes.encrypt('data', 'key')
   ```

## 📚 更多资源

- [Core包文档](./packages/core/README.md)
- [Vue包文档](./packages/vue/README.md)
- [API参考](./docs/api.md)

## ❓ 常见问题

### Q: 如何迁移现有代码?
A: 主要是更新导入路径,API基本保持兼容。参考上面的"API变更"部分。

### Q: 性能有影响吗?
A: 没有负面影响。懒加载功能反而可以减少初始加载时间。

### Q: 是否需要同时安装两个包?
A: Vue项目只需安装`@ldesign/crypto-vue`,它会自动依赖`@ldesign/crypto-core`。

### Q: TypeScript类型定义在哪里?
A: 类型定义已包含在包中,导入时会自动识别。

## 🤝 贡献

欢迎提交Issue和Pull Request!

## 📄 License

MIT