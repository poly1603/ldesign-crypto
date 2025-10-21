import type { AESOptions, DecryptResult, EncryptResult, IEncryptor } from '../types';
/**
 * AES 默认选项类型：salt 保持可选，其他字段必需
 */
type AESDefaultOptions = Omit<Required<AESOptions>, 'salt'> & {
    salt?: string;
};
/**
 * AES 加密器
 * 优化：添加密钥派生缓存，减少重复计算
 */
export declare class AESEncryptor implements IEncryptor {
    private readonly defaultOptions;
    /**
     * 获取默认选项（公开方法，用于外部访问）
     */
    static getDefaultOptions(): AESDefaultOptions;
    private static keyCache;
    private static modeCache;
    private static wordArrayPool;
    private static readonly MAX_POOL_SIZE;
    /**
     * AES 加密
     *
     * @param data 明文字符串（允许为空字符串）
     * @param key 加密密钥；可传入普通字符串（将通过 PBKDF2-SHA256 派生），或十六进制字符串（长度需与 keySize 匹配）
     * @param options 可选项：mode、keySize、iv（十六进制）、padding
     * @returns EncryptResult 包含加密后字符串（默认使用 CryptoJS 默认格式，通常为 Base64）以及算法、模式、IV 等信息
     *
     * @example
     * ```ts
     * const res = new AESEncryptor().encrypt('hello', 'secret', { keySize: 256, mode: 'CBC' })
     * if (res.success)
     * ```
     */
    encrypt(data: string, key: string, options?: AESOptions): EncryptResult;
    /**
     * AES 解密
     *
     * @param encryptedData 加密后的字符串，或加密结果对象（包含算法、模式、iv、keySize 等）
     * @param key 解密密钥；规则与加密相同
     * @param options 可选项：mode、keySize、iv（十六进制）、padding。若传入字符串且未提供 iv，将尝试使用 CryptoJS 默认格式自动解析
     * @returns DecryptResult 包含解密后的明文字符串
     *
     * @example
     * ```ts
     * const enc = new AESEncryptor().encrypt('hello', 'secret')
     * const dec = new AESEncryptor().decrypt(enc, 'secret')
     * ```
     */
    decrypt(encryptedData: string | EncryptResult, key: string, options?: AESOptions): DecryptResult;
    /**
     * 提取解密参数
     * 优化：将参数提取逻辑独立出来，使主方法更清晰
     */
    private extractDecryptParams;
    /**
     * 尝试使用CryptoJS默认格式解密
     * 优化：将默认格式解密逻辑提取为独立方法
     */
    private tryDecryptWithDefaultFormat;
    /**
     * 执行标准解密流程
     * 优化：将标准解密逻辑提取为独立方法
     */
    private performStandardDecryption;
    /**
     * 验证解密结果
     * 优化：提取验证逻辑，避免代码重复
     */
    private validateDecryptionResult;
    /**
     * 创建解密错误结果
     * 优化：统一错误处理逻辑
     */
    private createDecryptErrorResult;
    /**
     * 验证 UTF-8 字符串有效性
     * 优化：提取为独立方法，避免代码重复
     */
    private validateUtf8String;
    /**
     * 准备密钥
     * 优化：使用 LRU 缓存，自动管理缓存大小和过期
     */
    private prepareKey;
    /**
     * 获取加密模式（带缓存）
     */
    private getMode;
    /**
     * 从对象池获取WordArray
     */
    private static getWordArrayFromPool;
    /**
     * 归还WordArray到对象池
     */
    private static returnWordArrayToPool;
    /**
     * 清理静态资源（供外部调用）
     */
    static cleanup(): void;
}
/**
 * AES 加密便捷函数
 */
export declare const aes: {
    /**
     * AES 加密
     */
    encrypt: (data: string, key: string, options?: AESOptions) => EncryptResult;
    /**
     * AES 解密
     */
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: AESOptions) => DecryptResult;
    /**
     * AES-128 加密
     */
    encrypt128: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
    /**
     * AES-192 加密
     */
    encrypt192: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
    /**
     * AES-256 加密
     */
    encrypt256: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
    /**
     * AES-128 解密
     */
    decrypt128: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
    /**
     * AES-192 解密
     */
    decrypt192: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
    /**
     * AES-256 解密
     */
    decrypt256: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
};
export {};
