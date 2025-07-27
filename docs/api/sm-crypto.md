# 国密算法 API

@ldesign/crypto 提供了完整的中国国家密码标准（国密）算法支持，包括 SM2、SM3、SM4 等算法。

## SM2 椭圆曲线公钥密码算法

### 密钥管理

#### `generateSM2KeyPair(options?)`

生成 SM2 密钥对。

**参数:**
- `options?: SM2KeyOptions` - 可选的密钥生成选项

**返回值:**
- `Promise<SM2KeyPair>` - SM2 密钥对

**示例:**
```typescript
import { useSMCrypto } from '@ldesign/crypto'

const { generateSM2KeyPair } = useSMCrypto()

// 生成密钥对
const keyPair = await generateSM2KeyPair()
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 使用选项
const keyPair2 = await generateSM2KeyPair({
  format: 'pem',
  compressed: true,
  userId: 'user@example.com'
})
```

#### `importSM2Key(keyData, format?, options?)`

导入 SM2 密钥。

**参数:**
- `keyData: string | ArrayBuffer` - 密钥数据
- `format?: 'pem' | 'der' | 'hex'` - 密钥格式
- `options?: ImportKeyOptions` - 导入选项

**返回值:**
- `Promise<SM2Key>` - 导入的密钥

**示例:**
```typescript
// 导入 PEM 格式公钥
const publicKey = await importSM2Key(pemPublicKey, 'pem')

// 导入十六进制格式私钥
const privateKey = await importSM2Key(hexPrivateKey, 'hex', {
  type: 'private'
})
```

### 加密解密

#### `sm2Encrypt(data, publicKey, options?)`

使用 SM2 公钥加密数据。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要加密的数据
- `publicKey: SM2PublicKey | string` - SM2 公钥
- `options?: SM2EncryptOptions` - 加密选项

**返回值:**
- `Promise<SM2EncryptResult>` - 加密结果

**示例:**
```typescript
const { sm2Encrypt } = useSMCrypto()

// 基础加密
const encrypted = await sm2Encrypt('Hello World', publicKey)
console.log('密文:', encrypted.ciphertext)

// 使用选项
const encrypted2 = await sm2Encrypt('sensitive data', publicKey, {
  mode: 'C1C3C2',
  encoding: 'base64',
  userId: 'user@example.com'
})
```

#### `sm2Decrypt(ciphertext, privateKey, options?)`

使用 SM2 私钥解密数据。

**参数:**
- `ciphertext: string | ArrayBuffer` - 密文
- `privateKey: SM2PrivateKey | string` - SM2 私钥
- `options?: SM2DecryptOptions` - 解密选项

**返回值:**
- `Promise<SM2DecryptResult>` - 解密结果

**示例:**
```typescript
const { sm2Decrypt } = useSMCrypto()

// 解密数据
const decrypted = await sm2Decrypt(ciphertext, privateKey)
console.log('明文:', decrypted.plaintext)

// 使用选项
const decrypted2 = await sm2Decrypt(ciphertext, privateKey, {
  mode: 'C1C3C2',
  encoding: 'base64',
  userId: 'user@example.com'
})
```

### 数字签名

#### `sm2Sign(data, privateKey, options?)`

使用 SM2 私钥对数据进行签名。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要签名的数据
- `privateKey: SM2PrivateKey | string` - SM2 私钥
- `options?: SM2SignOptions` - 签名选项

**返回值:**
- `Promise<SM2SignResult>` - 签名结果

**示例:**
```typescript
const { sm2Sign } = useSMCrypto()

// 基础签名
const signature = await sm2Sign('message to sign', privateKey)
console.log('签名:', signature.signature)

// 使用选项
const signature2 = await sm2Sign('important document', privateKey, {
  userId: 'signer@example.com',
  encoding: 'base64',
  der: true
})
```

#### `sm2Verify(signature, data, publicKey, options?)`

使用 SM2 公钥验证签名。

**参数:**
- `signature: string | ArrayBuffer` - 签名值
- `data: string | ArrayBuffer | Uint8Array` - 原始数据
- `publicKey: SM2PublicKey | string` - SM2 公钥
- `options?: SM2VerifyOptions` - 验证选项

