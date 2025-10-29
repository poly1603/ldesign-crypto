/**
 * @ldesign/crypto-react
 * React adapter for crypto operations
 */

// Hooks
export {
  useCrypto,
  useEncryption,
  useDecryption,
  useHash,
  useRSA,
} from './hooks'

// Context
export {
  CryptoProvider,
  useCryptoContext,
} from './context/CryptoContext'

// Components
export { CryptoStatus } from './components/CryptoStatus'

// Types
export type {
  UseCryptoReturn,
  UseEncryptionReturn,
  UseHashReturn,
  CryptoContextValue,
} from './types'

export const version = '2.0.0'

