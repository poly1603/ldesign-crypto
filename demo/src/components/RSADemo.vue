<script setup lang="ts">
import { ref } from 'vue'
import { rsa } from '@ldesign/crypto'

/**
 * RSA 非对称加密演示组件
 */

// RSA 密钥对
const publicKey = ref('')
const privateKey = ref('')
const keySize = ref<1024 | 2048 | 4096>(2048)

// 加密相关
const plaintext = ref('Hello, RSA Encryption!')
const encrypted = ref('')
const decrypted = ref('')
const error = ref('')
const processing = ref(false)
const generating = ref(false)

/**
 * 生成 RSA 密钥对
 */
async function generateKeyPair() {
  generating.value = true
  error.value = ''

  try {
    const result = await rsa.generateKeyPair({
      keySize: keySize.value,
    })

    if (result.success && result.data) {
      publicKey.value = result.data.publicKey
      privateKey.value = result.data.privateKey
    } else {
      error.value = result.error || '密钥生成失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '密钥生成出错'
  } finally {
    generating.value = false
  }
}

/**
 * 执行加密
 */
async function handleEncrypt() {
  if (!plaintext.value || !publicKey.value) {
    error.value = '请先生成密钥并输入明文'
    return
  }

  processing.value = true
  error.value = ''
  decrypted.value = ''

  try {
    const result = await rsa.encrypt(plaintext.value, publicKey.value)

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
  if (!encrypted.value || !privateKey.value) {
    error.value = '请先加密并确保有私钥'
    return
  }

  processing.value = true
  error.value = ''

  try {
    const result = await rsa.decrypt(encrypted.value, privateKey.value)

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
  plaintext.value = 'Hello, RSA Encryption!'
  encrypted.value = ''
  decrypted.value = ''
  error.value = ''
}
</script>

<template>
  <div class="demo-card">
    <div class="card-header">
      <h2 class="card-title">🔑 RSA 非对称加密</h2>
      <p class="card-description">
        RSA 是最广泛使用的非对称加密算法，使用公钥加密、私钥解密，适用于密钥交换和数字签名。
      </p>
    </div>

    <div class="card-content">
      <!-- 密钥生成 -->
      <div class="key-generation-section">
        <h3 class="section-title">1. 生成密钥对</h3>
        
        <div class="form-group">
          <label class="form-label">密钥长度</label>
          <select v-model.number="keySize" class="form-select">
            <option :value="1024">1024 位 (不推荐，仅测试)</option>
            <option :value="2048">2048 位 (推荐)</option>
            <option :value="4096">4096 位 (最安全，较慢)</option>
          </select>
        </div>

        <button
          class="btn btn-primary"
          :disabled="generating"
          @click="generateKeyPair"
        >
          {{ generating ? '生成中...' : '🔑 生成密钥对' }}
        </button>

        <!-- 公钥显示 -->
        <div v-if="publicKey" class="key-display">
          <label class="key-label">公钥 (Public Key)</label>
          <textarea
            v-model="publicKey"
            class="key-textarea"
            rows="4"
            readonly
          />
        </div>

        <!-- 私钥显示 -->
        <div v-if="privateKey" class="key-display">
          <label class="key-label">私钥 (Private Key) ⚠️ 请妥善保管</label>
          <textarea
            v-model="privateKey"
            class="key-textarea key-private"
            rows="4"
            readonly
          />
        </div>
      </div>

      <!-- 加密解密 -->
      <div v-if="publicKey && privateKey" class="encryption-section">
        <h3 class="section-title">2. 加密与解密</h3>

        <!-- 明文输入 -->
        <div class="form-group">
          <label class="form-label">明文</label>
          <textarea
            v-model="plaintext"
            class="form-textarea"
            rows="3"
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

        <!-- 密文 -->
        <div v-if="encrypted" class="result-section">
          <label class="result-label">密文 (Ciphertext)</label>
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
      </div>

      <!-- 使用说明 -->
      <div class="info-section">
        <h3 class="info-title">💡 使用说明</h3>
        <ul class="info-list">
          <li><strong>公钥加密</strong>：使用公钥加密数据，只有对应的私钥才能解密</li>
          <li><strong>私钥解密</strong>：私钥必须严格保密，泄露会导致安全问题</li>
          <li><strong>密钥长度</strong>：2048位是当前的推荐标准，4096位更安全但性能较慢</li>
          <li><strong>应用场景</strong>：适用于密钥交换、数字签名、身份验证</li>
          <li><strong>性能考虑</strong>：RSA 加密较慢，不适合大量数据，通常用于加密对称密钥</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './demo-styles.css';

.key-generation-section,
.encryption-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px dashed #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.key-display {
  margin-top: 1rem;
}

.key-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.key-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  resize: vertical;
  background: #f9fafb;
}

.key-private {
  border-color: #fbbf24;
  background: #fffbeb;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
</style>


