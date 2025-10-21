/**
 * Crypto Worker - 在 Worker 线程中执行加密/解密操作
 * Web Worker 专用
 */
import type { DecryptResult, EncryptResult } from '../types';
/**
 * Worker 消息类型
 */
export interface WorkerMessage {
    id: string;
    type: 'encrypt' | 'decrypt';
    algorithm: string;
    data: string;
    key: string;
    options?: Record<string, unknown>;
}
/**
 * Worker 响应类型
 */
export interface WorkerResponse {
    id: string;
    result: EncryptResult | DecryptResult;
    error?: string;
}
/**
 * 执行加密操作
 */
declare function performEncryption(data: string, key: string, algorithm: string, options?: Record<string, unknown>): EncryptResult;
/**
 * 执行解密操作
 */
declare function performDecryption(data: string, key: string, algorithm: string, options?: Record<string, unknown>): DecryptResult;
/**
 * 处理 Worker 消息
 */
declare function handleMessage(message: WorkerMessage): WorkerResponse;
export { handleMessage, performDecryption, performEncryption };
