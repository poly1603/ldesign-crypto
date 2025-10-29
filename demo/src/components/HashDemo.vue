<script setup lang="ts">
import { ref, computed } from 'vue'
import { hash } from '@ldesign/crypto'

/**
 * 哈希算法演示组件
 */

// 输入数据
const input = ref('Hello, LDesign Crypto!')
const algorithm = ref<'MD5' | 'SHA1' | 'SHA256' | 'SHA512'>('SHA256')

// 哈希结果
const hashResult = ref('')
const processing = ref(false)

// 算法选项
const algorithms = [
  { value: 'MD5', label: 'MD5', security: '低' },
  { value: 'SHA1', label: 'SHA-1', security: '低' },
  { value: 'SHA256', label: 'SHA-256', security: '高' },
  { value: 'SHA512', label: 'SHA-512', security: '最高' },
]

/**
 * 计算哈希
 */
async function calculateHash() {
  if (!input.value) {
    return
  }

  processing.value = true

  try {
    let result

    switch (algorithm.value) {
      case 'MD5':
        result = await hash.md5(input.value)
        break
      case 'SHA1':
        result = await hash.sha1(input.value)
        break
      case 'SHA256':
        result = await hash.sha256(input.value)
        break
      case 'SHA512':
        result = await hash.sha512(input.value)
        break
    }

    if (result.success && result.data) {
      hashResult.value = result.data
    }
  } finally {
    processing.value = false
  }
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

// 自动计算
import { watch } from 'vue'
watch([input, algorithm], () => {
  if (input.value) {
    calculateHash()
  }
}, { immediate: true })
</script>

<template>
  <div class="demo-card">
    <div class="card-header">
      <h2 class="card-title">#️⃣ 哈希算法</h2>
      <p class="card-description">
        哈希算法可以将任意长度的数据转换为固定长度的摘要，广泛用于数据完整性校验和密码存储。
      </p>
    </div>

    <div class="card-content">
      <!-- 算法选择 -->
      <div class="form-group">
        <label class="form-label">哈希算法</label>
        <div class="algorithm-grid">
          <button
            v-for="algo in algorithms"
            :key="algo.value"
            :class="['algorithm-btn', { active: algorithm === algo.value }]"
            @click="algorithm = algo.value as any"
          >
            <div class="algorithm-name">{{ algo.label }}</div>
            <div class="algorithm-security">
              安全级别: <span :class="`security-${algo.security}`">{{ algo.security }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 输入数据 -->
      <div class="form-group">
        <label class="form-label">输入数据</label>
        <textarea
          v-model="input"
          class="form-textarea"
          rows="5"
          placeholder="请输入要计算哈希的内容"
        />
        <div class="input-info">
          数据长度: {{ input.length }} 字符
        </div>
      </div>

      <!-- 哈希结果 -->
      <div v-if="hashResult" class="result-section">
        <div class="result-header">
          <label class="result-label">哈希值 ({{ algorithm }})</label>
          <button
            class="btn-copy"
            @click="copyToClipboard(hashResult)"
            title="复制"
          >
            📋 复制
          </button>
        </div>
        <div class="hash-result">
          <code>{{ hashResult }}</code>
        </div>
        <div class="hash-info">
          长度: {{ hashResult.length }} 字符 | 
          {{ (hashResult.length / 2 * 8) }} 位
        </div>
      </div>

      <!-- 应用场景 -->
      <div class="scenarios-section">
        <h3 class="section-title">📌 常见应用场景</h3>
        <div class="scenarios-grid">
          <div class="scenario-card">
            <div class="scenario-icon">🔐</div>
            <div class="scenario-title">密码存储</div>
            <div class="scenario-desc">
              将用户密码哈希后存储，避免明文泄露
            </div>
          </div>
          <div class="scenario-card">
            <div class="scenario-icon">✅</div>
            <div class="scenario-title">数据完整性</div>
            <div class="scenario-desc">
              校验文件下载、传输过程中是否被篡改
            </div>
          </div>
          <div class="scenario-card">
            <div class="scenario-icon">🔍</div>
            <div class="scenario-title">数据去重</div>
            <div class="scenario-desc">
              通过哈希值快速判断数据是否重复
            </div>
          </div>
          <div class="scenario-card">
            <div class="scenario-icon">📝</div>
            <div class="scenario-title">数字签名</div>
            <div class="scenario-desc">
              对数据哈希值签名，验证数据来源
            </div>
          </div>
        </div>
      </div>

      <!-- 算法对比 -->
      <div class="comparison-section">
        <h3 class="section-title">📊 算法对比</h3>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>算法</th>
                <th>输出长度</th>
                <th>安全性</th>
                <th>性能</th>
                <th>推荐使用</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MD5</td>
                <td>128 位</td>
                <td class="text-danger">低 (已破解)</td>
                <td class="text-success">极快</td>
                <td>❌ 不推荐</td>
              </tr>
              <tr>
                <td>SHA-1</td>
                <td>160 位</td>
                <td class="text-warning">低 (已破解)</td>
                <td class="text-success">快</td>
                <td>❌ 不推荐</td>
              </tr>
              <tr>
                <td>SHA-256</td>
                <td>256 位</td>
                <td class="text-success">高</td>
                <td class="text-info">中等</td>
                <td>✅ 推荐</td>
              </tr>
              <tr>
                <td>SHA-512</td>
                <td>512 位</td>
                <td class="text-success">最高</td>
                <td class="text-warning">较慢</td>
                <td>✅ 高安全场景</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="info-section">
        <h3 class="info-title">💡 使用说明</h3>
        <ul class="info-list">
          <li><strong>单向性</strong>：哈希是单向函数，无法从哈希值还原原始数据</li>
          <li><strong>确定性</strong>：相同的输入总是产生相同的哈希值</li>
          <li><strong>雪崩效应</strong>：输入的微小变化会导致哈希值巨大变化</li>
          <li><strong>抗碰撞</strong>：很难找到两个不同的输入产生相同的哈希值</li>
          <li><strong>安全建议</strong>：对于密码存储，建议使用 SHA-256 或更高级别的算法</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './demo-styles.css';

.algorithm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.algorithm-btn {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.algorithm-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.algorithm-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.algorithm-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.algorithm-security {
  font-size: 0.875rem;
  opacity: 0.8;
}

.security-低 {
  color: #ef4444;
}

.security-高,
.security-最高 {
  color: #10b981;
}

.algorithm-btn.active .security-低,
.algorithm-btn.active .security-高,
.algorithm-btn.active .security-最高 {
  color: white;
}

.input-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.hash-result {
  padding: 1rem;
  background: #1f2937;
  color: #10b981;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  line-height: 1.6;
}

.hash-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
}

.scenarios-section,
.comparison-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.scenario-card {
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  text-align: center;
  transition: all 0.2s;
}

.scenario-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
}

.scenario-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.scenario-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.scenario-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.comparison-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

thead {
  background: #f9fafb;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:hover {
  background: #f9fafb;
}

.text-danger {
  color: #ef4444;
}

.text-warning {
  color: #f59e0b;
}

.text-success {
  color: #10b981;
}

.text-info {
  color: #3b82f6;
}
</style>


