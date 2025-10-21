/**
 * Custom Error Classes
 *
 * 提供专门的错误类型，用于更精确的错误处理和调试
 *
 * 特性：
 * - 继承自原生 Error
 * - 包含详细的错误信息
 * - 支持错误码
 * - 便于错误分类和处理
 */
/**
 * 错误详情类型
 * 用于提供额外的错误上下文信息
 * 使用 Record<string, unknown> 而非 any 以提升类型安全性
 */
export type ErrorDetails = Record<string, unknown> | undefined;
/**
 * 错误代码枚举
 */
export declare enum CryptoErrorCode {
    UNKNOWN_ERROR = 1000,
    INVALID_INPUT = 1001,
    INVALID_PARAMETER = 1002,
    NOT_SUPPORTED = 1003,
    ENCRYPTION_FAILED = 2000,
    INVALID_KEY = 2001,
    INVALID_IV = 2002,
    INVALID_MODE = 2003,
    INVALID_PADDING = 2004,
    KEY_SIZE_MISMATCH = 2005,
    DECRYPTION_FAILED = 3000,
    CORRUPTED_DATA = 3001,
    WRONG_KEY = 3002,
    WRONG_IV = 3003,
    INVALID_CIPHERTEXT = 3004,
    HASH_FAILED = 4000,
    INVALID_ALGORITHM = 4001,
    INVALID_HASH = 4002,
    KEY_GENERATION_FAILED = 5000,
    KEY_NOT_FOUND = 5001,
    KEY_EXPIRED = 5002,
    KEY_DERIVATION_FAILED = 5003,
    ENCODING_FAILED = 6000,
    DECODING_FAILED = 6001,
    INVALID_ENCODING = 6002,
    RATE_LIMIT_EXCEEDED = 7000,
    STORAGE_FAILED = 8000,
    STORAGE_NOT_AVAILABLE = 8001
}
/**
 * 基础加密错误类
 */
export declare class CryptoError extends Error {
    readonly code: CryptoErrorCode;
    readonly algorithm?: string;
    readonly details?: ErrorDetails;
    readonly timestamp: number;
    constructor(message: string, code?: CryptoErrorCode, algorithm?: string, details?: ErrorDetails);
    /**
     * 获取格式化的错误信息
     */
    getFormattedMessage(): string;
    /**
     * 转换为JSON格式
     */
    toJSON(): object;
}
/**
 * 加密错误
 */
export declare class EncryptionError extends CryptoError {
    constructor(message: string, code?: CryptoErrorCode, algorithm?: string, details?: ErrorDetails);
}
/**
 * 解密错误
 */
export declare class DecryptionError extends CryptoError {
    constructor(message: string, code?: CryptoErrorCode, algorithm?: string, details?: ErrorDetails);
}
/**
 * 哈希错误
 */
export declare class HashError extends CryptoError {
    constructor(message: string, code?: CryptoErrorCode, algorithm?: string, details?: ErrorDetails);
}
/**
 * 密钥管理错误
 */
export declare class KeyManagementError extends CryptoError {
    constructor(message: string, code?: CryptoErrorCode, algorithm?: string, details?: ErrorDetails);
}
/**
 * 编码错误
 */
export declare class EncodingError extends CryptoError {
    constructor(message: string, code?: CryptoErrorCode, algorithm?: string, details?: ErrorDetails);
}
/**
 * 限流错误
 */
export declare class RateLimitError extends CryptoError {
    readonly retryAfter?: number;
    constructor(message: string, retryAfter?: number, details?: ErrorDetails);
    getFormattedMessage(): string;
}
/**
 * 验证错误
 */
export declare class ValidationError extends CryptoError {
    readonly field?: string;
    constructor(message: string, field?: string, details?: ErrorDetails);
    getFormattedMessage(): string;
}
/**
 * 存储错误
 */
export declare class StorageError extends CryptoError {
    constructor(message: string, code?: CryptoErrorCode, details?: ErrorDetails);
}
/**
 * 错误工厂函数
 */
export declare class CryptoErrorFactory {
    /**
     * 创建加密错误
     */
    static createEncryptionError(message: string, options?: {
        code?: CryptoErrorCode;
        algorithm?: string;
        details?: ErrorDetails;
    }): EncryptionError;
    /**
     * 创建解密错误
     */
    static createDecryptionError(message: string, options?: {
        code?: CryptoErrorCode;
        algorithm?: string;
        details?: ErrorDetails;
    }): DecryptionError;
    /**
     * 创建哈希错误
     */
    static createHashError(message: string, options?: {
        code?: CryptoErrorCode;
        algorithm?: string;
        details?: ErrorDetails;
    }): HashError;
    /**
     * 创建密钥管理错误
     */
    static createKeyManagementError(message: string, options?: {
        code?: CryptoErrorCode;
        algorithm?: string;
        details?: ErrorDetails;
    }): KeyManagementError;
    /**
     * 创建编码错误
     */
    static createEncodingError(message: string, options?: {
        code?: CryptoErrorCode;
        algorithm?: string;
        details?: ErrorDetails;
    }): EncodingError;
    /**
     * 创建限流错误
     */
    static createRateLimitError(message: string, retryAfter?: number, details?: ErrorDetails): RateLimitError;
    /**
     * 创建验证错误
     */
    static createValidationError(message: string, field?: string, details?: ErrorDetails): ValidationError;
    /**
     * 创建存储错误
     */
    static createStorageError(message: string, code?: CryptoErrorCode, details?: ErrorDetails): StorageError;
    /**
     * 从原生错误转换
     */
    static fromNativeError(error: Error, defaultMessage?: string): CryptoError;
}
/**
 * 错误处理辅助函数
 */
export declare class ErrorHandler {
    /**
     * 判断是否为加密错误
     */
    static isCryptoError(error: unknown): error is CryptoError;
    /**
     * 判断是否为加密操作错误
     */
    static isEncryptionError(error: unknown): error is EncryptionError;
    /**
     * 判断是否为解密错误
     */
    static isDecryptionError(error: unknown): error is DecryptionError;
    /**
     * 判断是否为限流错误
     */
    static isRateLimitError(error: unknown): error is RateLimitError;
    /**
     * 安全地处理错误
     */
    static handle(error: unknown, fallbackMessage?: string): string;
    /**
     * 记录错误（可扩展为发送到日志服务）
     */
    static log(error: unknown, context?: string): void;
}
