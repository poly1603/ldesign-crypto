import { useState, useCallback } from 'react'
import { hash } from '@ldesign/crypto-core'

export interface UseHashReturn {
  md5: (data: string) => Promise<string | null>
  sha256: (data: string) => Promise<string | null>
  sha512: (data: string) => Promise<string | null>
  loading: boolean
  error: string | null
}

export function useHash(): UseHashReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const md5 = useCallback(async (data: string): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await hash.md5(data)
      return result.success && result.data ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const sha256 = useCallback(async (data: string): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await hash.sha256(data)
      return result.success && result.data ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const sha512 = useCallback(async (data: string): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await hash.sha512(data)
      return result.success && result.data ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { md5, sha256, sha512, loading, error }
}

