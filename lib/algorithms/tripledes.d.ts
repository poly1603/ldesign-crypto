import type { DecryptResult, EncryptResult, IEncryptor, TripleDESOptions } from '../types';
/**
 * 3DES (Triple DES) 加密器
 */
export declare class TripleDESEncryptor implements IEncryptor {
    private readonly defaultOptions;
    /**
     * 3DES 加密
     */
    encrypt(data: string, key: string, options?: TripleDESOptions): EncryptResult;
    /**
     * 3DES 解密
     */
    decrypt(encryptedData: string | EncryptResult, key: string, options?: TripleDESOptions): DecryptResult;
    /**
     * 准备密钥
     */
    private prepareKey;
    /**
     * 获取加密模式
     */
    private getMode;
}
/**
 * 3DES 加密便捷函数
 */
export declare const tripledes: {
    /**
     * 加密
     */
    encrypt: (data: string, key: string, options?: TripleDESOptions) => EncryptResult;
    /**
     * 解密
     */
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: TripleDESOptions) => DecryptResult;
    /**
     * 生成随机密钥
     */
    generateKey: () => string;
};
export declare const des3: {
    /**
     * 加密
     */
    encrypt: (data: string, key: string, options?: TripleDESOptions) => EncryptResult;
    /**
     * 解密
     */
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: TripleDESOptions) => DecryptResult;
    /**
     * 生成随机密钥
     */
    generateKey: () => string;
};
