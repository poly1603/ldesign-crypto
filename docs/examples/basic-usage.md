# 基础使用示例

这里提供了 @ldesign/crypto 的基础使用示例，帮助你快速上手。

## 快速开始

### 安装和初始化

```typescript
import { createCrypto } from '@ldesign/crypto'

// 创建加密实例
const crypto = createCrypto({
  provider: 'software',
  cache: { enabled: true }
})

// 初始化
await crypto.init()

console.log('加密库初始化完成')
```

### 基础对称加密

```typescript
// 生成密钥
const key = crypto.generateKey('AES', 256)

// 加密数据
const plaintext = 'Hello, World!'
const encrypted = await crypto.aesEncrypt(plaintext, {
  key,
  mode: 'CBC'
})

console.log('加密结果:', encrypted.ciphertext)
console.log('初始化向量:', encrypted.iv)

// 解密数据
const decrypted = await crypto.aesDecrypt(encrypted.ciphertext, {
  key,
  mode: 'CBC',
  iv: encrypted.iv
})

console.log('解密结果:', decrypted.plaintext)
console.log('验证:', decrypted.plaintext === plaintext)
```

### 基础哈希计算

```typescript
// 计算 SHA-256 哈希
const data = 'Hello, World!'
const hash = await crypto.sha256(data)

console.log('SHA-256 哈希:', hash)

// 验证哈希
const isValid = await crypto.verifyHash(data, hash, 'SHA-256')
console.log('哈希验证:', isValid)

// 计算 HMAC
const hmacKey = 'secret-key'
const hmac = await crypto.hmac(data, hmacKey, 'SHA-256')
console.log('HMAC:', hmac)
```

## Vue 3 集成示例

### 基础组件

