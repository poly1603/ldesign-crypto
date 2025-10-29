import { createSignal } from 'solid-js'
import { encrypt, decrypt } from '@ldesign/crypto-core'

export function createCrypto() {
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const encryptData = async (data: string, key: string) => {
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
  }

  const decryptData = async (data: string, key: string) => {
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
  }

  return { encryptData, decryptData, loading, error }
}

