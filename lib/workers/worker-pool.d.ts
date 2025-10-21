/**
 * Worker Pool - Worker 线程池管理
 * 支持 Web Worker (浏览器) 和 Worker Threads (Node.js)
 */
import type { DecryptResult, EncryptResult } from '../types';
/**
 * Worker 池配置选项
 */
export interface WorkerPoolOptions {
    /**
     * 线程池大小（默认为 CPU 核心数）
     */
    size?: number;
    /**
     * 任务超时时间（毫秒，默认 30000）
     */
    timeout?: number;
    /**
     * 是否自动启动 Worker（默认 true）
     */
    autoStart?: boolean;
    /**
     * Worker 脚本路径（仅 Node.js）
     */
    workerPath?: string;
}
/**
 * Worker 池统计信息
 */
export interface WorkerPoolStats {
    /**
     * 总 Worker 数量
     */
    totalWorkers: number;
    /**
     * 空闲 Worker 数量
     */
    idleWorkers: number;
    /**
     * 忙碌 Worker 数量
     */
    busyWorkers: number;
    /**
     * 等待队列长度
     */
    queueLength: number;
    /**
     * 完成任务数
     */
    completedTasks: number;
    /**
     * 失败任务数
     */
    failedTasks: number;
    /**
     * 平均任务执行时间（毫秒）
     */
    averageTaskTime: number;
}
/**
 * Worker 线程池
 */
export declare class WorkerPool {
    private workers;
    private taskQueue;
    private activeTasks;
    private options;
    private isInitialized;
    private isNodeEnv;
    private taskIdCounter;
    private stats;
    constructor(options?: WorkerPoolOptions);
    /**
     * 初始化 Worker 池
     */
    private initialize;
    /**
     * 创建 Worker 实例
     */
    private createWorker;
    /**
     * 处理 Worker 响应
     */
    private handleWorkerResponse;
    /**
     * 处理 Worker 错误
     */
    private handleWorkerError;
    /**
     * 处理队列中的下一个任务
     */
    private processNextTask;
    /**
     * 执行任务
     */
    private executeTask;
    /**
     * 提交加密任务
     */
    encrypt(data: string, key: string, algorithm: string, options?: Record<string, unknown>): Promise<EncryptResult>;
    /**
     * 提交解密任务
     */
    decrypt(data: string, key: string, algorithm: string, options?: Record<string, unknown>): Promise<DecryptResult>;
    /**
     * 批量加密
     */
    batchEncrypt(operations: Array<{
        data: string;
        key: string;
        algorithm: string;
        options?: Record<string, unknown>;
    }>): Promise<EncryptResult[]>;
    /**
     * 批量解密
     */
    batchDecrypt(operations: Array<{
        data: string;
        key: string;
        algorithm: string;
        options?: Record<string, unknown>;
    }>): Promise<DecryptResult[]>;
    /**
     * 获取统计信息
     */
    getStats(): WorkerPoolStats;
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 终止所有 Worker
     */
    terminate(): Promise<void>;
    /**
     * 获取池大小
     */
    get size(): number;
    /**
     * 是否已初始化
     */
    get initialized(): boolean;
}
/**
 * 获取全局 Worker 池
 */
export declare function getGlobalWorkerPool(options?: WorkerPoolOptions): WorkerPool;
/**
 * 销毁全局 Worker 池
 */
export declare function destroyGlobalWorkerPool(): Promise<void>;
