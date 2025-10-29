import { ref } from 'vue'
import { digitalSignature } from '@ldesign/crypto-core'

export function useSignature() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sign = async (data: string, privateKey: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await digitalSignature.sign(data, privateKey)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { sign, loading, error }
}

