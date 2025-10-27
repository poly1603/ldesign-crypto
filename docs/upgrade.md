# 升级指南 v2.0

本指南帮助您从 v1.x 升级到 v2.0，了解重大变更和新特性。

## 快速升级

### 1. 更新依赖

```bash
pnpm update @ldesign/crypto
# 或
npm update @ldesign/crypto
# 或
yarn upgrade @ldesign/crypto
```

### 2. 运行测试

```bash
npm test
```

### 3. 检查弃用警告

v2.0 会在使用已弃用 API 时显示警告，请根据警告信息更新代码。

## 重大变更

### 1. API 重命名

#### AES 相关

```typescript
// ❌ v1.x
import { AES } from '@ldesign/crypto'
const encrypted = AES.encrypt('data', 'key')

// ✅ v2.0
import { createAES } from '@ldesign/crypto'
const aes = createAES('key')
const encrypted = aes.encrypt('data')
```

#### Hash 相关

```typescript
// ❌ v1.x
import { Hash } from '@ldesign/crypto'
const hash = Hash.SHA256('data')

// ✅ v2.0
import { hash } from '@ldesign/crypto'
const result = hash.sha256('data')
```

### 2. 返回值格式变更

v2.0 统一使用结果对象格式：

```typescript
// ❌ v1.x - 直接返回字符串或抛出异常
try {
  const encrypted = AES.encrypt('data', 'key') // string
  const decrypted = AES.decrypt(encrypted, 'key') // string
} catch (error) {
  console.error(error)
}

// ✅ v2.0 - 返回结果对象
const aes = createAES('key')
const encryptResult = aes.encrypt('data')
if (encryptResult.success) {
  console.log(encryptResult.data) // 加密结果
} else {
  console.error(encryptResult.error) // 错误信息
}

const decryptResult = aes.decrypt(encryptResult.data)
if (decryptResult.success) {
  console.log(decryptResult.data) // 解密结果
} else {
  console.error(decryptResult.error)
}
```

### 3. 配置选项变更

```typescript
// ❌ v1.x
const aes = new AES({
  keySize: 256,
  mode: 'CBC',
  padding: 'Pkcs7'
})

// ✅ v2.0
const aes = createAES('key', {
  keySize: 256,
  mode: 'CBC',
  padding: 'pkcs7', // 小写
  useWebCrypto: true, // 新增: 硬件加速
  enableCache: true // 新增: 缓存优化
})
```

### 4. 导入路径变更

```typescript
// ❌ v1.x
import { AES, Hash, RSA } from '@ldesign/crypto'

// ✅ v2.0 - 推荐命名导入
import { createAES, hash, createRSA } from '@ldesign/crypto'

// ✅ v2.0 - 子路径导入 (更好的 tree-shaking)
import { AES } from '@ldesign/crypto/algorithms/aes'
import { sha256 } from '@ldesign/crypto/algorithms/hash'
```

### 5. Vue 插件变更

```typescript
// ❌ v1.x
import { VueCrypto } from '@ldesign/crypto'
app.use(VueCrypto)

// ✅ v2.0
import { createCryptoPlugin } from '@ldesign/crypto/vue'
app.use(createCryptoPlugin({
  defaultAlgorithm: 'AES',
  enableCache: true
}))
```

## 新特性

### 1. WebCrypto 硬件加速

```typescript
import { createAES } from '@ldesign/crypto'

// 自动使用 WebCrypto (如果可用)
const aes = createAES('key', {
  useWebCrypto: true // 默认启用
})

// 性能提升 2-2.44x
const encrypted = await aes.encrypt('data')
```

### 2. 流式处理

```typescript
import { FileEncryptor } from '@ldesign/crypto/stream'

// 支持 GB 级文件，内存恒定 < 50MB
const encryptor = new FileEncryptor('secret-key')
await encryptor.encryptFile(
  'large-file.bin',
  'encrypted.bin',
  (progress) => console.log(`进度: ${progress}%`)
)
```

### 3. 时序攻击防护

```typescript
import { timingSafeEqual } from '@ldesign/crypto'

// 恒定时间比较，防止时序攻击
const isValid = timingSafeEqual(hash1, hash2)
```

### 4. 安全内存管理

```typescript
import { SecureMemory } from '@ldesign/crypto'

// 密钥自动清零
const secureKey = SecureMemory.allocate(32)
secureKey.write('my-secret-key')

// 使用密钥...

// 清零内存
secureKey.clear() // 密钥被覆盖为零
```

### 5. 密钥轮换

