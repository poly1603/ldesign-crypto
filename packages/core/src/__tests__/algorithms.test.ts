import { describe, it, expect } from 'vitest'
import { aes, rsa, base64, hex } from '../algorithms'

describe('@ldesign/crypto-core - Algorithms', () => {
  describe('AES', () => {
    it('should encrypt with AES', async () => {
      const result = await aes.encrypt('data', 'key')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should decrypt with AES', async () => {
      const encrypted = await aes.encrypt('data', 'key')
      if (!encrypted.data) throw new Error('Encryption failed')

      const decrypted = await aes.decrypt(encrypted.data, 'key')

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe('data')
    })
  })

  describe('RSA', () => {
    it('should generate RSA key pair', async () => {
      const result = await rsa.generateKeyPair()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.publicKey).toBeDefined()
      expect(result.data?.privateKey).toBeDefined()
    })

    it('should encrypt with RSA', async () => {
      const keyPair = await rsa.generateKeyPair()
      if (!keyPair.data) throw new Error('Key generation failed')

      const result = await rsa.encrypt('data', keyPair.data.publicKey)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('Encoding', () => {
    it('should encode and decode base64', () => {
      const original = 'test data'
      const encoded = base64.encode(original)
      const decoded = base64.decode(encoded)

      expect(decoded).toBe(original)
    })

    it('should encode and decode hex', () => {
      const original = 'test'
      const encoded = hex.encode(original)
      const decoded = hex.decode(encoded)

      expect(decoded).toBe(original)
    })
  })
})

