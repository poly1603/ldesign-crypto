/**
 * @ldesign/crypto - Vue 3集成
 * 提供Vue 3组合式API和组件支持
 */

import { ref, reactive, computed, inject, provide, type App, type InjectionKey } from 'vue'
import { CryptoAPI } from '../core/CryptoAPI'
import type {
  CryptoManagerConfig,
  SymmetricConfig,
  AsymmetricConfig,
  HashConfig,
  SM2Config,
  SM4Config,
  CryptoResult,
  KeyPair,
  SignatureResult,
  VerifyResult
} from '../types'

// 注入键
export const CryptoAPIKey: InjectionKey<CryptoAPI> = Symbol('CryptoAPI')

/**
 * Vue 3插件安装函数
 */
export function install(app: App, config: CryptoManagerConfig = {}) {
  const cryptoAPI = new CryptoAPI(config)
  
  // 初始化API
  cryptoAPI.init().then(() => {
    console.log('[LDesign Crypto] Vue plugin initialized')
  }).catch(error => {
    console.error('[LDesign Crypto] Vue plugin initialization failed:', error)
  })

  // 提供全局实例
  app.provide(CryptoAPIKey, cryptoAPI)
  app.config.globalProperties.$crypto = cryptoAPI
}

/**
 * 使用加密API的组合式函数
 */
export function useCrypto(): CryptoAPI {
  const cryptoAPI = inject(CryptoAPIKey)
  if (!cryptoAPI) {
    throw new Error('CryptoAPI not found. Make sure to install the plugin.')
  }
  return cryptoAPI
}

/**
 * 对称加密组合式函数
 */