**返回值:**
- `Promise<boolean>` - 验证结果

**示例:**
```typescript
const { sm2Verify } = useSMCrypto()

// 验证签名
const isValid = await sm2Verify(signature, originalData, publicKey)
console.log('签名验证:', isValid ? '通过' : '失败')

// 使用选项
const isValid2 = await sm2Verify(signature, originalData, publicKey, {
  userId: 'signer@example.com',
  encoding: 'base64',
  der: true
})
```

### 密钥交换

#### `sm2KeyExchange(privateKey, publicKey, options?)`

执行 SM2 密钥交换协议。

**参数:**
- `privateKey: SM2PrivateKey` - 本方私钥
- `publicKey: SM2PublicKey` - 对方公钥
- `options?: SM2KeyExchangeOptions` - 密钥交换选项

**返回值:**
- `Promise<SM2KeyExchangeResult>` - 密钥交换结果

**示例:**
```typescript
const { sm2KeyExchange } = useSMCrypto()

// 密钥交换
const result = await sm2KeyExchange(myPrivateKey, theirPublicKey, {
  keyLength: 32,
  userId: 'alice@example.com',
  peerId: 'bob@example.com'
})

console.log('共享密钥:', result.sharedKey)
```

## SM3 密码杂凑算法

### `sm3(data, options?)`

计算 SM3 哈希值。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要哈希的数据
- `options?: SM3Options` - SM3 选项

**返回值:**
- `Promise<string>` - 十六进制格式的哈希值

**示例:**
```typescript
const { sm3 } = useSMCrypto()

// 基础哈希
const hash = await sm3('Hello World')
console.log('SM3 哈希:', hash)

// 使用选项
const hash2 = await sm3('data to hash', {
  encoding: 'base64',
  iterations: 1000
})
```

### `sm3HMAC(data, key, options?)`

计算基于 SM3 的 HMAC。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要认证的数据
- `key: string | ArrayBuffer | Uint8Array` - HMAC 密钥
- `options?: SM3HMACOptions` - HMAC 选项

**返回值:**
- `Promise<string>` - 十六进制格式的 HMAC 值

**示例:**
```typescript
const { sm3HMAC } = useSMCrypto()

const mac = await sm3HMAC('message', 'secret-key')
console.log('SM3-HMAC:', mac)
```

## SM4 分组密码算法

### 密钥管理

#### `generateSM4Key(options?)`

生成 SM4 密钥。

**参数:**
- `options?: SM4KeyOptions` - 密钥生成选项

**返回值:**
- `Promise<ArrayBuffer>` - SM4 密钥（128位）

**示例:**
```typescript
const { generateSM4Key } = useSMCrypto()

const key = await generateSM4Key()
console.log('SM4 密钥长度:', key.byteLength) // 16 bytes
```

### 加密解密

#### `sm4Encrypt(data, key, options?)`

使用 SM4 算法加密数据。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要加密的数据
- `key: ArrayBuffer | Uint8Array | string` - SM4 密钥
- `options?: SM4EncryptOptions` - 加密选项

**返回值:**
- `Promise<SM4EncryptResult>` - 加密结果

**示例:**
```typescript
const { sm4Encrypt } = useSMCrypto()

// ECB 模式
const encrypted1 = await sm4Encrypt('Hello World', key, {
  mode: 'ECB',
  padding: 'PKCS7'
})

// CBC 模式
const encrypted2 = await sm4Encrypt('Hello World', key, {
  mode: 'CBC',
  iv: crypto.getRandomValues(new Uint8Array(16)),
  padding: 'PKCS7'
})

// CTR 模式
const encrypted3 = await sm4Encrypt('Hello World', key, {
  mode: 'CTR',
  counter: crypto.getRandomValues(new Uint8Array(16))
})
```

#### `sm4Decrypt(ciphertext, key, options?)`

使用 SM4 算法解密数据。

**参数:**
- `ciphertext: string | ArrayBuffer | Uint8Array` - 密文
- `key: ArrayBuffer | Uint8Array | string` - SM4 密钥
- `options?: SM4DecryptOptions` - 解密选项

