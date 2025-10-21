import type { App, Plugin } from 'vue';
import { aes, base64, decrypt, digitalSignature, encoding, encrypt, hash, hex, hmac, keyGenerator, rsa } from '../../core';
import { useCrypto, useHash, useSignature } from './composables';
/**
 * 插件选项接口
 */
export interface CryptoPluginOptions {
    globalPropertyName?: string;
    registerComposables?: boolean;
    config?: {
        defaultAESKeySize?: 128 | 192 | 256;
        defaultRSAKeySize?: 1024 | 2048 | 3072 | 4096;
        defaultHashAlgorithm?: 'MD5' | 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512';
        defaultEncoding?: 'base64' | 'hex' | 'utf8';
    };
}
/**
 * 全局 Crypto 实例接口
 */
export interface GlobalCrypto {
    encrypt: typeof encrypt;
    decrypt: typeof decrypt;
    hash: typeof hash;
    hmac: typeof hmac;
    keyGenerator: typeof keyGenerator;
    digitalSignature: typeof digitalSignature;
    aes: typeof aes;
    rsa: typeof rsa;
    encoding: typeof encoding;
    base64: typeof base64;
    hex: typeof hex;
    useCrypto: typeof useCrypto;
    useHash: typeof useHash;
    useSignature: typeof useSignature;
}
/**
 * Crypto 插件
 */
export declare const CryptoPlugin: Plugin;
/**
 * 便捷安装函数
 */
export declare function installCrypto(app: App, options?: CryptoPluginOptions): void;
/**
 * 创建 Crypto 插件实例
 */
export declare function createCryptoPlugin(options?: CryptoPluginOptions): Plugin;
export default CryptoPlugin;
