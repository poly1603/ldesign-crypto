# @ldesign/crypto-react

> ⚛️ React adapter for @ldesign/crypto-core - Hooks, contexts, and components

## Features

- 🎣 **React Hooks** - useCrypto, useHash, useRSA
- 🔄 **Context API** - Global crypto state management
- ⚡ **Auto-reactive** - Automatic state updates
- 🛡️ **Type Safe** - Full TypeScript support

## Installation

```bash
pnpm add @ldesign/crypto-react @ldesign/crypto-core react
```

## Quick Start

### Basic Usage with Hooks

```tsx
import { useCrypto } from '@ldesign/crypto-react'

function App() {
  const { encryptData, decryptData, loading, error } = useCrypto()
  
  const handleEncrypt = async () => {
    const encrypted = await encryptData('Hello', 'secret-key')
    console.log(encrypted)
  }
  
  return (
    <div>
      <button onClick={handleEncrypt} disabled={loading}>
        {loading ? 'Encrypting...' : 'Encrypt'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  )
}
```

### Using Context Provider

```tsx
import { CryptoProvider, useCryptoContext } from '@ldesign/crypto-react'

function App() {
  return (
    <CryptoProvider>
      <EncryptComponent />
    </CryptoProvider>
  )
}

function EncryptComponent() {
  const { encrypt } = useCryptoContext()
  // Use encrypt function
}
```

## API

### Hooks

- `useCrypto()` - General crypto operations
- `useEncryption()` - Encryption only
- `useDecryption()` - Decryption only
- `useHash()` - Hash functions
- `useRSA()` - RSA operations

### Components

- `<CryptoProvider>` - Context provider
- `<CryptoStatus>` - Status display component

## License

MIT © [LDesign Team](https://github.com/ldesign)

