import { useState, useCallback } from 'react'
import { decrypt } from '@ldesign/crypto-core'

export function useDecryption() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decryptFn = useCallback(async (data: string, key: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await decrypt.aes(data, key)
      return result.success ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { decrypt: decryptFn, loading, error }
}