```vue
<template>
  <div class="crypto-demo">
    <h2>加密演示</h2>
    
    <!-- 输入区域 -->
    <div class="input-section">
      <label>输入文本:</label>
      <textarea 
        v-model="inputText" 
        placeholder="请输入要加密的文本"
        rows="3"
      ></textarea>
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="encryptText" :disabled="!inputText || isLoading">
        {{ isLoading ? '加密中...' : '加密' }}
      </button>
      
      <button @click="decryptText" :disabled="!encryptedData || isLoading">
        {{ isLoading ? '解密中...' : '解密' }}
      </button>
      
      <button @click="hashText" :disabled="!inputText || isLoading">
        计算哈希
      </button>
      
      <button @click="clearAll">
        清空
      </button>
    </div>
    
    <!-- 结果显示 -->
    <div class="results">
      <div v-if="encryptedData" class="result-item">
        <h3>加密结果</h3>
        <div class="result-content">
          <p><strong>密文:</strong></p>
          <code>{{ encryptedData.ciphertext }}</code>
          
          <p><strong>初始化向量:</strong></p>
          <code>{{ encryptedData.iv }}</code>
          
          <p><strong>算法:</strong> {{ encryptedData.algorithm }}</p>
          <p><strong>模式:</strong> {{ encryptedData.mode }}</p>
        </div>
      </div>
      
      <div v-if="decryptedText" class="result-item">
        <h3>解密结果</h3>
        <div class="result-content">
          <p>{{ decryptedText }}</p>
          <p class="success">✓ 解密成功</p>
        </div>
      </div>
      
      <div v-if="hashResult" class="result-item">
        <h3>哈希结果</h3>
        <div class="result-content">
          <p><strong>SHA-256:</strong></p>
          <code>{{ hashResult }}</code>
          
          <button @click="copyToClipboard(hashResult)" class="copy-btn">
            复制
          </button>
        </div>
      </div>
    </div>
    
    <!-- 错误显示 -->
    <div v-if="error" class="error">
      <h3>错误</h3>
      <p>{{ error.message }}</p>
      <button @click="clearError">清除错误</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSymmetricCrypto, useHash } from '@ldesign/crypto'

// 响应式数据
const inputText = ref('')
const encryptedData = ref(null)
const decryptedText = ref('')
const hashResult = ref('')
const isLoading = ref(false)
const error = ref(null)

// 加密密钥
const encryptionKey = ref('')

// 组合式 API
const { aesEncrypt, aesDecrypt, generateKey } = useSymmetricCrypto()
const { sha256 } = useHash()

// 初始化
onMounted(async () => {
  try {
    // 生成加密密钥
    encryptionKey.value = generateKey('AES', 256)
    console.log('加密密钥已生成')
  } catch (err) {
    error.value = err
  }
})

// 加密文本
const encryptText = async () => {
  if (!inputText.value.trim()) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const result = await aesEncrypt(inputText.value, {
      key: encryptionKey.value,
      mode: 'CBC'
    })
    
    encryptedData.value = result
    console.log('加密完成:', result)
  } catch (err) {
    error.value = err
    console.error('加密失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 解密文本
const decryptText = async () => {
  if (!encryptedData.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const result = await aesDecrypt(encryptedData.value.ciphertext, {
      key: encryptionKey.value,
      mode: 'CBC',
      iv: encryptedData.value.iv
    })
    
    decryptedText.value = result.plaintext
    console.log('解密完成:', result.plaintext)
  } catch (err) {
    error.value = err
    console.error('解密失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 计算哈希
const hashText = async () => {
  if (!inputText.value.trim()) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const hash = await sha256(inputText.value)
    hashResult.value = hash
    console.log('哈希计算完成:', hash)
  } catch (err) {
    error.value = err
    console.error('哈希计算失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('已复制到剪贴板')
  }
}

// 清空所有数据
const clearAll = () => {
  inputText.value = ''
  encryptedData.value = null
  decryptedText.value = ''
  hashResult.value = ''
  error.value = null
}

// 清除错误
const clearError = () => {
  error.value = null
}
</script>

<style scoped>
.crypto-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.input-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
}

.input-section textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.actions button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actions button:hover:not(:disabled) {
  background: #2563eb;
}

.actions button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-item {
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.result-item h3 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.125rem;
}

.result-content p {
  margin: 0.5rem 0;
  color: #374151;
}

.result-content code {
  display: block;
  padding: 0.75rem;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  word-break: break-all;
  margin: 0.5rem 0;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.copy-btn:hover {
  background: #059669;
}

.success {
  color: #10b981 !important;
  font-weight: 600;
}

.error {
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
}

.error h3 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
}

.error p {
  margin: 0 0 1rem 0;
  color: #991b1b;
}

.error button {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.error button:hover {
  background: #b91c1c;
}

@media (max-width: 640px) {
  .crypto-demo {
    padding: 1rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions button {
    width: 100%;
  }
}
</style>
```

## React 集成示例

### 基础 Hook

```typescript
import { useState, useEffect, useCallback } from 'react'
import { createCrypto } from '@ldesign/crypto'

export function useCrypto() {
  const [crypto, setCrypto] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initCrypto = async () => {
      try {
        const instance = createCrypto({
          provider: 'software',
          cache: { enabled: true }
        })
        
        await instance.init()
        setCrypto(instance)
        setIsInitialized(true)
      } catch (err) {
        setError(err)
      }
    }

    initCrypto()
  }, [])

  const encrypt = useCallback(async (data, options) => {
    if (!crypto) throw new Error('Crypto not initialized')
    return crypto.aesEncrypt(data, options)
  }, [crypto])

  const decrypt = useCallback(async (data, options) => {
    if (!crypto) throw new Error('Crypto not initialized')
    return crypto.aesDecrypt(data, options)
  }, [crypto])

  const hash = useCallback(async (data, algorithm = 'SHA-256') => {
    if (!crypto) throw new Error('Crypto not initialized')
    return crypto.hash(data, algorithm)
  }, [crypto])

  return {
    crypto,
    isInitialized,
    error,
    encrypt,
    decrypt,
    hash
  }
}
```

### React 组件示例

