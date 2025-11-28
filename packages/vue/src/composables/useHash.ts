import { ref } from 'vue'
import { hash as hashFn, hmac as hmacFn, type HashAlgorithm } from '@ldesign/crypto-core'

export function useHash() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hash = async (data: string, algorithm: HashAlgorithm = 'SHA256') => {
    loading.value = true
    error.value = null
    try {
      let result: string
      switch (algorithm) {
        case 'MD5':
          result = hashFn.md5(data)
          break
        case 'SHA1':
          result = hashFn.sha1(data)
          break
        case 'SHA256':
          result = hashFn.sha256(data)
          break
        case 'SHA384':
          result = hashFn.sha384(data)
          break
        case 'SHA512':
          result = hashFn.sha512(data)
          break
        default:
          result = hashFn.sha256(data)
      }
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Hash failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const md5 = async (data: string) => hashFn.md5(data)
  const sha1 = async (data: string) => hashFn.sha1(data)
  const sha256 = async (data: string) => hashFn.sha256(data)
  const sha384 = async (data: string) => hashFn.sha384(data)
  const sha512 = async (data: string) => hashFn.sha512(data)

  const hmac = async (data: string, key: string, algorithm: HashAlgorithm = 'SHA256') => {
    loading.value = true
    error.value = null
    try {
      let result: string
      switch (algorithm) {
        case 'MD5':
          result = hmacFn.md5(data, key)
          break
        case 'SHA1':
          result = hmacFn.sha1(data, key)
          break
        case 'SHA256':
          result = hmacFn.sha256(data, key)
          break
        case 'SHA384':
          result = hmacFn.sha384(data, key)
          break
        case 'SHA512':
          result = hmacFn.sha512(data, key)
          break
        default:
          result = hmacFn.sha256(data, key)
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

