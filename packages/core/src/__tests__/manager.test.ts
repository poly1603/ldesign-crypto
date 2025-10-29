import { describe, it, expect, beforeEach } from 'vitest'
import { cryptoManager } from '../core/manager'

describe('@ldesign/crypto-core - Manager', () => {
  beforeEach(() => {
    cryptoManager.configure({
      defaultAlgorithm: 'AES-256-CBC',
      enableCache: false,
    })
  })

  it('should configure manager', () => {
    cryptoManager.configure({
      enableCache: true,
      cacheSize: 500,
    })

    const config = cryptoManager.getConfig()
    expect(config.enableCache).toBe(true)
    expect(config.cacheSize).toBe(500)
  })

  it('should encrypt with manager', async () => {
    const result = await cryptoManager.encrypt('data', 'key')

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should decrypt with manager', async () => {
    const encrypted = await cryptoManager.encrypt('data', 'key')
    if (!encrypted.data) throw new Error('Encryption failed')

    const decrypted = await cryptoManager.decrypt(encrypted.data, 'key')

    expect(decrypted.success).toBe(true)
    expect(decrypted.data).toBe('data')
  })
})

