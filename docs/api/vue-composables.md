# Vue 组合式 API

@ldesign/crypto 为 Vue 3 提供了专门的组合式 API，让你能够在 Vue 组件中轻松使用加密功能。

## 核心组合式函数

### `useCrypto(options?)`

主要的加密组合式函数，提供完整的加密功能。

**参数:**
- `options?: CryptoOptions` - 可选的配置选项

**返回值:**
- `CryptoComposable` - 加密功能对象

**示例:**
```vue
<script setup lang="ts">
import { useCrypto } from '@ldesign/crypto'

const crypto = useCrypto({
  provider: 'software',
  cache: { enabled: true }
})

// 等待初始化
await crypto.init()

// 使用加密功能
const encrypted = await crypto.encrypt('Hello World', {
  algorithm: 'AES',
  key: 'my-secret-key'
})
</script>
```

### `useSymmetricCrypto(options?)`

对称加密专用组合式函数。

**返回值:**
- `SymmetricCryptoComposable` - 对称加密功能

**示例:**
```vue
<script setup lang="ts">
import { useSymmetricCrypto } from '@ldesign/crypto'

const {
  encrypt,
  decrypt,
  generateKey,
  aesEncrypt,
  aesDecrypt
} = useSymmetricCrypto()

// AES 加密
const key = generateKey('AES', 256)
const encrypted = await aesEncrypt('sensitive data', {
  key,
  mode: 'CBC'
})

const decrypted = await aesDecrypt(encrypted.ciphertext, {
  key,
  mode: 'CBC',
  iv: encrypted.iv
})
</script>
```

### `useAsymmetricCrypto(options?)`

非对称加密专用组合式函数。

**返回值:**
- `AsymmetricCryptoComposable` - 非对称加密功能

**示例:**
```vue
<script setup lang="ts">
import { useAsymmetricCrypto } from '@ldesign/crypto'

const {
  generateKeyPair,
  encrypt,
  decrypt,
  sign,
  verify,
  rsaEncrypt,
  rsaDecrypt
} = useAsymmetricCrypto()

// RSA 密钥对生成
const keyPair = await generateKeyPair('RSA', 2048)

// 加密和解密
const encrypted = await rsaEncrypt('message', keyPair.publicKey)
const decrypted = await rsaDecrypt(encrypted, keyPair.privateKey)

// 数字签名
const signature = await sign('document', keyPair.privateKey, 'RSA-PSS')
const isValid = await verify(signature, 'document', keyPair.publicKey, 'RSA-PSS')
</script>
```

### `useHash(options?)`

哈希算法专用组合式函数。

**返回值:**
- `HashComposable` - 哈希功能

**示例:**
```vue
<script setup lang="ts">
import { useHash } from '@ldesign/crypto'

const {
  hash,
  sha256,
  sha512,
  md5,
  hmac,
  pbkdf2,
  verifyHash
} = useHash()

// 计算哈希
const hash1 = await sha256('Hello World')
const hash2 = await hash('Hello World', 'SHA-512')

// HMAC
const mac = await hmac('message', 'secret-key', 'SHA-256')

// 密钥派生
const derivedKey = await pbkdf2('password', 'salt', {
  iterations: 100000,
  keyLength: 32,
  hash: 'SHA-256'
})

// 哈希验证
const isValid = await verifyHash('Hello World', hash1, 'SHA-256')
</script>
```

### `useSMCrypto(options?)`

国密算法专用组合式函数。

**返回值:**
- `SMCryptoComposable` - 国密算法功能

**示例:**
```vue
<script setup lang="ts">
import { useSMCrypto } from '@ldesign/crypto'

const {
  generateSM2KeyPair,
  sm2Encrypt,
  sm2Decrypt,
  sm2Sign,
  sm2Verify,
  sm3,
  sm4Encrypt,
  sm4Decrypt
} = useSMCrypto()

// SM2 密钥对
const keyPair = await generateSM2KeyPair()

// SM2 加密
const encrypted = await sm2Encrypt('message', keyPair.publicKey)
const decrypted = await sm2Decrypt(encrypted.ciphertext, keyPair.privateKey)

// SM3 哈希
const hash = await sm3('Hello World')

// SM4 对称加密
const sm4Key = generateKey('SM4', 128)
const sm4Encrypted = await sm4Encrypt('data', sm4Key, { mode: 'CBC' })
</script>
```

## 响应式状态管理

### `useCryptoState()`

提供响应式的加密状态管理。

**返回值:**
- `CryptoStateComposable` - 响应式状态对象

