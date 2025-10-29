# @ldesign/crypto 子包迁移指南

> 🔄 将现有代码迁移到子包结构

## 📋 迁移概述

本指南说明如何将 `src/` 目录下的代码迁移到相应的子包中。

## 🗺️ 代码映射关系

### 1. @ldesign/crypto-core

迁移以下目录到 `packages/core/src/`：

```
src/algorithms/     → packages/core/src/algorithms/
src/core/          → packages/core/src/core/
src/types/         → packages/core/src/types/
```

**包含文件**：
- ✅ `algorithms/*` - 所有算法实现
- ✅ `core/*` - 核心加密功能
- ✅ `types/*` - 类型定义

### 2. @ldesign/crypto-vue

迁移以下目录到 `packages/vue/src/`：

```
src/adapt/vue/     → packages/vue/src/
src/vue.ts         → packages/vue/src/vue.ts
```

**包含文件**：
- ✅ `adapt/vue/composables/*` - Vue composables
- ✅ `adapt/vue/plugin.ts` - Vue plugin
- ✅ `vue.ts` - Vue 入口文件

### 3. @ldesign/crypto-utils

迁移以下文件到 `packages/utils/src/`：

```
src/utils/         → packages/utils/src/
```

**包含文件**：
- ✅ `password-strength.ts`
- ✅ `performance-monitor.ts`
- ✅ `key-derivation.ts`
- ✅ `key-rotation.ts`
- ✅ `secure-storage.ts`
- ✅ `rate-limiter.ts`
- ✅ `lru-cache.ts`
- ✅ `crypto-helpers.ts`
- ✅ `errors.ts`
- ✅ `benchmark.ts`
- ✅ `compression.ts`
- ✅ 其他工具文件

### 4. @ldesign/crypto-stream

迁移以下目录到 `packages/stream/src/`：

```
src/stream/        → packages/stream/src/
```

**包含文件**：
- ✅ `file-encryptor.ts`
- ✅ `types.ts`
- ✅ `index.ts`

### 5. @ldesign/crypto-workers

迁移以下目录到 `packages/workers/src/`：

```
src/workers/       → packages/workers/src/
```

**包含文件**：
- ✅ `crypto.worker.ts`
- ✅ `worker-pool.ts`
- ✅ `index.ts`

## 🔧 迁移步骤

### 方式一：手动迁移

1. **创建目标目录**：
   ```bash
   # 核心包
   mkdir -p packages/core/src/{algorithms,core,types}
   
   # Vue 包
   mkdir -p packages/vue/src/composables
   
   # Utils 包
   mkdir -p packages/utils/src
   
   # Stream 包
   mkdir -p packages/stream/src
   
   # Workers 包
   mkdir -p packages/workers/src
   ```

2. **复制文件**：
   ```bash
   # 核心包
   cp -r src/algorithms/* packages/core/src/algorithms/
   cp -r src/core/* packages/core/src/core/
   cp -r src/types/* packages/core/src/types/
   
   # Vue 包
   cp -r src/adapt/vue/* packages/vue/src/
   cp src/vue.ts packages/vue/src/
   
   # Utils 包
   cp -r src/utils/* packages/utils/src/
   
   # Stream 包
   cp -r src/stream/* packages/stream/src/
   
   # Workers 包
   cp -r src/workers/* packages/workers/src/
   ```

3. **更新导入路径**：

   在迁移后的文件中，更新导入路径：

   ```typescript
   // 之前
   import { encrypt } from '../core/crypto'
   import { AESEncryptor } from '../algorithms/aes'
   
   // 之后（在子包内）
   import { encrypt } from './core/crypto'
   import { AESEncryptor } from './algorithms/aes'
   
   // 跨子包引用
   import { encrypt } from '@ldesign/crypto-core'
   ```

### 方式二：使用迁移脚本

创建自动化迁移脚本 `scripts/migrate-to-packages.ts`：

