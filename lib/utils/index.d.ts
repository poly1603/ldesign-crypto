import type { EncodingType } from '../types';
import CryptoJS from 'crypto-js';
export * from './advanced-validation';
/**
 * 字符串转换工具
 *
 * 提供字符串与常见编码（Base64、Hex、Utf8）之间的转换便捷方法。
 */
export declare class StringUtils {
    /**
     * 字符串转 WordArray
     * @param str 输入的 UTF-8 字符串
     * @returns CryptoJS 的 WordArray 表示
     */
    static stringToWordArray(str: string): CryptoJS.lib.WordArray;
    /**
     * WordArray 转字符串
     * @param wordArray CryptoJS WordArray
     * @returns UTF-8 字符串
     */
    static wordArrayToString(wordArray: CryptoJS.lib.WordArray): string;
    /**
     * 字符串转 Base64
     * @param str 输入 UTF-8 字符串
     * @returns Base64 字符串
     */
    static stringToBase64(str: string): string;
    /**
     * Base64 转字符串
     * @param base64 Base64 字符串
     * @returns UTF-8 字符串
     */
    static base64ToString(base64: string): string;
    /**
     * 字符串转 Hex
     * @param str 输入 UTF-8 字符串
     * @returns 十六进制字符串
     */
    static stringToHex(str: string): string;
    /**
     * Hex 转字符串
     * @param hex 十六进制字符串
     * @returns UTF-8 字符串
     */
    static hexToString(hex: string): string;
    /**
     * 根据编码类型转换字符串
     * @param str 输入 UTF-8 字符串
     * @param encoding 'base64' | 'hex' | 'utf8'
     */
    static encodeString(str: string, encoding: EncodingType): string;
    /**
     * 根据编码类型解码字符串
     * @param encodedStr 已编码的字符串
     * @param encoding 'base64' | 'hex' | 'utf8'
     */
    static decodeString(encodedStr: string, encoding: EncodingType): string;
}
/**
 * 随机数生成工具
 */
export declare class RandomUtils {
    /**
     * 生成随机字节
     * @param length 字节长度
     */
    static generateRandomBytes(length: number): CryptoJS.lib.WordArray;
    /**
     * 生成随机字符串
     * @param length 字节长度（将被转换为不同编码的字符串）
     * @param encoding 输出编码类型：'base64' | 'hex' | 'utf8'（默认 hex）
     */
    static generateRandomString(length: number, encoding?: EncodingType): string;
    /**
     * 生成盐值
     * @param length 盐值字节长度（默认 16）
     * @returns 十六进制字符串
     */
    static generateSalt(length?: number): string;
    /**
     * 生成初始化向量 (IV)
     * @param length IV 字节长度（默认 16）
     * @returns 十六进制字符串
     */
    static generateIV(length?: number): string;
    /**
     * 生成随机密钥
     * @param length 期望的字节长度，返回的十六进制字符串长度为 length * 2
     * @returns 十六进制字符串
     */
    static generateKey(length?: number): string;
}
/**
 * 验证工具
 */
export declare class ValidationUtils {
    /**
     * 验证字符串是否为空
     * @param str 目标字符串
     */
    static isEmpty(str: string | null | undefined): boolean;
    /**
     * 验证是否为有效的 Base64 字符串
     * 兼容浏览器与 Node 环境（无 atob/btoa 时使用正则与 CryptoJS 校验）
     * @param str Base64 字符串
     */
    static isValidBase64(str: string): boolean;
    /**
     * 验证是否为有效的 Hex 字符串
     * @param str 十六进制字符串
     */
    static isValidHex(str: string): boolean;
    /**
     * 验证密钥长度
     * @param key 密钥字符串
     * @param expectedLength 期望字节长度
     */
    static validateKeyLength(key: string, expectedLength: number): boolean;
    /**
     * 验证 AES 密钥长度
     * @param key 明文密钥字符串
     * @param keySize 位数（128/192/256）
     */
    static validateAESKeyLength(key: string, keySize: number): boolean;
}
/**
 * 错误处理工具
 */
export declare class ErrorUtils {
    /**
     * 创建加密错误
     */
    static createEncryptionError(message: string, algorithm?: string): Error;
    /**
     * 创建解密错误
     */
    static createDecryptionError(message: string, algorithm?: string): Error;
    /**
     * 创建哈希错误
     */
    static createHashError(message: string, algorithm?: string): Error;
    /**
     * 创建验证错误
     */
    static createValidationError(message: string): Error;
    /**
     * 处理错误
     */
    static handleError(error: unknown, context?: string): string;
}
/**
 * 常量定义
 */
export declare const CONSTANTS: {
    readonly AES: {
        readonly KEY_SIZES: readonly [128, 192, 256];
        readonly MODES: readonly ["CBC", "ECB", "CFB", "OFB", "CTR", "GCM"];
        readonly DEFAULT_MODE: "CBC";
        readonly DEFAULT_KEY_SIZE: 256;
        readonly IV_LENGTH: 16;
    };
    readonly RSA: {
        readonly KEY_SIZES: readonly [1024, 2048, 3072, 4096];
        readonly DEFAULT_KEY_SIZE: 2048;
    };
    readonly HASH: {
        readonly ALGORITHMS: readonly ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512"];
    };
    readonly HMAC: {
        readonly ALGORITHMS: readonly ["HMAC-MD5", "HMAC-SHA1", "HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"];
    };
    readonly ENCODING: {
        readonly TYPES: readonly ["base64", "hex", "utf8"];
        readonly DEFAULT: "hex";
    };
};
export * from './benchmark';
export * from './compression';
export * from './crypto-helpers';
export * from './errors';
export * from './key-derivation';
export * from './key-rotation';
export { LRUCache, type LRUCacheOptions } from './lru-cache';
export * from './object-pool';
export * from './performance-logger';
export * from './rate-limiter';
export * from './secure-storage';
