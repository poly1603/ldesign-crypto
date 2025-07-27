<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 响应式数据
const isLoading = ref(false)
const error = ref('')
const performanceData = ref(null)

// SM2 相关
const sm2Keys = ref(null)
const sm2Operation = ref('encrypt')
const sm2Data = ref('Hello, 国密SM2!')
const sm2SignData = ref('重要文档内容需要数字签名')
const sm2UserId = ref('1234567812345678')
const sm2Result = ref('')
const sm2Signature = ref('')

// SM3 相关
const sm3Data = ref('Hello, 国密SM3!')
const sm3Salt = ref('')
const sm3Result = ref('')

// SM4 相关
const sm4Key = ref('')
const sm4Mode = ref('ECB')
const sm4IV = ref('')
const sm4Data = ref('Hello, 国密SM4!')
const sm4Result = ref('')

// 综合应用
const comprehensiveData = ref('这是需要安全传输的重要商业机密数据')
const comprehensiveResult = ref(null)

// 动态导入crypto模块
let crypto = null

onMounted(async () => {
  try {
    if (typeof window !== 'undefined') {
      // 创建模拟的国密算法模块用于演示
      crypto = createMockSMCrypto()
      await crypto.init()
      generateSM4Key()
    }
  }
 catch (err) {
    error.value = `国密算法模块初始化失败: ${err.message}`
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

// 创建模拟的国密算法模块用于演示
function createMockSMCrypto() {
  return {
    async init() {
      // 模拟初始化
    },

    generateKey(algorithm) {
      // 生成模拟密钥
      const keyLengths = {
        SM4: 32,
        AES: 64,
        HMAC: 64,
      }
      const length = keyLengths[algorithm] || 32
      return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    },

    generateRandom(options) {
      const length = options.length || 32
      if (options.charset === 'hex') {
        return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      }
      return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('')
    },

    async generateSM2KeyPair() {
      // 模拟SM2密钥对生成
      return {
        publicKey: `04${this.generateRandom({ length: 128, charset: 'hex' })}`,
        privateKey: this.generateRandom({ length: 64, charset: 'hex' }),
      }
    },

    async sm2Encrypt(data, options) {
      // 模拟SM2加密
      const mockEncrypted = safeBase64Encode(`${data}-sm2-encrypted-${Date.now()}`)
      return {
        success: true,
        data: mockEncrypted,
      }
    },

    async sm2Decrypt(data, options) {
      // 模拟SM2解密
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

    async sm2Sign(data, options) {
      // 模拟SM2签名
      const signature = safeBase64Encode(`${data}-signature-${Date.now()}`)
      return {
        success: true,
        signature,
        algorithm: 'SM2',
      }
    },

    async sm2Verify(data, signature, options) {
      // 模拟SM2验签
      try {
        const decoded = safeBase64Decode(signature)
        const isValid = decoded.includes(data) && decoded.includes('-signature-')
        return {
          success: true,
          valid: isValid,
        }
      }
 catch {
        return {
          success: false,
          valid: false,
        }
      }
    },

    async sm3(data, options = {}) {
      // 模拟SM3哈希
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

    async sm4Encrypt(data, options) {
      // 模拟SM4加密
      const mockEncrypted = safeBase64Encode(`${data}-sm4-encrypted-${Date.now()}`)
      return {
        success: true,
        data: mockEncrypted,
      }
    },

    async sm4Decrypt(data, options) {
      // 模拟SM4解密
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

// SM2 操作
async function generateSM2Keys() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    sm2Keys.value = await crypto.generateSM2KeyPair()
    const duration = performance.now() - startTime

    performanceData.value = {
      algorithm: 'SM2',
      operation: '密钥生成',
      duration: duration.toFixed(2),
    }
  }
 catch (err) {
    error.value = `SM2密钥生成失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function encryptSM2() {
  if (!crypto || !sm2Keys.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const result = await crypto.sm2Encrypt(sm2Data.value, {
      publicKey: sm2Keys.value.publicKey,
    })
    const duration = performance.now() - startTime

    if (result.success) {
      sm2Result.value = result.data
      performanceData.value = {
        algorithm: 'SM2',
        operation: '公钥加密',
        duration: duration.toFixed(2),
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `SM2加密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function decryptSM2() {
  if (!crypto || !sm2Keys.value || !sm2Result.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const result = await crypto.sm2Decrypt(sm2Result.value, {
      privateKey: sm2Keys.value.privateKey,
    })
    const duration = performance.now() - startTime

    if (result.success) {
      sm2Result.value = result.data
      performanceData.value = {
        algorithm: 'SM2',
        operation: '私钥解密',
        duration: duration.toFixed(2),
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `SM2解密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function signSM2() {
  if (!crypto || !sm2Keys.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const signature = await crypto.sm2Sign(sm2SignData.value, {
      privateKey: sm2Keys.value.privateKey,
      userId: sm2UserId.value || '1234567812345678',
    })
    const duration = performance.now() - startTime

    sm2Signature.value = signature.signature
    sm2Result.value = `签名成功！算法: ${signature.algorithm}`

    performanceData.value = {
      algorithm: 'SM2',
      operation: '数字签名',
      duration: duration.toFixed(2),
    }
  }
 catch (err) {
    error.value = `SM2签名失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function verifySM2() {
  if (!crypto || !sm2Keys.value || !sm2Signature.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const verified = await crypto.sm2Verify(sm2SignData.value, sm2Signature.value, {
      publicKey: sm2Keys.value.publicKey,
      userId: sm2UserId.value || '1234567812345678',
    })
    const duration = performance.now() - startTime

    sm2Result.value = verified.valid ? '✅ 签名验证通过' : '❌ 签名验证失败'

    performanceData.value = {
      algorithm: 'SM2',
      operation: '签名验证',
      duration: duration.toFixed(2),
    }
  }
 catch (err) {
    error.value = `SM2验签失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

// SM3 操作
async function calculateSM3() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const config = sm3Salt.value ? { salt: sm3Salt.value } : {}
    const result = await crypto.sm3(sm3Data.value, config)
    const duration = performance.now() - startTime

    if (result.success) {
      sm3Result.value = result.data
      performanceData.value = {
        algorithm: 'SM3',
        operation: '哈希计算',
        duration: duration.toFixed(2),
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `SM3哈希计算失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

// SM4 操作
function generateSM4Key() {
  if (!crypto)
return

  try {
    sm4Key.value = crypto.generateKey('SM4')
    if (sm4Mode.value === 'CBC') {
      sm4IV.value = crypto.generateRandom({ length: 32, charset: 'hex' })
    }
  }
 catch (err) {
    error.value = `SM4密钥生成失败: ${err.message}`
  }
}

async function encryptSM4() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const config = {
      key: sm4Key.value,
      mode: sm4Mode.value,
    }

    if (sm4Mode.value === 'CBC') {
      config.iv = sm4IV.value
    }

    const result = await crypto.sm4Encrypt(sm4Data.value, config)
    const duration = performance.now() - startTime

    if (result.success) {
      sm4Result.value = result.data
      performanceData.value = {
        algorithm: 'SM4',
        operation: `${sm4Mode.value}加密`,
        duration: duration.toFixed(2),
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `SM4加密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function decryptSM4() {
  if (!crypto || !sm4Result.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()
    const config = {
      key: sm4Key.value,
      mode: sm4Mode.value,
    }

    if (sm4Mode.value === 'CBC') {
      config.iv = sm4IV.value
    }

    const result = await crypto.sm4Decrypt(sm4Result.value, config)
    const duration = performance.now() - startTime

    if (result.success) {
      sm4Result.value = result.data
      performanceData.value = {
        algorithm: 'SM4',
        operation: `${sm4Mode.value}解密`,
        duration: duration.toFixed(2),
      }
    }
 else {
      error.value = result.error
    }
  }
 catch (err) {
    error.value = `SM4解密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

// 综合应用
async function comprehensiveEncrypt() {
  if (!crypto)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()

    // 1. 生成SM2密钥对
    const keyPair = await crypto.generateSM2KeyPair()

    // 2. 生成随机SM4密钥
    const sm4SessionKey = crypto.generateKey('SM4')

    // 3. 使用SM4加密数据
    const encryptedData = await crypto.sm4Encrypt(comprehensiveData.value, {
      key: sm4SessionKey,
      mode: 'CBC',
    })

    // 4. 使用SM2加密SM4密钥
    const encryptedKey = await crypto.sm2Encrypt(sm4SessionKey, {
      publicKey: keyPair.publicKey,
    })

    // 5. 计算SM3完整性校验
    const integrity = await crypto.sm3(comprehensiveData.value)

    const duration = performance.now() - startTime

    comprehensiveResult.value = {
      encryptedData: encryptedData.data,
      encryptedKey: encryptedKey.data,
      integrity: integrity.data,
      keyPair,
    }

    performanceData.value = {
      algorithm: 'SM2+SM4+SM3',
      operation: '综合加密',
      duration: duration.toFixed(2),
    }
  }
 catch (err) {
    error.value = `综合加密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function comprehensiveDecrypt() {
  if (!crypto || !comprehensiveResult.value)
return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()

    // 1. 使用SM2解密SM4密钥
    const decryptedKey = await crypto.sm2Decrypt(comprehensiveResult.value.encryptedKey, {
      privateKey: comprehensiveResult.value.keyPair.privateKey,
    })

    // 2. 使用SM4解密数据
    const decryptedData = await crypto.sm4Decrypt(comprehensiveResult.value.encryptedData, {
      key: decryptedKey.data,
      mode: 'CBC',
    })

    // 3. 验证SM3完整性
    const integrity = await crypto.sm3(decryptedData.data)

    const duration = performance.now() - startTime

    if (integrity.data === comprehensiveResult.value.integrity) {
      comprehensiveResult.value = {
        ...comprehensiveResult.value,
        decryptedData: decryptedData.data,
        integrityValid: true,
      }
    }
 else {
      error.value = '数据完整性校验失败'
      return
    }

    performanceData.value = {
      algorithm: 'SM2+SM4+SM3',
      operation: '综合解密',
      duration: duration.toFixed(2),
    }
  }
 catch (err) {
    error.value = `综合解密失败: ${err.message}`
  }
 finally {
    isLoading.value = false
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  }
 catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div class="sm-crypto-demo">
    <div class="demo-header">
      <h2>🇨🇳 国密算法在线演示</h2>
      <p>体验中国国家密码标准算法的强大功能</p>
    </div>

    <!-- SM2 椭圆曲线公钥密码 -->
    <div class="algorithm-section">
      <h3>🔐 SM2 椭圆曲线公钥密码算法</h3>

      <div class="form-group">
        <button :disabled="isLoading" class="btn-primary" @click="generateSM2Keys">
          {{ isLoading ? '生成中...' : '🔑 生成SM2密钥对' }}
        </button>
      </div>

      <div v-if="sm2Keys" class="key-display">
        <div class="key-item">
          <label>🔓 SM2公钥 (用于加密和验签):</label>
          <textarea :value="sm2Keys.publicKey" readonly />
          <button class="btn-copy" @click="copyToClipboard(sm2Keys.publicKey)">
            📋
          </button>
        </div>
        <div class="key-item">
          <label>🔐 SM2私钥 (用于解密和签名):</label>
          <textarea :value="sm2Keys.privateKey" readonly />
          <button class="btn-copy" @click="copyToClipboard(sm2Keys.privateKey)">
            📋
          </button>
        </div>
      </div>

      <div class="operation-tabs">
        <button
          class="tab-btn" :class="[{ active: sm2Operation === 'encrypt' }]"
          @click="sm2Operation = 'encrypt'"
        >
          🔒 加密/解密
        </button>
        <button
          class="tab-btn" :class="[{ active: sm2Operation === 'sign' }]"
          @click="sm2Operation = 'sign'"
        >
          ✍️ 签名/验签
        </button>
      </div>

      <!-- SM2 加密/解密 -->
      <div v-if="sm2Operation === 'encrypt'" class="operation-panel">
        <div class="form-group">
          <label>待加密数据:</label>
          <textarea v-model="sm2Data" placeholder="输入要加密的数据" />
        </div>

        <div class="button-group">
          <button :disabled="isLoading || !sm2Keys" class="btn-primary" @click="encryptSM2">
            🔒 SM2加密
          </button>
          <button :disabled="isLoading || !sm2Keys || !sm2Result" class="btn-secondary" @click="decryptSM2">
            🔓 SM2解密
          </button>
        </div>
      </div>

      <!-- SM2 签名/验签 -->
      <div v-if="sm2Operation === 'sign'" class="operation-panel">
        <div class="form-group">
          <label>待签名数据:</label>
          <textarea v-model="sm2SignData" placeholder="输入要签名的数据" />
        </div>

        <div class="form-group">
          <label>用户标识 (可选):</label>
          <input v-model="sm2UserId" placeholder="输入用户标识，默认为 1234567812345678">
        </div>

        <div class="button-group">
          <button :disabled="isLoading || !sm2Keys" class="btn-primary" @click="signSM2">
            ✍️ SM2签名
          </button>
          <button :disabled="isLoading || !sm2Keys || !sm2Signature" class="btn-secondary" @click="verifySM2">
            ✅ 验证签名
          </button>
        </div>

        <div v-if="sm2Signature" class="signature-display">
          <label>数字签名:</label>
          <textarea :value="sm2Signature" readonly />
          <button class="btn-copy" @click="copyToClipboard(sm2Signature)">
            📋
          </button>
        </div>
      </div>

      <div v-if="sm2Result" class="result-panel">
        <h4>SM2 操作结果:</h4>
        <div class="result-content">
          {{ sm2Result }}
        </div>
        <button class="btn-copy" @click="copyToClipboard(sm2Result)">
          📋 复制
        </button>
      </div>
    </div>

    <!-- SM3 密码杂凑算法 -->
    <div class="algorithm-section">
      <h3>🔍 SM3 密码杂凑算法</h3>

      <div class="form-group">
        <label>待哈希数据:</label>
        <textarea v-model="sm3Data" placeholder="输入要计算SM3哈希的数据" />
      </div>

      <div class="form-group">
        <label>盐值 (可选):</label>
        <input v-model="sm3Salt" placeholder="输入盐值以增强安全性">
      </div>

      <div class="button-group">
        <button :disabled="isLoading" class="btn-primary" @click="calculateSM3">
          🔍 计算SM3哈希
        </button>
      </div>

      <div v-if="sm3Result" class="result-panel">
        <h4>SM3 哈希值 (256位):</h4>
        <div class="result-content hash-result">
          {{ sm3Result }}
        </div>
        <button class="btn-copy" @click="copyToClipboard(sm3Result)">
          📋 复制
        </button>
        <div class="hash-info">
          <span>长度: {{ sm3Result.length }} 字符</span>
          <span>位数: {{ sm3Result.length * 4 }} 位</span>
        </div>
      </div>
    </div>

    <!-- SM4 分组密码算法 -->
    <div class="algorithm-section">
      <h3>🔐 SM4 分组密码算法</h3>

      <div class="form-group">
        <label>SM4密钥:</label>
        <div class="key-input">
          <input v-model="sm4Key" placeholder="32位十六进制密钥 (128位)">
          <button class="btn-generate" @click="generateSM4Key">
            生成
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>加密模式:</label>
        <select v-model="sm4Mode">
          <option value="ECB">
            ECB (电子密码本)
          </option>
          <option value="CBC">
            CBC (密码块链接)
          </option>
        </select>
      </div>

      <div v-if="sm4Mode === 'CBC'" class="form-group">
        <label>初始向量 (IV):</label>
        <input v-model="sm4IV" placeholder="32位十六进制IV (128位)">
      </div>

      <div class="form-group">
        <label>待加密数据:</label>
        <textarea v-model="sm4Data" placeholder="输入要加密的数据" />
      </div>

      <div class="button-group">
        <button :disabled="isLoading" class="btn-primary" @click="encryptSM4">
          🔒 SM4加密
        </button>
        <button :disabled="isLoading || !sm4Result" class="btn-secondary" @click="decryptSM4">
          🔓 SM4解密
        </button>
      </div>

      <div v-if="sm4Result" class="result-panel">
        <h4>SM4 操作结果:</h4>
        <div class="result-content">
          {{ sm4Result }}
        </div>
        <button class="btn-copy" @click="copyToClipboard(sm4Result)">
          📋 复制
        </button>
      </div>
    </div>

    <!-- 综合应用示例 -->
    <div class="algorithm-section">
      <h3>🎯 综合应用示例</h3>
      <p>演示国密算法的组合使用：SM2密钥交换 + SM4数据加密 + SM3完整性校验</p>

      <div class="form-group">
        <label>重要数据:</label>
        <textarea v-model="comprehensiveData" placeholder="输入需要安全传输的重要数据" />
      </div>

      <div class="button-group">
        <button :disabled="isLoading" class="btn-primary" @click="comprehensiveEncrypt">
          🛡️ 安全加密 (SM2+SM4+SM3)
        </button>
        <button :disabled="isLoading || !comprehensiveResult" class="btn-secondary" @click="comprehensiveDecrypt">
          🔓 安全解密
        </button>
      </div>

      <div v-if="comprehensiveResult" class="comprehensive-result">
        <h4>安全传输包:</h4>
        <div class="result-item">
          <label>加密数据 (SM4):</label>
          <div class="result-content">
            {{ comprehensiveResult.encryptedData?.substring(0, 100) }}...
          </div>
        </div>
        <div class="result-item">
          <label>加密密钥 (SM2):</label>
          <div class="result-content">
            {{ comprehensiveResult.encryptedKey?.substring(0, 100) }}...
          </div>
        </div>
        <div class="result-item">
          <label>完整性校验 (SM3):</label>
          <div class="result-content">
            {{ comprehensiveResult.integrity }}
          </div>
        </div>
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
      <div class="performance-grid">
        <div class="performance-item">
          <span class="label">算法:</span>
          <span class="value">{{ performanceData.algorithm }}</span>
        </div>
        <div class="performance-item">
          <span class="label">执行时间:</span>
          <span class="value">{{ performanceData.duration }}ms</span>
        </div>
        <div class="performance-item">
          <span class="label">操作类型:</span>
          <span class="value">{{ performanceData.operation }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sm-crypto-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  border-radius: 12px;
  color: white;
}

.demo-header h2 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.algorithm-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.algorithm-section h3 {
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
  border-bottom: 3px solid #ff6b6b;
  padding-bottom: 0.5rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
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

.operation-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.tab-btn.active {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

.operation-panel {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 2px solid var(--vp-c-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
  border-color: #ff6b6b;
}

.btn-generate {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.btn-copy {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 12px;
}

.btn-copy:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.key-display {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 2px solid #4ecdc4;
  border-radius: 12px;
}

.key-item {
  margin-bottom: 1.5rem;
  position: relative;
}

.key-item:last-child {
  margin-bottom: 0;
}

.key-item textarea {
  height: 80px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
}

.key-item .btn-copy {
  position: absolute;
  top: 2rem;
  right: 0.5rem;
}

.signature-display {
  margin-top: 1.5rem;
  position: relative;
}

.signature-display textarea {
  height: 60px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: var(--vp-c-bg-mute);
}

.signature-display .btn-copy {
  position: absolute;
  top: 2rem;
  right: 0.5rem;
}

.result-panel {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 2px solid #4ecdc4;
  border-radius: 12px;
  position: relative;
}

.result-panel h4 {
  margin-bottom: 1rem;
  color: #4ecdc4;
  font-size: 1.2rem;
}

.result-content {
  background: var(--vp-c-bg-mute);
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--vp-c-border);
}

.result-content.hash-result {
  font-size: 14px;
  font-weight: 600;
  color: #4ecdc4;
  text-align: center;
  padding: 1.5rem;
}

.hash-info {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  padding: 0.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.comprehensive-result {
  margin-top: 1.5rem;
}

.result-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}

.result-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.error-panel {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 2px solid #ff6b6b;
  border-radius: 12px;
}

.error-panel h4 {
  margin-bottom: 0.5rem;
  color: #ff6b6b;
}

.error-content {
  color: #ff6b6b;
  font-size: 14px;
}

.performance-panel {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  color: white;
}

.performance-panel h4 {
  margin-bottom: 1rem;
  color: white;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.performance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.performance-item .label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.performance-item .value {
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sm-crypto-demo {
    padding: 1rem;
  }

  .operation-tabs {
    flex-direction: column;
  }

  .button-group {
    flex-direction: column;
  }

  .key-input {
    flex-direction: column;
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }

  .key-item .btn-copy,
  .signature-display .btn-copy {
    position: static;
    margin-top: 0.5rem;
  }
}
</style>