**示例:**
```vue
<script setup lang="ts">
import { useCryptoState, useSymmetricCrypto } from '@ldesign/crypto'

const {
  isLoading,
  error,
  status,
  progress,
  setLoading,
  setError,
  setProgress,
  clearError
} = useCryptoState()

const { encrypt } = useSymmetricCrypto()

async function handleEncrypt(data: string) {
  try {
    setLoading(true)
    setProgress(0)

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90))
    }, 100)

    const result = await encrypt(data, {
      algorithm: 'AES',
      key: 'secret-key'
    })

    clearInterval(progressInterval)
    setProgress(100)

    return result
  }
 catch (err) {
    setError(err)
  }
 finally {
    setLoading(false)
  }
}
</script>

<template>
  <div>
    <div v-if="isLoading">
      加载中...
    </div>
    <div v-else-if="error">
      错误: {{ error.message }}
    </div>
    <div v-else>
      <p>操作状态: {{ status }}</p>
      <p>进度: {{ progress }}%</p>
    </div>
  </div>
</template>
```

### `useCryptoCache()`

提供响应式的缓存管理。

**返回值:**
- `CryptoCacheComposable` - 缓存管理对象

**示例:**
```vue
<script setup lang="ts">
import { useCryptoCache } from '@ldesign/crypto'

const {
  cache,
  cacheStats,
  clearCache,
  getCacheItem,
  setCacheItem,
  removeCacheItem
} = useCryptoCache()

// 监听缓存统计
watchEffect(() => {
  console.log('缓存统计:', cacheStats.value)
})

// 手动缓存操作
const cacheKey = 'user-data-hash'
const cachedHash = getCacheItem(cacheKey)

if (!cachedHash) {
  const hash = await sha256('user data')
  setCacheItem(cacheKey, hash, { ttl: 300000 }) // 5分钟过期
}
</script>
```

## 文件处理组合式函数

### `useFileEncryption()`

文件加密专用组合式函数。

**返回值:**
- `FileEncryptionComposable` - 文件加密功能

**示例:**
```vue
<script setup lang="ts">
import { useFileEncryption } from '@ldesign/crypto'

const {
  selectedFile,
  isProcessing,
  progress,
  result,
  error,
  selectFile,
  encryptFile,
  decryptFile,
  downloadResult,
  formatFileSize
} = useFileEncryption({
  algorithm: 'AES-256-GCM',
  chunkSize: 1024 * 1024 // 1MB chunks
})

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectFile(file)
  }
}
</script>

<template>
  <div class="file-encryption">
    <input
      type="file"
      :disabled="isProcessing"
      @change="handleFileSelect"
    >

    <div v-if="selectedFile">
      <p>文件: {{ selectedFile.name }}</p>
      <p>大小: {{ formatFileSize(selectedFile.size) }}</p>

      <button :disabled="isProcessing" @click="encryptFile">
        {{ isProcessing ? '加密中...' : '加密文件' }}
      </button>

      <button :disabled="isProcessing" @click="decryptFile">
        {{ isProcessing ? '解密中...' : '解密文件' }}
      </button>
    </div>

    <div v-if="isProcessing" class="progress">
      <div class="progress-bar" :style="{ width: `${progress}%` }" />
      <span>{{ progress }}%</span>
    </div>

    <div v-if="result">
      <h3>处理完成</h3>
      <p>耗时: {{ result.duration }}ms</p>
      <button @click="downloadResult">
        下载结果
      </button>
    </div>
  </div>
</template>
```

### `useFileHash()`

文件哈希计算组合式函数。

**示例:**
```vue
<script setup lang="ts">
import { useFileHash } from '@ldesign/crypto'

const {
  calculateHash,
  verifyFileIntegrity,
  isCalculating,
  progress,
  result
} = useFileHash()

async function handleFileHash(file: File) {
  const hashResult = await calculateHash(file, 'SHA-256', {
    onProgress: (prog) => {
      console.log(`哈希计算进度: ${prog.percentage}%`)
    }
  })

  console.log('文件哈希:', hashResult.hash)
  console.log('计算时间:', hashResult.duration)
}

async function handleVerifyIntegrity(file: File, expectedHash: string) {
  const isValid = await verifyFileIntegrity(file, expectedHash, 'SHA-256')
  console.log('文件完整性:', isValid ? '验证通过' : '验证失败')
}
</script>
```

## 密钥管理组合式函数

### `useKeyManager()`

密钥管理专用组合式函数。

**示例:**
```vue
<script setup lang="ts">
import { useKeyManager } from '@ldesign/crypto'

const {
  keys,
  generateKey,
  importKey,
  exportKey,
  deleteKey,
  rotateKey,
  getKeyInfo
} = useKeyManager()

// 生成新密钥
const newKey = await generateKey('AES', 256, {
  name: 'user-data-key',
  usage: ['encrypt', 'decrypt'],
  extractable: true
})

// 导入密钥
const importedKey = await importKey(keyData, 'raw', {
  name: 'imported-key',
  algorithm: 'AES'
})

// 密钥轮换
const rotatedKey = await rotateKey('user-data-key')

// 监听密钥变化
watchEffect(() => {
  console.log('当前密钥数量:', keys.value.length)
})
</script>
```

