import { ref } from 'vue'
import { keyGenerator } from '@ldesign/crypto-core'

export function useKeyManager() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const generate = async () => {
    loading.value = true
    error.value = null
    try {
      return await keyGenerator.generate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { generate, loading, error }
}

