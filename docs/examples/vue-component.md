# Vue 组件示例

这里展示了如何在 Vue 3 项目中使用 @ldesign/crypto 创建实用的加密组件。

## 文件加密组件

### 基础文件加密器

一个完整的文件加密/解密组件示例，支持拖拽上传、进度显示和密码强度检测。

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHash, useSymmetricCrypto } from '@ldesign/crypto'

// 组合式 API
const { encrypt, decrypt, generateKey } = useSymmetricCrypto()
const { hash } = useHash()

// 响应式数据
const selectedFile = ref<File | null>(null)
const password = ref('')
const showPassword = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const progressText = ref('')
const result = ref<any>(null)
const error = ref('')
const processedBlob = ref<Blob | null>(null)

// 计算属性
const canEncrypt = computed(() =>
  selectedFile.value && password.value.length >= 6 && !isProcessing.value
)

const canDecrypt = computed(() =>
  selectedFile.value && password.value && !isProcessing.value
)

const passwordStrength = computed(() => {
  const pwd = password.value
  let score = 0
  const feedback = []

  if (pwd.length >= 8)
score += 1
  else feedback.push('至少8位')

  if (/[a-z]/.test(pwd))
score += 1
  else feedback.push('包含小写字母')

  if (/[A-Z]/.test(pwd))
score += 1
  else feedback.push('包含大写字母')

  if (/\d/.test(pwd))
score += 1
  else feedback.push('包含数字')

  if (/[^a-z0-9]/i.test(pwd))
score += 1
  else feedback.push('包含特殊字符')

  const levels = [
    { level: 'very-weak', text: '很弱', percentage: 20 },
    { level: 'weak', text: '弱', percentage: 40 },
    { level: 'medium', text: '中等', percentage: 60 },
    { level: 'strong', text: '强', percentage: 80 },
    { level: 'very-strong', text: '很强', percentage: 100 }
  ]

  return levels[Math.min(score, 4)]
})

// 方法
function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    result.value = null
    error.value = ''
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0)
return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

async function encryptFile() {
  if (!selectedFile.value || !password.value)
return

  isProcessing.value = true
  progress.value = 0
  progressText.value = '准备加密...'
  error.value = ''

  try {
    const startTime = Date.now()

    // 1. 读取文件
    progressText.value = '读取文件...'
    progress.value = 10

    const fileBuffer = await selectedFile.value.arrayBuffer()

    // 2. 计算文件哈希
    progressText.value = '计算文件哈希...'
    progress.value = 20

    const fileHash = await hash(fileBuffer, 'SHA-256')

    // 3. 从密码派生密钥
    progressText.value = '派生加密密钥...'
    progress.value = 30

    const salt = generateKey('AES', 256).substring(0, 32)
    const derivedKey = await deriveKeyFromPassword(password.value, salt)

    // 4. 加密文件
    progressText.value = '加密文件数据...'
    progress.value = 50

    const encrypted = await encrypt(fileBuffer, {
      key: derivedKey,
      mode: 'GCM'
    })

    // 5. 创建加密包
    progressText.value = '创建加密包...'
    progress.value = 80

    const encryptedPackage = {
      version: '1.0',
      algorithm: 'AES-256-GCM',
      salt,
      iv: encrypted.iv,
      tag: encrypted.tag,
      data: encrypted.data,
      originalName: selectedFile.value.name,
      originalSize: selectedFile.value.size,
      hash: fileHash,
      timestamp: new Date().toISOString()
    }

    // 6. 创建下载文件
    progressText.value = '准备下载...'
    progress.value = 90

    const packageJson = JSON.stringify(encryptedPackage)
    processedBlob.value = new Blob([packageJson], { type: 'application/json' })

    const duration = Date.now() - startTime
    progress.value = 100

    result.value = {
      type: 'encrypt',
      originalName: selectedFile.value.name,
      processedName: `${selectedFile.value.name}.encrypted`,
      duration,
      hash: fileHash
    }
  }
 catch (err) {
    error.value = `加密失败: ${err.message}`
  }
 finally {
    isProcessing.value = false
  }
}

