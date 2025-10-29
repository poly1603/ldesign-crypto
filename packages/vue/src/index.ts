/**
 * @ldesign/crypto-vue
 * 
 * Vue 3 adapter for crypto core
 * Provides composables and plugins for Vue applications
 */

// === Composables ===
export {
  useCrypto,
  useEncryption,
  useHash,
  useKeyManager,
  useSignature,
} from './composables'

// === Plugin ===
export {
  createCryptoPlugin,
  CryptoPlugin,
  installCrypto,
  type CryptoPluginOptions,
  type GlobalCrypto,
} from './plugin'

// === Types ===
export type {
  UseCryptoOptions,
  UseCryptoReturn,
  UseEncryptionOptions,
  UseEncryptionReturn,
  UseHashOptions,
  UseHashReturn,
} from './types'

// === Version ===
export const version = '2.0.0'
export const name = '@ldesign/crypto-vue'


