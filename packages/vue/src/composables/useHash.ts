import { ref } from 'vue'
import { hashInstance, hmacInstance, type HashAlgorithm } from '@ldesign/crypto-core'

export function useHash() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hash = async (data: string, algorithm: HashAlgorithm = 'SHA256') => {
    loading.value = true
    error.value = null
    try {
      const result = hashInstance.hash(data, algorithm)
      return result.success ? result.hash : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Hash failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const md5 = async (data: string) => hash(data, 'MD5')
  const sha1 = async (data: string) => hash(data, 'SHA1')
  const sha256 = async (data: string) => hash(data, 'SHA256')
  const sha384 = async (data: string) => hash(data, 'SHA384')
  const sha512 = async (data: string) => hash(data, 'SHA512')

  const hmac = async (data: string, key: string, algorithm: HashAlgorithm = 'SHA256') => {
    loading.value = true
    error.value = null
    try {
      let result: string
      switch (algorithm) {
        case 'MD5':
          result = hmacInstance.md5(data, key)
          break
        case 'SHA1':
          result = hmacInstance.sha1(data, key)
          break
        case 'SHA256':
          result = hmacInstance.sha256(data, key)
          break
        case 'SHA384':
          result = hmacInstance.sha384(data, key)
          break
        case 'SHA512':
          result = hmacInstance.sha512(data, key)
          break
        default:
          result = hmacInstance.sha256(data, key)
      }
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'HMAC failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    hash,
    md5,
    sha1,
    sha256,
    sha384,
    sha512,
    hmac,
    loading,
    error,
  }
}

