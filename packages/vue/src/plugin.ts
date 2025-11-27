import type { App } from 'vue'
import { encrypt, decrypt, hashInstance, aes, rsa } from '@ldesign/crypto-core'

export interface CryptoPluginOptions {
  defaultAlgorithm?: string
}

export interface GlobalCrypto {
  encrypt: typeof encrypt
  decrypt: typeof decrypt
  hash: typeof hashInstance
  aes: typeof aes
  rsa: typeof rsa
}

export const CryptoPlugin = {
  install(app: App, options: CryptoPluginOptions = {}) {
    const crypto: GlobalCrypto = {
      encrypt,
      decrypt,
      hash: hashInstance,
      aes,
      rsa,
    }

    app.config.globalProperties.$crypto = crypto
    app.provide('crypto', crypto)
  },
}

export function createCryptoPlugin(options: CryptoPluginOptions = {}) {
  return CryptoPlugin
}

export function installCrypto(app: App, options: CryptoPluginOptions = {}) {
  app.use(CryptoPlugin, options)
}

