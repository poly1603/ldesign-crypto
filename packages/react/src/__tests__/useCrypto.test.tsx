import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCrypto } from '../hooks/useCrypto'

describe('@ldesign/crypto-react - useCrypto', () => {
  it('should encrypt data', async () => {
    const { result } = renderHook(() => useCrypto())

    const encrypted = await result.current.encryptData('test data', 'test-key')

    expect(encrypted).toBeDefined()
    expect(typeof encrypted).toBe('string')
  })

  it('should decrypt data', async () => {
    const { result } = renderHook(() => useCrypto())

    const encrypted = await result.current.encryptData('test data', 'test-key')
    expect(encrypted).toBeDefined()

    if (encrypted) {
      const decrypted = await result.current.decryptData(encrypted, 'test-key')
      expect(decrypted).toBe('test data')
    }
  })

  it('should handle loading state', async () => {
    const { result } = renderHook(() => useCrypto())

    expect(result.current.loading).toBe(false)

    const promise = result.current.encryptData('test', 'key')

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await promise
  })
})

