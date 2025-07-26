# 高级功能

@ldesign/crypto 提供了丰富的高级功能，满足复杂的加密需求。

## 流式加密

### 大文件流式处理

```typescript
import { createCrypto } from '@ldesign/crypto'

const crypto = createCrypto()
await crypto.init()

// 创建加密流
class EncryptionStream {
  constructor(algorithm, key, options = {}) {
    this.algorithm = algorithm
    this.key = key
    this.options = options
    this.chunks = []
    this.totalSize = 0
  }
  
  async processChunk(chunk) {
    const encrypted = await crypto.aesEncrypt(chunk, {
      key: this.key,
      mode: this.options.mode || 'CBC',
      iv: this.options.iv
    })
    
    this.chunks.push(encrypted)
    this.totalSize += chunk.length
    
    return encrypted
  }
  
  async finalize() {
    // 合并所有加密块
    const result = {
      chunks: this.chunks,
      totalSize: this.totalSize,
      metadata: {
        algorithm: this.algorithm,
        mode: this.options.mode,
        timestamp: new Date().toISOString()
      }
    }
    
    return result
  }
}

// 使用示例
async function encryptLargeFile(file) {
  const chunkSize = 1024 * 1024 // 1MB chunks
  const key = crypto.generateKey('AES', 256)
  const stream = new EncryptionStream('AES-256', key, { mode: 'CBC' })
  
  const reader = file.stream().getReader()
  const chunks = []
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const encrypted = await stream.processChunk(value)
      chunks.push(encrypted)
      
      // 报告进度
      const progress = (stream.totalSize / file.size) * 100
      console.log(`加密进度: ${progress.toFixed(2)}%`)
    }
    
    return await stream.finalize()
  } finally {
    reader.releaseLock()
  }
}
```

### 实时数据流加密

```typescript
class RealTimeEncryption {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'AES-256-GCM'
    this.key = options.key
    this.buffer = new ArrayBuffer(0)
    this.sequence = 0
  }
  
  async encryptStream(dataStream) {
    const encryptedStream = new ReadableStream({
      start: (controller) => {
        this.controller = controller
      },
      
      cancel: () => {
        console.log('流已取消')
      }
    })
    
    const reader = dataStream.getReader()
    
    this.processStream(reader)
    
    return encryptedStream
  }
  
  async processStream(reader) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          this.controller.close()
          break
        }
        
        const encrypted = await this.encryptChunk(value)
        this.controller.enqueue(encrypted)
      }
    } catch (error) {
      this.controller.error(error)
    }
  }
  
  async encryptChunk(chunk) {
    const nonce = this.generateNonce()
    
    const encrypted = await crypto.aesEncrypt(chunk, {
      key: this.key,
      mode: 'GCM',
      iv: nonce
    })
    
    return {
      sequence: this.sequence++,
      nonce,
      data: encrypted.data,
      tag: encrypted.tag,
      timestamp: Date.now()
    }
  }
  
  generateNonce() {
    // 生成唯一的nonce
    const nonce = new Uint8Array(12)
    crypto.getRandomValues(nonce)
    return nonce
  }
}
```

## 密钥管理

### 分层密钥系统

```typescript
class HierarchicalKeyManager {
  constructor() {
    this.masterKey = null
    this.keyDerivationCache = new Map()
    this.keyRotationSchedule = new Map()
  }
  
  async initializeMasterKey(password, salt) {
    // 从密码派生主密钥
    this.masterKey = await crypto.pbkdf2(password, salt, {
      iterations: 100000,
      keyLength: 32,
      hash: 'SHA-256'
    })
  }
  
  async deriveKey(purpose, context = '', keyLength = 32) {
    const cacheKey = `${purpose}_${context}_${keyLength}`
    
    if (this.keyDerivationCache.has(cacheKey)) {
      return this.keyDerivationCache.get(cacheKey)
    }
    
    // 使用HKDF派生密钥
    const info = new TextEncoder().encode(`${purpose}:${context}`)
    const derivedKey = await crypto.hkdf(this.masterKey, {
      salt: new Uint8Array(32), // 应该使用随机salt
      info,
      length: keyLength,
      hash: 'SHA-256'
    })
    
    this.keyDerivationCache.set(cacheKey, derivedKey)
    
    // 设置密钥轮换
    this.scheduleKeyRotation(cacheKey, 24 * 60 * 60 * 1000) // 24小时
    
    return derivedKey
  }
  
  scheduleKeyRotation(keyId, interval) {
    const timer = setTimeout(() => {
      this.rotateKey(keyId)
    }, interval)
    
    this.keyRotationSchedule.set(keyId, timer)
  }
  
  async rotateKey(keyId) {
    // 清除旧密钥
    this.keyDerivationCache.delete(keyId)
    
    // 清除定时器
    const timer = this.keyRotationSchedule.get(keyId)
    if (timer) {
      clearTimeout(timer)
      this.keyRotationSchedule.delete(keyId)
    }
    
    console.log(`密钥已轮换: ${keyId}`)
  }
  
  async getEncryptionKey(dataType) {
    return this.deriveKey('encryption', dataType)
  }
  
  async getSigningKey(purpose) {
    return this.deriveKey('signing', purpose)
  }
  
  async getHMACKey(context) {
    return this.deriveKey('hmac', context)
  }
}

// 使用示例
const keyManager = new HierarchicalKeyManager()
await keyManager.initializeMasterKey('user-password', 'unique-salt')

const userDataKey = await keyManager.getEncryptionKey('user-data')
const sessionKey = await keyManager.getEncryptionKey('session')
const signingKey = await keyManager.getSigningKey('api-requests')
```

