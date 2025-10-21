/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
var CryptoErrorCode;
(function(CryptoErrorCode2) {
  CryptoErrorCode2[CryptoErrorCode2["UNKNOWN_ERROR"] = 1e3] = "UNKNOWN_ERROR";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_INPUT"] = 1001] = "INVALID_INPUT";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_PARAMETER"] = 1002] = "INVALID_PARAMETER";
  CryptoErrorCode2[CryptoErrorCode2["NOT_SUPPORTED"] = 1003] = "NOT_SUPPORTED";
  CryptoErrorCode2[CryptoErrorCode2["ENCRYPTION_FAILED"] = 2e3] = "ENCRYPTION_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_KEY"] = 2001] = "INVALID_KEY";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_IV"] = 2002] = "INVALID_IV";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_MODE"] = 2003] = "INVALID_MODE";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_PADDING"] = 2004] = "INVALID_PADDING";
  CryptoErrorCode2[CryptoErrorCode2["KEY_SIZE_MISMATCH"] = 2005] = "KEY_SIZE_MISMATCH";
  CryptoErrorCode2[CryptoErrorCode2["DECRYPTION_FAILED"] = 3e3] = "DECRYPTION_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["CORRUPTED_DATA"] = 3001] = "CORRUPTED_DATA";
  CryptoErrorCode2[CryptoErrorCode2["WRONG_KEY"] = 3002] = "WRONG_KEY";
  CryptoErrorCode2[CryptoErrorCode2["WRONG_IV"] = 3003] = "WRONG_IV";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_CIPHERTEXT"] = 3004] = "INVALID_CIPHERTEXT";
  CryptoErrorCode2[CryptoErrorCode2["HASH_FAILED"] = 4e3] = "HASH_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_ALGORITHM"] = 4001] = "INVALID_ALGORITHM";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_HASH"] = 4002] = "INVALID_HASH";
  CryptoErrorCode2[CryptoErrorCode2["KEY_GENERATION_FAILED"] = 5e3] = "KEY_GENERATION_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["KEY_NOT_FOUND"] = 5001] = "KEY_NOT_FOUND";
  CryptoErrorCode2[CryptoErrorCode2["KEY_EXPIRED"] = 5002] = "KEY_EXPIRED";
  CryptoErrorCode2[CryptoErrorCode2["KEY_DERIVATION_FAILED"] = 5003] = "KEY_DERIVATION_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["ENCODING_FAILED"] = 6e3] = "ENCODING_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["DECODING_FAILED"] = 6001] = "DECODING_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["INVALID_ENCODING"] = 6002] = "INVALID_ENCODING";
  CryptoErrorCode2[CryptoErrorCode2["RATE_LIMIT_EXCEEDED"] = 7e3] = "RATE_LIMIT_EXCEEDED";
  CryptoErrorCode2[CryptoErrorCode2["STORAGE_FAILED"] = 8e3] = "STORAGE_FAILED";
  CryptoErrorCode2[CryptoErrorCode2["STORAGE_NOT_AVAILABLE"] = 8001] = "STORAGE_NOT_AVAILABLE";
})(CryptoErrorCode || (CryptoErrorCode = {}));
class CryptoError extends Error {
  constructor(message, code = CryptoErrorCode.UNKNOWN_ERROR, algorithm, details) {
    super(message);
    this.name = "CryptoError";
    this.code = code;
    this.algorithm = algorithm;
    this.details = details;
    this.timestamp = Date.now();
    Object.setPrototypeOf(this, CryptoError.prototype);
  }
  /**
   * 获取格式化的错误信息
   */
  getFormattedMessage() {
    let msg = `[${this.name}:${this.code}] ${this.message}`;
    if (this.algorithm) {
      msg += ` (Algorithm: ${this.algorithm})`;
    }
    return msg;
  }
  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      algorithm: this.algorithm,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}
