import type { App } from 'vue'
import { encrypt, decrypt, hash } from '@ldesign/crypto-core'

export interface CryptoPluginOptions {
  defaultAlgorithm?: string
}

export interface GlobalCrypto {
  encrypt: typeof encrypt
  decrypt: typeof decrypt
  hash: typeof hash
}

export const CryptoPlugin = {
  install(app: App, options: CryptoPluginOptions = {}) {
    const crypto: GlobalCrypto = {
      encrypt,
      decrypt,
      hash,
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

