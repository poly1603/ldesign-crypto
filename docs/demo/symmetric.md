# 🔒 对称加密演示

体验 AES、DES、3DES 等对称加密算法的强大功能。

<SymmetricDemo />

## 算法介绍

### AES (Advanced Encryption Standard)

AES 是目前最广泛使用的对称加密算法，由美国国家标准与技术研究院 (NIST) 于 2001 年确立为标准。

**特点:**
- 🔐 **高安全性**: 至今未被有效破解
- ⚡ **高性能**: 硬件和软件实现都很高效
- 🎯 **灵活性**: 支持 128、192、256 位密钥长度
- 🌍 **标准化**: 国际通用标准

**密钥长度:**
- **AES-128**: 128位密钥，安全强度高
- **AES-192**: 192位密钥，更高安全性
- **AES-256**: 256位密钥，最高安全级别（推荐）

**加密模式:**
- **ECB**: 电子密码本模式，简单但不安全
- **CBC**: 密码块链接模式，最常用（推荐）
- **CFB**: 密码反馈模式，适合流数据
- **OFB**: 输出反馈模式，错误不传播
- **CTR**: 计数器模式，支持并行处理
- **GCM**: 认证加密模式，提供完整性保护（推荐）

### DES (Data Encryption Standard)

DES 是较早的对称加密标准，现已不推荐用于新项目。

**特点:**
- ⚠️ **安全性低**: 56位密钥已可被暴力破解
- ⚡ **速度快**: 算法简单，执行速度快
- 📜 **历史意义**: 第一个公开的加密标准
- 🔄 **兼容性**: 仍在一些遗留系统中使用

**使用建议:**
- ❌ 不推荐用于新项目
- ⚠️ 仅用于兼容遗留系统
- 🔄 建议迁移到 AES

### 3DES (Triple DES)

3DES 是对 DES 的改进，使用三次 DES 加密来提高安全性。

**特点:**
- 🔐 **安全性**: 比 DES 更安全，但仍不如 AES
- 📏 **密钥长度**: 168位有效密钥长度
- 🐌 **性能**: 比 DES 慢三倍
- 🔄 **过渡方案**: DES 到 AES 的过渡选择

**使用建议:**
- ⚠️ 可用于过渡期
- 🎯 推荐迁移到 AES-256
- 💼 某些金融系统仍在使用

## 实际应用场景

### 1. 文件加密

```javascript
// 文件加密示例
class FileEncryption {
  constructor() {
    this.algorithm = 'AES'
    this.keySize = 256
    this.mode = 'GCM'
  }

  async encryptFile(file, password) {
    // 1. 从密码派生密钥
    const salt = crypto.generateRandom({ length: 32, charset: 'hex' })
    const key = await crypto.pbkdf2(password, {
      salt,
      iterations: 100000,
      keyLength: 32,
      algorithm: 'SHA-256'
    })

    // 2. 读取文件内容
    const fileContent = await file.arrayBuffer()

    // 3. AES-GCM 加密
    const encrypted = await crypto.aesEncrypt(fileContent, {
      key: key.data,
      mode: 'GCM'
    })

    // 4. 返回加密包
    return {
      encryptedData: encrypted.data,
      salt,
      iv: encrypted.iv,
      tag: encrypted.tag,
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date().toISOString()
    }
  }

  async decryptFile(encryptedPackage, password) {
    // 1. 重新派生密钥
    const key = await crypto.pbkdf2(password, {
      salt: encryptedPackage.salt,
      iterations: 100000,
      keyLength: 32,
      algorithm: 'SHA-256'
    })

    // 2. AES-GCM 解密
    const decrypted = await crypto.aesDecrypt(encryptedPackage.encryptedData, {
      key: key.data,
      mode: 'GCM',
      iv: encryptedPackage.iv,
      tag: encryptedPackage.tag
    })

    // 3. 创建文件对象
    const blob = new Blob([decrypted.data])
    return new File([blob], encryptedPackage.fileName)
  }
}
```

### 2. 数据库字段加密

```javascript
// 敏感字段加密
class DatabaseEncryption {
  constructor(masterKey) {
    this.masterKey = masterKey
  }

  // 加密敏感字段
  async encryptField(plaintext, fieldType = 'general') {
    // 为不同字段类型使用不同的派生密钥
    const fieldKey = await crypto.pbkdf2(this.masterKey, {
      salt: fieldType,
      iterations: 10000,
      keyLength: 32,
      algorithm: 'SHA-256'
    })

    const encrypted = await crypto.aesEncrypt(plaintext, {
      key: fieldKey.data,
      mode: 'GCM'
    })

    // 返回包含所有必要信息的字符串
    return JSON.stringify({
      data: encrypted.data,
      iv: encrypted.iv,
      tag: encrypted.tag,
      type: fieldType
    })
  }

  // 解密敏感字段
  async decryptField(encryptedField) {
    const { data, iv, tag, type } = JSON.parse(encryptedField)

    const fieldKey = await crypto.pbkdf2(this.masterKey, {
      salt: type,
      iterations: 10000,
      keyLength: 32,
      algorithm: 'SHA-256'
    })

    const decrypted = await crypto.aesDecrypt(data, {
      key: fieldKey.data,
      mode: 'GCM',
      iv,
      tag
    })

    return decrypted.data
  }
}

// 使用示例
const dbCrypto = new DatabaseEncryption('master-key-from-env')

// 加密用户敏感信息
const encryptedPhone = await dbCrypto.encryptField('13800138000', 'phone')
const encryptedEmail = await dbCrypto.encryptField('user@example.com', 'email')
const encryptedIdCard = await dbCrypto.encryptField('123456789012345678', 'idcard')

// 存储到数据库
const user = {
  id: 1,
  username: 'john_doe',
  phone: encryptedPhone,
  email: encryptedEmail,
  idCard: encryptedIdCard
}

// 从数据库读取并解密
const decryptedPhone = await dbCrypto.decryptField(user.phone)
```

