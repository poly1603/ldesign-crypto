# 哈希算法 API

@ldesign/crypto 提供了完整的哈希算法API，支持多种哈希函数和相关操作。

## 基础哈希函数

### SHA 系列

#### `sha256(data, options?)`

计算 SHA-256 哈希值。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要哈希的数据
- `options?: HashOptions` - 可选的哈希选项

**返回值:**
- `Promise<string>` - 十六进制格式的哈希值

**示例:**
```typescript
import { useHash } from '@ldesign/crypto'

const { sha256 } = useHash()

// 基础用法
const hash = await sha256('Hello World')
console.log(hash) // "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"

// 使用选项
const hash2 = await sha256('Hello World', {
  encoding: 'base64',
  iterations: 1000
})
```

#### `sha512(data, options?)`

计算 SHA-512 哈希值。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要哈希的数据
- `options?: HashOptions` - 可选的哈希选项

**返回值:**
- `Promise<string>` - 十六进制格式的哈希值

**示例:**
```typescript
const hash = await sha512('Hello World')
console.log(hash) // 128字符的十六进制字符串
```

#### `sha1(data, options?)`

计算 SHA-1 哈希值（不推荐用于安全敏感场景）。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要哈希的数据
- `options?: HashOptions` - 可选的哈希选项

**返回值:**
- `Promise<string>` - 十六进制格式的哈希值

### MD5

#### `md5(data, options?)`

计算 MD5 哈希值（仅用于非安全场景）。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要哈希的数据
- `options?: HashOptions` - 可选的哈希选项

**返回值:**
- `Promise<string>` - 十六进制格式的哈希值

**示例:**
```typescript
const hash = await md5('Hello World')
console.log(hash) // "b10a8db164e0754105b7a99be72e3fe5"
```

## HMAC (基于哈希的消息认证码)

### `hmac(data, key, algorithm?, options?)`

计算 HMAC 值。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要认证的数据
- `key: string | ArrayBuffer | Uint8Array` - HMAC 密钥
- `algorithm?: string` - 哈希算法，默认 'SHA-256'
- `options?: HMACOptions` - 可选的 HMAC 选项

**返回值:**
- `Promise<string>` - 十六进制格式的 HMAC 值

**示例:**
```typescript
const { hmac } = useHash()

// 基础用法
const mac = await hmac('Hello World', 'secret-key')

// 指定算法
const mac2 = await hmac('Hello World', 'secret-key', 'SHA-512')

// 使用选项
const mac3 = await hmac('Hello World', 'secret-key', 'SHA-256', {
  encoding: 'base64',
  keyEncoding: 'utf8'
})
```

### `hmacSha256(data, key, options?)`

计算 HMAC-SHA256 值的便捷方法。

**示例:**
```typescript
const mac = await hmacSha256('message', 'secret')
```

### `hmacSha512(data, key, options?)`

计算 HMAC-SHA512 值的便捷方法。

## PBKDF2 (基于密码的密钥派生函数)

### `pbkdf2(password, salt, options?)`

使用 PBKDF2 从密码派生密钥。

**参数:**
- `password: string | ArrayBuffer | Uint8Array` - 密码
- `salt: string | ArrayBuffer | Uint8Array` - 盐值
- `options?: PBKDF2Options` - PBKDF2 选项

**返回值:**
- `Promise<ArrayBuffer>` - 派生的密钥

**示例:**
```typescript
const { pbkdf2 } = useHash()

// 基础用法
const key = await pbkdf2('password', 'salt', {
  iterations: 100000,
  keyLength: 32,
  hash: 'SHA-256'
})

// 高级用法
const key2 = await pbkdf2('user-password', 'random-salt', {
  iterations: 500000,
  keyLength: 64,
  hash: 'SHA-512',
  encoding: 'hex'
})
```

## HKDF (基于 HMAC 的密钥派生函数)

### `hkdf(inputKeyMaterial, options?)`

使用 HKDF 派生密钥。

**参数:**
- `inputKeyMaterial: ArrayBuffer | Uint8Array` - 输入密钥材料
- `options?: HKDFOptions` - HKDF 选项

**返回值:**
- `Promise<ArrayBuffer>` - 派生的密钥

**示例:**
```typescript
const { hkdf } = useHash()

const masterKey = new Uint8Array(32) // 主密钥
crypto.getRandomValues(masterKey)

// 派生加密密钥
const encryptionKey = await hkdf(masterKey, {
  salt: new Uint8Array(16),
  info: new TextEncoder().encode('encryption'),
  length: 32,
  hash: 'SHA-256'
})

// 派生认证密钥
const authKey = await hkdf(masterKey, {
  salt: new Uint8Array(16),
  info: new TextEncoder().encode('authentication'),
  length: 32,
  hash: 'SHA-256'
})
```

## 国密哈希算法

### `sm3(data, options?)`

计算 SM3 哈希值（中国国家标准）。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要哈希的数据
- `options?: HashOptions` - 可选的哈希选项

**返回值:**
- `Promise<string>` - 十六进制格式的哈希值

**示例:**
```typescript
const { sm3 } = useHash()

const hash = await sm3('Hello World')
console.log(hash) // SM3 哈希值
```

## 文件哈希

### `hashFile(file, algorithm?, options?)`

计算文件的哈希值。

**参数:**
- `file: File | Blob` - 要哈希的文件
- `algorithm?: string` - 哈希算法，默认 'SHA-256'
- `options?: FileHashOptions` - 文件哈希选项

**返回值:**
- `Promise<FileHashResult>` - 文件哈希结果

