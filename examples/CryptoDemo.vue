<template>
  <div class="crypto-demo">
    <div class="demo-header">
      <h1>🔐 LDesign Crypto 演示</h1>
      <p>功能完整的加解密模块，支持主流算法和国密算法</p>
    </div>

    <!-- 对称加密演示 -->
    <div class="demo-section">
      <h2>🔒 对称加密 (AES)</h2>
      <div class="form-group">
        <label>待加密数据:</label>
        <textarea v-model="symmetricData" placeholder="输入要加密的数据"></textarea>
      </div>
      <div class="form-group">
        <label>密钥:</label>
        <input v-model="symmetricKey" placeholder="32位十六进制密钥" />
        <button @click="generateSymmetricKey" class="btn-generate">生成密钥</button>
      </div>
      <div class="button-group">
        <button @click="encryptSymmetric" :disabled="symmetricLoading" class="btn-primary">
          {{ symmetricLoading ? '加密中...' : '加密' }}
        </button>
        <button @click="decryptSymmetric" :disabled="symmetricLoading" class="btn-secondary">
          {{ symmetricLoading ? '解密中...' : '解密' }}
        </button>
      </div>
      <div v-if="symmetricError" class="error">{{ symmetricError }}</div>
      <div v-if="symmetricResult" class="result">
        <strong>结果:</strong> {{ symmetricResult }}
      </div>
    </div>

    <!-- 哈希算法演示 -->
    <div class="demo-section">
      <h2>🔍 哈希算法</h2>
      <div class="form-group">
        <label>待哈希数据:</label>
        <textarea v-model="hashData" placeholder="输入要计算哈希的数据"></textarea>
      </div>
      <div class="form-group">
        <label>算法:</label>
        <select v-model="hashAlgorithm">
          <option value="MD5">MD5</option>
          <option value="SHA1">SHA1</option>
          <option value="SHA256">SHA256</option>
          <option value="SHA512">SHA512</option>
          <option value="SM3">SM3 (国密)</option>
        </select>
      </div>
      <div class="form-group">
        <label>盐值 (可选):</label>
        <input v-model="hashSalt" placeholder="输入盐值" />
      </div>
      <button @click="calculateHash" :disabled="hashLoading" class="btn-primary">
        {{ hashLoading ? '计算中...' : '计算哈希' }}
      </button>
      <div v-if="hashError" class="error">{{ hashError }}</div>
      <div v-if="hashResult" class="result">
        <strong>{{ hashAlgorithm }}:</strong> {{ hashResult }}
      </div>
    </div>

    <!-- 国密SM2演示 -->
    <div class="demo-section">
      <h2>🇨🇳 国密SM2算法</h2>
      <div class="form-group">
        <button @click="generateSM2Keys" :disabled="sm2Loading" class="btn-generate">
          {{ sm2Loading ? '生成中...' : '生成SM2密钥对' }}
        </button>
      </div>
      <div v-if="sm2KeyPair" class="key-pair">
        <div class="key-item">
          <label>公钥:</label>
          <textarea :value="sm2KeyPair.publicKey" readonly></textarea>
        </div>
        <div class="key-item">
          <label>私钥:</label>
          <textarea :value="sm2KeyPair.privateKey" readonly></textarea>
        </div>
      </div>
      <div class="form-group">
        <label>待加密数据:</label>
        <textarea v-model="sm2Data" placeholder="输入要加密的数据"></textarea>
      </div>
      <div class="button-group">
        <button @click="encryptSM2" :disabled="sm2Loading || !sm2KeyPair" class="btn-primary">
          {{ sm2Loading ? '加密中...' : 'SM2加密' }}
        </button>
        <button @click="decryptSM2" :disabled="sm2Loading || !sm2KeyPair" class="btn-secondary">
          {{ sm2Loading ? '解密中...' : 'SM2解密' }}
        </button>
      </div>
      <div v-if="sm2Error" class="error">{{ sm2Error }}</div>
      <div v-if="sm2Result" class="result">
        <strong>结果:</strong> {{ sm2Result }}
      </div>
    </div>

    <!-- 工具功能演示 -->
    <div class="demo-section">
      <h2>🛠️ 工具功能</h2>
      <div class="tool-grid">
        <div class="tool-item">
          <h3>随机字符串生成</h3>
          <div class="form-group">
            <label>长度:</label>
            <input v-model.number="randomLength" type="number" min="1" max="128" />
          </div>
          <div class="form-group">
            <label>字符集:</label>
            <select v-model="randomCharset">
              <option value="hex">十六进制</option>
              <option value="alphanumeric">字母数字</option>
              <option value="base64">Base64</option>
            </select>
          </div>
          <button @click="generateRandomString" class="btn-primary">生成</button>
          <div v-if="randomResult" class="result">{{ randomResult }}</div>
        </div>

        <div class="tool-item">
          <h3>密钥生成</h3>
          <div class="form-group">
            <label>算法:</label>
            <select v-model="keyAlgorithm">
              <option value="AES">AES</option>
              <option value="DES">DES</option>
              <option value="SM4">SM4</option>
            </select>
          </div>
          <button @click="generateKey" class="btn-primary">生成密钥</button>
          <div v-if="keyResult" class="result">{{ keyResult }}</div>
        </div>
      </div>
    </div>

    <!-- 性能统计 -->
    <div class="demo-section">
      <h2>📊 性能统计</h2>
      <button @click="refreshMetrics" class="btn-secondary">刷新统计</button>
      <div v-if="performanceMetrics" class="metrics">
        <div v-for="(stats, operation) in performanceMetrics" :key="operation" class="metric-item">
          <h4>{{ operation }}</h4>
          <p>执行次数: {{ stats.count }}</p>
          <p>平均耗时: {{ stats.average.toFixed(2) }}ms</p>
          <p>最小耗时: {{ stats.min.toFixed(2) }}ms</p>
          <p>最大耗时: {{ stats.max.toFixed(2) }}ms</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCrypto, useSymmetricCrypto, useHash, useSM } from '../src/vue'