```typescript
import { cpSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const migrations = [
  {
    source: 'src/algorithms',
    target: 'packages/core/src/algorithms',
  },
  {
    source: 'src/core',
    target: 'packages/core/src/core',
  },
  {
    source: 'src/types',
    target: 'packages/core/src/types',
  },
  {
    source: 'src/adapt/vue',
    target: 'packages/vue/src',
  },
  {
    source: 'src/utils',
    target: 'packages/utils/src',
  },
  {
    source: 'src/stream',
    target: 'packages/stream/src',
  },
  {
    source: 'src/workers',
    target: 'packages/workers/src',
  },
]

console.log('🔄 开始迁移代码到子包...\n')

for (const { source, target } of migrations) {
  const srcPath = resolve(process.cwd(), source)
  const destPath = resolve(process.cwd(), target)
  
  try {
    // 创建目标目录
    mkdirSync(destPath, { recursive: true })
    
    // 复制文件
    cpSync(srcPath, destPath, { recursive: true })
    
    console.log(`✅ ${source} → ${target}`)
  } catch (error) {
    console.error(`❌ 迁移失败: ${source}`)
    console.error(error)
  }
}

console.log('\n✨ 迁移完成！')
console.log('\n📝 下一步：')
console.log('1. 检查并更新各子包的导入路径')
console.log('2. 运行 pnpm build 测试构建')
console.log('3. 运行 pnpm test 测试功能')
```

运行迁移脚本：

```bash
pnpm tsx scripts/migrate-to-packages.ts
```

## ⚠️ 注意事项

### 1. 导入路径更新

迁移后需要更新导入路径：

**packages/core/src/index.ts**:
```typescript
// ❌ 错误 - 旧路径
export * from '../../../src/algorithms'

// ✅ 正确 - 新路径
export * from './algorithms'
```

**packages/vue/src/index.ts**:
```typescript
// ❌ 错误 - 相对路径
export * from '../../../src/core'

// ✅ 正确 - 使用包名
export * from '@ldesign/crypto-core'
```

### 2. 依赖声明

确保每个子包的 `package.json` 正确声明了依赖：

```json
{
  "dependencies": {
    "@ldesign/crypto-core": "workspace:*"
  }
}
```

### 3. 类型引用

更新类型引用：

```typescript
// 之前
import type { EncryptResult } from '../types'

// 之后
import type { EncryptResult } from '@ldesign/crypto-core'
```

## 🧪 验证迁移

### 1. 构建测试

```bash
# 构建所有子包
pnpm build

# 检查构建产物
ls packages/core/es
ls packages/core/lib
ls packages/core/dist
```

### 2. 类型检查

```bash
pnpm type-check
```

### 3. 单元测试

```bash
pnpm test
```

### 4. 演示项目测试

```bash
pnpm demo
```

## 📦 构建顺序

由于子包之间有依赖关系，建议按以下顺序构建：

1. ✅ `@ldesign/crypto-core` (无依赖)
2. ✅ `@ldesign/crypto-utils` (依赖 core)
3. ✅ `@ldesign/crypto-stream` (依赖 core)
4. ✅ `@ldesign/crypto-workers` (依赖 core)
5. ✅ `@ldesign/crypto-vue` (依赖 core)

pnpm workspace 会自动处理构建顺序。

## 🔗 相关文档

- [子包架构说明](./PACKAGES.md)
- [主包 README](./README.md)
- [演示项目](./demo/README.md)

## ❓ 常见问题

### Q: 迁移后原有的 src/ 目录怎么办？

A: 迁移完成并验证无误后，可以删除原有的 `src/` 目录。建议先备份：

```bash
mv src src.backup
```

### Q: 如何处理共享的类型定义？

A: 共享类型应放在 `@ldesign/crypto-core/types` 中，其他包通过导入使用：

```typescript
import type { EncryptResult } from '@ldesign/crypto-core'
```

### Q: 测试文件需要迁移吗？

A: 是的，测试文件应该和源代码一起迁移到对应的子包中。

### Q: 如何处理循环依赖？

A: 避免循环依赖。如果出现，重新设计模块结构，将共享代码提取到 core 包中。

## ✅ 迁移检查清单

- [ ] 所有源代码已迁移到对应子包
- [ ] 导入路径已全部更新
- [ ] 所有子包能够成功构建
- [ ] 类型检查通过
- [ ] 单元测试通过
- [ ] 演示项目正常运行
- [ ] 文档已更新
- [ ] 旧的 src/ 目录已备份/删除

---

**完成迁移后，你将拥有一个清晰、模块化的代码结构！** 🎉


