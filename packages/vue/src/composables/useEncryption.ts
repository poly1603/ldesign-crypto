import { ref } from 'vue'
import { aes, rsa, type AESOptions, type RSAKeyPair } from '@ldesign/crypto-core'

export function useEncryption() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const encryptAES = async (data: string, key: string, options?: AESOptions) => {
    loading.value = true
    error.value = null
    try {
      const result = aes.encrypt(data, key, options)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Encryption failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const decryptAES = async (encryptedData: string, key: string, options?: AESOptions) => {
    loading.value = true
    error.value = null
    try {
      const result = aes.decrypt(encryptedData, key, options)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Decryption failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const encryptRSA = async (data: string, publicKey: string) => {
    loading.value = true
    error.value = null
    try {
      const result = rsa.encrypt(data, publicKey)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'RSA encryption failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const decryptRSA = async (encryptedData: string, privateKey: string) => {
    loading.value = true
    error.value = null
    try {
      const result = rsa.decrypt(encryptedData, privateKey)
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'RSA decryption failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const generateRSAKeyPair = async (bits: 1024 | 2048 | 3072 | 4096 = 2048): Promise<RSAKeyPair | null> => {
    loading.value = true
    error.value = null
    try {
      return rsa.generateKeyPair(bits)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Key generation failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    encryptAES,
    decryptAES,
    encryptRSA,
    decryptRSA,
    generateRSAKeyPair,
    loading,
    error,
  }
}

