# 安装配置

本指南将帮助你在项目中安装和配置 @ldesign/crypto。

## 环境要求

### 浏览器支持

| 浏览器 | 版本要求 | 状态 |
|--------|----------|------|
| Chrome | 88+ | ✅ 完全支持 |
| Firefox | 85+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Edge | 88+ | ✅ 完全支持 |

### Node.js 支持

- **Node.js**: 16.0.0 或更高版本
- **npm**: 7.0.0 或更高版本
- **TypeScript**: 4.5.0 或更高版本（可选）

## 安装方式

### 使用包管理器安装

::: code-group

```bash [pnpm (推荐)]
# 安装核心包
pnpm add @ldesign/crypto

# 如果使用 TypeScript
pnpm add -D @types/node
```

```bash [npm]
# 安装核心包
npm install @ldesign/crypto

# 如果使用 TypeScript
npm install -D @types/node
```

```bash [yarn]
# 安装核心包
yarn add @ldesign/crypto

# 如果使用 TypeScript
yarn add -D @types/node
```

:::

### CDN 引入

```html
<!-- 生产版本 -->
<script src="https://unpkg.com/@ldesign/crypto@latest/dist/index.umd.js"></script>

<!-- 开发版本 -->
<script src="https://unpkg.com/@ldesign/crypto@latest/dist/index.umd.dev.js"></script>
```

## 基础配置

### ES 模块

```typescript
import { createCrypto } from '@ldesign/crypto'

// 创建加密实例
const crypto = createCrypto({
  debug: true,                    // 开发模式启用调试
  performance: { enabled: true }, // 启用性能监控
  cache: { enabled: true }        // 启用缓存
})

// 初始化
await crypto.init()
```

### CommonJS

```javascript
const { createCrypto } = require('@ldesign/crypto')

async function setupCrypto() {
  const crypto = createCrypto({
    debug: process.env.NODE_ENV === 'development',
    performance: { enabled: true },
    cache: { enabled: true }
  })
  
  await crypto.init()
  return crypto
}
```

### UMD (浏览器)

```html
<script src="https://unpkg.com/@ldesign/crypto@latest/dist/index.umd.js"></script>
<script>
  const { createCrypto } = LDesignCrypto
  
  async function init() {
    const crypto = createCrypto({
      debug: true,
      performance: { enabled: true }
    })
    
    await crypto.init()
    
    // 使用加密功能
    const result = await crypto.sha256('Hello World')
    console.log('SHA256:', result.data)
  }
  
  init()
</script>
```

## 配置选项

### 完整配置示例

```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto({
  // 默认编码格式
  defaultEncoding: 'hex',
  
  // 性能监控配置
  performance: {
    enabled: true,        // 启用性能监控
    detailed: true,       // 详细监控信息
    threshold: 100        // 性能阈值(ms)，超过会发出警告
  },
  
  // 缓存配置
  cache: {
    enabled: true,        // 启用缓存
    maxSize: 1000,        // 最大缓存条目数
    ttl: 300000          // 缓存过期时间(ms)
  },
  
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 自定义插件
  plugins: [
    // 可以添加自定义插件
  ]
})
```

### 配置选项说明

#### defaultEncoding
- **类型**: `'hex' | 'base64' | 'utf8' | 'binary'`
- **默认值**: `'hex'`
- **说明**: 默认的编码格式

#### performance
- **enabled**: 是否启用性能监控
- **detailed**: 是否记录详细的性能信息
- **threshold**: 性能阈值，超过此时间的操作会发出警告

#### cache
- **enabled**: 是否启用缓存
- **maxSize**: 最大缓存条目数
- **ttl**: 缓存过期时间（毫秒）

#### debug
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用调试模式，会输出详细的日志信息

## 环境变量配置

### Node.js 环境

```bash
# .env 文件
CRYPTO_DEBUG=true
CRYPTO_CACHE_SIZE=1000
CRYPTO_CACHE_TTL=300000
CRYPTO_PERFORMANCE_THRESHOLD=100
```

