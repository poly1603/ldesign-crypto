# 插件开发

@ldesign/crypto 提供了强大的插件系统，允许开发者扩展和自定义加密功能。

## 插件架构

### 插件接口定义

```typescript
interface CryptoPlugin {
  name: string
  version: string
  description?: string
  dependencies?: string[]
  
  // 生命周期钩子
  install?(crypto: CryptoInstance): Promise<void> | void
  uninstall?(crypto: CryptoInstance): Promise<void> | void
  
  // 功能扩展
  algorithms?: AlgorithmExtension[]
  providers?: ProviderExtension[]
  middleware?: MiddlewareExtension[]
  
  // 配置选项
  options?: PluginOptions
}

interface AlgorithmExtension {
  name: string
  type: 'symmetric' | 'asymmetric' | 'hash' | 'signature'
  implementation: AlgorithmImplementation
}

interface ProviderExtension {
  name: string
  type: 'hardware' | 'software' | 'cloud'
  implementation: ProviderImplementation
}

interface MiddlewareExtension {
  name: string
  type: 'before' | 'after' | 'around'
  handler: MiddlewareHandler
}
```

### 基础插件模板

```typescript
class BasePlugin implements CryptoPlugin {
  name: string
  version: string
  description: string
  
  constructor(options: PluginOptions = {}) {
    this.name = options.name || 'base-plugin'
    this.version = options.version || '1.0.0'
    this.description = options.description || 'Base plugin template'
  }
  
  async install(crypto: CryptoInstance) {
    console.log(`安装插件: ${this.name} v${this.version}`)
    
    // 注册算法
    this.registerAlgorithms(crypto)
    
    // 注册提供者
    this.registerProviders(crypto)
    
    // 注册中间件
    this.registerMiddleware(crypto)
    
    // 初始化插件
    await this.initialize(crypto)
  }
  
  async uninstall(crypto: CryptoInstance) {
    console.log(`卸载插件: ${this.name}`)
    
    // 清理资源
    await this.cleanup(crypto)
  }
  
  protected registerAlgorithms(crypto: CryptoInstance) {
    // 子类实现
  }
  
  protected registerProviders(crypto: CryptoInstance) {
    // 子类实现
  }
  
  protected registerMiddleware(crypto: CryptoInstance) {
    // 子类实现
  }
  
  protected async initialize(crypto: CryptoInstance) {
    // 子类实现
  }
  
  protected async cleanup(crypto: CryptoInstance) {
    // 子类实现
  }
}
```

## 算法插件开发

### 自定义对称加密算法