### 密钥托管和恢复

```typescript
class KeyEscrow {
  constructor(threshold = 3, totalShares = 5) {
    this.threshold = threshold
    this.totalShares = totalShares
    this.shares = new Map()
  }
  
  // Shamir秘密共享
  async splitSecret(secret) {
    const shares = []
    
    // 简化的秘密共享实现
    for (let i = 1; i <= this.totalShares; i++) {
      const share = await this.generateShare(secret, i)
      shares.push({
        id: i,
        data: share,
        checksum: await crypto.sha256(share)
      })
    }
    
    return shares
  }
  
  async generateShare(secret, shareId) {
    // 使用多项式生成份额
    const polynomial = this.generatePolynomial(secret)
    return this.evaluatePolynomial(polynomial, shareId)
  }
  
  generatePolynomial(secret) {
    // 生成threshold-1次多项式
    const coefficients = [secret]
    
    for (let i = 1; i < this.threshold; i++) {
      coefficients.push(crypto.getRandomValues(new Uint8Array(32)))
    }
    
    return coefficients
  }
  
  evaluatePolynomial(coefficients, x) {
    let result = new Uint8Array(32)
    
    for (let i = 0; i < coefficients.length; i++) {
      const term = this.multiplyByPower(coefficients[i], x, i)
      result = this.addArrays(result, term)
    }
    
    return result
  }
  
  async reconstructSecret(shares) {
    if (shares.length < this.threshold) {
      throw new Error(`需要至少 ${this.threshold} 个份额才能重构密钥`)
    }
    
    // 验证份额完整性
    for (const share of shares) {
      const checksum = await crypto.sha256(share.data)
      if (checksum !== share.checksum) {
        throw new Error(`份额 ${share.id} 已损坏`)
      }
    }
    
    // 使用拉格朗日插值重构密钥
    return this.lagrangeInterpolation(shares.slice(0, this.threshold))
  }
  
  lagrangeInterpolation(shares) {
    let result = new Uint8Array(32)
    
    for (let i = 0; i < shares.length; i++) {
      let numerator = 1
      let denominator = 1
      
      for (let j = 0; j < shares.length; j++) {
        if (i !== j) {
          numerator *= (0 - shares[j].id)
          denominator *= (shares[i].id - shares[j].id)
        }
      }
      
      const coefficient = numerator / denominator
      const term = this.multiplyArray(shares[i].data, coefficient)
      result = this.addArrays(result, term)
    }
    
    return result
  }
  
  multiplyByPower(array, base, power) {
    // 简化实现
    let result = new Uint8Array(array)
    for (let i = 0; i < power; i++) {
      result = this.multiplyArray(result, base)
    }
    return result
  }
  
  multiplyArray(array, scalar) {
    return array.map(byte => (byte * scalar) % 256)
  }
  
  addArrays(a, b) {
    return a.map((byte, index) => (byte + b[index]) % 256)
  }
}

// 使用示例
const escrow = new KeyEscrow(3, 5)
const masterKey = crypto.generateKey('AES', 256)

// 分割密钥
const shares = await escrow.splitSecret(masterKey)
console.log('密钥已分割为5个份额，需要3个份额才能重构')

// 分发份额给不同的托管方
const trustee1 = shares[0]
const trustee2 = shares[1]
const trustee3 = shares[2]

// 重构密钥（需要至少3个份额）
const reconstructedKey = await escrow.reconstructSecret([
  trustee1, trustee2, trustee3
])

console.log('密钥重构成功:', reconstructedKey === masterKey)
```

## 零知识证明

### 简单的零知识身份验证

