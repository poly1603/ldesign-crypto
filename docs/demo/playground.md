# 🔐 加密演练场

在这里你可以实时体验各种加密算法的功能，所有操作都在浏览器中完成，数据不会上传到服务器。

<CryptoPlayground />

## 使用说明

### 🔒 对称加密
- **AES**: 推荐使用的对称加密算法，支持128/192/256位密钥
- **DES/3DES**: 传统算法，仅用于兼容性

### 🔑 非对称加密
- **RSA**: 广泛使用的非对称加密算法，支持1024/2048/4096位密钥
- **SM2**: 中国国密椭圆曲线公钥密码算法

### 🔍 哈希算法
- **SHA-256/512**: 推荐使用的安全哈希算法
- **MD5/SHA-1**: 传统算法，安全性较低
- **SM3**: 中国国密哈希算法

### 🛡️ 安全提示

::: warning 注意
- 演示中的密钥仅用于测试，请勿在生产环境中使用
- 建议使用强随机密钥，避免使用简单密码
- 对于敏感数据，请使用推荐的安全算法
:::

::: tip 最佳实践
- AES-256 + CBC模式用于对称加密
- RSA-2048或更高位数用于非对称加密
- SHA-256或更高强度用于哈希计算
- 国密算法适用于符合国标的场景
:::

## 性能参考

基于现代浏览器的性能测试数据：

| 算法 | 数据大小 | 平均耗时 | 备注 |
|------|----------|----------|------|
| AES-256 | 1MB | ~15ms | 推荐 |
| RSA-2048 | 1KB | ~5ms | 适中 |
| SHA-256 | 1MB | ~8ms | 快速 |
| SM2 | 1KB | ~12ms | 国密 |
| SM4 | 1MB | ~18ms | 国密 |

## 代码示例

演练场中的操作对应的代码示例：

### AES加密示例
```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto()
await crypto.init()

const result = await crypto.aesEncrypt('Hello World', {
  key: '12345678901234567890123456789012', // 32字节密钥
  mode: 'CBC',
  padding: 'PKCS7'
})

console.log('加密结果:', result.data)
```

### RSA加密示例
```typescript
// 生成密钥对
const keyPair = await crypto.generateRSAKeyPair(2048)

// 公钥加密
const encrypted = await crypto.rsaEncrypt('Hello World', {
  publicKey: keyPair.publicKey
})

// 私钥解密
const decrypted = await crypto.rsaDecrypt(encrypted.data!, {
  privateKey: keyPair.privateKey
})
```

### 国密SM2示例
```typescript
// 生成SM2密钥对
const sm2KeyPair = await crypto.generateSM2KeyPair()

// SM2加密
const encrypted = await crypto.sm2Encrypt('Hello World', {
  publicKey: sm2KeyPair.publicKey
})

// SM2解密
const decrypted = await crypto.sm2Decrypt(encrypted.data!, {
  privateKey: sm2KeyPair.privateKey
})
```

<script setup>
import CryptoPlayground from '../.vitepress/components/CryptoPlayground.vue'
</script>
