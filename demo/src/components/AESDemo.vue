<script setup lang="ts">
import { ref, computed } from 'vue'
import { encrypt, decrypt } from '@ldesign/crypto'

/**
 * AES 加密演示组件
 */

// 输入数据
const plaintext = ref('Hello, LDesign Crypto!')
const key = ref('my-secret-key-123')
const algorithm = ref<'AES-128-CBC' | 'AES-192-CBC' | 'AES-256-CBC'>('AES-256-CBC')

// 加密结果
const encrypted = ref('')
const decrypted = ref('')
const error = ref('')
const processing = ref(false)

// 算法选项
const algorithmOptions = [
  { value: 'AES-128-CBC', label: 'AES-128-CBC' },
  { value: 'AES-192-CBC', label: 'AES-192-CBC' },
  { value: 'AES-256-CBC', label: 'AES-256-CBC' },
]

/**
 * 执行加密
 */
async function handleEncrypt() {
  if (!plaintext.value || !key.value) {
    error.value = '请输入明文和密钥'
    return
  }

  processing.value = true
  error.value = ''
  decrypted.value = ''

  try {
    const result = await encrypt.aes(plaintext.value, key.value, {
      mode: 'CBC',
      keySize: algorithm.value.includes('128') ? 128 : algorithm.value.includes('192') ? 192 : 256,
    })

    if (result.success && result.data) {
      encrypted.value = result.data
    } else {
      error.value = result.error || '加密失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加密过程出错'
  } finally {
    processing.value = false
  }
}

/**
 * 执行解密
 */
async function handleDecrypt() {
  if (!encrypted.value || !key.value) {
    error.value = '请先加密或输入密文'
    return
  }

  processing.value = true
  error.value = ''

  try {
    const result = await decrypt.aes(encrypted.value, key.value, {
      mode: 'CBC',
      keySize: algorithm.value.includes('128') ? 128 : algorithm.value.includes('192') ? 192 : 256,
    })

    if (result.success && result.data) {
      decrypted.value = result.data
    } else {
      error.value = result.error || '解密失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '解密过程出错'
  } finally {
    processing.value = false
  }
}

/**
 * 清空所有内容
 */
function handleClear() {
  plaintext.value = 'Hello, LDesign Crypto!'
  key.value = 'my-secret-key-123'
  encrypted.value = ''
  decrypted.value = ''
  error.value = ''
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    alert('复制失败')
  }
}
</script>

<template>
  <div class="demo-card">
    <div class="card-header">
      <h2 class="card-title">🔒 AES 对称加密</h2>
      <p class="card-description">
        AES (Advanced Encryption Standard) 是最广泛使用的对称加密算法，支持 128/192/256 位密钥。
      </p>
    </div>

    <div class="card-content">
      <!-- 算法选择 -->
      <div class="form-group">
        <label class="form-label">算法类型</label>
        <select v-model="algorithm" class="form-select">
          <option
            v-for="opt in algorithmOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- 密钥输入 -->
      <div class="form-group">
        <label class="form-label">密钥 (Secret Key)</label>
        <input
          v-model="key"
          type="text"
          class="form-input"
          placeholder="请输入密钥"
        />
      </div>

      <!-- 明文输入 -->
      <div class="form-group">
        <label class="form-label">明文 (Plaintext)</label>
        <textarea
          v-model="plaintext"
          class="form-textarea"
          rows="4"
          placeholder="请输入要加密的内容"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="button-group">
        <button
          class="btn btn-primary"
          :disabled="processing"
          @click="handleEncrypt"
        >
          {{ processing ? '处理中...' : '🔒 加密' }}
        </button>
        <button
          class="btn btn-secondary"
          :disabled="processing || !encrypted"
          @click="handleDecrypt"
        >
          🔓 解密
        </button>
        <button
          class="btn btn-outline"
          @click="handleClear"
        >
          🗑️ 清空
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="alert alert-error">
        ❌ {{ error }}
      </div>

      <!-- 加密结果 -->
      <div v-if="encrypted" class="result-section">
        <div class="result-header">
          <label class="result-label">密文 (Ciphertext)</label>
          <button
            class="btn-icon"
            @click="copyToClipboard(encrypted)"
            title="复制"
          >
            📋
          </button>
        </div>
        <div class="result-box">
          <code>{{ encrypted }}</code>
        </div>
      </div>

      <!-- 解密结果 -->
      <div v-if="decrypted" class="result-section">
        <div class="result-header">
          <label class="result-label">解密结果</label>
          <span class="badge badge-success">✓ 解密成功</span>
        </div>
        <div class="result-box result-success">
          {{ decrypted }}
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="info-section">
        <h3 class="info-title">💡 使用说明</h3>
        <ul class="info-list">
          <li>AES 是对称加密算法，加密和解密使用相同的密钥</li>
          <li>密钥长度决定了安全级别：128位（快速）、192位（平衡）、256位（最安全）</li>
          <li>CBC 模式使用初始化向量 (IV) 增强安全性</li>
          <li>请妥善保管密钥，密钥泄露会导致数据泄露</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 1rem;
  opacity: 0.95;
  line-height: 1.6;
}

.card-content {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #10b981;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-outline {
  background: transparent;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.result-section {
  margin-bottom: 1.5rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.result-label {
  font-weight: 600;
  color: #374151;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.1);
}

.result-box {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.result-success {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.info-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #eff6ff;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1e40af;
}

.info-list {
  list-style-position: inside;
  color: #1e40af;
  line-height: 1.8;
}

.info-list li {
  margin-bottom: 0.5rem;
}
</style>


