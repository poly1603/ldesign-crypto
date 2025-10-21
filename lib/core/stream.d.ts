/**
 * 流式加密/解密处理
 * 支持大文件和流数据的加密处理，减少内存占用
 */
import type { AESOptions } from '../types';
/**
 * 流式加密选项
 */
export interface StreamOptions {
    /** 块大小（字节） */
    chunkSize?: number;
    /** 算法 */
    algorithm?: 'AES' | 'ChaCha20';
    /** 加密选项 */
    encryptionOptions?: AESOptions;
    /** 进度回调 */
    onProgress?: (progress: number) => void;
    /** 是否启用并行处理 */
    parallel?: boolean;
    /** 并行工作线程数 */
    workers?: number;
}
/**
 * 流式处理结果
 */
export interface StreamResult {
    /** 是否成功 */
    success: boolean;
    /** 处理的字节数 */
    bytesProcessed: number;
    /** 总时间（毫秒） */
    timeMs: number;
    /** 吞吐量（MB/s） */
    throughput: number;
    /** 错误信息 */
    error?: string;
}
/**
 * 流式加密器
 */
export declare class StreamCipher {
    private readonly defaultOptions;
    /**
     * 流式加密文本
     */
    encryptStream(input: ReadableStream<Uint8Array> | string, key: string, options?: StreamOptions): Promise<{
        stream: ReadableStream<Uint8Array>;
        metadata: {
            iv: string;
            algorithm: string;
            chunkSize: number;
        };
    }>;
    /**
     * 流式解密
     */
    decryptStream(input: ReadableStream<Uint8Array>, key: string, iv: string, options?: StreamOptions): Promise<ReadableStream<Uint8Array>>;
    /**
     * 处理大文件加密
     */
    encryptLargeData(data: ArrayBuffer | Uint8Array, key: string, options?: StreamOptions): Promise<{
        data: ArrayBuffer;
        metadata: {
            iv: string;
            algorithm: string;
            originalSize: number;
        };
    }>;
    /**
     * 处理大文件解密
     */
    decryptLargeData(encryptedData: ArrayBuffer | Uint8Array, key: string, iv: string, options?: StreamOptions): Promise<ArrayBuffer>;
    /**
     * 处理单个块
     */
    private processChunkEncrypt;
    private processChunkDecrypt;
    /**
     * 创建加密管道
     */
    createEncryptionPipeline(key: string, options?: StreamOptions): TransformStream<Uint8Array, Uint8Array>;
    /**
     * 创建解密管道
     */
    createDecryptionPipeline(key: string, iv: string, options?: StreamOptions): TransformStream<Uint8Array, Uint8Array>;
}
/**
 * 文件加密器
 * 专门处理文件的流式加密
 */
export declare class FileEncryptor {
    private streamCipher;
    /**
     * 加密文件（浏览器环境）
     */
    encryptFile(file: File, key: string, options?: StreamOptions): Promise<{
        blob: Blob;
        metadata: {
            originalName: string;
            originalSize: number;
            mimeType: string;
            iv: string;
            algorithm: string;
            encryptedAt: number;
        };
    }>;
    /**
     * 解密文件（浏览器环境）
     */
    decryptFile(encryptedBlob: Blob, key: string, options?: StreamOptions): Promise<{
        blob: Blob;
        metadata: {
            originalName: string;
            originalSize: number;
            mimeType: string;
            iv: string;
            algorithm: string;
            encryptedAt: number;
        };
    }>;
    /**
     * 分块加密文件（用于超大文件）
     */
    encryptFileChunks(file: File, key: string, chunkSize?: number): AsyncGenerator<{
        chunk: Uint8Array;
        index: number;
        total: number;
        progress: number;
    }>;
}
export declare const streamCipher: StreamCipher;
export declare const fileEncryptor: FileEncryptor;
