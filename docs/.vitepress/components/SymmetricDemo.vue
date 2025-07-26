<template>
  <div class="symmetric-demo">
    <div class="demo-header">
      <h2>🔒 对称加密在线演示</h2>
      <p>体验 AES、DES、3DES 等对称加密算法</p>
    </div>

    <!-- 算法选择 -->
    <div class="algorithm-section">
      <h3>🔧 算法配置</h3>

      <div class="form-group">
        <label>加密算法:</label>
        <select v-model="algorithm">
          <option value="AES">AES (推荐)</option>
          <option value="DES">DES (兼容)</option>
          <option value="3DES">3DES (兼容)</option>
        </select>
      </div>

      <div v-if="algorithm === 'AES'" class="form-group">
        <label>密钥长度:</label>
        <select v-model="keySize">
          <option :value="128">128位</option>
          <option :value="192">192位</option>
          <option :value="256">256位 (推荐)</option>
        </select>
      </div>

      <div class="form-group">
        <label>加密模式:</label>
        <select v-model="mode">
          <option value="CBC">CBC (推荐)</option>
          <option value="ECB">ECB (不安全)</option>
          <option value="GCM" v-if="algorithm === 'AES'">GCM (认证加密)</option>
          <option value="CFB" v-if="algorithm === 'AES'">CFB</option>
          <option value="OFB" v-if="algorithm === 'AES'">OFB</option>
          <option value="CTR" v-if="algorithm === 'AES'">CTR</option>
        </select>
      </div>

      <div class="form-group">
        <label>填充方式:</label>
        <select v-model="padding">
          <option value="PKCS7">PKCS7 (推荐)</option>
          <option value="PKCS5">PKCS5</option>
          <option value="ZeroPadding">Zero Padding</option>
          <option value="NoPadding" v-if="mode !== 'ECB' && mode !== 'CBC'">No Padding</option>
        </select>
      </div>
    </div>

    <!-- 密钥管理 -->
    <div class="key-section">
      <h3>🔑 密钥管理</h3>

      <div class="form-group">
        <label>加密密钥:</label>
        <div class="key-input">
          <input
            v-model="encryptionKey"
            :placeholder="getKeyPlaceholder()"
            :maxlength="getKeyLength()"
          />
          <button @click="generateKey" class="btn-generate">生成密钥</button>
        </div>
      </div>

      <div v-if="mode !== 'ECB'" class="form-group">
        <label>初始向量 (IV):</label>
        <div class="key-input">
          <input
            v-model="iv"
            :placeholder="getIVPlaceholder()"
            :maxlength="getIVLength()"
          />
          <button @click="generateIV" class="btn-generate">生成IV</button>
        </div>
      </div>

      <div class="key-info">
        <div class="info-item">
          <span class="label">密钥长度:</span>
          <span class="value">{{ getKeyLength() }} 字符 ({{ getKeyBits() }} 位)</span>
        </div>
        <div v-if="mode !== 'ECB'" class="info-item">
          <span class="label">IV长度:</span>
          <span class="value">{{ getIVLength() }} 字符 ({{ getIVBits() }} 位)</span>
        </div>
      </div>
    </div>

    <!-- 数据输入 -->
    <div class="data-section">
      <h3>📝 数据输入</h3>

      <div class="form-group">
        <label>待加密数据:</label>
        <textarea
          v-model="plaintext"
          placeholder="输入要加密的数据"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label>数据编码:</label>
        <select v-model="inputEncoding">
          <option value="utf8">UTF-8 文本</option>
          <option value="hex">十六进制</option>
          <option value="base64">Base64</option>
        </select>
      </div>

      <div class="data-info">
        <span>数据长度: {{ getDataLength() }} 字节</span>
        <span>分组数量: {{ getBlockCount() }} 个</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button
        @click="encrypt"
        :disabled="isLoading || !canEncrypt"
        class="btn-primary"
      >
        {{ isLoading ? '加密中...' : '🔒 加密' }}
      </button>

      <button
        @click="decrypt"
        :disabled="isLoading || !encryptedData"
        class="btn-secondary"
      >
        {{ isLoading ? '解密中...' : '🔓 解密' }}
      </button>

      <button @click="clearAll" class="btn-clear">
        🗑️ 清空
      </button>
    </div>

    <!-- 结果显示 -->
    <div v-if="encryptedData || decryptedData" class="result-section">
      <h3>📊 加密结果</h3>

      <div v-if="encryptedData" class="result-item">
        <label>🔒 加密数据:</label>
        <textarea :value="encryptedData" readonly rows="3"></textarea>
        <div class="result-actions">
          <button @click="copyToClipboard(encryptedData)" class="btn-copy">📋 复制</button>
          <span class="result-info">长度: {{ encryptedData.length }} 字符</span>
        </div>
      </div>

      <div v-if="usedIV" class="result-item">
        <label>🔢 使用的IV:</label>
        <input :value="usedIV" readonly />
        <button @click="copyToClipboard(usedIV)" class="btn-copy">📋</button>
      </div>

      <div v-if="authTag" class="result-item">
        <label>🏷️ 认证标签 (GCM):</label>
        <input :value="authTag" readonly />
        <button @click="copyToClipboard(authTag)" class="btn-copy">📋</button>
      </div>

      <div v-if="decryptedData" class="result-item">
        <label>🔓 解密数据:</label>
        <textarea :value="decryptedData" readonly rows="3"></textarea>
        <div class="result-actions">
          <button @click="copyToClipboard(decryptedData)" class="btn-copy">📋 复制</button>
          <span class="result-info">
            验证: {{ decryptedData === plaintext ? '✅ 成功' : '❌ 失败' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 性能信息 -->
    <div v-if="performanceData" class="performance-section">
      <h3>📈 性能统计</h3>
      <div class="performance-grid">
        <div class="performance-item">
          <span class="label">算法:</span>
          <span class="value">{{ performanceData.algorithm }}</span>
        </div>
        <div class="performance-item">
          <span class="label">加密时间:</span>
          <span class="value">{{ performanceData.encryptTime }}ms</span>
        </div>
        <div class="performance-item">
          <span class="label">解密时间:</span>
          <span class="value">{{ performanceData.decryptTime }}ms</span>
        </div>
        <div class="performance-item">
          <span class="label">吞吐量:</span>
          <span class="value">{{ performanceData.throughput }}MB/s</span>
        </div>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="error" class="error-section">
      <h3>❌ 错误信息</h3>
      <div class="error-content">{{ error }}</div>
      <button @click="clearError" class="btn-clear">清除错误</button>
    </div>

    <!-- 算法说明 -->
    <div class="info-section">
      <h3>ℹ️ 算法说明</h3>
      <div class="algorithm-info">
        <div v-if="algorithm === 'AES'" class="info-content">
          <h4>AES (Advanced Encryption Standard)</h4>
          <p>AES是目前最安全、最广泛使用的对称加密算法。支持128、192、256位密钥长度，推荐使用256位密钥。</p>
          <ul>
            <li><strong>安全性:</strong> 极高，至今未被有效破解</li>
            <li><strong>性能:</strong> 优秀，硬件加速支持</li>
            <li><strong>应用:</strong> 政府、金融、企业级应用</li>
          </ul>
        </div>

        <div v-if="algorithm === 'DES'" class="info-content">
          <h4>DES (Data Encryption Standard)</h4>
          <p>DES是较早的加密标准，由于56位密钥长度较短，现已不推荐用于安全要求高的场景。</p>
          <ul>
            <li><strong>安全性:</strong> 低，可被暴力破解</li>
            <li><strong>性能:</strong> 快速，算法简单</li>
            <li><strong>应用:</strong> 仅用于兼容遗留系统</li>
          </ul>
        </div>

        <div v-if="algorithm === '3DES'" class="info-content">
          <h4>3DES (Triple DES)</h4>
          <p>3DES通过三次DES加密来提高安全性，是DES到AES的过渡方案。</p>
          <ul>
            <li><strong>安全性:</strong> 中等，比DES安全但不如AES</li>
            <li><strong>性能:</strong> 较慢，是DES的三倍时间</li>
            <li><strong>应用:</strong> 过渡期使用，建议迁移到AES</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// 响应式数据
const algorithm = ref('AES')
const keySize = ref(256)
const mode = ref('CBC')
const padding = ref('PKCS7')
const encryptionKey = ref('')
const iv = ref('')
const plaintext = ref('Hello, 对称加密!')
const inputEncoding = ref('utf8')

const encryptedData = ref('')
const decryptedData = ref('')
const usedIV = ref('')
const authTag = ref('')
const error = ref('')
const isLoading = ref(false)
const performanceData = ref(null)

// 模拟加密模块
let crypto = null

onMounted(async () => {
  crypto = createMockCrypto()
  generateKey()
  generateIV()
})

// 计算属性
const canEncrypt = computed(() => {
  return plaintext.value && encryptionKey.value &&
         (mode.value === 'ECB' || iv.value)
})

// 方法
const getKeyLength = () => {
  switch (algorithm.value) {
    case 'AES': return keySize.value === 128 ? 32 : keySize.value === 192 ? 48 : 64
    case 'DES': return 16
    case '3DES': return 48
    default: return 32
  }
}

const getKeyBits = () => {
  switch (algorithm.value) {
    case 'AES': return keySize.value
    case 'DES': return 64
    case '3DES': return 192
    default: return 256
  }
}

const getIVLength = () => {
  return algorithm.value === 'AES' ? 32 : 16
}

const getIVBits = () => {
  return algorithm.value === 'AES' ? 128 : 64
}

const getKeyPlaceholder = () => {
  return `${getKeyLength()}位十六进制密钥 (${getKeyBits()}位)`
}

const getIVPlaceholder = () => {
  return `${getIVLength()}位十六进制IV (${getIVBits()}位)`
}

const getDataLength = () => {
  return new TextEncoder().encode(plaintext.value).length
}

const getBlockCount = () => {
  const blockSize = algorithm.value === 'AES' ? 16 : 8
  return Math.ceil(getDataLength() / blockSize)
}

const generateKey = () => {
  if (!crypto) return

  try {
    encryptionKey.value = crypto.generateKey(algorithm.value, keySize.value)
  } catch (err) {
    error.value = '密钥生成失败: ' + err.message
  }
}

const generateIV = () => {
  if (!crypto || mode.value === 'ECB') return

  try {
    iv.value = crypto.generateRandom({
      length: getIVLength(),
      charset: 'hex'
    })
  } catch (err) {
    error.value = 'IV生成失败: ' + err.message
  }
}

const encrypt = async () => {
  if (!crypto || !canEncrypt.value) return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()

    const options = {
      key: encryptionKey.value,
      mode: mode.value,
      padding: padding.value
    }

    if (mode.value !== 'ECB') {
      options.iv = iv.value
    }

    let result
    switch (algorithm.value) {
      case 'AES':
        result = await crypto.aesEncrypt(plaintext.value, options)
        break
      case 'DES':
        result = await crypto.desEncrypt(plaintext.value, options)
        break
      case '3DES':
        result = await crypto.tripleDesEncrypt(plaintext.value, options)
        break
    }

    const encryptTime = performance.now() - startTime

    if (result.success) {
      encryptedData.value = result.data
      usedIV.value = result.iv || iv.value
      authTag.value = result.tag || ''

      // 计算性能数据
      const dataSize = getDataLength() / 1024 / 1024 // MB
      const throughput = dataSize / (encryptTime / 1000)

      performanceData.value = {
        algorithm: `${algorithm.value}-${getKeyBits()}-${mode.value}`,
        encryptTime: encryptTime.toFixed(2),
        decryptTime: 0,
        throughput: throughput.toFixed(2)
      }
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = '加密失败: ' + err.message
  } finally {
    isLoading.value = false
  }
}

const decrypt = async () => {
  if (!crypto || !encryptedData.value) return

  isLoading.value = true
  error.value = ''

  try {
    const startTime = performance.now()

    const options = {
      key: encryptionKey.value,
      mode: mode.value,
      padding: padding.value
    }

    if (mode.value !== 'ECB') {
      options.iv = usedIV.value
    }

    if (authTag.value) {
      options.tag = authTag.value
    }

    let result
    switch (algorithm.value) {
      case 'AES':
        result = await crypto.aesDecrypt(encryptedData.value, options)
        break
      case 'DES':
        result = await crypto.desDecrypt(encryptedData.value, options)
        break
      case '3DES':
        result = await crypto.tripleDesDecrypt(encryptedData.value, options)
        break
    }

    const decryptTime = performance.now() - startTime

    if (result.success) {
      decryptedData.value = result.data

      // 更新性能数据
      if (performanceData.value) {
        performanceData.value.decryptTime = decryptTime.toFixed(2)
      }
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = '解密失败: ' + err.message
  } finally {
    isLoading.value = false
  }
}

const clearAll = () => {
  encryptedData.value = ''
  decryptedData.value = ''
  usedIV.value = ''
  authTag.value = ''
  error.value = ''
  performanceData.value = null
}

const clearError = () => {
  error.value = ''
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

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
  } catch (error) {
    // 降级方案：简单的十六进制编码
    return Array.from(str).map(char =>
      char.charCodeAt(0).toString(16).padStart(4, '0')
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
  } catch (error) {
    // 降级方案：十六进制解码
    try {
      const chars = []
      for (let i = 0; i < encodedStr.length; i += 4) {
        const hex = encodedStr.substr(i, 4)
        chars.push(String.fromCharCode(parseInt(hex, 16)))
      }
      return chars.join('')
    } catch (e) {
      return encodedStr // 如果都失败了，返回原字符串
    }
  }
}

// 创建模拟加密模块
function createMockCrypto() {
  return {
    generateKey(algorithm, keySize) {
      const keyLengths = {
        'AES': keySize === 128 ? 32 : keySize === 192 ? 48 : 64,
        'DES': 16,
        '3DES': 48
      }
      const length = keyLengths[algorithm] || 64
      return Array.from({length}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    },

    generateRandom(options) {
      const length = options.length || 32
      return Array.from({length}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    },

    async aesEncrypt(data, options) {
      const mockEncrypted = safeBase64Encode(data + '-aes-encrypted-' + Date.now())
      return {
        success: true,
        data: mockEncrypted,
        iv: options.iv || this.generateRandom({ length: 32, charset: 'hex' }),
        tag: options.mode === 'GCM' ? this.generateRandom({ length: 32, charset: 'hex' }) : undefined
      }
    },

    async aesDecrypt(data, options) {
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-aes-encrypted-')[0]
        return { success: true, data: original }
      } catch {
        return { success: false, error: 'AES解密失败' }
      }
    },

    async desEncrypt(data, options) {
      const mockEncrypted = safeBase64Encode(data + '-des-encrypted-' + Date.now())
      return {
        success: true,
        data: mockEncrypted,
        iv: options.iv || this.generateRandom({ length: 16, charset: 'hex' })
      }
    },

    async desDecrypt(data, options) {
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-des-encrypted-')[0]
        return { success: true, data: original }
      } catch {
        return { success: false, error: 'DES解密失败' }
      }
    },

    async tripleDesEncrypt(data, options) {
      const mockEncrypted = safeBase64Encode(data + '-3des-encrypted-' + Date.now())
      return {
        success: true,
        data: mockEncrypted,
        iv: options.iv || this.generateRandom({ length: 16, charset: 'hex' })
      }
    },

    async tripleDesDecrypt(data, options) {
      try {
        const decoded = safeBase64Decode(data)
        const original = decoded.split('-3des-encrypted-')[0]
        return { success: true, data: original }
      } catch {
        return { success: false, error: '3DES解密失败' }
      }
    }
  }
}
</script>

<style scoped>
.symmetric-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  color: white;
}

.demo-header h2 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.algorithm-section,
.key-section,
.data-section,
.result-section,
.performance-section,
.error-section,
.info-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.algorithm-section h3,
.key-section h3,
.data-section h3,
.result-section h3,
.performance-section h3,
.error-section h3,
.info-section h3 {
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
  border-bottom: 3px solid #667eea;
  padding-bottom: 0.5rem;
  font-size: 1.3rem;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.key-input {
  display: flex;
  gap: 0.5rem;
}

.key-input input {
  flex: 1;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.btn-generate {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-generate:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.key-info,
.data-info {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  font-size: 14px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.info-item .value {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.data-info {
  justify-content: space-between;
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-clear,
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 2px solid var(--vp-c-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
  border-color: #667eea;
}

.btn-clear {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: white;
}

.btn-clear:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-copy {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 12px;
}

.btn-copy:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.result-item {
  margin-bottom: 1.5rem;
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

.result-item textarea,
.result-item input {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  margin-bottom: 0.5rem;
}

.result-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-info {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.performance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
}

.performance-item .label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.performance-item .value {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.error-section {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.error-section h3 {
  border-bottom-color: #ff6b6b;
  color: #ff6b6b;
}

.error-content {
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid #ff6b6b;
}

.algorithm-info {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
}

.info-content h4 {
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.info-content p {
  margin-bottom: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.info-content ul {
  margin: 0;
  padding-left: 1.5rem;
}

.info-content li {
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.info-content strong {
  color: var(--vp-c-text-1);
}

@media (max-width: 768px) {
  .symmetric-demo {
    padding: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .key-input {
    flex-direction: column;
  }

  .key-info,
  .data-info {
    flex-direction: column;
    gap: 1rem;
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
