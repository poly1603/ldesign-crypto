/**
 * 性能监控和优化工具
 */
import type { EncryptionAlgorithm } from '../types';
/**
 * 性能指标接口
 */
export interface PerformanceMetric {
    /** 操作名称 */
    operation: string;
    /** 算法类型 */
    algorithm?: EncryptionAlgorithm;
    /** 开始时间 */
    startTime: number;
    /** 结束时间 */
    endTime: number;
    /** 执行时长（毫秒） */
    duration: number;
    /** 数据大小（字节） */
    dataSize?: number;
    /** 吞吐量（字节/秒） */
    throughput?: number;
    /** 内存使用（字节） */
    memoryUsage?: number;
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
}
/**
 * 性能报告接口
 */
export interface PerformanceReport {
    /** 总操作数 */
    totalOperations: number;
    /** 成功操作数 */
    successfulOperations: number;
    /** 失败操作数 */
    failedOperations: number;
    /** 平均执行时长（毫秒） */
    averageDuration: number;
    /** 最小执行时长（毫秒） */
    minDuration: number;
    /** 最大执行时长（毫秒） */
    maxDuration: number;
    /** 总数据处理量（字节） */
    totalDataProcessed: number;
    /** 平均吞吐量（字节/秒） */
    averageThroughput: number;
    /** 按算法分组的统计 */
    byAlgorithm: Map<string, AlgorithmStats>;
    /** 按操作分组的统计 */
    byOperation: Map<string, OperationStats>;
    /** 时间段统计 */
    timeSeriesData: TimeSeriesData[];
}
/**
 * 算法统计接口
 */
export interface AlgorithmStats {
    algorithm: string;
    count: number;
    averageDuration: number;
    totalDataProcessed: number;
    successRate: number;
}
/**
 * 操作统计接口
 */
export interface OperationStats {
    operation: string;
    count: number;
    averageDuration: number;
    successRate: number;
}
/**
 * 时间序列数据接口
 */
export interface TimeSeriesData {
    timestamp: number;
    operationsPerSecond: number;
    averageLatency: number;
    errorRate: number;
}
/**
 * 性能监控器配置
 */
export interface PerformanceMonitorConfig {
    /** 是否启用监控 */
    enabled: boolean;
    /** 最大存储的指标数量 */
    maxMetrics: number;
    /** 采样率（0-1） */
    samplingRate: number;
    /** 是否记录内存使用 */
    trackMemory: boolean;
    /** 是否自动清理旧数据 */
    autoCleanup: boolean;
    /** 清理阈值（毫秒） */
    cleanupThreshold: number;
    /** 是否启用实时监控 */
    realTimeMonitoring: boolean;
}
/**
 * 性能监控器类
 */
export declare class PerformanceMonitor {
    private metrics;
    private config;
    private startTimes;
    private realTimeCallbacks;
    private cleanupInterval?;
    constructor(config?: Partial<PerformanceMonitorConfig>);
    /**
     * 开始监控操作
     */
    startOperation(operationId: string, _algorithm?: EncryptionAlgorithm): void;
    /**
     * 结束监控操作
     */
    endOperation(operationId: string, operation: string, success?: boolean, dataSize?: number, error?: string, algorithm?: EncryptionAlgorithm): void;
    /**
     * 记录指标
     */
    private addMetric;
    /**
     * 获取内存使用情况
     */
    private getMemoryUsage;
    /**
     * 生成性能报告
     */
    generateReport(since?: number): PerformanceReport;
    /**
     * 按算法分组统计
     */
    private groupByAlgorithm;
    /**
     * 按操作分组统计
     */
    private groupByOperation;
    /**
     * 生成时间序列数据
     */
    private generateTimeSeriesData;
    /**
     * 计算平均值
     */
    private average;
    /**
     * 计算平均吞吐量
     */
    private calculateAverageThroughput;
    /**
     * 清理旧数据
     */
    cleanup(olderThan?: number): void;
    /**
     * 启动自动清理
     */
    private startAutoCleanup;
    /**
     * 停止自动清理
     */
    stopAutoCleanup(): void;
    /**
     * 注册实时监控回调
     */
    onRealTimeMetric(callback: (metric: PerformanceMetric) => void): () => void;
    /**
     * 通知实时监控监听器
     */
    private notifyRealTimeListeners;
    /**
     * 重置监控器
     */
    reset(): void;
    /**
     * 获取当前指标
     */
    getMetrics(): PerformanceMetric[];
    /**
     * 导出指标数据
     */
    exportMetrics(): string;
    /**
     * 导入指标数据
     */
    importMetrics(data: string): void;
    /**
     * 销毁监控器
     */
    destroy(): void;
}
export declare const performanceMonitor: PerformanceMonitor;
/**
 * 性能测量装饰器
 */
export declare function measurePerformance(target: unknown, propertyName: string, descriptor: PropertyDescriptor): PropertyDescriptor;
