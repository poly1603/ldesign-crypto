import { ref } from 'vue'
import { encrypt } from '@ldesign/crypto-core'

export function useEncryption() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const encryptAES = async (data: string, key: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await encrypt.aes(data, key)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { encryptAES, loading, error }
}