```typescript
class ChaCha20Plugin extends BasePlugin {
  constructor() {
    super({
      name: 'chacha20-plugin',
      version: '1.0.0',
      description: 'ChaCha20 stream cipher implementation'
    })
  }
  
  protected registerAlgorithms(crypto: CryptoInstance) {
    crypto.registerAlgorithm({
      name: 'ChaCha20',
      type: 'symmetric',
      implementation: new ChaCha20Implementation()
    })
  }
}

class ChaCha20Implementation implements AlgorithmImplementation {
  async encrypt(data: ArrayBuffer, options: EncryptionOptions): Promise<EncryptionResult> {
    const { key, nonce } = options
    
    // ChaCha20 加密实现
    const encrypted = await this.chaCha20Encrypt(data, key, nonce)
    
    return {
      data: encrypted,
      algorithm: 'ChaCha20',
      mode: 'stream',
      iv: nonce
    }
  }
  
  async decrypt(data: ArrayBuffer, options: DecryptionOptions): Promise<DecryptionResult> {
    const { key, nonce } = options
    
    // ChaCha20 解密实现
    const decrypted = await this.chaCha20Decrypt(data, key, nonce)
    
    return {
      data: decrypted,
      algorithm: 'ChaCha20',
      mode: 'stream'
    }
  }
  
  private async chaCha20Encrypt(data: ArrayBuffer, key: ArrayBuffer, nonce: ArrayBuffer): Promise<ArrayBuffer> {
    // ChaCha20 核心算法实现
    const state = this.initializeState(key, nonce)
    const keystream = this.generateKeystream(state, data.byteLength)
    
    return this.xorBuffers(data, keystream)
  }
  
  private async chaCha20Decrypt(data: ArrayBuffer, key: ArrayBuffer, nonce: ArrayBuffer): Promise<ArrayBuffer> {
    // ChaCha20 解密（与加密相同）
    return this.chaCha20Encrypt(data, key, nonce)
  }
  
  private initializeState(key: ArrayBuffer, nonce: ArrayBuffer): Uint32Array {
    const state = new Uint32Array(16)
    
    // 常量
    state[0] = 0x61707865
    state[1] = 0x3320646e
    state[2] = 0x79622d32
    state[3] = 0x6b206574
    
    // 密钥
    const keyView = new Uint32Array(key)
    for (let i = 0; i < 8; i++) {
      state[4 + i] = keyView[i]
    }
    
    // 计数器
    state[12] = 0
    
    // Nonce
    const nonceView = new Uint32Array(nonce)
    for (let i = 0; i < 3; i++) {
      state[13 + i] = nonceView[i]
    }
    
    return state
  }
  
  private generateKeystream(initialState: Uint32Array, length: number): ArrayBuffer {
    const keystream = new ArrayBuffer(length)
    const keystreamView = new Uint8Array(keystream)
    
    let offset = 0
    let counter = 0
    
    while (offset < length) {
      const state = new Uint32Array(initialState)
      state[12] = counter++
      
      // ChaCha20 quarter round
      this.chaCha20Block(state)
      
      // 转换为字节流
      const blockBytes = new Uint8Array(state.buffer)
      const bytesToCopy = Math.min(64, length - offset)
      
      keystreamView.set(blockBytes.subarray(0, bytesToCopy), offset)
      offset += bytesToCopy
    }
    
    return keystream
  }
  
  private chaCha20Block(state: Uint32Array) {
    const x = new Uint32Array(state)
    
    // 20 rounds
    for (let i = 0; i < 10; i++) {
      // Column rounds
      this.quarterRound(x, 0, 4, 8, 12)
      this.quarterRound(x, 1, 5, 9, 13)
      this.quarterRound(x, 2, 6, 10, 14)
      this.quarterRound(x, 3, 7, 11, 15)
      
      // Diagonal rounds
      this.quarterRound(x, 0, 5, 10, 15)
      this.quarterRound(x, 1, 6, 11, 12)
      this.quarterRound(x, 2, 7, 8, 13)
      this.quarterRound(x, 3, 4, 9, 14)
    }
    
    // Add original state
    for (let i = 0; i < 16; i++) {
      state[i] = (x[i] + state[i]) >>> 0
    }
  }
  
  private quarterRound(x: Uint32Array, a: number, b: number, c: number, d: number) {
    x[a] = (x[a] + x[b]) >>> 0
    x[d] = this.rotateLeft(x[d] ^ x[a], 16)
    
    x[c] = (x[c] + x[d]) >>> 0
    x[b] = this.rotateLeft(x[b] ^ x[c], 12)
    
    x[a] = (x[a] + x[b]) >>> 0
    x[d] = this.rotateLeft(x[d] ^ x[a], 8)
    
    x[c] = (x[c] + x[d]) >>> 0
    x[b] = this.rotateLeft(x[b] ^ x[c], 7)
  }
  
  private rotateLeft(value: number, shift: number): number {
    return ((value << shift) | (value >>> (32 - shift))) >>> 0
  }
  
  private xorBuffers(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
    const result = new ArrayBuffer(a.byteLength)
    const aView = new Uint8Array(a)
    const bView = new Uint8Array(b)
    const resultView = new Uint8Array(result)
    
    for (let i = 0; i < aView.length; i++) {
      resultView[i] = aView[i] ^ bView[i]
    }
    
    return result
  }
}
```

### 自定义哈希算法

