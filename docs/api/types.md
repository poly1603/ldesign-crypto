# 类型定义

@ldesign/crypto 提供了完整的 TypeScript 类型定义，确保类型安全和良好的开发体验。

## 核心类型

### CryptoInstance

主要的加密实例接口。

```typescript
interface CryptoInstance {
  // 初始化
  init: (options?: InitOptions) => Promise<void>

  // 对称加密
  encrypt: (data: CryptoData, options: EncryptOptions) => Promise<EncryptResult>
  decrypt: (data: CryptoData, options: DecryptOptions) => Promise<DecryptResult>

  // 非对称加密
  generateKeyPair: (algorithm: AsymmetricAlgorithm, keySize: number) => Promise<KeyPair>
  publicKeyEncrypt: (data: CryptoData, publicKey: PublicKey) => Promise<EncryptResult>
  privateKeyDecrypt: (data: CryptoData, privateKey: PrivateKey) => Promise<DecryptResult>

  // 数字签名
  sign: (data: CryptoData, privateKey: PrivateKey, algorithm: SignatureAlgorithm) => Promise<Signature>
  verify: (signature: Signature, data: CryptoData, publicKey: PublicKey, algorithm: SignatureAlgorithm) => Promise<boolean>

  // 哈希
  hash: (data: CryptoData, algorithm: HashAlgorithm) => Promise<string>
  hmac: (data: CryptoData, key: CryptoKey, algorithm: HashAlgorithm) => Promise<string>

  // 密钥管理
  generateKey: (algorithm: SymmetricAlgorithm, keySize: number) => CryptoKey
  deriveKey: (password: string, salt: CryptoData, options: KeyDerivationOptions) => Promise<CryptoKey>

  // 工具方法
  getRandomBytes: (length: number) => Uint8Array
  encode: (data: CryptoData, encoding: Encoding) => string
  decode: (data: string, encoding: Encoding) => Uint8Array
}
```

### 基础数据类型

```typescript
// 加密数据类型
type CryptoData = string | ArrayBuffer | Uint8Array

// 加密密钥类型
type CryptoKey = string | ArrayBuffer | Uint8Array

// 编码类型
type Encoding = 'hex' | 'base64' | 'base64url' | 'binary' | 'utf8'

// 密钥对
interface KeyPair {
  publicKey: PublicKey
  privateKey: PrivateKey
}

// 公钥
interface PublicKey {
  algorithm: AsymmetricAlgorithm
  keySize: number
  format: KeyFormat
  data: ArrayBuffer
  usage: KeyUsage[]
}

// 私钥
interface PrivateKey {
  algorithm: AsymmetricAlgorithm
  keySize: number
  format: KeyFormat
  data: ArrayBuffer
  usage: KeyUsage[]
  extractable: boolean
}

// 签名
interface Signature {
  algorithm: SignatureAlgorithm
  data: ArrayBuffer
  encoding?: Encoding
}
```

## 算法类型

### 对称加密算法

```typescript
type SymmetricAlgorithm =
  | 'AES'
  | 'DES'
  | '3DES'
  | 'ChaCha20'
  | 'SM4'

type SymmetricMode =
  | 'ECB'
  | 'CBC'
  | 'CFB'
  | 'OFB'
  | 'CTR'
  | 'GCM'
  | 'CCM'

type PaddingMode =
  | 'PKCS7'
  | 'PKCS5'
  | 'ZERO'
  | 'ANSIX923'
  | 'ISO10126'
  | 'NONE'
```

### 非对称加密算法

```typescript
type AsymmetricAlgorithm =
  | 'RSA'
  | 'ECC'
  | 'ECDH'
  | 'ECDSA'
  | 'SM2'
  | 'SM9'

type ECCCurve =
  | 'P-256'
  | 'P-384'
  | 'P-521'
  | 'secp256k1'
  | 'sm2p256v1'

type RSAPadding =
  | 'PKCS1'
  | 'OAEP'
  | 'PSS'
  | 'NONE'
```

### 哈希算法

```typescript
type HashAlgorithm =
  | 'SHA-1'
  | 'SHA-256'
  | 'SHA-384'
  | 'SHA-512'
  | 'SHA-3'
  | 'MD5'
  | 'SM3'
  | 'BLAKE2b'
  | 'BLAKE2s'

type SignatureAlgorithm =
  | 'RSA-PSS'
  | 'RSA-PKCS1'
  | 'ECDSA'
  | 'EdDSA'
  | 'SM2-DSA'
```

## 选项类型