### `useKeyDerivation()`

密钥派生专用组合式函数。

**示例:**
```vue
<script setup lang="ts">
import { useKeyDerivation } from '@ldesign/crypto'

const {
  deriveKey,
  deriveKeyFromPassword,
  generateSalt,
  validatePassword
} = useKeyDerivation()

// 从密码派生密钥
const derivedKey = await deriveKeyFromPassword('user-password', {
  salt: generateSalt(),
  iterations: 100000,
  keyLength: 32,
  hash: 'SHA-256'
})

// 密钥派生
const childKey = await deriveKey(masterKey, {
  info: 'encryption-key',
  length: 32
})
</script>
```

## 性能监控组合式函数

### `usePerformanceMonitor()`

性能监控专用组合式函数。

**示例:**
```vue
<script setup lang="ts">
import { usePerformanceMonitor } from '@ldesign/crypto'

const {
  metrics,
  recentOperations,
  startMonitoring,
  stopMonitoring,
  resetMetrics,
  getDetailedReport
} = usePerformanceMonitor({
  sampleRate: 1.0,
  maxRecords: 100
})

// 开始监控
onMounted(() => {
  startMonitoring()
})

// 停止监控
onUnmounted(() => {
  stopMonitoring()
})

// 获取详细报告
async function generateReport() {
  const report = await getDetailedReport()
  console.log('性能报告:', report)
}
</script>

<template>
  <div class="performance-monitor">
    <h3>性能监控</h3>

    <div class="metrics">
      <div class="metric">
        <label>总操作数:</label>
        <span>{{ metrics.totalOperations }}</span>
      </div>

      <div class="metric">
        <label>平均耗时:</label>
        <span>{{ metrics.averageTime }}ms</span>
      </div>

      <div class="metric">
        <label>缓存命中率:</label>
        <span>{{ (metrics.cacheHitRate * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <div class="recent-operations">
      <h4>最近操作</h4>
      <ul>
        <li v-for="op in recentOperations" :key="op.id">
          {{ op.operation }} - {{ op.duration }}ms
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 类型定义

### 组合式函数返回类型

```typescript
interface CryptoComposable {
  // 初始化
  init: () => Promise<void>

  // 基础加密
  encrypt: (data: string | ArrayBuffer, options: EncryptOptions) => Promise<EncryptResult>
  decrypt: (data: string | ArrayBuffer, options: DecryptOptions) => Promise<DecryptResult>

  // 密钥管理
  generateKey: (algorithm: string, keySize: number) => string | ArrayBuffer

  // 状态
  isInitialized: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

interface CryptoStateComposable {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  status: Ref<string>
  progress: Ref<number>

  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  setStatus: (status: string) => void
  setProgress: (progress: number) => void
  clearError: () => void
}

interface FileEncryptionComposable {
  selectedFile: Ref<File | null>
  isProcessing: Ref<boolean>
  progress: Ref<number>
  result: Ref<FileProcessResult | null>
  error: Ref<Error | null>

  selectFile: (file: File) => void
  encryptFile: (password?: string) => Promise<void>
  decryptFile: (password?: string) => Promise<void>
  downloadResult: () => void
  formatFileSize: (bytes: number) => string
}
```

## 使用示例

### 完整的加密应用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import SymmetricEncryptionPanel from './components/SymmetricEncryptionPanel.vue'
import AsymmetricEncryptionPanel from './components/AsymmetricEncryptionPanel.vue'
import HashCalculationPanel from './components/HashCalculationPanel.vue'
import FileEncryptionPanel from './components/FileEncryptionPanel.vue'

const activeTab = ref('symmetric')

const tabs = [
  { id: 'symmetric', label: '对称加密' },
  { id: 'asymmetric', label: '非对称加密' },
  { id: 'hash', label: '哈希计算' },
  { id: 'file', label: '文件加密' }
]
</script>

<template>
  <div class="crypto-app">
    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="tab-content">
      <!-- 对称加密 -->
      <div v-if="activeTab === 'symmetric'" class="tab-panel">
        <SymmetricEncryptionPanel />
      </div>

      <!-- 非对称加密 -->
      <div v-if="activeTab === 'asymmetric'" class="tab-panel">
        <AsymmetricEncryptionPanel />
      </div>

      <!-- 哈希计算 -->
      <div v-if="activeTab === 'hash'" class="tab-panel">
        <HashCalculationPanel />
      </div>

      <!-- 文件加密 -->
      <div v-if="activeTab === 'file'" class="tab-panel">
        <FileEncryptionPanel />
      </div>
    </div>
  </div>
</template>
```

Vue 组合式 API 让你能够在 Vue 3 应用中优雅地使用加密功能，提供了响应式状态管理、错误处理和性能监控等完整功能。
