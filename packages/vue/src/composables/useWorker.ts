import { ref } from 'vue'
import { getGlobalWorkerPool, type WorkerPoolOptions } from '@ldesign/crypto-core'

/**
 * 使用Web Worker进行加密操作
 * 可以在后台线程执行计算密集型的加密操作,避免阻塞主线程
 */
export function useWorker(options?: WorkerPoolOptions) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const workerPool = getGlobalWorkerPool(options)

  const encryptInWorker = async (
    data: string,
    key: string,
    algorithm: string = 'AES',
    encryptOptions?: Record<string, unknown>
  ) => {
    loading.value = true
    error.value = null
    try {
      const result = await workerPool.execute({
        type: 'encrypt',
        data: { data, key, algorithm, options: encryptOptions },
      })
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Worker encryption failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const decryptInWorker = async (
    encryptedData: string,
    key: string,
    algorithm: string = 'AES',
    decryptOptions?: Record<string, unknown>
  ) => {
    loading.value = true
    error.value = null
    try {
      const result = await workerPool.execute({
        type: 'decrypt',
        data: { encryptedData, key, algorithm, options: decryptOptions },
      })
      return result.success ? result.data : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Worker decryption failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const hashInWorker = async (data: string, algorithm: string = 'SHA256') => {
    loading.value = true
    error.value = null
    try {
      const result = await workerPool.execute({
        type: 'hash',
        data: { data, algorithm },
      })
      return result.success ? result.hash : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Worker hash failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    encryptInWorker,
    decryptInWorker,
    hashInWorker,
    loading,
    error,
  }
}