export function useSymmetricCrypto() {
  const crypto = useCrypto()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<string | null>(null)

  const encrypt = async (data: string, config: SymmetricConfig, algorithm: 'AES' | 'DES' | '3DES' = 'AES') => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      let cryptoResult: CryptoResult
      
      switch (algorithm) {
        case 'AES':
          cryptoResult = await crypto.aesEncrypt(data, config)
          break
        case 'DES':
          cryptoResult = await crypto.desEncrypt(data, config)
          break
        case '3DES':
          cryptoResult = await crypto.tripleDesEncrypt(data, config)
          break
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const decrypt = async (encryptedData: string, config: SymmetricConfig, algorithm: 'AES' | 'DES' | '3DES' = 'AES') => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      let cryptoResult: CryptoResult
      
      switch (algorithm) {
        case 'AES':
          cryptoResult = await crypto.aesDecrypt(encryptedData, config)
          break
        case 'DES':
          cryptoResult = await crypto.desDecrypt(encryptedData, config)
          break
        case '3DES':
          cryptoResult = await crypto.tripleDesDecrypt(encryptedData, config)
          break
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    result: computed(() => result.value),
    encrypt,
    decrypt
  }
}

/**
 * 非对称加密组合式函数
 */
export function useAsymmetricCrypto() {
  const crypto = useCrypto()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<string | null>(null)
  const keyPair = ref<KeyPair | null>(null)

  const generateKeyPair = async (algorithm: 'RSA' | 'SM2' = 'RSA', keySize?: number) => {
    isLoading.value = true
    error.value = null

    try {
      if (algorithm === 'RSA') {
        keyPair.value = await crypto.generateRSAKeyPair(keySize)
      } else {
        keyPair.value = await crypto.generateSM2KeyPair()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const encrypt = async (data: string, config: AsymmetricConfig | SM2Config, algorithm: 'RSA' | 'SM2' = 'RSA') => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      let cryptoResult: CryptoResult
      
      if (algorithm === 'RSA') {
        cryptoResult = await crypto.rsaEncrypt(data, config as AsymmetricConfig)
      } else {
        cryptoResult = await crypto.sm2Encrypt(data, config as SM2Config)
      }

      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const decrypt = async (encryptedData: string, config: AsymmetricConfig | SM2Config, algorithm: 'RSA' | 'SM2' = 'RSA') => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      let cryptoResult: CryptoResult
      
      if (algorithm === 'RSA') {
        cryptoResult = await crypto.rsaDecrypt(encryptedData, config as AsymmetricConfig)
      } else {
        cryptoResult = await crypto.sm2Decrypt(encryptedData, config as SM2Config)
      }

      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const sign = async (data: string, config: AsymmetricConfig | SM2Config, algorithm: 'RSA' | 'SM2' = 'RSA') => {
    isLoading.value = true
    error.value = null

    try {
      let signatureResult: SignatureResult
      
      if (algorithm === 'RSA') {
        signatureResult = await crypto.rsaSign(data, config as AsymmetricConfig)
      } else {
        signatureResult = await crypto.sm2Sign(data, config as SM2Config)
      }

      result.value = signatureResult.signature
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const verify = async (data: string, signature: string, config: AsymmetricConfig | SM2Config, algorithm: 'RSA' | 'SM2' = 'RSA') => {
    isLoading.value = true
    error.value = null

    try {
      let verifyResult: VerifyResult
      
      if (algorithm === 'RSA') {
        verifyResult = await crypto.rsaVerify(data, signature, config as AsymmetricConfig)
      } else {
        verifyResult = await crypto.sm2Verify(data, signature, config as SM2Config)
      }

      result.value = verifyResult.valid ? 'valid' : 'invalid'
      if (verifyResult.error) {
        error.value = verifyResult.error
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    result: computed(() => result.value),
    keyPair: computed(() => keyPair.value),
    generateKeyPair,
    encrypt,
    decrypt,
    sign,
    verify
  }
}

/**
 * 哈希算法组合式函数
 */
export function useHash() {
  const crypto = useCrypto()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<string | null>(null)

  const hash = async (
    data: string, 
    algorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'SM3' = 'SHA256',
    config: HashConfig = {}
  ) => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      let cryptoResult: CryptoResult
      
      switch (algorithm) {
        case 'MD5':
          cryptoResult = await crypto.md5(data, config)
          break
        case 'SHA1':
          cryptoResult = await crypto.sha1(data, config)
          break
        case 'SHA256':
          cryptoResult = await crypto.sha256(data, config)
          break
        case 'SHA512':
          cryptoResult = await crypto.sha512(data, config)
          break
        case 'SM3':
          cryptoResult = await crypto.sm3(data, config)
          break
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    result: computed(() => result.value),
    hash
  }
}

/**
 * 国密算法组合式函数
 */
export function useSM() {
  const crypto = useCrypto()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<string | null>(null)
  const keyPair = ref<KeyPair | null>(null)

  const generateSM2KeyPair = async () => {
    isLoading.value = true
    error.value = null

    try {
      keyPair.value = await crypto.generateSM2KeyPair()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const sm2Encrypt = async (data: string, config: SM2Config) => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      const cryptoResult = await crypto.sm2Encrypt(data, config)
      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const sm2Decrypt = async (encryptedData: string, config: SM2Config) => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      const cryptoResult = await crypto.sm2Decrypt(encryptedData, config)
      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const sm3Hash = async (data: string, config: HashConfig = {}) => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      const cryptoResult = await crypto.sm3(data, config)
      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const sm4Encrypt = async (data: string, config: SM4Config) => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      const cryptoResult = await crypto.sm4Encrypt(data, config)
      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  const sm4Decrypt = async (encryptedData: string, config: SM4Config) => {
    isLoading.value = true
    error.value = null
    result.value = null

    try {
      const cryptoResult = await crypto.sm4Decrypt(encryptedData, config)
      if (cryptoResult.success) {
        result.value = cryptoResult.data!
      } else {
        error.value = cryptoResult.error!
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    result: computed(() => result.value),
    keyPair: computed(() => keyPair.value),
    generateSM2KeyPair,
    sm2Encrypt,
    sm2Decrypt,
    sm3Hash,
    sm4Encrypt,
    sm4Decrypt
  }
}
