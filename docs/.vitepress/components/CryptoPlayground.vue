<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 响应式数据
const activeTab = ref('symmetric')
const isLoading = ref(false)
const error = ref('')
const performanceData = ref(null)

// 对称加密
const symmetricAlgorithm = ref('AES')
const symmetricData = ref('Hello, LDesign Crypto!')
const symmetricKey = ref('')
const symmetricResult = ref('')

// 非对称加密
const asymmetricAlgorithm = ref('RSA')
const asymmetricData = ref('Hello, RSA!')
const asymmetricKeys = ref(null)
const asymmetricResult = ref('')

// 哈希算法
const hashAlgorithm = ref('SHA256')
const hashData = ref('Hello, Hash!')
const hashSalt = ref('')
const hashResult = ref('')

// 算法标签页
const algorithmTabs = [
  { key: 'symmetric', label: '对称加密', icon: '🔒' },
  { key: 'asymmetric', label: '非对称加密', icon: '🔑' },
  { key: 'hash', label: '哈希算法', icon: '🔍' },
]

// 动态导入crypto模块
let crypto = null

onMounted(async () => {
  try {
    // 在客户端环境中动态导入
    if (typeof window !== 'undefined') {
      // 创建模拟的加密模块用于演示
      crypto = createMockCrypto()
      await crypto.init()
      generateSymmetricKey()
    }
  }
 catch (err) {
    error.value = `加密模块初始化失败: ${err.message}`
  }
})

// 安全的Base64编码函数，支持Unicode
function safeBase64Encode(str) {
  try {
    // 使用TextEncoder将字符串转换为UTF-8字节
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)

    // 将字节数组转换为二进制字符串
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    // 使用btoa编码二进制字符串
    return btoa(binary)
  }
 catch (error) {
    // 降级方案：简单的十六进制编码
    return Array.from(str).map(char =>
      char.charCodeAt(0).toString(16).padStart(4, '0'),
    ).join('')
  }
}

// 安全的Base64解码函数，支持Unicode
function safeBase64Decode(encodedStr) {
  try {
    // 尝试Base64解码
    const binary = atob(encodedStr)

    // 将二进制字符串转换为字节数组
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    // 使用TextDecoder将字节数组转换为UTF-8字符串
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  }
 catch (error) {
    // 降级方案：十六进制解码
    try {
      const chars = []
      for (let i = 0; i < encodedStr.length; i += 4) {
        const hex = encodedStr.substr(i, 4)
        chars.push(String.fromCharCode(Number.parseInt(hex, 16)))
      }
      return chars.join('')
    }
 catch (e) {
      return encodedStr // 如果都失败了，返回原字符串
    }
  }
}

