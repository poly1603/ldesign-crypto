/**
 * AES 加密器单例模式优化
 * 避免重复创建实例，提升性能
 */
/**
 * 导出优化后的 AES 加密函数
 */
export declare const aesOptimized: {
    encrypt: (data: string, key: string, options?: import(".").AESOptions) => import(".").EncryptResult;
    decrypt: (encryptedData: string | import(".").EncryptResult, key: string, options?: import(".").AESOptions) => import(".").DecryptResult;
    generateKey: (length?: number) => Promise<string>;
};
