import { ref } from 'vue'
import { aes } from '@ldesign/crypto-core'
import type { AESOptions } from '@ldesign/crypto-core'

export function useCrypto() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const encryptFn = async (data: string, key: string, options?: AESOptions) => {
    loading.value = true
    error.value = null

    try {
      const result = aes.encrypt(data, key, options)
      if (result.success && result.data) {
        return result.data
      }
      error.value = result.error || 'Encryption failed'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      return null
    } finally {
      loading.value = false
    }
  }

  const decryptFn = async (data: string, key: string, options?: AESOptions) => {
    loading.value = true
    error.value = null

    try {
      const result = aes.decrypt(data, key, options)
      if (result.success && result.data) {
        return result.data
      }
      error.value = result.error || 'Decryption failed'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      return null
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    encrypt: encryptFn,
    decrypt: decryptFn,
    loading,
    error,
    clearError,
  }
}

