# @ldesign/crypto 构建和测试指南

## 🔧 构建所有包

### 前置条件

```bash
# 确保在 ldesign 根目录
cd d:/WorkBench/ldesign

# 安装所有依赖
pnpm install
```

### 构建顺序

由于子包之间有依赖关系，建议按以下顺序构建：

#### 1. 构建核心包（无依赖）

```bash
cd packages/crypto/packages/core
pnpm build
```

**预期输出**：
- `es/` - ESM 格式
- `lib/` - CJS 格式
- `dist/` - UMD 格式（压缩）

#### 2. 构建工具包（依赖 core）

```bash
# Utils
cd ../utils
pnpm build

# Stream
cd ../stream
pnpm build

# Workers
cd ../workers
pnpm build
```

#### 3. 构建框架适配器（依赖 core）

```bash
# Vue
cd ../vue
pnpm build

# React
cd ../react
pnpm build

# Solid
cd ../solid
pnpm build

# Svelte
cd ../svelte
pnpm build

# Angular
cd ../angular
pnpm build
```

### 一键构建所有包

```bash
# 在 packages/crypto 目录
cd packages/crypto

# 构建所有子包
pnpm build

# 这会执行：
# pnpm -r --filter './packages/*' build
```

## ✅ 验证构建

### 检查输出文件

```bash
# 核心包
ls -la packages/core/es/
ls -la packages/core/lib/
ls -la packages/core/dist/

# Vue 包
ls -la packages/vue/es/
ls -la packages/vue/lib/

# React 包
ls -la packages/react/es/
ls -la packages/react/lib/
```

### 检查类型文件

```bash
# 确保每个包都有 .d.ts 文件
find packages -name "*.d.ts" -type f
```

## 🧪 测试指南

### 单元测试

```bash
# 测试所有包
cd packages/crypto
pnpm test

# 测试特定包
pnpm --filter @ldesign/crypto-core test
pnpm --filter @ldesign/crypto-vue test
```

### 类型检查

```bash
# 检查所有包的类型
pnpm type-check

# 检查特定包
pnpm --filter @ldesign/crypto-core type-check
```

### Lint 检查

```bash
# Lint 所有包
pnpm lint

# 自动修复
pnpm lint:fix
```

## 🚀 运行演示

### Vue 3 演示

```bash
cd demo
pnpm dev

# 访问 http://localhost:5175
```

### 创建其他框架演示

#### React 演示模板

```bash
mkdir -p examples/react-demo
cd examples/react-demo

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "@ldesign/crypto-react-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "launcher dev",
    "build": "launcher build"
  },
  "dependencies": {
    "@ldesign/crypto-core": "workspace:*",
    "@ldesign/crypto-react": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@ldesign/launcher": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.7.3"
  }
}
EOF

# 创建 launcher.config.ts
cat > launcher.config.ts << 'EOF'
import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    open: true,
  },
})
EOF

# 创建 index.html
mkdir src
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Crypto React Demo</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
EOF

# 创建 src/main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

# 创建 src/App.tsx
cat > src/App.tsx << 'EOF'
import { useCrypto } from '@ldesign/crypto-react'

export default function App() {
  const { encryptData, decryptData, loading } = useCrypto()
  
  return (
    <div>
      <h1>Crypto React Demo</h1>
      <button disabled={loading}>
        {loading ? 'Processing...' : 'Test Crypto'}
      </button>
    </div>
  )
}
EOF
```

## 🐛 常见问题

### 问题 1：找不到模块

**错误**：`Cannot find module '@ldesign/crypto-core'`

**解决**：
```bash
# 确保安装了所有依赖
pnpm install

# 确保 core 包已构建
cd packages/core
pnpm build
```

### 问题 2：类型错误

**错误**：`Type error: Cannot find type definitions`

**解决**：
```bash
# 确保生成了类型文件
pnpm build

# 检查 tsconfig.json 中的 paths 配置
```

### 问题 3：构建失败

**错误**：`Build failed with errors`

**解决**：
1. 检查是否有 lint 错误：`pnpm lint`
2. 检查类型错误：`pnpm type-check`
3. 查看详细日志：`pnpm build --verbose`

### 问题 4：源代码缺失

**错误**：`Source file not found`

**解决**：
需要将现有的 `src/` 代码迁移到相应的子包中。参考 `MIGRATION_GUIDE.md`。

## 📊 构建检查清单

在提交代码前，确保：

- [ ] 所有子包能成功构建
- [ ] 生成了正确的输出文件（es/, lib/, dist/）
- [ ] 生成了类型声明文件（.d.ts）
- [ ] Lint 检查通过
- [ ] 类型检查通过
- [ ] 单元测试通过
- [ ] 演示项目能正常运行

## 🎯 构建脚本

在 `packages/crypto/package.json` 中已配置：

```json
{
  "scripts": {
    "build": "pnpm -r --filter './packages/*' build",
    "build:core": "pnpm --filter @ldesign/crypto-core build",
    "build:vue": "pnpm --filter @ldesign/crypto-vue build",
    "build:react": "pnpm --filter @ldesign/crypto-react build",
    "build:solid": "pnpm --filter @ldesign/crypto-solid build",
    "build:svelte": "pnpm --filter @ldesign/crypto-svelte build",
    "build:angular": "pnpm --filter @ldesign/crypto-angular build",
    "dev": "pnpm -r --filter './packages/*' --parallel dev",
    "demo": "pnpm --filter @ldesign/crypto-demo dev",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "type-check": "pnpm -r type-check",
    "clean": "pnpm -r clean"
  }
}
```

## 🚀 发布准备

在发布前：

1. **构建所有包**：`pnpm build`
2. **运行所有测试**：`pnpm test`
3. **检查代码质量**：`pnpm lint`
4. **验证类型**：`pnpm type-check`
5. **测试演示项目**：`pnpm demo`
6. **更新版本号**
7. **更新 CHANGELOG**

## 📝 持续集成

建议配置 CI/CD 自动化：

```yaml
# .github/workflows/build.yml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm type-check
```

---

**构建愉快！** 🎉

