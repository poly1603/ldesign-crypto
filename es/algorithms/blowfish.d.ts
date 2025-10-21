import type { BlowfishOptions, DecryptResult, EncryptResult, IEncryptor } from '../types';
/**
 * Blowfish 加密器
 */
export declare class BlowfishEncryptor implements IEncryptor {
    private readonly defaultOptions;
    /**
     * Blowfish 加密
     * 注意：crypto-js 不直接支持 Blowfish，这里使用自定义实现
     */
    encrypt(data: string, key: string, options?: BlowfishOptions): EncryptResult;
    /**
     * Blowfish 解密
     */
    decrypt(encryptedData: string | EncryptResult, key: string, options?: BlowfishOptions): DecryptResult;
    /**
     * 准备密钥
     * 注意：由于使用 AES 作为替代，这个方法主要用于验证
     */
    private prepareKey;
}
/**
 * Blowfish 加密便捷函数
 */
export declare const blowfish: {
    /**
     * 加密
     */
    encrypt: (data: string, key: string, options?: BlowfishOptions) => EncryptResult;
    /**
     * 解密
     */
    decrypt: (encryptedData: string | EncryptResult, key: string, options?: BlowfishOptions) => DecryptResult;
    /**
     * 生成随机密钥
     */
    generateKey: (length?: number) => string;
};
