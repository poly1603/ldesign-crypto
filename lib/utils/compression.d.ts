/**
 * 数据压缩工具
 * 提供加密前的数据压缩功能，减小加密数据体积
 */
/**
 * 压缩选项
 */
export interface CompressionOptions {
    /** 压缩级别 (1-9, 默认6) */
    level?: number;
    /** 是否使用Base64编码输出 */
    base64?: boolean;
}
/**
 * 压缩结果
 */
export interface CompressionResult {
    /** 是否成功 */
    success: boolean;
    /** 压缩后的数据 */
    data: string;
    /** 原始大小（字节） */
    originalSize: number;
    /** 压缩后大小（字节） */
    compressedSize: number;
    /** 压缩率 */
    compressionRatio: number;
    /** 错误信息 */
    error?: string;
}
/**
 * 解压缩结果
 */
export interface DecompressionResult {
    /** 是否成功 */
    success: boolean;
    /** 解压后的数据 */
    data: string;
    /** 错误信息 */
    error?: string;
}
/**
 * 数据压缩工具类
 *
 * 使用简单的RLE（Run-Length Encoding）和字典压缩算法
 * 适用于文本数据的压缩
 */
export declare class DataCompressor {
    /**
     * 压缩数据
     *
     * @param data 要压缩的数据
     * @param options 压缩选项
     * @returns 压缩结果
     *
     * @example
     * ```typescript
     * const result = DataCompressor.compress('Hello World Hello World')
     *  // 压缩率
     * ```
     */
    static compress(data: string, options?: CompressionOptions): CompressionResult;
    /**
     * 解压缩数据
     *
     * @param compressedData 压缩的数据
     * @param options 解压选项
     * @returns 解压结果
     *
     * @example
     * ```typescript
     * const result = DataCompressor.decompress(compressed.data)
     *  // 原始数据
     * ```
     */
    static decompress(compressedData: string, options?: CompressionOptions): DecompressionResult;
    /**
     * 字典压缩算法
     * 查找重复的字符串模式并用较短的标记替换
     */
    private static dictionaryCompress;
    /**
     * 字典解压缩算法
     */
    private static dictionaryDecompress;
    /**
     * 估算压缩效果
     *
     * @param data 要压缩的数据
     * @returns 预估的压缩率
     */
    static estimateCompressionRatio(data: string): number;
    /**
     * 判断数据是否值得压缩
     *
     * @param data 要检查的数据
     * @returns 是否建议压缩
     */
    static shouldCompress(data: string): boolean;
}
/**
 * 便捷的压缩函数
 */
export declare function compress(data: string, options?: CompressionOptions): CompressionResult;
/**
 * 便捷的解压缩函数
 */
export declare function decompress(data: string, options?: CompressionOptions): DecompressionResult;
