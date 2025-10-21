/**
 * Performance Benchmark Utility
 *
 * 提供算法性能基准测试工具
 *
 * 特性：
 * - 多种算法性能测试
 * - 不同数据大小测试
 * - 自动生成性能报告
 * - 支持对比测试
 *
 * @example
 * ```ts
 * import { Benchmark, createBenchmark } from '@ldesign/crypto'
 *
 * const benchmark = createBenchmark()
 * const results = await benchmark.runAll()
 * )
 * ```
 */
/**
 * 基准测试结果
 */
export interface BenchmarkResult {
    /** 算法名称 */
    algorithm: string;
    /** 操作类型 */
    operation: string;
    /** 数据大小（字节） */
    dataSize: number;
    /** 迭代次数 */
    iterations: number;
    /** 总耗时（毫秒） */
    totalTime: number;
    /** 平均耗时（毫秒） */
    averageTime: number;
    /** 每秒操作数 */
    operationsPerSecond: number;
    /** 吞吐量（MB/s） */
    throughput: number;
}
/**
 * 基准测试套件结果
 */
export interface BenchmarkSuite {
    /** 套件名称 */
    name: string;
    /** 开始时间 */
    startTime: number;
    /** 结束时间 */
    endTime: number;
    /** 总耗时 */
    duration: number;
    /** 测试结果 */
    results: BenchmarkResult[];
}
/**
 * 基准测试配置
 */
export interface BenchmarkOptions {
    /** 迭代次数 */
    iterations?: number;
    /** 预热次数 */
    warmupIterations?: number;
    /** 测试数据大小（字节） */
    dataSizes?: number[];
    /** 要测试的算法 */
    algorithms?: string[];
    /** 是否输出详细信息 */
    verbose?: boolean;
}
/**
 * 性能基准测试类
 */
export declare class Benchmark {
    private options;
    constructor(options?: BenchmarkOptions);
    /**
     * 运行所有基准测试
     */
    runAll(): Promise<BenchmarkSuite>;
    /**
     * AES 加密基准测试
     */
    private benchmarkAES;
    /**
     * 哈希算法基准测试
     */
    private benchmarkHash;
    /**
     * 编码算法基准测试
     */
    private benchmarkEncoding;
    /**
     * 生成测试数据
     */
    private generateTestData;
    /**
     * 生成性能报告
     */
    generateReport(suite: BenchmarkSuite): string;
    /**
     * 生成 JSON 报告
     */
    generateJSONReport(suite: BenchmarkSuite): string;
    /**
     * 格式化大小
     */
    formatSize(bytes: number): string;
    /**
     * 格式化时间
     */
    private formatTime;
    /**
     * 格式化吞吐量
     */
    private formatThroughput;
    /**
     * 日志输出
     */
    private log;
}
/**
 * 便捷函数：创建基准测试实例
 */
export declare function createBenchmark(options?: BenchmarkOptions): Benchmark;
/**
 * 便捷函数：运行快速基准测试
 */
export declare function quickBenchmark(): Promise<BenchmarkSuite>;
/**
 * 便捷函数：比较两个算法
 */
export declare function compareBenchmark(algorithm1: string, algorithm2: string, options?: BenchmarkOptions): Promise<string>;