```jsx
import React, { useState } from 'react'
import { useCrypto } from './hooks/useCrypto'

export function CryptoDemo() {
  const { encrypt, decrypt, hash, isInitialized, error } = useCrypto()
  const [inputText, setInputText] = useState('')
  const [encryptedData, setEncryptedData] = useState(null)
  const [decryptedText, setDecryptedText] = useState('')
  const [hashResult, setHashResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [key] = useState(() => {
    // 生成随机密钥
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  })

  const handleEncrypt = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const result = await encrypt(inputText, {
        key,
        mode: 'CBC'
      })
      setEncryptedData(result)
    } catch (err) {
      console.error('Encryption failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecrypt = async () => {
    if (!encryptedData) return
    
    setIsLoading(true)
    try {
      const result = await decrypt(encryptedData.ciphertext, {
        key,
        mode: 'CBC',
        iv: encryptedData.iv
      })
      setDecryptedText(result.plaintext)
    } catch (err) {
      console.error('Decryption failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHash = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const result = await hash(inputText, 'SHA-256')
      setHashResult(result)
    } catch (err) {
      console.error('Hash calculation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isInitialized) {
    return <div>Initializing crypto library...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="crypto-demo">
      <h2>Crypto Demo</h2>
      
      <div className="input-section">
        <label>Input Text:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to encrypt"
          rows={3}
        />
      </div>
      
      <div className="actions">
        <button onClick={handleEncrypt} disabled={!inputText || isLoading}>
          {isLoading ? 'Encrypting...' : 'Encrypt'}
        </button>
        
        <button onClick={handleDecrypt} disabled={!encryptedData || isLoading}>
          {isLoading ? 'Decrypting...' : 'Decrypt'}
        </button>
        
        <button onClick={handleHash} disabled={!inputText || isLoading}>
          Calculate Hash
        </button>
      </div>
      
      {encryptedData && (
        <div className="result-item">
          <h3>Encrypted Result</h3>
          <p><strong>Ciphertext:</strong></p>
          <code>{encryptedData.ciphertext}</code>
          <p><strong>IV:</strong></p>
          <code>{encryptedData.iv}</code>
        </div>
      )}
      
      {decryptedText && (
        <div className="result-item">
          <h3>Decrypted Result</h3>
          <p>{decryptedText}</p>
        </div>
      )}
      
      {hashResult && (
        <div className="result-item">
          <h3>Hash Result</h3>
          <code>{hashResult}</code>
        </div>
      )}
    </div>
  )
}
```

## Node.js 服务端示例

```typescript
import { createCrypto } from '@ldesign/crypto'
import express from 'express'

const app = express()
app.use(express.json())

// 初始化加密实例
const crypto = createCrypto({
  provider: 'software'
})

await crypto.init()

// 加密端点
app.post('/api/encrypt', async (req, res) => {
  try {
    const { data, key } = req.body
    
    if (!data || !key) {
      return res.status(400).json({ error: 'Missing data or key' })
    }
    
    const encrypted = await crypto.aesEncrypt(data, {
      key,
      mode: 'GCM'
    })
    
    res.json({
      success: true,
      result: encrypted
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 解密端点
app.post('/api/decrypt', async (req, res) => {
  try {
    const { ciphertext, key, iv, tag } = req.body
    
    const decrypted = await crypto.aesDecrypt(ciphertext, {
      key,
      mode: 'GCM',
      iv,
      tag
    })
    
    res.json({
      success: true,
      result: decrypted.plaintext
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 哈希端点
app.post('/api/hash', async (req, res) => {
  try {
    const { data, algorithm = 'SHA-256' } = req.body
    
    const hash = await crypto.hash(data, algorithm)
    
    res.json({
      success: true,
      result: hash
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(3000, () => {
  console.log('Crypto API server running on port 3000')
})
```

这些基础示例展示了如何在不同环境中使用 @ldesign/crypto，包括 Vue 3、React 和 Node.js 服务端应用。
