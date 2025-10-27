# @ldesign/crypto 示例

这里包含了 `@ldesign/crypto` 的各种使用示例，涵盖多种框架和使用场景。

## 📂 示例列表

### 1. Vue 3 示例 (`/vue`)
完整的 Vue 3 应用示例，展示如何在 Vue 项目中使用加密功能。

**特性:**
- ✅ 多种加密算法 (AES, DES, 3DES, Blowfish, RSA)
- ✅ 哈希计算 (MD5, SHA-1, SHA-256, SHA-384, SHA-512)
- ✅ 实时加密/解密演示
- ✅ 美观的用户界面
- ✅ 完整的错误处理

**运行:**
```bash
cd vue
pnpm install
pnpm dev
```

### 2. React 示例 (`/react`)
React 应用示例，包含多个高级功能演示。

**特性:**
- ✅ 基础加密演示
- ✅ 密码管理器
- ✅ 文件加密
- ✅ 数字签名
- ✅ 性能基准测试

**运行:**
```bash
cd react
pnpm install
pnpm dev
```

### 3. Node.js 示例 (`/node-js`)
Node.js 环境的实用示例，适合服务端应用。

**示例文件:**
- `basic-encryption.js` - 基础加密操作
- `api-signature.js` - API 签名和验证
- `password-security.js` - 密码安全最佳实践

**运行:**
```bash
cd node-js
pnpm install
pnpm run all
```

### 4. Vanilla JavaScript 示例 (`/vanilla`)
原生 JavaScript 示例，无需任何框架。

**特性:**
- ✅ 纯 JavaScript 实现
- ✅ 浏览器直接运行
- ✅ 简单易懂

**运行:**
```bash
cd vanilla
pnpm install
pnpm dev
```

## 🚀 快速开始

### 安装依赖

在项目根目录或具体示例目录下运行:

```bash
pnpm install
```

### 运行示例

每个示例目录都有独立的 `package.json`，提供以下脚本:

- `pnpm dev` - 开发模式运行
- `pnpm build` - 构建生产版本
- `pnpm preview` - 预览构建结果

## 📚 示例分类

### 按功能分类

#### 加密解密
- **AES 加密** - 对称加密的最佳选择
  - Vue: `/vue/src/App.vue`
  - React: `/react/src/App.tsx`
  - Node.js: `/node-js/basic-encryption.js`

- **RSA 加密** - 非对称加密和数字签名
  - Vue: `/vue/src/App.vue` (RSA 标签)
  - React: `/react/src/components/DigitalSignature.tsx`
  - Node.js: `/node-js/basic-encryption.js`

#### 哈希和 HMAC
- **哈希计算** - MD5, SHA-256, SHA-512
  - 所有示例都包含

- **HMAC** - 消息认证码
  - Node.js: `/node-js/basic-encryption.js`
  - Node.js: `/node-js/api-signature.js`

#### 高级功能
- **文件加密** - 大文件流式处理
  - React: `/react/src/components/FileEncryption.tsx`

- **密码管理** - 安全的密码存储
  - React: `/react/src/components/PasswordManager.tsx`
  - Node.js: `/node-js/password-security.js`

- **数字签名** - RSA 签名和验证
  - React: `/react/src/components/DigitalSignature.tsx`
  - Node.js: `/node-js/basic-encryption.js`

- **API 签名** - HMAC 签名防篡改
  - Node.js: `/node-js/api-signature.js`

- **性能测试** - 基准测试和优化
  - React: `/react/src/components/PerformanceBenchmark.tsx`

### 按场景分类

#### Web 应用
适合浏览器环境的示例:
- Vue 3 应用 (`/vue`)
- React 应用 (`/react`)
- Vanilla JS (`/vanilla`)

#### 服务端应用
适合 Node.js 环境的示例:
- API 签名验证 (`/node-js/api-signature.js`)
- 密码安全 (`/node-js/password-security.js`)
- 基础加密 (`/node-js/basic-encryption.js`)

#### 全栈应用
同时适用于前后端的示例:
- AES 加密 (所有示例)
- 哈希计算 (所有示例)
- Base64/Hex 编码 (所有示例)

## 🎯 使用场景示例

### 1. 用户数据加密