**返回值:**
- `Promise<SM4DecryptResult>` - 解密结果

**示例:**
```typescript
const { sm4Decrypt } = useSMCrypto()

// 解密数据
const decrypted = await sm4Decrypt(ciphertext, key, {
  mode: 'CBC',
  iv: originalIV,
  padding: 'PKCS7'
})

console.log('解密结果:', decrypted.plaintext)
```

## SM9 标识密码算法

### 密钥管理

#### `generateSM9MasterKey(options?)`

生成 SM9 主密钥。

**参数:**
- `options?: SM9MasterKeyOptions` - 主密钥生成选项

**返回值:**
- `Promise<SM9MasterKeyPair>` - SM9 主密钥对

**示例:**
```typescript
const { generateSM9MasterKey } = useSMCrypto()

const masterKeyPair = await generateSM9MasterKey()
console.log('主公钥:', masterKeyPair.publicKey)
console.log('主私钥:', masterKeyPair.privateKey)
```

#### `extractSM9PrivateKey(identity, masterPrivateKey, options?)`

从标识提取 SM9 私钥。

**参数:**
- `identity: string` - 用户标识
- `masterPrivateKey: SM9MasterPrivateKey` - 主私钥
- `options?: SM9ExtractOptions` - 提取选项

**返回值:**
- `Promise<SM9PrivateKey>` - 用户私钥

**示例:**
```typescript
const { extractSM9PrivateKey } = useSMCrypto()

const userPrivateKey = await extractSM9PrivateKey(
  'alice@example.com',
  masterPrivateKey,
  { keyType: 'encryption' }
)
```

### 加密解密

#### `sm9Encrypt(data, identity, masterPublicKey, options?)`

使用 SM9 标识加密数据。

**参数:**
- `data: string | ArrayBuffer | Uint8Array` - 要加密的数据
- `identity: string` - 接收者标识
- `masterPublicKey: SM9MasterPublicKey` - 主公钥
- `options?: SM9EncryptOptions` - 加密选项

**返回值:**
- `Promise<SM9EncryptResult>` - 加密结果

**示例:**
```typescript
const { sm9Encrypt } = useSMCrypto()

const encrypted = await sm9Encrypt(
  'confidential message',
  'bob@example.com',
  masterPublicKey
)
```

#### `sm9Decrypt(ciphertext, privateKey, options?)`

使用 SM9 私钥解密数据。

**参数:**
- `ciphertext: string | ArrayBuffer` - 密文
- `privateKey: SM9PrivateKey` - 用户私钥
- `options?: SM9DecryptOptions` - 解密选项

**返回值:**
- `Promise<SM9DecryptResult>` - 解密结果

## 类型定义

### SM2 相关类型

```typescript
interface SM2KeyPair {
  publicKey: SM2PublicKey
  privateKey: SM2PrivateKey
}

interface SM2EncryptOptions {
  mode?: 'C1C2C3' | 'C1C3C2'
  encoding?: 'hex' | 'base64'
  userId?: string
}

interface SM2SignOptions {
  userId?: string
  encoding?: 'hex' | 'base64'
  der?: boolean
}
```

### SM3 相关类型

```typescript
interface SM3Options {
  encoding?: 'hex' | 'base64'
  iterations?: number
}
```

### SM4 相关类型

```typescript
interface SM4EncryptOptions {
  mode: 'ECB' | 'CBC' | 'CTR' | 'OFB' | 'CFB'
  iv?: ArrayBuffer | Uint8Array
  counter?: ArrayBuffer | Uint8Array
  padding?: 'PKCS7' | 'ZERO' | 'NONE'
  encoding?: 'hex' | 'base64'
}

interface SM4EncryptResult {
  ciphertext: string | ArrayBuffer
  iv?: ArrayBuffer
  mode: string
  algorithm: 'SM4'
}
```

## 使用示例

### 完整的 SM2 加密通信