### 加密选项

```typescript
interface EncryptOptions {
  algorithm: SymmetricAlgorithm
  key: CryptoKey
  mode?: SymmetricMode
  padding?: PaddingMode
  iv?: CryptoData
  aad?: CryptoData // 用于 AEAD 模式
  tagLength?: number // 用于 GCM/CCM 模式
  encoding?: Encoding
  provider?: ProviderType
}

interface DecryptOptions {
  algorithm: SymmetricAlgorithm
  key: CryptoKey
  mode?: SymmetricMode
  padding?: PaddingMode
  iv?: CryptoData
  aad?: CryptoData
  tag?: CryptoData // 用于 AEAD 模式
  encoding?: Encoding
  provider?: ProviderType
}
```

### 非对称加密选项

```typescript
interface AsymmetricEncryptOptions {
  algorithm: AsymmetricAlgorithm
  padding?: RSAPadding
  hash?: HashAlgorithm
  encoding?: Encoding
  provider?: ProviderType
}

interface KeyGenerationOptions {
  algorithm: AsymmetricAlgorithm
  keySize: number
  curve?: ECCCurve // 用于 ECC
  publicExponent?: number // 用于 RSA
  usage?: KeyUsage[]
  extractable?: boolean
  format?: KeyFormat
}
```

### 哈希选项

```typescript
interface HashOptions {
  algorithm: HashAlgorithm
  encoding?: Encoding
  iterations?: number // 用于迭代哈希
  outputLength?: number // 用于可变长度哈希
}

interface HMACOptions extends HashOptions {
  key: CryptoKey
  keyEncoding?: Encoding
}

interface KeyDerivationOptions {
  algorithm: 'PBKDF2' | 'HKDF' | 'scrypt' | 'Argon2'
  iterations?: number // PBKDF2
  salt: CryptoData
  info?: CryptoData // HKDF
  keyLength: number
  hash: HashAlgorithm
  memory?: number // scrypt, Argon2
  parallelism?: number // Argon2
}
```

## 结果类型

### 加密结果

```typescript
interface EncryptResult {
  ciphertext: string | ArrayBuffer
  algorithm: SymmetricAlgorithm
  mode: SymmetricMode
  iv?: ArrayBuffer
  tag?: ArrayBuffer // 用于 AEAD 模式
  aad?: ArrayBuffer
  encoding?: Encoding
  metadata?: EncryptionMetadata
}

interface DecryptResult {
  plaintext: string | ArrayBuffer
  algorithm: SymmetricAlgorithm
  mode: SymmetricMode
  verified?: boolean // 用于 AEAD 模式
  encoding?: Encoding
  metadata?: DecryptionMetadata
}

interface EncryptionMetadata {
  timestamp: string
  keyId?: string
  provider: ProviderType
  performance?: PerformanceMetrics
}
```

### 签名结果

```typescript
interface SignResult {
  signature: ArrayBuffer
  algorithm: SignatureAlgorithm
  hash: HashAlgorithm
  encoding?: Encoding
  metadata?: SignatureMetadata
}

interface VerifyResult {
  valid: boolean
  algorithm: SignatureAlgorithm
  hash: HashAlgorithm
  metadata?: VerificationMetadata
}
```

## 配置类型

### 初始化选项

```typescript
interface InitOptions {
  provider?: ProviderOptions
  cache?: CacheOptions
  performance?: PerformanceOptions
  security?: SecurityOptions
  plugins?: PluginOptions[]
}

interface ProviderOptions {
  type: ProviderType
  config?: ProviderConfig
  fallback?: ProviderType[]
}

type ProviderType = 'software' | 'hardware' | 'cloud' | 'webassembly'

interface ProviderConfig {
  // 软件提供者
  software?: {
    algorithms?: string[]
    optimization?: 'speed' | 'size' | 'balanced'
  }

  // 硬件提供者
  hardware?: {
    device?: string
    authentication?: AuthenticationConfig
  }

  // 云提供者
  cloud?: {
    endpoint: string
    apiKey: string
    region?: string
  }
}
```

### 缓存选项

```typescript
interface CacheOptions {
  enabled: boolean
  maxSize?: number
  ttl?: number // 生存时间（毫秒）
  strategy?: CacheStrategy
  storage?: CacheStorage
  compression?: boolean
}

type CacheStrategy = 'LRU' | 'LFU' | 'FIFO' | 'TTL'
type CacheStorage = 'memory' | 'localStorage' | 'indexedDB' | 'custom'

interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  size: number
}
```

