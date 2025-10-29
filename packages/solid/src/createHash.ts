import { createSignal } from 'solid-js'
import { hash } from '@ldesign/crypto-core'

export function createHash() {
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const sha256 = async (data: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await hash.sha256(data)
      return result.success ? result.data : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { sha256, loading, error }
}

