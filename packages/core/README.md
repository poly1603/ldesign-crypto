# @ldesign/crypto-core

> 🔐 Framework-agnostic crypto core - High-performance encryption, hashing, and security utilities

[![npm version](https://img.shields.io/npm/v/@ldesign/crypto-core.svg)](https://www.npmjs.com/package/@ldesign/crypto-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔒 **AES Encryption** - AES-128/192/256 with multiple modes (CBC, CTR, GCM)
- 🔑 **RSA Encryption** - Asymmetric encryption with key pair generation
- #️⃣ **Hash Algorithms** - MD5, SHA-1, SHA-256, SHA-512, HMAC
- 🎯 **Framework Agnostic** - Works with any JavaScript framework
- ⚡ **High Performance** - Optimized for speed and efficiency
- 🛡️ **Type Safe** - Full TypeScript support
- 📦 **Tree-shakeable** - Import only what you need

## Installation

```bash
pnpm add @ldesign/crypto-core
# or
npm install @ldesign/crypto-core
# or
yarn add @ldesign/crypto-core
```

## Quick Start

### AES Encryption

```typescript
import { encrypt, decrypt } from '@ldesign/crypto-core'

// Encrypt data
const encrypted = await encrypt.aes('Hello, World!', 'secret-key', {
  mode: 'CBC',
  keySize: 256,
})

if (encrypted.success) {
  console.log('Encrypted:', encrypted.data)
  
  // Decrypt data
  const decrypted = await decrypt.aes(encrypted.data, 'secret-key', {
    mode: 'CBC',
    keySize: 256,
  })
  
  if (decrypted.success) {
    console.log('Decrypted:', decrypted.data) // 'Hello, World!'
  }
}
```

### RSA Encryption

```typescript
import { rsa } from '@ldesign/crypto-core'

// Generate key pair
const keyPair = await rsa.generateKeyPair({ keySize: 2048 })

if (keyPair.success) {
  const { publicKey, privateKey } = keyPair.data
  
  // Encrypt with public key
  const encrypted = await rsa.encrypt('Hello, World!', publicKey)
  
  if (encrypted.success) {
    // Decrypt with private key
    const decrypted = await rsa.decrypt(encrypted.data, privateKey)
    console.log('Decrypted:', decrypted.data)
  }
}
```

### Hash Functions

```typescript
import { hash } from '@ldesign/crypto-core'

// SHA-256
const sha256Hash = await hash.sha256('Hello, World!')
console.log('SHA-256:', sha256Hash.data)

// MD5
const md5Hash = await hash.md5('Hello, World!')
console.log('MD5:', md5Hash.data)

// HMAC
const hmacHash = await hash.hmac('Hello, World!', 'secret-key', 'SHA256')
console.log('HMAC-SHA256:', hmacHash.data)
```

## API Reference

### Encryption

- `encrypt.aes(data, key, options)` - AES encryption
- `decrypt.aes(data, key, options)` - AES decryption
- `encrypt.des(data, key, options)` - DES encryption
- `decrypt.des(data, key, options)` - DES decryption

### Asymmetric Encryption

- `rsa.generateKeyPair(options)` - Generate RSA key pair
- `rsa.encrypt(data, publicKey)` - RSA encryption
- `rsa.decrypt(data, privateKey)` - RSA decryption

### Hash Functions

- `hash.md5(data)` - MD5 hash
- `hash.sha1(data)` - SHA-1 hash
- `hash.sha256(data)` - SHA-256 hash
- `hash.sha512(data)` - SHA-512 hash
- `hash.hmac(data, key, algorithm)` - HMAC

### Key Management

- `keyGenerator.generate(options)` - Generate cryptographic keys
- `keyGenerator.derive(password, salt, options)` - Derive key from password

## Advanced Usage

### Crypto Manager

```typescript
import { cryptoManager } from '@ldesign/crypto-core'

// Configure manager
cryptoManager.configure({
  defaultAlgorithm: 'AES-256-CBC',
  enableCache: true,
  cacheSize: 1000,
})

// Use manager for encryption
const encrypted = await cryptoManager.encrypt('data', 'key')
const decrypted = await cryptoManager.decrypt(encrypted.data, 'key')
```

### Performance Optimization

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto-core'

const optimizer = new PerformanceOptimizer({
  enableCache: true,
  enableBatching: true,
  batchSize: 100,
})

// Batch operations for better performance
const results = await optimizer.batch([
  { operation: 'encrypt', data: 'data1', key: 'key1' },
  { operation: 'encrypt', data: 'data2', key: 'key2' },
])
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Node.js: >= 18.0.0

## Related Packages

- [@ldesign/crypto-vue](../vue) - Vue 3 integration
- [@ldesign/crypto-utils](../utils) - Utility functions
- [@ldesign/crypto-stream](../stream) - Stream encryption
- [@ldesign/crypto-workers](../workers) - Worker threads

## License

MIT © [LDesign Team](https://github.com/ldesign)