```typescript
class ZeroKnowledgeAuth {
  constructor() {
    this.challenges = new Map()
  }
  
  // 生成挑战
  generateChallenge(identity) {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const challengeId = crypto.getRandomValues(new Uint8Array(16))
    
    this.challenges.set(challengeId, {
      challenge,
      identity,
      timestamp: Date.now(),
      used: false
    })
    
    return { challengeId, challenge }
  }
  
  // 创建证明
  async createProof(secret, challenge) {
    // 简化的Schnorr证明
    const r = crypto.getRandomValues(new Uint8Array(32))
    const commitment = await crypto.sha256(r)
    
    const challengeHash = await crypto.sha256(challenge)
    const response = this.addModular(r, this.multiplyModular(secret, challengeHash))
    
    return {
      commitment,
      response
    }
  }
  
  // 验证证明
  async verifyProof(challengeId, proof, publicKey) {
    const challengeData = this.challenges.get(challengeId)
    
    if (!challengeData || challengeData.used) {
      throw new Error('无效或已使用的挑战')
    }
    
    if (Date.now() - challengeData.timestamp > 300000) { // 5分钟过期
      throw new Error('挑战已过期')
    }
    
    // 验证证明
    const challengeHash = await crypto.sha256(challengeData.challenge)
    const leftSide = await crypto.sha256(proof.response)
    const rightSide = this.addModular(
      proof.commitment,
      this.multiplyModular(publicKey, challengeHash)
    )
    
    const isValid = await crypto.sha256(leftSide) === await crypto.sha256(rightSide)
    
    if (isValid) {
      challengeData.used = true
    }
    
    return isValid
  }
  
  addModular(a, b) {
    // 简化的模运算
    return a.map((byte, index) => (byte + b[index]) % 256)
  }
  
  multiplyModular(a, b) {
    // 简化的模运算
    return a.map((byte, index) => (byte * b[index]) % 256)
  }
}

// 使用示例
const zkAuth = new ZeroKnowledgeAuth()

// 用户注册
const userSecret = crypto.getRandomValues(new Uint8Array(32))
const userPublicKey = await crypto.sha256(userSecret) // 简化的公钥

// 身份验证流程
const { challengeId, challenge } = zkAuth.generateChallenge('user123')
const proof = await zkAuth.createProof(userSecret, challenge)
const isAuthenticated = await zkAuth.verifyProof(challengeId, proof, userPublicKey)

console.log('零知识身份验证:', isAuthenticated ? '成功' : '失败')
```

## 同态加密

### 简单的加法同态加密

```typescript
class AdditiveHomomorphicEncryption {
  constructor() {
    this.publicKey = null
    this.privateKey = null
  }
  
  async generateKeyPair() {
    // 简化的Paillier密码系统
    const p = this.generateLargePrime()
    const q = this.generateLargePrime()
    const n = p * q
    const lambda = this.lcm(p - 1, q - 1)
    const g = n + 1
    
    this.publicKey = { n, g }
    this.privateKey = { lambda, mu: this.modInverse(lambda, n) }
    
    return { publicKey: this.publicKey, privateKey: this.privateKey }
  }
  
  encrypt(plaintext) {
    const { n, g } = this.publicKey
    const r = this.generateRandomLessThan(n)
    
    // E(m) = g^m * r^n mod n^2
    const n2 = n * n
    const gm = this.modPow(g, plaintext, n2)
    const rn = this.modPow(r, n, n2)
    
    return (gm * rn) % n2
  }
  
  decrypt(ciphertext) {
    const { lambda, mu } = this.privateKey
    const { n } = this.publicKey
    const n2 = n * n
    
    // D(c) = L(c^lambda mod n^2) * mu mod n
    const u = this.modPow(ciphertext, lambda, n2)
    const l = this.L(u, n)
    
    return (l * mu) % n
  }
  
  // 同态加法：E(m1) * E(m2) = E(m1 + m2)
  homomorphicAdd(ciphertext1, ciphertext2) {
    const { n } = this.publicKey
    const n2 = n * n
    
    return (ciphertext1 * ciphertext2) % n2
  }
  
  // 同态标量乘法：E(m)^k = E(k * m)
  homomorphicMultiply(ciphertext, scalar) {
    const { n } = this.publicKey
    const n2 = n * n
    
    return this.modPow(ciphertext, scalar, n2)
  }
  
  L(u, n) {
    return Math.floor((u - 1) / n)
  }
  
  generateLargePrime() {
    // 简化实现，实际应使用更安全的素数生成
    const candidates = [1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049]
    return candidates[Math.floor(Math.random() * candidates.length)]
  }
  
  generateRandomLessThan(n) {
    return Math.floor(Math.random() * (n - 1)) + 1
  }
  
  modPow(base, exponent, modulus) {
    let result = 1
    base = base % modulus
    
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus
      }
      exponent = Math.floor(exponent / 2)
      base = (base * base) % modulus
    }
    
    return result
  }
  
  gcd(a, b) {
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }
  
  lcm(a, b) {
    return Math.abs(a * b) / this.gcd(a, b)
  }
  
  modInverse(a, m) {
    // 扩展欧几里得算法
    if (this.gcd(a, m) !== 1) {
      throw new Error('模逆不存在')
    }
    
    let [old_r, r] = [a, m]
    let [old_s, s] = [1, 0]
    
    while (r !== 0) {
      const quotient = Math.floor(old_r / r)
      ;[old_r, r] = [r, old_r - quotient * r]
      ;[old_s, s] = [s, old_s - quotient * s]
    }
    
    return old_s < 0 ? old_s + m : old_s
  }
}

// 使用示例
const he = new AdditiveHomomorphicEncryption()
await he.generateKeyPair()

// 加密两个数字
const num1 = 15
const num2 = 25
const encrypted1 = he.encrypt(num1)
const encrypted2 = he.encrypt(num2)

// 在加密状态下进行加法运算
const encryptedSum = he.homomorphicAdd(encrypted1, encrypted2)

// 解密结果
const decryptedSum = he.decrypt(encryptedSum)

console.log(`${num1} + ${num2} = ${decryptedSum}`) // 应该输出 40
console.log('同态加法验证:', decryptedSum === num1 + num2)

// 同态标量乘法
const scalar = 3
const encryptedProduct = he.homomorphicMultiply(encrypted1, scalar)
const decryptedProduct = he.decrypt(encryptedProduct)

console.log(`${num1} * ${scalar} = ${decryptedProduct}`) // 应该输出 45
console.log('同态乘法验证:', decryptedProduct === num1 * scalar)
```

