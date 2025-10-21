import type { EncodingType, IEncoder } from '../types';
/**
 * 编码器
 * 优化：使用单例模式，避免重复创建实例
 */
export declare class Encoder implements IEncoder {
    private static instance;
    /**
     * 获取单例实例
     */
    static getInstance(): Encoder;
    /**
     * 私有构造函数，防止外部直接实例化
     */
    private constructor();
    /**
     * 编码字符串
     */
    encode(data: string, encoding: EncodingType): string;
    /**
     * 解码字符串
     */
    decode(encodedData: string, encoding: EncodingType): string;
    /**
     * Base64 编码
     */
    private encodeBase64;
    /**
     * Base64 解码
     */
    private decodeBase64;
    /**
     * Hex 编码
     */
    private encodeHex;
    /**
     * Hex 解码
     */
    private decodeHex;
    /**
     * URL 安全的 Base64 编码
     */
    encodeBase64Url(data: string): string;
    /**
     * URL 安全的 Base64 解码
     */
    decodeBase64Url(encodedData: string): string;
}
/**
 * 编码便捷函数
 * 优化：使用单例实例，避免重复创建
 */
export declare const encoding: {
    /**
     * Base64 编码
     */
    base64: {
        encode: (data: string) => string;
        decode: (encodedData: string) => string;
        encodeUrl: (data: string) => string;
        decodeUrl: (encodedData: string) => string;
    };
    /**
     * Hex 编码
     */
    hex: {
        encode: (data: string) => string;
        decode: (encodedData: string) => string;
    };
    /**
     * 通用编码函数
     */
    encode: (data: string, encoding: EncodingType) => string;
    /**
     * 通用解码函数
     */
    decode: (encodedData: string, encoding: EncodingType) => string;
};
/**
 * 向后兼容的别名
 */
export declare const base64: {
    encode: (data: string) => string;
    decode: (encodedData: string) => string;
    encodeUrl: (data: string) => string;
    decodeUrl: (encodedData: string) => string;
};
export declare const hex: {
    encode: (data: string) => string;
    decode: (encodedData: string) => string;
};
