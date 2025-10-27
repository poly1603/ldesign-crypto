/**
 * Stream Encryption Module
 * 流式加密模块
 * 
 * 提供流式加密/解密支持
 */

// 导出类型
export type {
  FileDecryptionOptions,
  FileEncryptionOptions,
  IStreamDecryptor,
  IStreamEncryptor,
  IStreamProcessor,
  StreamDecryptionOptions,
  StreamDecryptionResult,
  StreamEncryptionOptions,
  StreamEncryptionResult,
  StreamProgress,
} from './types'

// 导出流式加密实现
export {
  StreamEncryptor,
  streamDecrypt,
  streamEncrypt,
} from './file-encryptor'