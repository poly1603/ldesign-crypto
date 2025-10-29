import { useState, useCallback } from 'react'
import { encrypt } from '@ldesign/crypto-core'

export function useEncryption() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const encryptFn = useCallback(async (data: string, key: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await encrypt.aes(data, key)
      return result.success ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { encrypt: encryptFn, loading, error }
}

