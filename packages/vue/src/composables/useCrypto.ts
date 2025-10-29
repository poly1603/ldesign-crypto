import { ref } from 'vue'
import { encrypt, decrypt } from '@ldesign/crypto-core'
import type { EncryptionOptions } from '@ldesign/crypto-core'

export function useCrypto() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const encryptFn = async (data: string, key: string, options?: EncryptionOptions) => {
    loading.value = true
    error.value = null

    try {
      const result = await encrypt.aes(data, key, options)
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

  const decryptFn = async (data: string, key: string, options?: EncryptionOptions) => {
    loading.value = true
    error.value = null

    try {
      const result = await decrypt.aes(data, key, options)
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

