import { writable } from 'svelte/store'
import { encrypt, decrypt } from '@ldesign/crypto-core'

export function cryptoStore() {
  const { subscribe, set, update } = writable({
    loading: false,
    error: null as string | null,
  })

  return {
    subscribe,
    encryptData: async (data: string, key: string) => {
      update(s => ({ ...s, loading: true, error: null }))
      try {
        const result = await encrypt.aes(data, key)
        update(s => ({ ...s, loading: false }))
        return result.success ? result.data : null
      } catch (err) {
        update(s => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Failed' }))
        return null
      }
    },
    decryptData: async (data: string, key: string) => {
      update(s => ({ ...s, loading: true, error: null }))
      try {
        const result = await decrypt.aes(data, key)
        update(s => ({ ...s, loading: false }))
        return result.success ? result.data : null
      } catch (err) {
        update(s => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Failed' }))
        return null
      }
    },
  }
}