```typescript
import { KeyRotation } from '@ldesign/crypto'

// 自动密钥轮换
const rotation = new KeyRotation({
  rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
  algorithm: 'AES',
  keySize: 256
})

rotation.on('rotate', (newKey, oldKey) => {
  // 重新加密数据
  reencryptData(oldKey, newKey)
})
```

### 6. LRU 缓存

```typescript
import { createAES } from '@ldesign/crypto'

// 密钥派生结果自动缓存
const aes = createAES('password', {
  enableCache: true, // 默认启用
  cacheSize: 100
})

// 首次调用: 145ms (派生密钥)
const enc1 = aes.encrypt('data1')

// 后续调用: 68.7ms (使用缓存)
const enc2 = aes.encrypt('data2') // 性能提升 2.11x
```

### 7. 批量并行处理

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 并行加密 (使用 Worker Pool)
const items = [
  { data: 'data1', key: 'key1' },
  { data: 'data2', key: 'key2' },
  // ... 100 items
]

const encrypted = await cryptoManager.batchEncrypt(items, {
  parallel: true // 性能提升 44%
})
```

### 8. 对象池优化

```typescript
import { hash } from '@ldesign/crypto'

// 哈希函数自动使用对象池
for (let i = 0; i < 10000; i++) {
  hash.sha256(`data-${i}`) // 性能提升 31%
}
```

## 迁移示例

### 示例 1: 基本加密

```typescript
// === v1.x ===
import { AES } from '@ldesign/crypto'

try {
  const encrypted = AES.encrypt('Hello', 'key')
  const decrypted = AES.decrypt(encrypted, 'key')
  console.log(decrypted)
} catch (error) {
  console.error(error.message)
}

// === v2.0 ===
import { createAES } from '@ldesign/crypto'

const aes = createAES('key')

const encResult = aes.encrypt('Hello')
if (!encResult.success) {
  console.error(encResult.error)
} else {
  const decResult = aes.decrypt(encResult.data)
  if (decResult.success) {
    console.log(decResult.data)
  }
}

// === v2.0 简化版 (使用 assert) ===
import { createAES, assertSuccess } from '@ldesign/crypto'

const aes = createAES('key')
const encrypted = assertSuccess(aes.encrypt('Hello'))
const decrypted = assertSuccess(aes.decrypt(encrypted))
console.log(decrypted)
```

### 示例 2: 哈希计算

```typescript
// === v1.x ===
import { Hash } from '@ldesign/crypto'

const md5 = Hash.MD5('data')
const sha256 = Hash.SHA256('data')
const hmac = Hash.HMAC('data', 'key', 'SHA256')

// === v2.0 ===
import { hash } from '@ldesign/crypto'

const md5 = hash.md5('data')
const sha256 = hash.sha256('data')
const hmac = hash.hmac('data', 'key', 'sha256')
```

### 示例 3: RSA 加密

```typescript
// === v1.x ===
import { RSA } from '@ldesign/crypto'

const keyPair = RSA.generateKeyPair(2048)
const encrypted = RSA.encrypt('data', keyPair.publicKey)
const decrypted = RSA.decrypt(encrypted, keyPair.privateKey)

// === v2.0 ===
import { createRSA } from '@ldesign/crypto'

const rsa = createRSA()
const keyPair = rsa.generateKeyPair(2048)

const encResult = rsa.encrypt('data', keyPair.publicKey)
if (encResult.success) {
  const decResult = rsa.decrypt(encResult.data, keyPair.privateKey)
  console.log(decResult.data)
}
```

### 示例 4: Vue 3 集成

```vue
<!-- === v1.x === -->
<script setup>
import { inject } from 'vue'

const crypto = inject('$crypto')

const encrypt = () => {
  const result = crypto.aes.encrypt('data', 'key')
  console.log(result)
}
</script>

<!-- === v2.0 === -->
<script setup>
import { useEncryption } from '@ldesign/crypto/vue'

const { encrypt, encrypted, loading } = useEncryption({
  algorithm: 'AES',
  key: 'key'
})

const handleEncrypt = async () => {
  await encrypt('data')
  console.log(encrypted.value)
}
</script>

<template>
  <button @click="handleEncrypt" :disabled="loading">
    加密
  </button>
  <p v-if="encrypted">结果: {{ encrypted }}</p>
