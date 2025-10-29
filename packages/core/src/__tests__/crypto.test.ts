import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, hash, keyGenerator } from '../core/crypto'

describe('@ldesign/crypto-core - Crypto', () => {
  describe('Encrypt & Decrypt', () => {
    it('should encrypt data successfully', async () => {
      const result = await encrypt.aes('test data', 'test-key')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.algorithm).toContain('AES')
    })

    it('should decrypt data successfully', async () => {
      const encrypted = await encrypt.aes('test data', 'test-key')
      if (!encrypted.success || !encrypted.data) throw new Error('Encryption failed')

      const decrypted = await decrypt.aes(encrypted.data, 'test-key')

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe('test data')
    })

    it('should encrypt and decrypt round trip', async () => {
      const originalData = 'Hello, World!'
      const key = 'secret-key'

      const encrypted = await encrypt.aes(originalData, key)
      expect(encrypted.success).toBe(true)

      if (encrypted.data) {
        const decrypted = await decrypt.aes(encrypted.data, key)
        expect(decrypted.success).toBe(true)
        expect(decrypted.data).toBe(originalData)
      }
    })
  })

  describe('Hash', () => {
    it('should generate MD5 hash', async () => {
      const result = await hash.md5('test data')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.algorithm).toBe('MD5')
    })

    it('should generate SHA256 hash', async () => {
      const result = await hash.sha256('test data')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.algorithm).toBe('SHA256')
    })

    it('should generate consistent hashes', async () => {
      const hash1 = await hash.sha256('test data')
      const hash2 = await hash.sha256('test data')

      expect(hash1.data).toBe(hash2.data)
    })
  })

  describe('Key Generator', () => {
    it('should generate a key', async () => {
      const key = await keyGenerator.generate()

      expect(key).toBeDefined()
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('should derive key from password', async () => {
      const derived = await keyGenerator.derive('password', 'salt')

      expect(derived).toBeDefined()
      expect(typeof derived).toBe('string')
    })
  })
})

