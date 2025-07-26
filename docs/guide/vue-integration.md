# Vue 3 集成

@ldesign/crypto 为 Vue 3 提供了完整的组合式 API 支持，让你可以在 Vue 应用中轻松使用加密功能。

## 安装和配置

### 插件安装

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignCrypto from '@ldesign/crypto'
import App from './App.vue'

const app = createApp(App)

// 全局安装插件
app.use(LDesignCrypto, {
  debug: import.meta.env.DEV,
  performance: { enabled: true },
  cache: { enabled: true }
})

app.mount('#app')
```

### 手动配置

```typescript
// composables/crypto.ts
import { createCrypto } from '@ldesign/crypto'
import { ref, readonly } from 'vue'

const crypto = createCrypto({
  debug: import.meta.env.DEV,
  performance: { enabled: true }
})

const isInitialized = ref(false)

export async function initializeCrypto() {
  if (!isInitialized.value) {
    await crypto.init()
    isInitialized.value = true
  }
  return crypto
}

export { crypto, readonly(isInitialized) as isInitialized }
```

## 组合式 API

### useSymmetricCrypto

用于对称加密操作的组合式 API。

```vue
<template>
  <div class="symmetric-crypto">
    <h3>AES 加密演示</h3>
    
    <!-- 输入区域 -->
    <div class="input-section">
      <textarea 
        v-model="plaintext" 
        placeholder="输入要加密的文本"
        :disabled="isLoading"
      />
      
      <div class="key-section">
        <input 
          v-model="encryptionKey" 
          placeholder="加密密钥（32位十六进制）"
          :disabled="isLoading"
        />
        <button @click="generateKey" :disabled="isLoading">
          生成密钥
        </button>
      </div>
      
      <div class="mode-section">
        <select v-model="mode" :disabled="isLoading">
          <option value="CBC">CBC</option>
          <option value="ECB">ECB</option>
          <option value="GCM">GCM</option>
        </select>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <button 
        @click="encrypt" 
        :disabled="isLoading || !plaintext || !encryptionKey"
        :class="{ loading: isLoading }"
      >
        {{ isLoading ? '加密中...' : '🔒 加密' }}
      </button>
      
      <button 
        @click="decrypt" 
        :disabled="isLoading || !result"
      >
        🔓 解密
      </button>
    </div>
    
    <!-- 结果显示 -->
    <div v-if="result" class="result">
      <h4>加密结果:</h4>
      <textarea :value="result" readonly />
      <button @click="copyResult">📋 复制</button>
    </div>
    
    <!-- 错误显示 -->
    <div v-if="error" class="error">
      <h4>❌ 错误:</h4>
      <p>{{ error }}</p>
    </div>
    
    <!-- 性能信息 -->
    <div v-if="performance" class="performance">
      <h4>📊 性能:</h4>
      <p>执行时间: {{ performance.duration }}ms</p>
      <p>操作类型: {{ performance.operation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSymmetricCrypto } from '@ldesign/crypto'

// 使用组合式 API
const {
  encrypt: encryptFn,
  decrypt: decryptFn,
  generateKey: generateKeyFn,
  result,
  error,
  isLoading,
  performance,
  clearResult,
  clearError
} = useSymmetricCrypto()

// 响应式数据
const plaintext = ref('Hello, Vue 3 + Crypto!')
const encryptionKey = ref('')
const mode = ref('CBC')

// 方法
const generateKey = () => {
  encryptionKey.value = generateKeyFn('AES', 256)
}

const encrypt = async () => {
  clearError()
  await encryptFn(plaintext.value, {
    key: encryptionKey.value,
    mode: mode.value,
    algorithm: 'AES'
  })
}

const decrypt = async () => {
  clearError()
  await decryptFn(result.value, {
    key: encryptionKey.value,
    mode: mode.value,
    algorithm: 'AES'
  })
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(result.value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 初始化时生成密钥
generateKey()
</script>
```

### useAsymmetricCrypto

用于非对称加密操作的组合式 API。

```vue
<template>
  <div class="asymmetric-crypto">
    <h3>RSA 加密演示</h3>
    
    <!-- 密钥生成 -->
    <div class="key-generation">
      <button @click="generateKeyPair" :disabled="isLoading">
        {{ isLoading ? '生成中...' : '🔑 生成RSA密钥对' }}
      </button>
      
      <div v-if="keyPair" class="key-display">
        <div class="key-item">
          <label>公钥:</label>
          <textarea :value="keyPair.publicKey" readonly />
        </div>
        <div class="key-item">
          <label>私钥:</label>
          <textarea :value="keyPair.privateKey" readonly />
        </div>
      </div>
    </div>
    
    <!-- 加密操作 -->
    <div class="encryption-section">
      <textarea 
        v-model="message" 
        placeholder="输入要加密的消息"
        :disabled="isLoading"
      />
      
      <div class="actions">
        <button @click="encrypt" :disabled="!keyPair || isLoading">
          🔒 RSA加密
        </button>
        <button @click="decrypt" :disabled="!encryptedData || isLoading">
          🔓 RSA解密
        </button>
      </div>
    </div>
    
    <!-- 数字签名 -->
    <div class="signature-section">
      <h4>数字签名</h4>
      <textarea 
        v-model="signMessage" 
        placeholder="输入要签名的消息"
        :disabled="isLoading"
      />
      
      <div class="actions">
        <button @click="sign" :disabled="!keyPair || isLoading">
          ✍️ 签名
        </button>
        <button @click="verify" :disabled="!signature || isLoading">
          ✅ 验证签名
        </button>
      </div>
      
      <div v-if="signature" class="signature-result">
        <label>数字签名:</label>
        <textarea :value="signature" readonly />
      </div>
    </div>
    
    <!-- 结果显示 -->
    <div v-if="result" class="result">
      <h4>操作结果:</h4>
      <pre>{{ result }}</pre>
    </div>
    
    <!-- 错误显示 -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsymmetricCrypto } from '@ldesign/crypto'

const {
  generateKeyPair: generateKeyPairFn,
  encrypt: encryptFn,
  decrypt: decryptFn,
  sign: signFn,
  verify: verifyFn,
  keyPair,
  result,
  error,
  isLoading
} = useAsymmetricCrypto()

const message = ref('Hello RSA!')
const signMessage = ref('Document to sign')
const encryptedData = ref('')
const signature = ref('')

const generateKeyPair = async () => {
  await generateKeyPairFn('RSA', 2048)
}

const encrypt = async () => {
  const encrypted = await encryptFn(message.value, {
    publicKey: keyPair.value.publicKey,
    algorithm: 'RSA',
    padding: 'OAEP'
  })
  if (encrypted) {
    encryptedData.value = result.value
  }
}

const decrypt = async () => {
  await decryptFn(encryptedData.value, {
    privateKey: keyPair.value.privateKey,
    algorithm: 'RSA',
    padding: 'OAEP'
  })
}

const sign = async () => {
  const signed = await signFn(signMessage.value, {
    privateKey: keyPair.value.privateKey,
    algorithm: 'RSA',
    hashAlgorithm: 'SHA-256'
  })
  if (signed) {
    signature.value = result.value
  }
}

const verify = async () => {
  await verifyFn(signMessage.value, signature.value, {
    publicKey: keyPair.value.publicKey,
    algorithm: 'RSA',
    hashAlgorithm: 'SHA-256'
  })
}
</script>
```

### useHash

用于哈希计算的组合式 API。

```vue
<template>
  <div class="hash-demo">
    <h3>哈希算法演示</h3>
    
    <!-- 输入区域 -->
    <div class="input-section">
      <textarea 
        v-model="inputData" 
        placeholder="输入要计算哈希的数据"
        :disabled="isLoading"
      />
      
      <div class="algorithm-selection">
        <label>选择算法:</label>
        <select v-model="algorithm" :disabled="isLoading">
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-512">SHA-512</option>
          <option value="MD5">MD5</option>
          <option value="SM3">SM3</option>
        </select>
      </div>
      
      <div class="salt-section">
        <input 
          v-model="salt" 
          placeholder="盐值（可选）"
          :disabled="isLoading"
        />
        <button @click="generateSalt" :disabled="isLoading">
          生成随机盐值
        </button>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="calculateHash" :disabled="isLoading || !inputData">
        {{ isLoading ? '计算中...' : '🔍 计算哈希' }}
      </button>
      
      <button @click="calculateHmac" :disabled="isLoading || !inputData">
        🔐 计算HMAC
      </button>
    </div>
    
    <!-- 结果显示 -->
    <div v-if="result" class="result">
      <h4>哈希结果:</h4>
      <div class="hash-result">
        <textarea :value="result" readonly />
        <button @click="copyResult">📋 复制</button>
      </div>
      <div class="hash-info">
        <span>算法: {{ algorithm }}</span>
        <span>长度: {{ result.length }} 字符</span>
        <span>位数: {{ result.length * 4 }} 位</span>
      </div>
    </div>
    
    <!-- 文件哈希 -->
    <div class="file-hash">
      <h4>文件哈希计算</h4>
      <input 
        type="file" 
        @change="handleFileSelect"
        :disabled="isLoading"
      />
      <div v-if="fileHash" class="file-result">
        <p>文件: {{ fileName }}</p>
        <p>哈希: {{ fileHash }}</p>
      </div>
    </div>
    
    <!-- 错误显示 -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <!-- 性能信息 -->
    <div v-if="performance" class="performance">
      <p>执行时间: {{ performance.duration }}ms</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHash } from '@ldesign/crypto'

const {
  hash: hashFn,
  hmac: hmacFn,
  fileHash: fileHashFn,
  generateRandom,
  result,
  error,
  isLoading,
  performance
} = useHash()

const inputData = ref('Hello, Hash!')
const algorithm = ref('SHA-256')
const salt = ref('')
const fileName = ref('')
const fileHash = ref('')

const calculateHash = async () => {
  const options = salt.value ? { salt: salt.value } : {}
  await hashFn(inputData.value, algorithm.value, options)
}

const calculateHmac = async () => {
  const key = generateRandom({ length: 32, charset: 'hex' })
  await hmacFn(inputData.value, key, { algorithm: algorithm.value })
}

const generateSalt = () => {
  salt.value = generateRandom({ length: 16, charset: 'hex' })
}

const handleFileSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    fileName.value = file.name
    const hash = await fileHashFn(file, algorithm.value)
    fileHash.value = hash
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(result.value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>
```

### useSM (国密算法)

```vue
<template>
  <div class="sm-crypto">
    <h3>国密算法演示</h3>
    
    <!-- SM2 椭圆曲线 -->
    <div class="sm2-section">
      <h4>SM2 椭圆曲线加密</h4>
      
      <button @click="generateSM2Keys" :disabled="isLoading">
        生成SM2密钥对
      </button>
      
      <div v-if="sm2Keys" class="keys">
        <div>公钥: {{ sm2Keys.publicKey.substring(0, 50) }}...</div>
        <div>私钥: {{ sm2Keys.privateKey.substring(0, 50) }}...</div>
      </div>
      
      <textarea v-model="sm2Data" placeholder="SM2加密数据" />
      
      <div class="actions">
        <button @click="sm2Encrypt" :disabled="!sm2Keys">SM2加密</button>
        <button @click="sm2Decrypt" :disabled="!sm2Result">SM2解密</button>
      </div>
    </div>
    
    <!-- SM3 哈希 -->
    <div class="sm3-section">
      <h4>SM3 密码杂凑</h4>
      
      <textarea v-model="sm3Data" placeholder="SM3哈希数据" />
      
      <button @click="calculateSM3">计算SM3哈希</button>
      
      <div v-if="sm3Result" class="result">
        SM3哈希: {{ sm3Result }}
      </div>
    </div>
    
    <!-- SM4 分组密码 -->
    <div class="sm4-section">
      <h4>SM4 分组密码</h4>
      
      <input v-model="sm4Key" placeholder="SM4密钥" />
      <button @click="generateSM4Key">生成SM4密钥</button>
      
      <textarea v-model="sm4Data" placeholder="SM4加密数据" />
      
      <div class="actions">
        <button @click="sm4Encrypt" :disabled="!sm4Key">SM4加密</button>
        <button @click="sm4Decrypt" :disabled="!sm4Result">SM4解密</button>
      </div>
    </div>
    
    <!-- 结果显示 -->
    <div v-if="result" class="result">
      <h4>操作结果:</h4>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSM } from '@ldesign/crypto'

const {
  generateSM2KeyPair,
  sm2Encrypt: sm2EncryptFn,
  sm2Decrypt: sm2DecryptFn,
  sm3: sm3Fn,
  generateSM4Key: generateSM4KeyFn,
  sm4Encrypt: sm4EncryptFn,
  sm4Decrypt: sm4DecryptFn,
  result,
  isLoading
} = useSM()

const sm2Keys = ref(null)
const sm2Data = ref('Hello SM2!')
const sm2Result = ref('')

const sm3Data = ref('Hello SM3!')
const sm3Result = ref('')

const sm4Key = ref('')
const sm4Data = ref('Hello SM4!')
const sm4Result = ref('')

const generateSM2Keys = async () => {
  sm2Keys.value = await generateSM2KeyPair()
}

const sm2Encrypt = async () => {
  const encrypted = await sm2EncryptFn(sm2Data.value, {
    publicKey: sm2Keys.value.publicKey
  })
  sm2Result.value = result.value
}

const sm2Decrypt = async () => {
  await sm2DecryptFn(sm2Result.value, {
    privateKey: sm2Keys.value.privateKey
  })
}

const calculateSM3 = async () => {
  const hash = await sm3Fn(sm3Data.value)
  sm3Result.value = result.value
}

const generateSM4Key = () => {
  sm4Key.value = generateSM4KeyFn()
}

const sm4Encrypt = async () => {
  const encrypted = await sm4EncryptFn(sm4Data.value, {
    key: sm4Key.value,
    mode: 'ECB'
  })
  sm4Result.value = result.value
}

const sm4Decrypt = async () => {
  await sm4DecryptFn(sm4Result.value, {
    key: sm4Key.value,
    mode: 'ECB'
  })
}
</script>
```

## 全局注入

### 使用 provide/inject

```typescript
// 在根组件中提供
import { provide } from 'vue'
import { createCrypto } from '@ldesign/crypto'

export default {
  async setup() {
    const crypto = createCrypto()
    await crypto.init()
    
    provide('crypto', crypto)
    
    return {}
  }
}
```

```typescript
// 在子组件中注入
import { inject } from 'vue'

export default {
  setup() {
    const crypto = inject('crypto')
    
    const encryptData = async (data: string) => {
      return await crypto.aesEncrypt(data, {
        key: 'your-key',
        mode: 'CBC'
      })
    }
    
    return { encryptData }
  }
}
```

## 响应式状态管理

### 使用 Pinia

```typescript
// stores/crypto.ts
import { defineStore } from 'pinia'
import { createCrypto } from '@ldesign/crypto'

export const useCryptoStore = defineStore('crypto', {
  state: () => ({
    crypto: null,
    isInitialized: false,
    keys: new Map(),
    operations: []
  }),
  
  actions: {
    async initialize() {
      if (!this.crypto) {
        this.crypto = createCrypto({
          debug: import.meta.env.DEV,
          performance: { enabled: true }
        })
        await this.crypto.init()
        this.isInitialized = true
      }
    },
    
    async generateAndStoreKey(name: string, algorithm: string, keySize?: number) {
      await this.initialize()
      
      let key
      if (algorithm === 'AES') {
        key = this.crypto.generateKey('AES', keySize || 256)
      } else if (algorithm === 'RSA') {
        key = await this.crypto.generateRSAKeyPair(keySize || 2048)
      }
      
      this.keys.set(name, { algorithm, key, createdAt: new Date() })
      return key
    },
    
    getKey(name: string) {
      return this.keys.get(name)?.key
    },
    
    async encryptWithStoredKey(data: string, keyName: string, options: any = {}) {
      const keyInfo = this.keys.get(keyName)
      if (!keyInfo) {
        throw new Error(`密钥 ${keyName} 不存在`)
      }
      
      const operation = {
        id: Date.now(),
        type: 'encrypt',
        algorithm: keyInfo.algorithm,
        timestamp: new Date(),
        status: 'pending'
      }
      
      this.operations.push(operation)
      
      try {
        let result
        if (keyInfo.algorithm === 'AES') {
          result = await this.crypto.aesEncrypt(data, {
            key: keyInfo.key,
            ...options
          })
        } else if (keyInfo.algorithm === 'RSA') {
          result = await this.crypto.rsaEncrypt(data, {
            publicKey: keyInfo.key.publicKey,
            ...options
          })
        }
        
        operation.status = 'success'
        return result
      } catch (error) {
        operation.status = 'error'
        operation.error = error.message
        throw error
      }
    }
  }
})
```

### 在组件中使用 Store

```vue
<template>
  <div class="crypto-manager">
    <div class="key-management">
      <h3>密钥管理</h3>
      
      <div class="key-generator">
        <input v-model="keyName" placeholder="密钥名称" />
        <select v-model="keyAlgorithm">
          <option value="AES">AES</option>
          <option value="RSA">RSA</option>
        </select>
        <button @click="generateKey">生成密钥</button>
      </div>
      
      <div class="key-list">
        <h4>已存储的密钥:</h4>
        <ul>
          <li v-for="[name, info] in cryptoStore.keys" :key="name">
            {{ name }} ({{ info.algorithm }}) - {{ info.createdAt.toLocaleString() }}
          </li>
        </ul>
      </div>
    </div>
    
    <div class="encryption">
      <h3>加密操作</h3>
      
      <textarea v-model="plaintext" placeholder="输入要加密的数据" />
      
      <select v-model="selectedKey">
        <option value="">选择密钥</option>
        <option v-for="[name] in cryptoStore.keys" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
      
      <button @click="encrypt" :disabled="!plaintext || !selectedKey">
        加密
      </button>
      
      <div v-if="encryptedResult" class="result">
        <h4>加密结果:</h4>
        <textarea :value="encryptedResult" readonly />
      </div>
    </div>
    
    <div class="operations">
      <h3>操作历史</h3>
      <ul>
        <li v-for="op in cryptoStore.operations" :key="op.id">
          {{ op.timestamp.toLocaleString() }} - {{ op.type }} ({{ op.algorithm }}) - {{ op.status }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCryptoStore } from '@/stores/crypto'

const cryptoStore = useCryptoStore()

const keyName = ref('')
const keyAlgorithm = ref('AES')
const plaintext = ref('')
const selectedKey = ref('')
const encryptedResult = ref('')

onMounted(async () => {
  await cryptoStore.initialize()
})

const generateKey = async () => {
  if (keyName.value) {
    await cryptoStore.generateAndStoreKey(keyName.value, keyAlgorithm.value)
    keyName.value = ''
  }
}

const encrypt = async () => {
  try {
    const result = await cryptoStore.encryptWithStoredKey(
      plaintext.value,
      selectedKey.value,
      { mode: 'CBC' }
    )
    encryptedResult.value = result.data
  } catch (error) {
    console.error('加密失败:', error)
  }
}
</script>
```

## 性能优化

### 懒加载

```typescript
// 懒加载加密模块
const useLazyCrypto = () => {
  const crypto = ref(null)
  const isLoading = ref(false)
  
  const loadCrypto = async () => {
    if (!crypto.value && !isLoading.value) {
      isLoading.value = true
      try {
        const { createCrypto } = await import('@ldesign/crypto')
        crypto.value = createCrypto()
        await crypto.value.init()
      } finally {
        isLoading.value = false
      }
    }
    return crypto.value
  }
  
  return { crypto: readonly(crypto), isLoading: readonly(isLoading), loadCrypto }
}
```

### Web Workers

```typescript
// crypto-worker.ts
import { createCrypto } from '@ldesign/crypto'

let crypto: any = null

self.onmessage = async (event) => {
  const { id, method, args } = event.data
  
  try {
    if (!crypto) {
      crypto = createCrypto()
      await crypto.init()
    }
    
    const result = await crypto[method](...args)
    
    self.postMessage({
      id,
      success: true,
      result
    })
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message
    })
  }
}
```

```typescript
// 在组件中使用 Worker
const useWorkerCrypto = () => {
  const worker = new Worker('/crypto-worker.js')
  const pendingOperations = new Map()
  
  worker.onmessage = (event) => {
    const { id, success, result, error } = event.data
    const { resolve, reject } = pendingOperations.get(id)
    
    if (success) {
      resolve(result)
    } else {
      reject(new Error(error))
    }
    
    pendingOperations.delete(id)
  }
  
  const callWorkerMethod = (method: string, ...args: any[]) => {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random()
      pendingOperations.set(id, { resolve, reject })
      
      worker.postMessage({ id, method, args })
    })
  }
  
  return { callWorkerMethod }
}
```

## 下一步

- 学习 [通用 JavaScript](/guide/vanilla-js) 的用法
- 了解 [性能监控](/guide/performance) 的配置
- 查看 [插件开发](/guide/plugins) 的指南
