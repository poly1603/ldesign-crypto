import type { DecryptResult, DESOptions, EncryptResult, IEncryptor } from '../types';
/**
 * DES 加密器
 */
export declare class DESEncryptor implements IEncryptor {
    private readonly defaultOptions;
    /**
     * DES 加密
     */
    encrypt(data: string, key: string, options?: DESOptions): EncryptResult;
    /**
     * DES 解密
     */
    decrypt(encryptedData: string | EncryptResult, key: string, options?: DESOptions): DecryptResult;
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
 * DES 加密便捷函数
 */
export declare const des: {
    /**
     * 加密
     */
    encrypt: (data: string, key: string, options?: DESOptions) => EncryptResult;
    /**
     * 解密
     */
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: DESOptions) => DecryptResult;
    /**
     * 生成随机密钥
     */
    generateKey: () => string;
};
