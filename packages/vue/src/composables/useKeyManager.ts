import { ref } from 'vue'
import { keyGenerator, RandomUtils, type RSAKeyPair } from '@ldesign/crypto-core'

export function useKeyManager() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const generateRSAKeyPair = async (bits: 1024 | 2048 | 3072 | 4096 = 2048): Promise<RSAKeyPair | null> => {
    loading.value = true
    error.value = null
    try {
      return keyGenerator.generateRSAKeyPair(bits)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'RSA key generation failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const generateRandomKey = async (length: number = 32): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      return RandomUtils.generateKey(length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Random key generation failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const generateIV = async (length: number = 16): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      return RandomUtils.generateIV(length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'IV generation failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const generateSalt = async (length: number = 16): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      return RandomUtils.generateSalt(length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Salt generation failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    generateRSAKeyPair,
    generateRandomKey,
    generateIV,
    generateSalt,
    loading,
    error,
  }
}