```typescript
import { useSMCrypto } from '@ldesign/crypto'

class SM2SecureMessaging {
  private { generateSM2KeyPair, sm2Encrypt, sm2Decrypt, sm2Sign, sm2Verify } = useSMCrypto()

  async setupCommunication() {
    // 生成双方密钥对
    const aliceKeyPair = await this.generateSM2KeyPair()
    const bobKeyPair = await this.generateSM2KeyPair()

    return { aliceKeyPair, bobKeyPair }
  }

  async sendSecureMessage(
    message: string,
    senderPrivateKey: SM2PrivateKey,
    receiverPublicKey: SM2PublicKey
  ) {
    // 1. 加密消息
    const encrypted = await this.sm2Encrypt(message, receiverPublicKey, {
      mode: 'C1C3C2',
      encoding: 'base64'
    })

    // 2. 对密文签名
    const signature = await this.sm2Sign(encrypted.ciphertext, senderPrivateKey, {
      encoding: 'base64'
    })

    return {
      ciphertext: encrypted.ciphertext,
      signature: signature.signature
    }
  }

  async receiveSecureMessage(
    secureMessage: { ciphertext: string, signature: string },
    receiverPrivateKey: SM2PrivateKey,
    senderPublicKey: SM2PublicKey
  ) {
    // 1. 验证签名
    const isValidSignature = await this.sm2Verify(
      secureMessage.signature,
      secureMessage.ciphertext,
      senderPublicKey,
      { encoding: 'base64' }
    )

    if (!isValidSignature) {
      throw new Error('签名验证失败')
    }

    // 2. 解密消息
    const decrypted = await this.sm2Decrypt(
      secureMessage.ciphertext,
      receiverPrivateKey,
      {
        mode: 'C1C3C2',
        encoding: 'base64'
      }
    )

    return decrypted.plaintext
  }
}
```

### SM4 文件加密

```typescript
class SM4FileEncryption {
  private { generateSM4Key, sm4Encrypt, sm4Decrypt } = useSMCrypto()

  async encryptFile(file: File, password: string): Promise<EncryptedFile> {
    // 1. 从密码派生密钥
    const key = await this.deriveKeyFromPassword(password)

    // 2. 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(16))

    // 3. 读取文件内容
    const fileData = await this.readFileAsArrayBuffer(file)

    // 4. 加密文件
    const encrypted = await this.sm4Encrypt(fileData, key, {
      mode: 'CBC',
      iv,
      padding: 'PKCS7'
    })

    // 5. 创建加密包
    const encryptedPackage = {
      version: '1.0',
      algorithm: 'SM4-CBC',
      iv: Array.from(iv),
      data: encrypted.ciphertext,
      originalName: file.name,
      originalSize: file.size,
      timestamp: new Date().toISOString()
    }

    return {
      data: new Blob([JSON.stringify(encryptedPackage)]),
      filename: file.name + '.sm4'
    }
  }

  async decryptFile(encryptedFile: File, password: string): Promise<File> {
    // 1. 读取加密包
    const packageText = await encryptedFile.text()
    const encryptedPackage = JSON.parse(packageText)

    // 2. 从密码派生密钥
    const key = await this.deriveKeyFromPassword(password)

    // 3. 解密数据
    const decrypted = await this.sm4Decrypt(
      encryptedPackage.data,
      key,
      {
        mode: 'CBC',
        iv: new Uint8Array(encryptedPackage.iv),
        padding: 'PKCS7'
      }
    )

    // 4. 创建原始文件
    return new File([decrypted.plaintext], encryptedPackage.originalName)
  }

  private async deriveKeyFromPassword(password: string): Promise<ArrayBuffer> {
    // 使用 SM3 和 PBKDF2 派生密钥
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    const salt = encoder.encode('sm4-file-encryption-salt')

    // 简化的密钥派生（实际应使用更安全的方法）
    let key = passwordData
    for (let i = 0; i < 10000; i++) {
      const combined = new Uint8Array(key.length + salt.length)
      combined.set(key)
      combined.set(salt, key.length)

      const hash = await crypto.subtle.digest('SHA-256', combined)
      key = new Uint8Array(hash)
    }

    return key.slice(0, 16).buffer // SM4 需要 128 位密钥
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }
}
```

国密算法API提供了完整的中国国家密码标准支持，满足国产化和合规性要求。