```typescript
class Blake2bPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'blake2b-plugin',
      version: '1.0.0',
      description: 'BLAKE2b hash function implementation'
    })
  }
  
  protected registerAlgorithms(crypto: CryptoInstance) {
    crypto.registerAlgorithm({
      name: 'BLAKE2b',
      type: 'hash',
      implementation: new Blake2bImplementation()
    })
  }
}

class Blake2bImplementation implements HashImplementation {
  private readonly IV = [
    0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn,
    0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n, 0x9b05688c2b3e6c1fn,
    0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n
  ]
  
  async hash(data: ArrayBuffer, options: HashOptions = {}): Promise<ArrayBuffer> {
    const outputLength = options.outputLength || 64
    const key = options.key || new ArrayBuffer(0)
    
    return this.blake2b(data, outputLength, key)
  }
  
  private async blake2b(data: ArrayBuffer, outputLength: number, key: ArrayBuffer): Promise<ArrayBuffer> {
    // 初始化状态
    const h = [...this.IV]
    h[0] ^= BigInt(0x01010000 ^ (key.byteLength << 8) ^ outputLength)
    
    // 处理密钥块（如果有）
    if (key.byteLength > 0) {
      const keyBlock = new ArrayBuffer(128)
      new Uint8Array(keyBlock).set(new Uint8Array(key))
      this.compress(h, keyBlock, 128, false)
    }
    
    // 处理数据块
    const dataView = new Uint8Array(data)
    let offset = 0
    
    while (offset + 128 <= dataView.length) {
      const block = dataView.slice(offset, offset + 128).buffer
      this.compress(h, block, key.byteLength + offset + 128, false)
      offset += 128
    }
    
    // 处理最后一块
    if (offset < dataView.length) {
      const lastBlock = new ArrayBuffer(128)
      const lastBlockView = new Uint8Array(lastBlock)
      lastBlockView.set(dataView.slice(offset))
      
      this.compress(h, lastBlock, key.byteLength + dataView.length, true)
    } else if (dataView.length === 0) {
      // 空输入的特殊情况
      const emptyBlock = new ArrayBuffer(128)
      this.compress(h, emptyBlock, key.byteLength, true)
    }
    
    // 生成输出
    const output = new ArrayBuffer(outputLength)
    const outputView = new Uint8Array(output)
    const hBytes = new ArrayBuffer(64)
    const hView = new DataView(hBytes)
    
    for (let i = 0; i < 8; i++) {
      hView.setBigUint64(i * 8, h[i], true)
    }
    
    outputView.set(new Uint8Array(hBytes, 0, outputLength))
    
    return output
  }
  
  private compress(h: bigint[], block: ArrayBuffer, counter: number, isLast: boolean) {
    // BLAKE2b 压缩函数实现
    const v = new Array(16)
    const m = new Array(16)
    
    // 初始化工作向量
    for (let i = 0; i < 8; i++) {
      v[i] = h[i]
      v[i + 8] = this.IV[i]
    }
    
    v[12] ^= BigInt(counter & 0xffffffff)
    v[13] ^= BigInt(counter >>> 32)
    
    if (isLast) {
      v[14] = ~v[14]
    }
    
    // 读取消息块
    const blockView = new DataView(block)
    for (let i = 0; i < 16; i++) {
      m[i] = blockView.getBigUint64(i * 8, true)
    }
    
    // 12 轮混合
    const sigma = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
      // ... 其他轮的置换表
    ]
    
    for (let round = 0; round < 12; round++) {
      const s = sigma[round % 10]
      
      // 列混合
      this.mix(v, 0, 4, 8, 12, m[s[0]], m[s[1]])
      this.mix(v, 1, 5, 9, 13, m[s[2]], m[s[3]])
      this.mix(v, 2, 6, 10, 14, m[s[4]], m[s[5]])
      this.mix(v, 3, 7, 11, 15, m[s[6]], m[s[7]])
      
      // 对角线混合
      this.mix(v, 0, 5, 10, 15, m[s[8]], m[s[9]])
      this.mix(v, 1, 6, 11, 12, m[s[10]], m[s[11]])
      this.mix(v, 2, 7, 8, 13, m[s[12]], m[s[13]])
      this.mix(v, 3, 4, 9, 14, m[s[14]], m[s[15]])
    }
    
    // 更新状态
    for (let i = 0; i < 8; i++) {
      h[i] ^= v[i] ^ v[i + 8]
    }
  }
  
  private mix(v: bigint[], a: number, b: number, c: number, d: number, x: bigint, y: bigint) {
    v[a] = (v[a] + v[b] + x) & 0xffffffffffffffffn
    v[d] = this.rotr64(v[d] ^ v[a], 32)
    
    v[c] = (v[c] + v[d]) & 0xffffffffffffffffn
    v[b] = this.rotr64(v[b] ^ v[c], 24)
    
    v[a] = (v[a] + v[b] + y) & 0xffffffffffffffffn
    v[d] = this.rotr64(v[d] ^ v[a], 16)
    
    v[c] = (v[c] + v[d]) & 0xffffffffffffffffn
    v[b] = this.rotr64(v[b] ^ v[c], 63)
  }
  
  private rotr64(value: bigint, shift: number): bigint {
    return ((value >> BigInt(shift)) | (value << BigInt(64 - shift))) & 0xffffffffffffffffn
  }
}
```

