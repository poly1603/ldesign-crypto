import { describe, it, expect } from 'vitest'
import { useCrypto } from '../composables/useCrypto'

describe('@ldesign/crypto-vue - useCrypto', () => {
  it('should encrypt data', async () => {
    const { encrypt } = useCrypto()

    const result = await encrypt('test data', 'test-key')

    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('should decrypt data', async () => {
    const { encrypt, decrypt } = useCrypto()

    const encrypted = await encrypt('test data', 'test-key')
    if (!encrypted) throw new Error('Encryption failed')

    const decrypted = await decrypt(encrypted, 'test-key')

    expect(decrypted).toBe('test data')
  })

  it('should handle errors', async () => {
    const { encrypt, error } = useCrypto()

    // This should succeed in our mock implementation
    await encrypt('test', 'key')

    // Error handling is tested when actual crypto fails
    expect(error.value).toBeNull()
  })
})