async function decryptFile() {
  if (!selectedFile.value || !password.value)
return

  isProcessing.value = true
  progress.value = 0
  progressText.value = '准备解密...'
  error.value = ''

  try {
    const startTime = Date.now()

    // 1. 读取加密包
    progressText.value = '读取加密包...'
    progress.value = 10

    const packageText = await selectedFile.value.text()
    const encryptedPackage = JSON.parse(packageText)

    // 2. 验证包格式
    progressText.value = '验证包格式...'
    progress.value = 20

    if (!encryptedPackage.version || !encryptedPackage.data) {
      throw new Error('无效的加密包格式')
    }

    // 3. 派生密钥
    progressText.value = '派生解密密钥...'
    progress.value = 30

    const derivedKey = await deriveKeyFromPassword(password.value, encryptedPackage.salt)

    // 4. 解密数据
    progressText.value = '解密文件数据...'
    progress.value = 50

    const decrypted = await decrypt(encryptedPackage.data, {
      key: derivedKey,
      mode: 'GCM',
      iv: encryptedPackage.iv,
      tag: encryptedPackage.tag
    })

    // 5. 验证文件完整性
    progressText.value = '验证文件完整性...'
    progress.value = 80

    const decryptedHash = await hash(decrypted.data, 'SHA-256')
    if (decryptedHash !== encryptedPackage.hash) {
      throw new Error('文件完整性验证失败')
    }

    // 6. 创建下载文件
    progressText.value = '准备下载...'
    progress.value = 90

    processedBlob.value = new Blob([decrypted.data])

    const duration = Date.now() - startTime
    progress.value = 100

    result.value = {
      type: 'decrypt',
      originalName: selectedFile.value.name,
      processedName: encryptedPackage.originalName,
      duration
    }
  }
 catch (err) {
    error.value = `解密失败: ${err.message}`
  }
 finally {
    isProcessing.value = false
  }
}