// 创建模拟的加密模块用于演示
function createMockCrypto() {
  return {
    async init() {
      // 模拟初始化
    },

    generateKey(algorithm, keySize) {
      // 生成模拟密钥
      const keyLengths = {
        'AES': keySize === 128 ? 32 : keySize === 192 ? 48 : 64,
        'DES': 16,
        '3DES': 48,
        'SM4': 32,
        'HMAC': 64,
      }
      const length = keyLengths[algorithm] || 64
      return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    },

    generateRandom(options) {
      const length = options.length || 32
      if (options.charset === 'hex') {
        return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      }
      return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('')
    },

    async aesEncrypt(data, options) {
      // 模拟AES加密
      const mockEncrypted = safeBase64Encode(`${data}-encrypted-${Date.now()}`)
      return {
        success: true,
        data: mockEncrypted,
        iv: this.generateRandom({ length: 32, charset: 'hex' }),
      }
    },

    async aesDecrypt(data, options) {
      // 模拟AES解密
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-encrypted-')[0]
        return {
          success: true,
          data: original,
        }
      }
 catch {
        return {
          success: false,
          error: '解密失败',
        }
      }
    },

    async generateRSAKeyPair(keySize) {
      // 模拟RSA密钥对生成
      return {
        publicKey: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${this.generateRandom({ length: 200 })}\n-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC${this.generateRandom({ length: 400 })}\n-----END PRIVATE KEY-----`,
      }
    },

    async rsaEncrypt(data, options) {
      const mockEncrypted = safeBase64Encode(`${data}-rsa-encrypted-${Date.now()}`)
      return {
        success: true,
        data: mockEncrypted,
      }
    },

    async rsaDecrypt(data, options) {
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-rsa-encrypted-')[0]
        return {
          success: true,
          data: original,
        }
      }
 catch {
        return {
          success: false,
          error: 'RSA解密失败',
        }
      }
    },

    async sha256(data, options = {}) {
      // 模拟SHA-256哈希
      const input = options.salt ? data + options.salt : data
      let hash = 0
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const mockHash = Math.abs(hash).toString(16).padStart(64, '0')
      return {
        success: true,
        data: mockHash,
      }
    },

    async md5(data) {
      // 模拟MD5哈希
      let hash = 0
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const mockHash = Math.abs(hash).toString(16).padStart(32, '0')
      return {
        success: true,
        data: mockHash,
      }
    },

    async generateSM2KeyPair() {
      return {
        publicKey: `04${this.generateRandom({ length: 128, charset: 'hex' })}`,
        privateKey: this.generateRandom({ length: 64, charset: 'hex' }),
      }
    },

    async sm2Encrypt(data, options) {
      const mockEncrypted = safeBase64Encode(`${data}-sm2-encrypted-${Date.now()}`)
      return {
        success: true,
        data: mockEncrypted,
      }
    },

    async sm2Decrypt(data, options) {
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-sm2-encrypted-')[0]
        return {
          success: true,
          data: original,
        }
      }
 catch {
        return {
          success: false,
          error: 'SM2解密失败',
        }
      }
    },

    async sm3(data) {
      // 模拟SM3哈希
      let hash = 0
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const mockHash = Math.abs(hash).toString(16).padStart(64, '0')
      return {
        success: true,
        data: mockHash,
      }
    },

    async sm4Encrypt(data, options) {
      const mockEncrypted = safeBase64Encode(`${data}-sm4-encrypted-${Date.now()}`)
      return {
        success: true,
        data: mockEncrypted,
      }
    },

    async sm4Decrypt(data, options) {
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-sm4-encrypted-')[0]
        return {
          success: true,
          data: original,
        }
      }
 catch {
        return {
          success: false,
          error: 'SM4解密失败',
        }
      }
    },
  }
}

// 工具方法
function getKeyPlaceholder(algorithm) {
  switch (algorithm) {
    case 'AES': return '32字节十六进制密钥 (256位)'
    case 'DES': return '8字节密钥 (64位)'
    case '3DES': return '24字节密钥 (192位)'
    default: return '输入密钥'
  }
}

function generateSymmetricKey() {
  if (!crypto)
return

  try {
    switch (symmetricAlgorithm.value) {
      case 'AES':
        symmetricKey.value = crypto.generateKey('AES', 256)
        break
      case 'DES':
        symmetricKey.value = crypto.generateKey('DES')
        break
      case '3DES':
        symmetricKey.value = crypto.generateKey('3DES')
        break
    }
  }
 catch (err) {
    error.value = `密钥生成失败: ${err.message}`
  }
}

async function generateAsymmetricKeys() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    if (asymmetricAlgorithm.value === 'RSA') {
      asymmetricKeys.value = await crypto.generateRSAKeyPair(2048)
    }
 else {
      asymmetricKeys.value = await crypto.generateSM2KeyPair()
    }
  }
 catch (err) {
    error.value = `密钥生成失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function encryptSymmetric() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    const config = { key: symmetricKey.value, mode: 'CBC' }
    let result

    switch (symmetricAlgorithm.value) {
      case 'AES':
        result = await crypto.aesEncrypt(symmetricData.value, config)
        break
      case 'DES':
        result = await crypto.desEncrypt(symmetricData.value, config)
        break
      case '3DES':
        result = await crypto.tripleDesEncrypt(symmetricData.value, config)
        break
    }

    if (result.success) {
      symmetricResult.value = result.data
      performanceData.value = {
        duration: result.duration?.toFixed(2),
        algorithm: symmetricAlgorithm.value,
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `加密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function decryptSymmetric() {
  if (!crypto || !symmetricResult.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const config = { key: symmetricKey.value, mode: 'CBC' }
    let result

    switch (symmetricAlgorithm.value) {
      case 'AES':
        result = await crypto.aesDecrypt(symmetricResult.value, config)
        break
      case 'DES':
        result = await crypto.desDecrypt(symmetricResult.value, config)
        break
      case '3DES':
        result = await crypto.tripleDesDecrypt(symmetricResult.value, config)
        break
    }

    if (result.success) {
      symmetricResult.value = result.data
      performanceData.value = {
        duration: result.duration?.toFixed(2),
        algorithm: symmetricAlgorithm.value,
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `解密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function encryptAsymmetric() {
  if (!crypto || !asymmetricKeys.value)
return

  isLoading.value = true
  error.value = ''

  try {
    let result

    if (asymmetricAlgorithm.value === 'RSA') {
      result = await crypto.rsaEncrypt(asymmetricData.value, {
        publicKey: asymmetricKeys.value.publicKey,
      })
    }
 else {
      result = await crypto.sm2Encrypt(asymmetricData.value, {
        publicKey: asymmetricKeys.value.publicKey,
      })
    }

    if (result.success) {
      asymmetricResult.value = result.data
      performanceData.value = {
        duration: result.duration?.toFixed(2),
        algorithm: asymmetricAlgorithm.value,
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `加密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function decryptAsymmetric() {
  if (!crypto || !asymmetricKeys.value || !asymmetricResult.value)
return

  isLoading.value = true
  error.value = ''

  try {
    let result

    if (asymmetricAlgorithm.value === 'RSA') {
      result = await crypto.rsaDecrypt(asymmetricResult.value, {
        privateKey: asymmetricKeys.value.privateKey,
      })
    }
 else {
      result = await crypto.sm2Decrypt(asymmetricResult.value, {
        privateKey: asymmetricKeys.value.privateKey,
      })
    }

    if (result.success) {
      asymmetricResult.value = result.data
      performanceData.value = {
        duration: result.duration?.toFixed(2),
        algorithm: asymmetricAlgorithm.value,
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `解密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function calculateHash() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    const config = hashSalt.value ? { salt: hashSalt.value } : {}
    let result

    switch (hashAlgorithm.value) {
      case 'MD5':
        result = await crypto.md5(hashData.value, config)
        break
      case 'SHA1':
        result = await crypto.sha1(hashData.value, config)
        break
      case 'SHA256':
        result = await crypto.sha256(hashData.value, config)
        break
      case 'SHA512':
        result = await crypto.sha512(hashData.value, config)
        break
      case 'SM3':
        result = await crypto.sm3(hashData.value, config)
        break
    }

    if (result.success) {
      hashResult.value = result.data
      performanceData.value = {
        duration: result.duration?.toFixed(2),
        algorithm: hashAlgorithm.value,
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `哈希计算失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    // 可以添加一个临时的成功提示
  }
 catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div class="crypto-playground">
    <!-- 算法选择 -->
    <div class="algorithm-selector">
      <h3>🔧 选择算法类型</h3>
      <div class="algorithm-tabs">
        <button
          v-for="tab in algorithmTabs"
          :key="tab.key"
          class="tab-btn" :class="[{ active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 对称加密 -->
    <div v-if="activeTab === 'symmetric'" class="algorithm-panel">
      <h3>🔒 对称加密</h3>

      <div class="form-group">
        <label>算法:</label>
        <select v-model="symmetricAlgorithm">
          <option value="AES">
            AES (推荐)
          </option>
          <option value="DES">
            DES (兼容)
          </option>
          <option value="3DES">
            3DES (兼容)
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>待加密数据:</label>
        <textarea v-model="symmetricData" placeholder="输入要加密的数据" />
      </div>

      <div class="form-group">
        <label>密钥:</label>
        <div class="key-input">
          <input v-model="symmetricKey" :placeholder="getKeyPlaceholder(symmetricAlgorithm)">
          <button class="btn-generate" @click="generateSymmetricKey">
            生成
          </button>
        </div>
      </div>

      <div class="button-group">
        <button :disabled="isLoading" class="btn-primary" @click="encryptSymmetric">
          {{ isLoading ? '加密中...' : '🔒 加密' }}
        </button>
        <button :disabled="isLoading" class="btn-secondary" @click="decryptSymmetric">
          {{ isLoading ? '解密中...' : '🔓 解密' }}
        </button>
      </div>

      <div v-if="symmetricResult" class="result-panel">
        <h4>结果:</h4>
        <div class="result-content">
          {{ symmetricResult }}
        </div>
        <button class="btn-copy" @click="copyToClipboard(symmetricResult)">
          📋 复制
        </button>
      </div>
    </div>

    <!-- 非对称加密 -->
    <div v-if="activeTab === 'asymmetric'" class="algorithm-panel">
      <h3>🔑 非对称加密</h3>

      <div class="form-group">
        <label>算法:</label>
        <select v-model="asymmetricAlgorithm">
          <option value="RSA">
            RSA
          </option>
          <option value="SM2">
            SM2 (国密)
          </option>
        </select>
      </div>

      <div class="form-group">
        <button :disabled="isLoading" class="btn-generate" @click="generateAsymmetricKeys">
          {{ isLoading ? '生成中...' : '🔑 生成密钥对' }}
        </button>
      </div>

      <div v-if="asymmetricKeys" class="key-display">
        <div class="key-item">
          <label>公钥:</label>
          <textarea :value="asymmetricKeys.publicKey" readonly />
        </div>
        <div class="key-item">
          <label>私钥:</label>
          <textarea :value="asymmetricKeys.privateKey" readonly />
        </div>
      </div>

      <div class="form-group">
        <label>待加密数据:</label>
        <textarea v-model="asymmetricData" placeholder="输入要加密的数据" />
      </div>

      <div class="button-group">
        <button :disabled="isLoading || !asymmetricKeys" class="btn-primary" @click="encryptAsymmetric">
          {{ isLoading ? '加密中...' : '🔒 公钥加密' }}
        </button>
        <button :disabled="isLoading || !asymmetricKeys" class="btn-secondary" @click="decryptAsymmetric">
          {{ isLoading ? '解密中...' : '🔓 私钥解密' }}
        </button>
      </div>

      <div v-if="asymmetricResult" class="result-panel">
        <h4>结果:</h4>
        <div class="result-content">
          {{ asymmetricResult }}
        </div>
        <button class="btn-copy" @click="copyToClipboard(asymmetricResult)">
          📋 复制
        </button>
      </div>
    </div>

    <!-- 哈希算法 -->
    <div v-if="activeTab === 'hash'" class="algorithm-panel">
      <h3>🔍 哈希算法</h3>

      <div class="form-group">
        <label>算法:</label>
        <select v-model="hashAlgorithm">
          <option value="SHA256">
            SHA-256 (推荐)
          </option>
          <option value="SHA512">
            SHA-512 (推荐)
          </option>
          <option value="SHA1">
            SHA-1 (兼容)
          </option>
          <option value="MD5">
            MD5 (兼容)
          </option>
          <option value="SM3">
            SM3 (国密)
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>待哈希数据:</label>
        <textarea v-model="hashData" placeholder="输入要计算哈希的数据" />
      </div>

      <div class="form-group">
        <label>盐值 (可选):</label>
        <input v-model="hashSalt" placeholder="输入盐值以增强安全性">
      </div>

      <div class="button-group">
        <button :disabled="isLoading" class="btn-primary" @click="calculateHash">
          {{ isLoading ? '计算中...' : '🔍 计算哈希' }}
        </button>
      </div>

      <div v-if="hashResult" class="result-panel">
        <h4>{{ hashAlgorithm }} 哈希值:</h4>
        <div class="result-content">
          {{ hashResult }}
        </div>
        <button class="btn-copy" @click="copyToClipboard(hashResult)">
          📋 复制
        </button>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="error" class="error-panel">
      <h4>❌ 错误:</h4>
      <div class="error-content">
        {{ error }}
      </div>
    </div>

    <!-- 性能统计 -->
    <div v-if="performanceData" class="performance-panel">
      <h4>📊 性能统计:</h4>
      <div class="performance-content">
        <span>执行时间: {{ performanceData.duration }}ms</span>
        <span>算法: {{ performanceData.algorithm }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crypto-playground {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.algorithm-selector {
  margin-bottom: 2rem;
}

.algorithm-selector h3 {
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.algorithm-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.tab-btn.active {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: white;
}

.algorithm-panel {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.algorithm-panel h3 {
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-brand);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', monospace;
}

.key-input {
  display: flex;
  gap: 0.5rem;
}

.key-input input {
  flex: 1;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.btn-primary,
.btn-secondary,
.btn-generate,
.btn-copy {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
}

.btn-generate {
  background: var(--vp-c-green);
  color: white;
}

.btn-generate:hover:not(:disabled) {
  background: var(--vp-c-green-dark);
}

.btn-copy {
  background: var(--vp-c-indigo);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 12px;
}

.btn-copy:hover {
  background: var(--vp-c-indigo-dark);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.key-display {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}

.key-item {
  margin-bottom: 1rem;
}

.key-item:last-child {
  margin-bottom: 0;
}

.key-item textarea {
  height: 80px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: var(--vp-c-bg-mute);
}

.result-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-green);
  border-radius: 8px;
}

.result-panel h4 {
  margin-bottom: 0.5rem;
  color: var(--vp-c-green);
}

.result-content {
  background: var(--vp-c-bg-mute);
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.error-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-red);
  border-radius: 8px;
}

.error-panel h4 {
  margin-bottom: 0.5rem;
  color: var(--vp-c-red);
}

.error-content {
  color: var(--vp-c-red);
  font-size: 14px;
}

.performance-panel {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
}

.performance-panel h4 {
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.performance-content {
  display: flex;
  gap: 1rem;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .crypto-playground {
    padding: 1rem;
  }

  .algorithm-tabs {
    flex-direction: column;
  }

  .button-group {
    flex-direction: column;
  }

  .key-input {
    flex-direction: column;
  }

  .performance-content {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
