import { useState, useCallback } from 'react'
import { rsa } from '@ldesign/crypto-core'

export function useRSA() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateKeyPair = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await rsa.generateKeyPair()
      return result.success ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Key generation failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateKeyPair, loading, error }
}