function downloadResult() {
  if (!processedBlob.value || !result.value)
return

  const url = URL.createObjectURL(processedBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = result.value.processedName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function clearError() {
  error.value = ''
}

// 辅助函数
async function deriveKeyFromPassword(password: string, salt: string) {
  // 这里应该使用真实的 PBKDF2 实现
  // 为了演示，我们使用简化版本
  return password + salt
}
</script>

<template>
  <div class="file-crypto">
    <h2>🔐 文件加密工具</h2>

    <!-- 文件选择 -->
    <div class="file-section">
      <h3>选择文件</h3>
      <input
        type="file"
        accept="*/*"
        :disabled="isProcessing"
        @change="handleFileSelect"
      >

      <div v-if="selectedFile" class="file-info">
        <p><strong>文件名:</strong> {{ selectedFile.name }}</p>
        <p><strong>大小:</strong> {{ formatFileSize(selectedFile.size) }}</p>
        <p><strong>类型:</strong> {{ selectedFile.type || '未知' }}</p>
      </div>
    </div>

    <!-- 密码输入 -->
    <div class="password-section">
      <h3>设置密码</h3>
      <div class="password-input">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="输入加密密码"
          :disabled="isProcessing"
        >
        <button class="toggle-password" @click="showPassword = !showPassword">
          {{ showPassword ? '👁️' : '🙈' }}
        </button>
      </div>

      <div class="password-strength">
        <div class="strength-bar">
          <div
            class="strength-fill"
            :style="{ width: `${passwordStrength.percentage}%` }"
            :class="passwordStrength.level"
          />
        </div>
        <span class="strength-text">{{ passwordStrength.text }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button
        :disabled="!canEncrypt"
        class="btn-primary"
        @click="encryptFile"
      >
        {{ isProcessing ? '加密中...' : '🔒 加密文件' }}
      </button>

      <button
        :disabled="!canDecrypt"
        class="btn-secondary"
        @click="decryptFile"
      >
        {{ isProcessing ? '解密中...' : '🔓 解密文件' }}
      </button>
    </div>

    <!-- 进度显示 -->
    <div v-if="isProcessing" class="progress-section">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="progress-text">
        {{ progressText }}
      </p>
    </div>

    <!-- 结果显示 -->
    <div v-if="result" class="result-section">
      <h3>{{ result.type === 'encrypt' ? '加密完成' : '解密完成' }}</h3>

      <div class="result-info">
        <p><strong>原文件:</strong> {{ result.originalName }}</p>
        <p><strong>处理后:</strong> {{ result.processedName }}</p>
        <p><strong>耗时:</strong> {{ result.duration }}ms</p>
        <p v-if="result.type === 'encrypt'">
          <strong>文件哈希:</strong> {{ result.hash }}
        </p>
      </div>

      <button class="btn-download" @click="downloadResult">
        📥 下载文件
      </button>
    </div>

    <!-- 错误显示 -->
    <div v-if="error" class="error-section">
      <h3>❌ 错误</h3>
      <p>{{ error }}</p>
      <button class="btn-clear" @click="clearError">
        清除
      </button>
    </div>
  </div>
</template>

<style scoped>
.file-crypto {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.file-section,
.password-section,
.result-section,
.error-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
}

.file-info {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

.password-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.password-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.toggle-password {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.strength-bar {
  width: 100%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
}

.strength-fill.very-weak { background: #dc3545; }
.strength-fill.weak { background: #fd7e14; }
.strength-fill.medium { background: #ffc107; }
.strength-fill.strong { background: #20c997; }
.strength-fill.very-strong { background: #28a745; }

.actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.btn-primary,
.btn-secondary,
.btn-download,
.btn-clear {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-download {
  background: #28a745;
  color: white;
}

.btn-clear {
  background: #dc3545;
  color: white;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.progress-section {
  margin: 2rem 0;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e1e5e9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s;
}

.error-section {
  border-color: #dc3545;
  background: #f8d7da;
  color: #721c24;
}
</style>
```

## 密码管理器组件

一个简单的密码管理器组件示例。

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHash, useSymmetricCrypto } from '@ldesign/crypto'

const { encrypt, decrypt } = useSymmetricCrypto()
const { hash } = useHash()

const masterPassword = ref('')
const isUnlocked = ref(false)
const passwords = ref([])
const showAddForm = ref(false)
const newPassword = ref({
  site: '',
  username: '',
  password: ''
})

async function unlock() {
  // 验证主密码并解密密码库
  try {
    const stored = localStorage.getItem('encrypted-passwords')
    if (stored) {
      const encryptedData = JSON.parse(stored)
      const key = await deriveKey(masterPassword.value, encryptedData.salt)

      const decrypted = await decrypt(encryptedData.data, {
        key,
        mode: 'GCM',
        iv: encryptedData.iv,
        tag: encryptedData.tag
      })

      passwords.value = JSON.parse(decrypted.data)
    }

    isUnlocked.value = true
  }
 catch (error) {
    alert('主密码错误')
  }
}

async function addPassword() {
  const newItem = {
    id: Date.now(),
    site: newPassword.value.site,
    username: newPassword.value.username,
    password: newPassword.value.password,
    createdAt: new Date().toISOString()
  }

  passwords.value.push(newItem)
  await savePasswords()

  newPassword.value = { site: '', username: '', password: '' }
  showAddForm.value = false
}

async function savePasswords() {
  const data = JSON.stringify(passwords.value)
  const salt = generateSalt()
  const key = await deriveKey(masterPassword.value, salt)

  const encrypted = await encrypt(data, {
    key,
    mode: 'GCM'
  })

  const encryptedPackage = {
    salt,
    iv: encrypted.iv,
    tag: encrypted.tag,
    data: encrypted.data
  }

  localStorage.setItem('encrypted-passwords', JSON.stringify(encryptedPackage))
}

async function copyPassword(item) {
  try {
    await navigator.clipboard.writeText(item.password)
    alert('密码已复制到剪贴板')
  }
 catch (error) {
    console.error('复制失败:', error)
  }
}

async function deletePassword(id) {
  if (confirm('确定要删除这个密码吗？')) {
    passwords.value = passwords.value.filter(item => item.id !== id)
    await savePasswords()
  }
}

async function deriveKey(password, salt) {
  // 简化的密钥派生
  const combined = password + salt
  const hashed = await hash(combined, 'SHA-256')
  return hashed.substring(0, 64)
}

function generateSalt() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)).join('')
}

function cancelAdd() {
  newPassword.value = { site: '', username: '', password: '' }
  showAddForm.value = false
}
</script>

<template>
  <div class="password-manager">
    <h2>🔑 密码管理器</h2>

    <!-- 主密码设置 -->
    <div v-if="!isUnlocked" class="master-password">
      <h3>输入主密码</h3>
      <input
        v-model="masterPassword"
        type="password"
        placeholder="主密码"
        @keyup.enter="unlock"
      >
      <button :disabled="!masterPassword" @click="unlock">
        解锁
      </button>
    </div>

    <!-- 密码列表 -->
    <div v-else class="password-list">
      <div class="header">
        <h3>已保存的密码</h3>
        <button class="btn-add" @click="showAddForm = true">
          ➕ 添加密码
        </button>
      </div>

      <!-- 添加密码表单 -->
      <div v-if="showAddForm" class="add-form">
        <input v-model="newPassword.site" placeholder="网站名称">
        <input v-model="newPassword.username" placeholder="用户名">
        <input v-model="newPassword.password" placeholder="密码">
        <div class="form-actions">
          <button class="btn-save" @click="addPassword">
            保存
          </button>
          <button class="btn-cancel" @click="cancelAdd">
            取消
          </button>
        </div>
      </div>

      <!-- 密码条目 -->
      <div v-for="item in passwords" :key="item.id" class="password-item">
        <div class="item-info">
          <h4>{{ item.site }}</h4>
          <p>{{ item.username }}</p>
        </div>
        <div class="item-actions">
          <button class="btn-copy" @click="copyPassword(item)">
            📋 复制密码
          </button>
          <button class="btn-delete" @click="deletePassword(item.id)">
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式省略，与上面的组件类似 */
</style>
```

这些示例展示了如何在实际的 Vue 3 项目中使用 @ldesign/crypto 创建实用的加密功能。
