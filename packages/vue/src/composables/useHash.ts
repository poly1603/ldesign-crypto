import { ref } from 'vue'
import { hash } from '@ldesign/crypto-core'

export function useHash() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sha256 = async (data: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await hash.sha256(data)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { sha256, loading, error }
}