### 性能选项

```typescript
interface PerformanceOptions {
  enabled: boolean
  detailed?: boolean
  threshold?: number // 慢操作阈值（毫秒）
  sampleRate?: number // 采样率 (0.0-1.0)
  maxRecords?: number
  onSlowOperation?: (metrics: OperationMetrics) => void
}

interface OperationMetrics {
  operation: string
  algorithm: string
  duration: number
  dataSize: number
  timestamp: number
  memoryUsage?: MemoryUsage
  cpuUsage?: number
}

interface MemoryUsage {
  before: number
  after: number
  peak: number
  delta: number
}
```

## 错误类型

### 错误定义

```typescript
class CryptoError extends Error {
  code: ErrorCode
  details?: ErrorDetails

  constructor(message: string, code: ErrorCode, details?: ErrorDetails)
}

type ErrorCode =
  | 'ALGORITHM_NOT_SUPPORTED'
  | 'INVALID_KEY'
  | 'INVALID_PARAMETER'
  | 'ENCRYPTION_FAILED'
  | 'DECRYPTION_FAILED'
  | 'SIGNATURE_FAILED'
  | 'VERIFICATION_FAILED'
  | 'KEY_GENERATION_FAILED'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'NOT_INITIALIZED'
  | 'UNKNOWN_ERROR'

interface ErrorDetails {
  algorithm?: string
  operation?: string
  provider?: ProviderType
  originalError?: Error
  context?: Record<string, any>
}
```

## 工具类型

### 类型守卫

```typescript
// 类型守卫函数
function isSymmetricAlgorithm(algorithm: string): algorithm is SymmetricAlgorithm
function isAsymmetricAlgorithm(algorithm: string): algorithm is AsymmetricAlgorithm
function isHashAlgorithm(algorithm: string): algorithm is HashAlgorithm
function isCryptoError(error: Error): error is CryptoError
function isKeyPair(obj: any): obj is KeyPair
function isPublicKey(obj: any): obj is PublicKey
function isPrivateKey(obj: any): obj is PrivateKey

// 类型断言
function assertSymmetricAlgorithm(algorithm: string): asserts algorithm is SymmetricAlgorithm
function assertValidKey(key: any): asserts key is CryptoKey
function assertInitialized(instance: CryptoInstance): asserts instance is InitializedCryptoInstance
```

### 条件类型

```typescript
// 根据算法类型推断选项类型
type AlgorithmOptions<T extends string> =
  T extends SymmetricAlgorithm ? EncryptOptions :
  T extends AsymmetricAlgorithm ? AsymmetricEncryptOptions :
  T extends HashAlgorithm ? HashOptions :
  never

// 根据操作类型推断结果类型
type OperationResult<T extends string> =
  T extends 'encrypt' ? EncryptResult :
  T extends 'decrypt' ? DecryptResult :
  T extends 'sign' ? SignResult :
  T extends 'verify' ? VerifyResult :
  T extends 'hash' ? string :
  never

// 提取算法支持的模式
type SupportedModes<T extends SymmetricAlgorithm> =
  T extends 'AES' ? 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR' | 'GCM' | 'CCM' :
  T extends 'DES' ? 'ECB' | 'CBC' | 'CFB' | 'OFB' :
  T extends 'SM4' ? 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR' :
  never
```

### 实用类型

```typescript
// 部分可选
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// 提取函数参数类型
type ExtractParameters<T> = T extends (...args: infer P) => any ? P : never

// 提取函数返回类型
type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// 创建联合类型的映射
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
```

## 模块声明

### 全局类型扩展

```typescript
declare global {
  interface Window {
    LDesignCrypto?: CryptoInstance
  }

  namespace LDesignCrypto {
    interface Config extends InitOptions {}
    interface Plugin extends PluginInterface {}
  }
}

// 模块扩展
declare module '@ldesign/crypto' {
  export interface CryptoInstance {
    // 允许插件扩展实例
    [key: string]: any
  }

  export interface PluginInterface {
    name: string
    version: string
    install(instance: CryptoInstance): void | Promise<void>
  }
}
```

### Vue 类型扩展

```typescript
// Vue 3 组合式 API 类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto: CryptoInstance
  }
}

// Vue 插件选项
interface VueCryptoPluginOptions extends InitOptions {
  globalProperty?: string
  injectKey?: string | symbol
}
```

这些类型定义确保了 @ldesign/crypto 在 TypeScript 项目中的类型安全，提供了完整的智能提示和编译时错误检查。
