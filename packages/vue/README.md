# @ldesign/crypto-vue

> 🔐 Vue 3 adapter for @ldesign/crypto-core - Composables, plugins, and reactive crypto utilities

[![npm version](https://img.shields.io/npm/v/@ldesign/crypto-vue.svg)](https://www.npmjs.com/package/@ldesign/crypto-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Vue 3 Composables** - Reactive crypto operations
- 🔌 **Plugin System** - Easy global integration
- ⚡ **Auto-reactive** - Automatic reactivity for all operations
- 🛡️ **Type Safe** - Full TypeScript support
- 📦 **Tree-shakeable** - Import only what you need

## Installation

```bash
pnpm add @ldesign/crypto-vue @ldesign/crypto-core
```

## Quick Start

### Plugin Installation

```typescript
import { createApp } from 'vue'
import { createCryptoPlugin } from '@ldesign/crypto-vue'
import App from './App.vue'

const app = createApp(App)

// Install crypto plugin
app.use(createCryptoPlugin({
  defaultAlgorithm: 'AES-256-CBC',
  enableCache: true,
}))

app.mount('#app')
```

### Using Composables

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCrypto } from '@ldesign/crypto-vue'

const { encrypt, decrypt, loading, error } = useCrypto()

const plaintext = ref('Hello, Vue!')
const key = ref('secret-key')
const encrypted = ref('')
const decrypted = ref('')

async function handleEncrypt() {
  const result = await encrypt(plaintext.value, key.value, {
    algorithm: 'AES-256-CBC',
  })
  
  if (result) {
    encrypted.value = result
  }
}

async function handleDecrypt() {
  const result = await decrypt(encrypted.value, key.value, {
    algorithm: 'AES-256-CBC',
  })
  
  if (result) {
    decrypted.value = result
  }
}
</script>

<template>
  <div>
    <input v-model="plaintext" placeholder="Enter text" />
    <input v-model="key" type="password" placeholder="Enter key" />
    
    <button @click="handleEncrypt" :disabled="loading">
      {{ loading ? 'Encrypting...' : 'Encrypt' }}
    </button>
    
    <div v-if="encrypted">Encrypted: {{ encrypted }}</div>
    
    <button @click="handleDecrypt" :disabled="loading || !encrypted">
      Decrypt
    </button>
    
    <div v-if="decrypted">Decrypted: {{ decrypted }}</div>
    
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
```

## Composables

### useCrypto()

General purpose crypto composable with encrypt/decrypt functionality.

```typescript
import { useCrypto } from '@ldesign/crypto-vue'

const {
  encrypt,
  decrypt,
  loading,
  error,
  clearError,
} = useCrypto({
  algorithm: 'AES-256-CBC',
  onError: (err) => console.error(err),
})
```

### useHash()

Hash functions composable.

```typescript
import { useHash } from '@ldesign/crypto-vue'

const {
  md5,
  sha256,
  sha512,
  hmac,
  loading,
  error,
} = useHash()

// Use hash functions
const hash = await sha256('Hello, World!')
```

### useEncryption()

Advanced encryption composable with batching and caching.

```typescript
import { useEncryption } from '@ldesign/crypto-vue'

const {
  encryptAES,
  decryptAES,
  encryptRSA,
  decryptRSA,
  generateKeyPair,
  loading,
  error,
} = useEncryption({
  enableCache: true,
  batchSize: 10,
})
```

## Global Usage (with Plugin)

```vue
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const crypto = instance?.appContext.config.globalProperties.$crypto

async function encrypt() {
  const result = await crypto.encrypt('data', 'key')
  console.log(result)
}
</script>
```

## TypeScript Support

All composables are fully typed:

```typescript
import type {
  UseCryptoOptions,
  UseCryptoReturn,
  UseHashReturn,
} from '@ldesign/crypto-vue'

const options: UseCryptoOptions = {
  algorithm: 'AES-256-CBC',
  enableCache: true,
}

const crypto: UseCryptoReturn = useCrypto(options)
```

## Related Packages

- [@ldesign/crypto-core](../core) - Core crypto functionality
- [@ldesign/crypto-utils](../utils) - Utility functions
- [@ldesign/crypto-stream](../stream) - Stream encryption
- [@ldesign/crypto-workers](../workers) - Worker threads

## License

MIT © [LDesign Team](https://github.com/ldesign)