**示例:**
```typescript
const { hashFile } = useHash()

// 哈希文件
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

const result = await hashFile(file, 'SHA-256', {
  chunkSize: 1024 * 1024, // 1MB chunks
  onProgress: (progress) => {
    console.log(`进度: ${progress.percentage}%`)
  }
})

console.log('文件哈希:', result.hash)
console.log('文件大小:', result.size)
console.log('处理时间:', result.duration)
```

## 流式哈希

### `createHashStream(algorithm, options?)`

创建流式哈希计算器。

**参数:**
- `algorithm: string` - 哈希算法
- `options?: StreamHashOptions` - 流式哈希选项

**返回值:**
- `HashStream` - 哈希流对象

**示例:**
```typescript
const { createHashStream } = useHash()

// 创建哈希流
const hashStream = createHashStream('SHA-256')

// 分块添加数据
hashStream.update('Hello ')
hashStream.update('World')
hashStream.update('!')

// 获取最终哈希
const hash = await hashStream.digest()
console.log(hash)

// 重置流以重新使用
hashStream.reset()
```

## 哈希验证

### `verifyHash(data, expectedHash, algorithm?)`

验证数据的哈希值。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要验证的数据
- `expectedHash: string` - 期望的哈希值
- `algorithm?: string` - 哈希算法，默认 'SHA-256'

**返回值:**
- `Promise<boolean>` - 验证结果

**示例:**
```typescript
const { verifyHash } = useHash()

const isValid = await verifyHash(
  'Hello World',
  'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
  'SHA-256'
)

console.log('哈希验证:', isValid ? '通过' : '失败')
```

## 类型定义

### HashOptions

```typescript
interface HashOptions {
  encoding?: 'hex' | 'base64' | 'binary'
  iterations?: number
  outputLength?: number
}
```

### HMACOptions

```typescript
interface HMACOptions extends HashOptions {
  keyEncoding?: 'utf8' | 'hex' | 'base64' | 'binary'
}
```

### PBKDF2Options

```typescript
interface PBKDF2Options {
  iterations: number
  keyLength: number
  hash: string
  encoding?: 'hex' | 'base64' | 'binary'
}
```

### HKDFOptions

```typescript
interface HKDFOptions {
  salt?: ArrayBuffer | Uint8Array
  info?: ArrayBuffer | Uint8Array
  length: number
  hash: string
}
```

### FileHashOptions

```typescript
interface FileHashOptions {
  chunkSize?: number
  onProgress?: (progress: ProgressInfo) => void
  signal?: AbortSignal
}
```

### FileHashResult

```typescript
interface FileHashResult {
  hash: string
  algorithm: string
  size: number
  duration: number
  chunks: number
}
```

### HashStream

```typescript
interface HashStream {
  update(data: string | ArrayBuffer | Uint8Array): void
  digest(): Promise<string>
  reset(): void
  getState(): HashStreamState
}
```

## 使用示例

### 密码哈希和验证

```typescript
import { useHash } from '@ldesign/crypto'

class PasswordManager {
  private { pbkdf2, sha256 } = useHash()
  
  async hashPassword(password: string): Promise<string> {
    // 生成随机盐
    const salt = crypto.getRandomValues(new Uint8Array(16))
    
    // 使用 PBKDF2 哈希密码
    const hash = await this.pbkdf2(password, salt, {
      iterations: 100000,
      keyLength: 32,
      hash: 'SHA-256'
    })
    
    // 组合盐和哈希
    const combined = new Uint8Array(salt.length + hash.byteLength)
    combined.set(salt)
    combined.set(new Uint8Array(hash), salt.length)
    
    // 返回 base64 编码
    return btoa(String.fromCharCode(...combined))
  }
  
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      // 解码存储的哈希
      const combined = new Uint8Array(
        atob(storedHash).split('').map(c => c.charCodeAt(0))
      )
      
      // 提取盐和哈希
      const salt = combined.slice(0, 16)
      const hash = combined.slice(16)
      
      // 重新计算哈希
      const computedHash = await this.pbkdf2(password, salt, {
        iterations: 100000,
        keyLength: 32,
        hash: 'SHA-256'
      })
      
      // 比较哈希值
      const computedArray = new Uint8Array(computedHash)
      return computedArray.every((byte, index) => byte === hash[index])
    } catch (error) {
      return false
    }
  }
}
```

### 文件完整性检查

```typescript
class FileIntegrityChecker {
  private { hashFile, verifyHash } = useHash()
  
  async generateChecksum(file: File): Promise<FileChecksum> {
    const result = await this.hashFile(file, 'SHA-256')
    
    return {
      filename: file.name,
      size: file.size,
      hash: result.hash,
      algorithm: 'SHA-256',
      timestamp: new Date().toISOString()
    }
  }
  
  async verifyFileIntegrity(file: File, expectedChecksum: FileChecksum): Promise<boolean> {
    if (file.size !== expectedChecksum.size) {
      return false
    }
    
    const result = await this.hashFile(file, expectedChecksum.algorithm)
    return result.hash === expectedChecksum.hash
  }
  
  async batchVerify(files: File[], checksums: FileChecksum[]): Promise<VerificationResult[]> {
    const results: VerificationResult[] = []
    
    for (const file of files) {
      const checksum = checksums.find(c => c.filename === file.name)
      
      if (!checksum) {
        results.push({
          filename: file.name,
          status: 'missing-checksum',
          valid: false
        })
        continue
      }
      
      const isValid = await this.verifyFileIntegrity(file, checksum)
      results.push({
        filename: file.name,
        status: isValid ? 'valid' : 'invalid',
        valid: isValid
      })
    }
    
    return results
  }
}
```

哈希算法API提供了全面的哈希计算、密钥派生和数据完整性验证功能，满足各种安全需求。