// 使用组合式API
const crypto = useCrypto()
const { isLoading: symmetricLoading, error: symmetricError, result: symmetricResult, encrypt: encryptSymmetric, decrypt: decryptSymmetric } = useSymmetricCrypto()
const { isLoading: hashLoading, error: hashError, result: hashResult, hash: calculateHash } = useHash()
const { isLoading: sm2Loading, error: sm2Error, result: sm2Result, keyPair: sm2KeyPair, generateSM2KeyPair, sm2Encrypt: encryptSM2, sm2Decrypt: decryptSM2 } = useSM()

// 响应式数据
const symmetricData = ref('Hello, LDesign Crypto!')
const symmetricKey = ref('')
const hashData = ref('Hello, Hash!')
const hashAlgorithm = ref<'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'SM3'>('SHA256')
const hashSalt = ref('')
const sm2Data = ref('Hello, SM2!')
const randomLength = ref(16)
const randomCharset = ref<'hex' | 'alphanumeric' | 'base64'>('hex')
const randomResult = ref('')
const keyAlgorithm = ref<'AES' | 'DES' | 'SM4'>('AES')
const keyResult = ref('')
const performanceMetrics = ref<any>(null)

// 方法
const generateSymmetricKey = () => {
  symmetricKey.value = crypto.generateKey('AES', 256)
}

const generateRandomString = () => {
  randomResult.value = crypto.generateRandom({
    length: randomLength.value,
    charset: randomCharset.value
  })
}

const generateKey = () => {
  keyResult.value = crypto.generateKey(keyAlgorithm.value)
}

const refreshMetrics = () => {
  performanceMetrics.value = crypto.getPerformanceMetrics()
}

// 生命周期
onMounted(() => {
  generateSymmetricKey()
  refreshMetrics()
})
</script>

<style scoped>
.crypto-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
}

.demo-section h2 {
  color: #495057;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.btn-primary,
.btn-secondary,
.btn-generate {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-generate {
  background: #28a745;
  color: white;
}

.btn-generate:hover:not(:disabled) {
  background: #1e7e34;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.result {
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  word-break: break-all;
}

.key-pair {
  margin: 1rem 0;
}

.key-item {
  margin-bottom: 1rem;
}

.key-item textarea {
  height: 60px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tool-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.tool-item h3 {
  margin-bottom: 1rem;
  color: #495057;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.metric-item {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.metric-item h4 {
  margin-bottom: 0.5rem;
  color: #007bff;
}

.metric-item p {
  margin: 0.25rem 0;
  font-size: 14px;
}
</style>