```typescript
import { createAES } from '@ldesign/crypto'

// 加密用户敏感数据
const aes = createAES(userKey)
const encrypted = aes.encrypt(JSON.stringify(userData))

// 存储加密数据
localStorage.setItem('userData', encrypted.data)

// 读取并解密
const storedData = localStorage.getItem('userData')
const decrypted = aes.decrypt(storedData)
const userData = JSON.parse(decrypted.data)
```

### 2. API 请求签名

```typescript
import { hash } from '@ldesign/crypto'

// 生成请求签名
const timestamp = Date.now()
const signature = hash.hmac(
  `${method}\n${path}\n${timestamp}\n${body}`,
  apiSecret,
  'sha256'
)

// 发送请求
fetch(url, {
  method: 'POST',
  headers: {
    'X-Signature': signature,
    'X-Timestamp': timestamp.toString(),
    'X-API-Key': apiKey
  },
  body
})
```

### 3. 密码哈希存储

```typescript
import { KeyDerivation, RandomUtils } from '@ldesign/crypto'

// 注册: 哈希密码
const salt = RandomUtils.generateSalt(16)
const hashedPassword = KeyDerivation.pbkdf2(password, salt, {
  iterations: 100000,
  keySize: 32,
  hash: 'SHA256'
})

// 存储到数据库
await db.users.insert({
  username,
  passwordHash: hashedPassword,
  passwordSalt: salt
})

// 登录: 验证密码
const user = await db.users.findOne({ username })
const hash = KeyDerivation.pbkdf2(
  inputPassword,
  user.passwordSalt,
  { iterations: 100000, keySize: 32, hash: 'SHA256' }
)
const isValid = timingSafeEqual(hash, user.passwordHash)
```

### 4. 文件加密

```typescript
import { FileEncryptor } from '@ldesign/crypto/stream'

// 加密大文件
const encryptor = new FileEncryptor('secret-key')
await encryptor.encryptFile(
  'large-file.pdf',
  'encrypted.bin',
  (progress) => {
    console.log(`进度: ${progress}%`)
  }
)

// 解密文件
await encryptor.decryptFile('encrypted.bin', 'decrypted.pdf')
```

## 💡 最佳实践

### 1. 选择合适的算法

| 场景 | 推荐算法 | 示例 |
|------|----------|------|
| 数据加密 | AES-256-GCM | `/vue`, `/react` |
| 密码存储 | PBKDF2 / Argon2 | `/node-js/password-security.js` |
| API 签名 | HMAC-SHA256 | `/node-js/api-signature.js` |
| 数字签名 | RSA-2048+ | `/react/components/DigitalSignature.tsx` |
| 文件完整性 | SHA-256 | 所有示例 |

### 2. 安全建议

- ✅ 使用强密钥 (256 位以上)
- ✅ 每次加密生成随机 IV
- ✅ 使用认证加密 (GCM 模式)
- ✅ 密码使用 PBKDF2/scrypt/Argon2
- ✅ API 签名防止重放攻击
- ✅ 使用恒定时间比较防止时序攻击

### 3. 性能优化

- ✅ 启用 WebCrypto 硬件加速
- ✅ 使用密钥缓存
- ✅ 批量操作使用并行处理
- ✅ 大文件使用流式处理

## 🔧 开发提示

### 调试

在开发环境中启用详细日志:

```typescript
import { enablePerformanceLogging } from '@ldesign/crypto'

enablePerformanceLogging({
  console: true,
  threshold: 10 // 记录超过 10ms 的操作
})
```

### 测试

每个示例都可以作为测试的参考:

```typescript
// 参考 /node-js 示例编写测试
describe('Encryption', () => {
  it('should encrypt and decrypt correctly', () => {
    const aes = createAES('key')
    const encrypted = aes.encrypt('data')
    const decrypted = aes.decrypt(encrypted.data)
    expect(decrypted.data).toBe('data')
  })
})
```

## 📖 相关文档

- [API 文档](../docs/api/)
- [使用指南](../docs/guide/)
- [安全最佳实践](../docs/security.md)
- [性能基准](../docs/performance.md)
- [升级指南](../docs/upgrade.md)

## 🤝 贡献

欢迎提交新的示例！请确保:

1. 代码清晰易懂
2. 包含完整的注释
3. 提供 README 说明
4. 遵循安全最佳实践

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE)

