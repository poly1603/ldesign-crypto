import { useState, useCallback } from 'react'
import { encrypt, decrypt } from '@ldesign/crypto-core'
import type { EncryptionOptions } from '@ldesign/crypto-core'

export interface UseCryptoReturn {
  encryptData: (data: string, key: string, options?: EncryptionOptions) => Promise<string | null>
  decryptData: (data: string, key: string, options?: EncryptionOptions) => Promise<string | null>
  loading: boolean
  error: string | null
  clearError: () => void
}

/**
 * React hook for crypto operations
 */
export function useCrypto(): UseCryptoReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const encryptData = useCallback(async (
    data: string,
    key: string,
    options?: EncryptionOptions
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await encrypt.aes(data, key, options)
      if (result.success && result.data) {
        return result.data
      }
      setError(result.error || 'Encryption failed')
      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const decryptData = useCallback(async (
    data: string,
    key: string,
    options?: EncryptionOptions
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await decrypt.aes(data, key, options)
      if (result.success && result.data) {
        return result.data
      }
      setError(result.error || 'Decryption failed')
      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    encryptData,
    decryptData,
    loading,
    error,
    clearError,
  }
}