### 3. API 通信加密

```javascript
// API 通信加密
class APIEncryption {
  constructor() {
    this.sessionKeys = new Map()
  }

  // 建立加密会话
  async establishSession(clientId) {
    // 生成会话密钥
    const sessionKey = crypto.generateKey('AES', 256)
    const keyId = crypto.generateRandom({ length: 16, charset: 'hex' })

    this.sessionKeys.set(keyId, {
      key: sessionKey,
      clientId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 // 1小时过期
    })

    return { keyId, sessionKey }
  }

  // 加密 API 请求
  async encryptRequest(data, keyId) {
    const session = this.sessionKeys.get(keyId)
    if (!session || session.expiresAt < Date.now()) {
      throw new Error('会话已过期')
    }

    const requestData = JSON.stringify(data)
    const encrypted = await crypto.aesEncrypt(requestData, {
      key: session.key,
      mode: 'GCM'
    })

    return {
      keyId,
      data: encrypted.data,
      iv: encrypted.iv,
      tag: encrypted.tag,
      timestamp: Date.now()
    }
  }

  // 解密 API 响应
  async decryptResponse(encryptedResponse) {
    const { keyId, data, iv, tag } = encryptedResponse
    const session = this.sessionKeys.get(keyId)

    if (!session) {
      throw new Error('无效的会话')
    }

    const decrypted = await crypto.aesDecrypt(data, {
      key: session.key,
      mode: 'GCM',
      iv,
      tag
    })

    return JSON.parse(decrypted.data)
  }
}
```

### 4. 配置文件加密

```javascript
// 配置文件加密存储
class ConfigEncryption {
  constructor(password) {
    this.password = password
  }

  async saveConfig(config, filePath) {
    // 序列化配置
    const configData = JSON.stringify(config, null, 2)

    // 生成盐值
    const salt = crypto.generateRandom({ length: 32, charset: 'hex' })

    // 派生密钥
    const key = await crypto.pbkdf2(this.password, {
      salt,
      iterations: 100000,
      keyLength: 32,
      algorithm: 'SHA-256'
    })

    // 加密配置
    const encrypted = await crypto.aesEncrypt(configData, {
      key: key.data,
      mode: 'GCM'
    })

    // 创建加密包
    const encryptedPackage = {
      version: '1.0',
      algorithm: 'AES-256-GCM',
      salt,
      iv: encrypted.iv,
      tag: encrypted.tag,
      data: encrypted.data,
      createdAt: new Date().toISOString()
    }

    // 保存到文件
    const packageData = JSON.stringify(encryptedPackage, null, 2)
    await fs.writeFile(filePath, packageData, 'utf8')
  }

  async loadConfig(filePath) {
    // 读取文件
    const packageData = await fs.readFile(filePath, 'utf8')
    const encryptedPackage = JSON.parse(packageData)

    // 派生密钥
    const key = await crypto.pbkdf2(this.password, {
      salt: encryptedPackage.salt,
      iterations: 100000,
      keyLength: 32,
      algorithm: 'SHA-256'
    })

    // 解密配置
    const decrypted = await crypto.aesDecrypt(encryptedPackage.data, {
      key: key.data,
      mode: 'GCM',
      iv: encryptedPackage.iv,
      tag: encryptedPackage.tag
    })

    return JSON.parse(decrypted.data)
  }
}
```

## 性能对比

### 加密速度测试

基于 1MB 数据的加密性能测试：

| 算法 | 密钥长度 | 加密时间 | 解密时间 | 吞吐量 |
|------|----------|----------|----------|--------|
| AES-128-CBC | 128位 | ~1.2ms | ~1.1ms | ~83MB/s |
| AES-256-CBC | 256位 | ~1.5ms | ~1.4ms | ~67MB/s |
| AES-256-GCM | 256位 | ~1.8ms | ~1.7ms | ~56MB/s |
| 3DES-CBC | 192位 | ~4.5ms | ~4.3ms | ~22MB/s |
| DES-CBC | 64位 | ~1.8ms | ~1.7ms | ~56MB/s |

### 内存使用

| 算法 | 内存占用 | 备注 |
|------|----------|------|
| AES | 低 | 现代CPU优化 |
| 3DES | 中等 | 三次加密开销 |
| DES | 低 | 算法简单 |

## 安全建议

### 密钥管理

1. **使用强密钥**: AES-256 密钥应该是真随机生成
2. **密钥轮换**: 定期更换加密密钥
3. **安全存储**: 密钥不要硬编码在代码中
4. **访问控制**: 限制密钥的访问权限

### 算法选择

1. **新项目**: 推荐使用 AES-256-GCM
2. **兼容性**: 需要兼容时使用 AES-256-CBC
3. **避免弱算法**: 不要使用 DES，谨慎使用 3DES
4. **模式选择**: 避免 ECB 模式，推荐 GCM 或 CBC

### 实现注意事项

1. **IV 随机性**: 每次加密使用不同的 IV
2. **填充攻击**: 使用 GCM 模式避免填充攻击
3. **时间攻击**: 使用常数时间比较函数
4. **错误处理**: 不要泄露加密错误的详细信息

<script setup>
import SymmetricDemo from '../.vitepress/components/SymmetricDemo.vue'
</script>