## 提供者插件开发

### 硬件安全模块 (HSM) 提供者

```typescript
class HSMPlugin extends BasePlugin {
  constructor(options: HSMOptions) {
    super({
      name: 'hsm-plugin',
      version: '1.0.0',
      description: 'Hardware Security Module provider'
    })
    
    this.hsmOptions = options
  }
  
  protected registerProviders(crypto: CryptoInstance) {
    crypto.registerProvider({
      name: 'HSM',
      type: 'hardware',
      implementation: new HSMProvider(this.hsmOptions)
    })
  }
}

class HSMProvider implements ProviderImplementation {
  private connection: HSMConnection
  
  constructor(private options: HSMOptions) {}
  
  async initialize(): Promise<void> {
    this.connection = await this.connectToHSM()
  }
  
  async generateKey(algorithm: string, keySize: number): Promise<ArrayBuffer> {
    return this.connection.generateKey({
      algorithm,
      keySize,
      extractable: false,
      usage: ['encrypt', 'decrypt']
    })
  }
  
  async encrypt(data: ArrayBuffer, key: ArrayBuffer, options: EncryptionOptions): Promise<EncryptionResult> {
    return this.connection.encrypt({
      data,
      keyHandle: key,
      algorithm: options.algorithm,
      mode: options.mode,
      iv: options.iv
    })
  }
  
  async decrypt(data: ArrayBuffer, key: ArrayBuffer, options: DecryptionOptions): Promise<DecryptionResult> {
    return this.connection.decrypt({
      data,
      keyHandle: key,
      algorithm: options.algorithm,
      mode: options.mode,
      iv: options.iv
    })
  }
  
  async sign(data: ArrayBuffer, privateKey: ArrayBuffer, algorithm: string): Promise<ArrayBuffer> {
    return this.connection.sign({
      data,
      keyHandle: privateKey,
      algorithm
    })
  }
  
  async verify(signature: ArrayBuffer, data: ArrayBuffer, publicKey: ArrayBuffer, algorithm: string): Promise<boolean> {
    return this.connection.verify({
      signature,
      data,
      keyHandle: publicKey,
      algorithm
    })
  }
  
  private async connectToHSM(): Promise<HSMConnection> {
    // 连接到HSM设备
    const connection = new HSMConnection(this.options)
    await connection.authenticate(this.options.credentials)
    return connection
  }
}
```

### 云端密钥管理服务提供者

```typescript
class CloudKMSPlugin extends BasePlugin {
  constructor(options: CloudKMSOptions) {
    super({
      name: 'cloud-kms-plugin',
      version: '1.0.0',
      description: 'Cloud Key Management Service provider'
    })
    
    this.kmsOptions = options
  }
  
  protected registerProviders(crypto: CryptoInstance) {
    crypto.registerProvider({
      name: 'CloudKMS',
      type: 'cloud',
      implementation: new CloudKMSProvider(this.kmsOptions)
    })
  }
}

class CloudKMSProvider implements ProviderImplementation {
  private client: KMSClient
  
  constructor(private options: CloudKMSOptions) {}
  
  async initialize(): Promise<void> {
    this.client = new KMSClient({
      region: this.options.region,
      credentials: this.options.credentials
    })
  }
  
  async generateKey(algorithm: string, keySize: number): Promise<string> {
    const response = await this.client.createKey({
      KeyUsage: 'ENCRYPT_DECRYPT',
      KeySpec: `${algorithm}_${keySize}`,
      Description: `Generated by @ldesign/crypto`
    })
    
    return response.KeyMetadata.KeyId
  }
  
  async encrypt(data: ArrayBuffer, keyId: string, options: EncryptionOptions): Promise<EncryptionResult> {
    const response = await this.client.encrypt({
      KeyId: keyId,
      Plaintext: data,
      EncryptionAlgorithm: options.algorithm
    })
    
    return {
      data: response.CiphertextBlob,
      algorithm: options.algorithm,
      keyId: response.KeyId
    }
  }
  
  async decrypt(data: ArrayBuffer, keyId: string, options: DecryptionOptions): Promise<DecryptionResult> {
    const response = await this.client.decrypt({
      CiphertextBlob: data,
      KeyId: keyId,
      EncryptionAlgorithm: options.algorithm
    })
    
    return {
      data: response.Plaintext,
      algorithm: options.algorithm,
      keyId: response.KeyId
    }
  }
}
```

