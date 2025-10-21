/**
 * 性能监控和日志系统
 *
 * 提供加密操作的性能监控、日志记录和统计分析
 */
export interface PerformanceMetric {
    operation: string;
    algorithm: string;
    dataSize: number;
    duration: number;
    timestamp: number;
    success: boolean;
    error?: string;
}
export interface PerformanceStats {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    totalDuration: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    operationsPerSecond: number;
    byAlgorithm: Map<string, {
        count: number;
        totalDuration: number;
        averageDuration: number;
    }>;
}
/**
 * 性能日志记录器
 */
export declare class PerformanceLogger {
    private metrics;
    private maxMetrics;
    private enabled;
    private readonly startTime;
    constructor(options?: {
        maxMetrics?: number;
        enabled?: boolean;
    });
    /**
     * 记录性能指标
     */
    log(metric: Omit<PerformanceMetric, 'timestamp'>): void;
    /**
     * 测量操作性能
     */
    measure<T>(operation: string, algorithm: string, dataSize: number, fn: () => Promise<T> | T): Promise<T>;
    /**
     * 获取性能统计
     */
    getStats(): PerformanceStats;
    /**
     * 获取最近的指标
     */
    getRecentMetrics(count?: number): PerformanceMetric[];
    /**
     * 获取特定算法的指标
     */
    getMetricsByAlgorithm(algorithm: string): PerformanceMetric[];
    /**
     * 获取失败的操作
     */
    getFailedOperations(): PerformanceMetric[];
    /**
     * 清除所有指标
     */
    clear(): void;
    /**
     * 启用/禁用日志记录
     */
    setEnabled(enabled: boolean): void;
    /**
     * 是否启用
     */
    isEnabled(): boolean;
    /**
     * 导出指标为 JSON
     */
    exportMetrics(): string;
    /**
     * 生成性能报告
     */
    generateReport(): string;
}
export declare const globalPerformanceLogger: PerformanceLogger;
/**
 * 性能装饰器（用于类方法）
 */
export declare function measurePerformance(operation: string, algorithm: string): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