```typescript
// 使用环境变量
const crypto = createCrypto({
  debug: process.env.CRYPTO_DEBUG === 'true',
  cache: {
    enabled: true,
    maxSize: parseInt(process.env.CRYPTO_CACHE_SIZE || '1000'),
    ttl: parseInt(process.env.CRYPTO_CACHE_TTL || '300000')
  },
  performance: {
    enabled: true,
    threshold: parseInt(process.env.CRYPTO_PERFORMANCE_THRESHOLD || '100')
  }
})
```

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __CRYPTO_DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  optimizeDeps: {
    include: ['@ldesign/crypto']
  }
})
```

### Webpack 配置

```javascript
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      __CRYPTO_DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development')
    })
  ],
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    }
  }
}
```

## 框架集成

### Vue 3 项目

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignCrypto from '@ldesign/crypto'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(LDesignCrypto, {
  debug: import.meta.env.DEV,
  performance: { enabled: true },
  cache: { enabled: true }
})

app.mount('#app')
```

### React 项目

```typescript
// App.tsx
import { createCrypto } from '@ldesign/crypto'
import { createContext, useContext, useEffect, useState } from 'react'

const CryptoContext = createContext(null)

export function CryptoProvider({ children }) {
  const [crypto, setCrypto] = useState(null)
  
  useEffect(() => {
    const initCrypto = async () => {
      const instance = createCrypto({
        debug: process.env.NODE_ENV === 'development',
        performance: { enabled: true }
      })
      await instance.init()
      setCrypto(instance)
    }
    
    initCrypto()
  }, [])
  
  return (
    <CryptoContext.Provider value={crypto}>
      {children}
    </CryptoContext.Provider>
  )
}

export const useCrypto = () => useContext(CryptoContext)
```

### Nuxt 3 项目

```typescript
// plugins/crypto.client.ts
import { createCrypto } from '@ldesign/crypto'

export default defineNuxtPlugin(async () => {
  const crypto = createCrypto({
    debug: process.dev,
    performance: { enabled: true }
  })
  
  await crypto.init()
  
  return {
    provide: {
      crypto
    }
  }
})
```

## 验证安装

### 基础功能测试

```typescript
import { createCrypto } from '@ldesign/crypto'

async function testInstallation() {
  try {
    // 创建实例
    const crypto = createCrypto({ debug: true })
    await crypto.init()
    
    // 测试哈希功能
    const hash = await crypto.sha256('Hello World')
    console.log('✅ 哈希功能正常:', hash.data)
    
    // 测试AES加密
    const key = crypto.generateKey('AES', 256)
    const encrypted = await crypto.aesEncrypt('Test Data', {
      key,
      mode: 'CBC'
    })
    console.log('✅ AES加密功能正常:', encrypted.success)
    
    // 测试国密算法
    const sm3Hash = await crypto.sm3('Hello SM3')
    console.log('✅ 国密算法正常:', sm3Hash.data)
    
    console.log('🎉 安装验证成功！')
    
  } catch (error) {
    console.error('❌ 安装验证失败:', error)
  }
}

testInstallation()
```

### 性能测试

```typescript
async function performanceTest() {
  const crypto = createCrypto({
    performance: { enabled: true }
  })
  await crypto.init()
  
  // 执行一些操作
  await crypto.sha256('test')
  await crypto.md5('test')
  
  // 查看性能指标
  const metrics = crypto.getPerformanceMetrics()
  console.log('性能指标:', metrics)
}
```

## 常见问题

### Q: 在浏览器中出现 "crypto is not defined" 错误？
A: 这通常是因为浏览器兼容性问题。确保使用支持的浏览器版本，或者添加 polyfill。

### Q: Node.js 环境中出现模块导入错误？
A: 确保 Node.js 版本 >= 16，并且正确配置了 ES 模块支持。

### Q: 打包后体积过大？
A: 启用 tree shaking，只导入需要的功能：

```typescript
// 按需导入
import { HashCrypto } from '@ldesign/crypto/hash'
import { SymmetricCrypto } from '@ldesign/crypto/symmetric'
```

### Q: TypeScript 类型错误？
A: 确保安装了类型定义，并在 tsconfig.json 中正确配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 下一步

- 阅读 [基础概念](/guide/concepts) 了解核心概念
- 查看 [快速开始](/guide/getting-started) 开始使用
- 体验 [在线演示](/demo/playground) 实时测试功能