## 中间件插件开发

### 审计日志中间件

```typescript
class AuditLogPlugin extends BasePlugin {
  constructor(options: AuditLogOptions) {
    super({
      name: 'audit-log-plugin',
      version: '1.0.0',
      description: 'Audit logging middleware'
    })
    
    this.auditOptions = options
  }
  
  protected registerMiddleware(crypto: CryptoInstance) {
    crypto.registerMiddleware({
      name: 'audit-log',
      type: 'around',
      handler: new AuditLogMiddleware(this.auditOptions)
    })
  }
}

class AuditLogMiddleware implements MiddlewareHandler {
  constructor(private options: AuditLogOptions) {}
  
  async handle(context: MiddlewareContext, next: NextFunction): Promise<any> {
    const startTime = Date.now()
    const auditId = this.generateAuditId()
    
    // 记录操作开始
    await this.logOperationStart(auditId, context)
    
    try {
      const result = await next()
      
      // 记录操作成功
      await this.logOperationSuccess(auditId, context, result, Date.now() - startTime)
      
      return result
    } catch (error) {
      // 记录操作失败
      await this.logOperationError(auditId, context, error, Date.now() - startTime)
      
      throw error
    }
  }
  
  private async logOperationStart(auditId: string, context: MiddlewareContext) {
    const logEntry = {
      auditId,
      timestamp: new Date().toISOString(),
      operation: context.operation,
      algorithm: context.algorithm,
      userId: context.userId,
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      status: 'started'
    }
    
    await this.writeLog(logEntry)
  }
  
  private async logOperationSuccess(auditId: string, context: MiddlewareContext, result: any, duration: number) {
    const logEntry = {
      auditId,
      timestamp: new Date().toISOString(),
      operation: context.operation,
      algorithm: context.algorithm,
      userId: context.userId,
      sessionId: context.sessionId,
      status: 'success',
      duration,
      resultSize: result?.data?.byteLength || 0
    }
    
    await this.writeLog(logEntry)
  }
  
  private async logOperationError(auditId: string, context: MiddlewareContext, error: Error, duration: number) {
    const logEntry = {
      auditId,
      timestamp: new Date().toISOString(),
      operation: context.operation,
      algorithm: context.algorithm,
      userId: context.userId,
      sessionId: context.sessionId,
      status: 'error',
      duration,
      error: error.message,
      errorStack: error.stack
    }
    
    await this.writeLog(logEntry)
  }
  
  private async writeLog(logEntry: AuditLogEntry) {
    if (this.options.storage === 'database') {
      await this.writeToDatabase(logEntry)
    } else if (this.options.storage === 'file') {
      await this.writeToFile(logEntry)
    } else if (this.options.storage === 'remote') {
      await this.writeToRemote(logEntry)
    }
  }
  
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private async writeToDatabase(logEntry: AuditLogEntry) {
    // 写入数据库实现
  }
  
  private async writeToFile(logEntry: AuditLogEntry) {
    // 写入文件实现
  }
  
  private async writeToRemote(logEntry: AuditLogEntry) {
    // 发送到远程服务实现
  }
}
```

## 插件使用示例

### 注册和使用插件

```typescript
import { createCrypto } from '@ldesign/crypto'
import { ChaCha20Plugin } from './plugins/chacha20-plugin'
import { HSMPlugin } from './plugins/hsm-plugin'
import { AuditLogPlugin } from './plugins/audit-log-plugin'

// 创建加密实例
const crypto = createCrypto()

// 注册插件
await crypto.installPlugin(new ChaCha20Plugin())
await crypto.installPlugin(new HSMPlugin({
  host: 'hsm.example.com',
  port: 443,
  credentials: { username: 'user', password: 'pass' }
}))
await crypto.installPlugin(new AuditLogPlugin({
  storage: 'database',
  connection: 'postgresql://...'
}))

// 初始化
await crypto.init()

// 使用插件提供的算法
const encrypted = await crypto.encrypt('test data', {
  algorithm: 'ChaCha20',
  key: crypto.generateKey('ChaCha20', 256),
  provider: 'HSM'
})

// 查看审计日志
const auditLogs = await crypto.getAuditLogs({
  operation: 'encrypt',
  timeRange: { start: '2024-01-01', end: '2024-01-31' }
})
```

插件系统为 @ldesign/crypto 提供了无限的扩展可能性，开发者可以根据具体需求开发自定义的算法、提供者和中间件。