class EncryptionError extends CryptoError {
  constructor(message, code = CryptoErrorCode.ENCRYPTION_FAILED, algorithm, details) {
    super(message, code, algorithm, details);
    this.name = "EncryptionError";
    Object.setPrototypeOf(this, EncryptionError.prototype);
  }
}
class DecryptionError extends CryptoError {
  constructor(message, code = CryptoErrorCode.DECRYPTION_FAILED, algorithm, details) {
    super(message, code, algorithm, details);
    this.name = "DecryptionError";
    Object.setPrototypeOf(this, DecryptionError.prototype);
  }
}
class HashError extends CryptoError {
  constructor(message, code = CryptoErrorCode.HASH_FAILED, algorithm, details) {
    super(message, code, algorithm, details);
    this.name = "HashError";
    Object.setPrototypeOf(this, HashError.prototype);
  }
}
class KeyManagementError extends CryptoError {
  constructor(message, code = CryptoErrorCode.KEY_GENERATION_FAILED, algorithm, details) {
    super(message, code, algorithm, details);
    this.name = "KeyManagementError";
    Object.setPrototypeOf(this, KeyManagementError.prototype);
  }
}
class EncodingError extends CryptoError {
  constructor(message, code = CryptoErrorCode.ENCODING_FAILED, algorithm, details) {
    super(message, code, algorithm, details);
    this.name = "EncodingError";
    Object.setPrototypeOf(this, EncodingError.prototype);
  }
}
class RateLimitError extends CryptoError {
  constructor(message, retryAfter, details) {
    super(message, CryptoErrorCode.RATE_LIMIT_EXCEEDED, void 0, details);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
  getFormattedMessage() {
    let msg = super.getFormattedMessage();
    if (this.retryAfter) {
      msg += ` (Retry after ${this.retryAfter}ms)`;
    }
    return msg;
  }
}
class ValidationError extends CryptoError {
  constructor(message, field, details) {
    super(message, CryptoErrorCode.INVALID_INPUT, void 0, details);
    this.name = "ValidationError";
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  getFormattedMessage() {
    let msg = super.getFormattedMessage();
    if (this.field) {
      msg += ` (Field: ${this.field})`;
    }
    return msg;
  }
}
class StorageError extends CryptoError {
  constructor(message, code = CryptoErrorCode.STORAGE_FAILED, details) {
    super(message, code, void 0, details);
    this.name = "StorageError";
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}
class CryptoErrorFactory {
  /**
   * 创建加密错误
   */
  static createEncryptionError(message, options) {
    return new EncryptionError(message, options?.code || CryptoErrorCode.ENCRYPTION_FAILED, options?.algorithm, options?.details);
  }
  /**
   * 创建解密错误
   */
  static createDecryptionError(message, options) {
    return new DecryptionError(message, options?.code || CryptoErrorCode.DECRYPTION_FAILED, options?.algorithm, options?.details);
  }
  /**
   * 创建哈希错误
   */
  static createHashError(message, options) {
    return new HashError(message, options?.code || CryptoErrorCode.HASH_FAILED, options?.algorithm, options?.details);
  }
  /**
   * 创建密钥管理错误
   */
  static createKeyManagementError(message, options) {
    return new KeyManagementError(message, options?.code || CryptoErrorCode.KEY_GENERATION_FAILED, options?.algorithm, options?.details);
  }
  /**
   * 创建编码错误
   */
  static createEncodingError(message, options) {
    return new EncodingError(message, options?.code || CryptoErrorCode.ENCODING_FAILED, options?.algorithm, options?.details);
  }
  /**
   * 创建限流错误
   */
  static createRateLimitError(message, retryAfter, details) {
    return new RateLimitError(message, retryAfter, details);
  }
  /**
   * 创建验证错误
   */
  static createValidationError(message, field, details) {
    return new ValidationError(message, field, details);
  }
  /**
   * 创建存储错误
   */
  static createStorageError(message, code, details) {
    return new StorageError(message, code || CryptoErrorCode.STORAGE_FAILED, details);
  }
  /**
   * 从原生错误转换
   */
  static fromNativeError(error, defaultMessage) {
    return new CryptoError(error.message || defaultMessage || "Unknown error", CryptoErrorCode.UNKNOWN_ERROR, void 0, { originalError: error });
  }
}
class ErrorHandler {
  /**
   * 判断是否为加密错误
   */
  static isCryptoError(error) {
    return error instanceof CryptoError;
  }
  /**
   * 判断是否为加密操作错误
   */
  static isEncryptionError(error) {
    return error instanceof EncryptionError;
  }
  /**
   * 判断是否为解密错误
   */
  static isDecryptionError(error) {
    return error instanceof DecryptionError;
  }
  /**
   * 判断是否为限流错误
   */
  static isRateLimitError(error) {
    return error instanceof RateLimitError;
  }
  /**
   * 安全地处理错误
   */
  static handle(error, fallbackMessage = "An error occurred") {
    if (this.isCryptoError(error)) {
      return error.getFormattedMessage();
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return fallbackMessage;
  }
  /**
   * 记录错误（可扩展为发送到日志服务）
   */
  static log(error, context) {
    const message = this.handle(error);
    const prefix = context ? `[${context}]` : "";
    console.error(`${prefix} ${message}`);
    if (this.isCryptoError(error) && error.stack) {
      console.error(error.stack);
    }
  }
}

export { CryptoError, CryptoErrorCode, CryptoErrorFactory, DecryptionError, EncodingError, EncryptionError, ErrorHandler, HashError, KeyManagementError, RateLimitError, StorageError, ValidationError };
//# sourceMappingURL=errors.js.map