</template>
```

## 弃用的 API

以下 API 在 v2.0 中已弃用，将在 v3.0 中移除：

| v1.x API | v2.0 替代 | 移除版本 |
|----------|-----------|----------|
| `AES.encrypt()` | `createAES().encrypt()` | v3.0 |
| `Hash.SHA256()` | `hash.sha256()` | v3.0 |
| `RSA.generateKeyPair()` | `createRSA().generateKeyPair()` | v3.0 |
| `mode: 'ECB'` | 使用 'GCM' 或 'CBC' | v3.0 |
| `CryptoJS` 导出 | 使用新 API | v3.0 |

## 性能对比

| 操作 | v1.x | v2.0 | 提升 |
|------|------|------|------|
| AES 加密 (WebCrypto) | 1.27ms | 0.52ms | 2.44x |
| 哈希计算 (对象池) | 12.5ms | 8.6ms | 31% |
| 密钥派生 (缓存) | 145ms | 68.7ms | 2.11x |
| 批量加密 (并行) | 450ms | 252ms | 44% |
| 内存占用 | 70MB | 40MB | 43% |

## 破坏性变更处理

### 1. 类型变更

```typescript
// v1.x - 类型较宽松
type EncryptResult = string

// v2.0 - 严格的结果类型
type EncryptResult = {
  success: boolean
  data?: string
  error?: string
  iv?: string
  algorithm?: string
}
```

**迁移建议**: 更新类型定义，使用类型守卫。

### 2. 错误处理

```typescript
// v1.x - 抛出异常
try {
  const result = AES.encrypt('data', 'key')
} catch (error) {
  // 处理错误
}

// v2.0 - 返回结果对象
const result = aes.encrypt('data')
if (!result.success) {
  // 处理错误: result.error
}
```

**迁移建议**: 移除 try-catch，使用 if 检查。

### 3. 配置变更

```typescript
// v1.x - 全局配置
CryptoJS.config.defaults = {
  keySize: 256
}

// v2.0 - 实例配置
const aes = createAES('key', {
  keySize: 256
})
```

**迁移建议**: 为每个实例提供配置。

## 工具和脚本

### 自动迁移脚本

```bash
# 运行迁移脚本 (实验性)
npx @ldesign/crypto-migrate

# 检查需要迁移的代码
npx @ldesign/crypto-migrate --check

# 自动修复
npx @ldesign/crypto-migrate --fix
```

### ESLint 规则

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@ldesign/crypto'],
  rules: {
    '@ldesign/crypto/no-deprecated-api': 'error',
    '@ldesign/crypto/prefer-new-api': 'warn'
  }
}
```

## 常见问题

### Q: 为什么 v2.0 返回结果对象而不是直接返回值?

**A**: 提供更好的错误处理和元数据支持。可以使用 `assertSuccess()` 辅助函数简化代码：

```typescript
import { assertSuccess } from '@ldesign/crypto'

const encrypted = assertSuccess(aes.encrypt('data'))
// 失败时抛出异常，成功时直接返回数据
```

### Q: 我的代码在 v1.x 中工作正常，升级后为什么报错?

**A**: 检查以下几点：
1. 是否使用了已弃用的 API
2. 是否正确处理返回的结果对象
3. 是否更新了类型定义
4. 查看控制台的弃用警告

### Q: 如何逐步迁移大型项目?

**A**: 建议策略：
1. 安装 v2.0，保持向后兼容模式
2. 启用弃用警告，记录需要更新的地方
3. 逐个模块更新到新 API
4. 运行测试确保功能正常
5. 移除兼容层

### Q: v2.0 的性能提升在哪里?

**A**: 主要优化：
- WebCrypto 硬件加速 (2-2.44x)
- 对象池优化 (31% 提升)
- LRU 缓存 (2.11x 提升)
- 批量并行处理 (40-60% 提升)
- 内存优化 (43% 减少)

查看[性能文档](/performance)了解详情。

### Q: 是否需要更新 TypeScript?

**A**: v2.0 要求 TypeScript 4.5+。建议使用最新稳定版。

## 获取帮助

- [完整文档](/guide/)
- [API 参考](/api/)
- [示例代码](/examples/)
- [GitHub Issues](https://github.com/ldesign/crypto/issues)
- [讨论区](https://github.com/ldesign/crypto/discussions)

## 总结

v2.0 带来了显著的性能提升和更好的开发体验，虽然有一些破坏性变更，但迁移过程是直观的。遵循本指南，您可以顺利完成升级。

**升级收益**:
- ✅ 性能提升 25-35%
- ✅ 内存优化 43%
- ✅ 更安全 (时序攻击防护、安全内存管理)
- ✅ 更好的 TypeScript 支持
- ✅ 流式处理大文件
- ✅ 硬件加速支持

开始升级吧！🚀