## 安全多方计算

### 简单的秘密共享计算

```typescript
class SecureMultiPartyComputation {
  constructor(parties) {
    this.parties = parties
    this.shares = new Map()
  }
  
  // 将秘密分享给各方
  shareSecret(secret, secretId) {
    const shares = []
    let sum = 0
    
    // 生成随机份额（除了最后一个）
    for (let i = 0; i < this.parties.length - 1; i++) {
      const share = Math.floor(Math.random() * 1000)
      shares.push(share)
      sum += share
    }
    
    // 最后一个份额确保总和等于秘密
    shares.push(secret - sum)
    
    // 分发份额
    this.parties.forEach((party, index) => {
      if (!this.shares.has(party)) {
        this.shares.set(party, new Map())
      }
      this.shares.get(party).set(secretId, shares[index])
    })
    
    return shares
  }
  
  // 安全加法
  secureAdd(secretId1, secretId2, resultId) {
    this.parties.forEach(party => {
      const partyShares = this.shares.get(party)
      const share1 = partyShares.get(secretId1)
      const share2 = partyShares.get(secretId2)
      
      partyShares.set(resultId, share1 + share2)
    })
  }
  
  // 安全乘法（简化版本）
  secureMultiply(secretId1, secretId2, resultId) {
    // 这是一个简化的实现，实际的安全乘法需要更复杂的协议
    this.parties.forEach(party => {
      const partyShares = this.shares.get(party)
      const share1 = partyShares.get(secretId1)
      const share2 = partyShares.get(secretId2)
      
      // 简化的乘法（不安全，仅用于演示）
      partyShares.set(resultId, share1 * share2)
    })
  }
  
  // 重构秘密
  reconstructSecret(secretId) {
    let sum = 0
    
    this.parties.forEach(party => {
      const partyShares = this.shares.get(party)
      sum += partyShares.get(secretId)
    })
    
    return sum
  }
  
  // 安全比较
  secureCompare(secretId1, secretId2) {
    // 计算差值
    const diffId = 'diff_' + Date.now()
    this.secureAdd(secretId1, secretId2, diffId)
    
    // 重构差值（在实际应用中，这应该通过零知识证明来完成）
    const diff = this.reconstructSecret(diffId)
    
    return {
      equal: diff === 0,
      greater: diff > 0,
      less: diff < 0
    }
  }
}

// 使用示例
const parties = ['Alice', 'Bob', 'Charlie']
const smpc = new SecureMultiPartyComputation(parties)

// Alice有秘密值 100
const aliceSecret = 100
smpc.shareSecret(aliceSecret, 'alice_value')

// Bob有秘密值 50
const bobSecret = 50
smpc.shareSecret(bobSecret, 'bob_value')

// 安全计算 Alice + Bob 的值
smpc.secureAdd('alice_value', 'bob_value', 'sum')

// 重构结果
const sum = smpc.reconstructSecret('sum')
console.log('安全加法结果:', sum) // 应该是 150

// 安全比较
const comparison = smpc.secureCompare('alice_value', 'bob_value')
console.log('安全比较结果:', comparison) // Alice > Bob
```

这些高级功能展示了 @ldesign/crypto 在复杂加密场景中的应用能力，包括流式处理、密钥管理、零知识证明、同态加密和安全多方计算等前沿技术。
