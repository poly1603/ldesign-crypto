<script setup lang="ts">
import { ref, computed } from 'vue'
import { PasswordStrengthChecker } from '@ldesign/crypto'

/**
 * 密码强度检测演示组件
 */

// 密码强度检测器实例
const checker = new PasswordStrengthChecker()

// 密码输入
const password = ref('')

// 分析结果
const analysis = computed(() => {
  if (!password.value) return null
  return checker.analyze(password.value)
})

// 强度等级颜色
const strengthColors = {
  0: { color: '#ef4444', label: '非常弱', bg: '#fee2e2' },
  1: { color: '#f59e0b', label: '弱', bg: '#fed7aa' },
  2: { color: '#eab308', label: '中等', bg: '#fef08a' },
  3: { color: '#84cc16', label: '强', bg: '#d9f99d' },
  4: { color: '#22c55e', label: '非常强', bg: '#bbf7d0' },
}

// 强度百分比
const strengthPercent = computed(() => {
  if (!analysis.value) return 0
  return (analysis.value.strength / 4) * 100
})

// 当前强度样式
const currentStrength = computed(() => {
  if (!analysis.value) return strengthColors[0]
  return strengthColors[analysis.value.strength as keyof typeof strengthColors]
})

// 建议示例密码
const examplePasswords = [
  { password: '123456', desc: '纯数字，极弱' },
  { password: 'password', desc: '常见单词，极弱' },
  { password: 'Pass123', desc: '字母+数字，弱' },
  { password: 'MyP@ssw0rd', desc: '字母+数字+符号，中等' },
  { password: 'C0mpl3x!P@ssW0rd#2024', desc: '复杂密码，强' },
]

/**
 * 使用示例密码
 */
function useExample(examplePassword: string) {
  password.value = examplePassword
}
</script>

<template>
  <div class="demo-card">
    <div class="card-header">
      <h2 class="card-title">💪 密码强度检测</h2>
      <p class="card-description">
        实时分析密码强度，提供详细的安全评分和改进建议。
      </p>
    </div>

    <div class="card-content">
      <!-- 密码输入 -->
      <div class="form-group">
        <label class="form-label">输入密码</label>
        <input
          v-model="password"
          type="text"
          class="form-input"
          placeholder="请输入要检测的密码"
        />
      </div>

      <!-- 强度指示器 -->
      <div v-if="analysis" class="strength-indicator">
        <div class="strength-bar-container">
          <div
            class="strength-bar"
            :style="{
              width: `${strengthPercent}%`,
              background: currentStrength.color,
            }"
          />
        </div>
        <div class="strength-label" :style="{ color: currentStrength.color }">
          {{ currentStrength.label }}
        </div>
      </div>

      <!-- 详细分析 -->
      <div v-if="analysis" class="analysis-section">
        <h3 class="section-title">📊 详细分析</h3>
        
        <div class="analysis-grid">
          <!-- 基本信息 -->
          <div class="analysis-card">
            <div class="analysis-icon">📏</div>
            <div class="analysis-label">密码长度</div>
            <div class="analysis-value">{{ analysis.length }} 字符</div>
          </div>

          <!-- 字符类型 -->
          <div class="analysis-card">
            <div class="analysis-icon">🔤</div>
            <div class="analysis-label">字符类型</div>
            <div class="analysis-value">
              <div class="char-types">
                <span v-if="analysis.hasLowerCase" class="char-badge">小写</span>
                <span v-if="analysis.hasUpperCase" class="char-badge">大写</span>
                <span v-if="analysis.hasNumbers" class="char-badge">数字</span>
                <span v-if="analysis.hasSymbols" class="char-badge">符号</span>
              </div>
            </div>
          </div>

          <!-- 安全评分 -->
          <div class="analysis-card">
            <div class="analysis-icon">⭐</div>
            <div class="analysis-label">安全评分</div>
            <div class="analysis-value">{{ analysis.score }} / 100</div>
          </div>

          <!-- 破解时间估算 -->
          <div class="analysis-card">
            <div class="analysis-icon">⏱️</div>
            <div class="analysis-label">破解难度</div>
            <div class="analysis-value">
              {{ analysis.estimatedCrackTime }}
            </div>
          </div>
        </div>

        <!-- 建议 -->
        <div v-if="analysis.suggestions.length > 0" class="suggestions-section">
          <h4 class="suggestions-title">💡 改进建议</h4>
          <ul class="suggestions-list">
            <li
              v-for="(suggestion, index) in analysis.suggestions"
              :key="index"
              class="suggestion-item"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- 常见问题 -->
        <div v-if="analysis.isCommon" class="alert alert-error">
          ⚠️ 这是一个常见密码，极易被破解！请使用更复杂的密码。
        </div>
      </div>

      <!-- 示例密码 -->
      <div class="examples-section">
        <h3 class="section-title">📝 示例密码</h3>
        <div class="examples-grid">
          <button
            v-for="(example, index) in examplePasswords"
            :key="index"
            class="example-card"
            @click="useExample(example.password)"
          >
            <code class="example-password">{{ example.password }}</code>
            <div class="example-desc">{{ example.desc }}</div>
          </button>
        </div>
      </div>

      <!-- 密码安全建议 -->
      <div class="info-section">
        <h3 class="info-title">🔐 密码安全最佳实践</h3>
        <ul class="info-list">
          <li><strong>长度至少 12 位</strong>：更长的密码更难破解</li>
          <li><strong>混合字符类型</strong>：包含大小写字母、数字和特殊符号</li>
          <li><strong>避免常见词汇</strong>：不要使用字典中的单词或常见短语</li>
          <li><strong>避免个人信息</strong>：不要使用生日、电话号码等容易猜到的信息</li>
          <li><strong>每个账户使用不同密码</strong>：防止一个账户被破解影响其他账户</li>
          <li><strong>定期更换密码</strong>：建议每 3-6 个月更换一次重要账户密码</li>
          <li><strong>使用密码管理器</strong>：帮助生成和记忆复杂密码</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './demo-styles.css';

.strength-indicator {
  margin: 1.5rem 0;
}

.strength-bar-container {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.strength-label {
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  transition: color 0.3s;
}

.analysis-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.analysis-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 0.75rem;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.analysis-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.analysis-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.analysis-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.analysis-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.char-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.char-badge {
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.suggestions-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #fffbeb;
  border-radius: 0.5rem;
  border-left: 4px solid #f59e0b;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #92400e;
}

.suggestions-list {
  list-style-position: inside;
  color: #92400e;
  line-height: 1.8;
}

.suggestion-item {
  margin-bottom: 0.5rem;
}

.examples-section {
  margin-top: 2rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.example-card {
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.example-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.example-password {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.example-desc {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>


