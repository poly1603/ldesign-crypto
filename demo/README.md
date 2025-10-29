# @ldesign/crypto 演示项目

> 🔐 完整展示 @ldesign/crypto 加密库的各项功能

[![Built with @ldesign/launcher](https://img.shields.io/badge/Built%20with-@ldesign%2Flauncher-blue)](https://github.com/ldesign/launcher)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green)](https://vuejs.org/)

## 📖 项目简介

这是一个基于 **@ldesign/launcher** 构建的 Vue 3 演示应用，全面展示了 `@ldesign/crypto` 加密库的核心功能。

## ✨ 功能演示

### 1. 🔒 AES 对称加密
- 支持 AES-128/192/256 多种密钥长度
- CBC 模式加密演示
- 实时加密/解密操作
- 密文复制和结果验证

### 2. 🔑 RSA 非对称加密
- RSA 密钥对生成（1024/2048/4096 位）
- 公钥加密、私钥解密演示
- 密钥显示和管理
- 安全使用建议

### 3. #️⃣ 哈希算法
- MD5、SHA-1、SHA-256、SHA-512 多种算法
- 实时哈希计算
- 算法性能和安全性对比
- 应用场景展示

### 4. 💪 密码强度检测
- 实时密码强度分析
- 详细的安全评分
- 字符类型和长度检测
- 破解时间估算
- 改进建议

### 5. ⚡ 性能基准测试
- 多种算法性能对比
- 可配置的测试参数
- 详细的性能指标
- 吞吐量计算
- 性能优化建议

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 启动开发服务器

```bash
# 方式 1: 从 crypto 包根目录启动
cd packages/crypto
pnpm demo

# 方式 2: 直接在 demo 目录启动
cd packages/crypto/demo
pnpm dev
```

开发服务器将在 http://localhost:5175 启动

### 构建生产版本

```bash
# 在 demo 目录
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
demo/
├── src/
│   ├── components/           # 演示组件
│   │   ├── AESDemo.vue      # AES 加密演示
│   │   ├── RSADemo.vue      # RSA 加密演示
│   │   ├── HashDemo.vue     # 哈希算法演示
│   │   ├── PasswordStrengthDemo.vue  # 密码强度演示
│   │   ├── PerformanceDemo.vue       # 性能测试演示
│   │   └── demo-styles.css  # 共享样式
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 应用入口
│   └── style.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── launcher.config.ts       # Launcher 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置

```

## 🔧 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **@ldesign/launcher** - 基于 Vite 的项目启动器
- **@ldesign/crypto** - 全面的加密解密库

## 🎯 使用的加密功能

### 导入方式

```typescript
import {
  encrypt,
  decrypt,
  hash,
  rsa,
  PasswordStrengthChecker,
  PerformanceMonitor,
} from '@ldesign/crypto'
```

### AES 加密示例

```typescript
// 加密
const encrypted = await encrypt.aes('Hello, World!', 'my-secret-key', {
  mode: 'CBC',
  keySize: 256,
})

// 解密
const decrypted = await decrypt.aes(encrypted.data, 'my-secret-key', {
  mode: 'CBC',
  keySize: 256,
})
```

### RSA 加密示例

```typescript
// 生成密钥对
const keyPair = await rsa.generateKeyPair({ keySize: 2048 })

// 加密
const encrypted = await rsa.encrypt('Hello, World!', keyPair.data.publicKey)

// 解密
const decrypted = await rsa.decrypt(encrypted.data, keyPair.data.privateKey)
```

### 哈希计算示例

```typescript
// SHA-256
const hash256 = await hash.sha256('Hello, World!')

// MD5
const hashMd5 = await hash.md5('Hello, World!')
```

### 密码强度检测示例

```typescript
const checker = new PasswordStrengthChecker()
const analysis = checker.analyze('MyP@ssw0rd123')

console.log(analysis.strength)      // 密码强度 (0-4)
console.log(analysis.score)         // 安全评分 (0-100)
console.log(analysis.suggestions)   // 改进建议
```

## 🎨 样式系统

项目使用 CSS 变量实现统一的设计系统：

```css
:root {
  --color-primary: #667eea;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  /* ... 更多变量 */
}
```

支持暗色模式自动适配。

## 📝 配置说明

### Launcher 配置

`launcher.config.ts` 使用 @ldesign/launcher 的配置系统：

```typescript
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,
    open: true,
  },
  resolve: {
    alias: [
      { find: '@ldesign/crypto', replacement: '../src/index.ts' },
    ],
  },
})
```

### TypeScript 配置

项目使用严格的 TypeScript 配置，确保类型安全。

## 🔗 相关链接

- [@ldesign/crypto 文档](../README.md)
- [@ldesign/launcher 文档](../../../tools/launcher/README.md)
- [@ldesign/builder 文档](../../../tools/builder/README.md)
- [Vue 3 文档](https://vuejs.org/)

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Made with ❤️ by LDesign Team**


