/**
 * 密码强度检测工具
 * 提供密码强度评估和安全建议
 */
/**
 * 密码强度级别
 */
export declare enum PasswordStrength {
    VeryWeak = 0,
    Weak = 1,
    Fair = 2,
    Good = 3,
    Strong = 4,
    VeryStrong = 5
}
export interface PasswordAnalysis {
    /** 强度级别 */
    strength: PasswordStrength;
    /** 强度分数（0-100） */
    score: number;
    /** 长度 */
    length: number;
    /** 包含的字符类型 */
    characterTypes: {
        lowercase: boolean;
        uppercase: boolean;
        numbers: boolean;
        symbols: boolean;
        unicode: boolean;
    };
    /** 熵值（比特） */
    entropy: number;
    /** 破解时间估算 */
    crackTime: {
        online: string;
        offline: string;
        offlineSlowHash: string;
    };
    /** 问题列表 */
    issues: string[];
    /** 建议列表 */
    suggestions: string[];
    /** 是否包含常见密码 */
    isCommon: boolean;
    /** 是否包含重复字符 */
    hasRepeats: boolean;
    /** 是否包含序列 */
    hasSequence: boolean;
    /** 是否包含键盘模式 */
    hasKeyboardPattern: boolean;
}
/**
 * 密码强度检测器
 */
export declare class PasswordStrengthChecker {
    private readonly commonPasswords;
    private readonly keyboardPatterns;
    private readonly sequences;
    /**
     * 分析密码强度
     */
    analyze(password: string): PasswordAnalysis;
    /**
     * 分析字符类型
     */
    private analyzeCharacterTypes;
    /**
     * 计算熵值
     */
    private calculateEntropy;
    /**
     * 获取字符集大小
     */
    private getCharsetSize;
    /**
     * 计算分数
     */
    private calculateScore;
    /**
     * 获取强度级别
     */
    private getStrengthLevel;
    /**
     * 识别问题
     */
    private identifyIssues;
    /**
     * 生成建议
     */
    private generateSuggestions;
    /**
     * 估算破解时间
     */
    private estimateCrackTime;
    /**
     * 格式化时间
     */
    private formatTime;
    /**
     * 检查是否为常见密码
     */
    private isCommonPassword;
    /**
     * 检查重复字符
     */
    private hasRepeatingCharacters;
    /**
     * 检查序列
     */
    private hasSequence;
    /**
     * 检查键盘模式
     */
    private hasKeyboardPattern;
    /**
     * 检查是否包含个人信息（简化版）
     */
    private containsPersonalInfo;
    /**
     * 生成强密码
     */
    generateStrongPassword(options?: {
        length?: number;
        includeUppercase?: boolean;
        includeLowercase?: boolean;
        includeNumbers?: boolean;
        includeSymbols?: boolean;
        excludeSimilar?: boolean;
        excludeAmbiguous?: boolean;
    }): string;
    /**
     * 获取随机字符
     */
    private getRandomChar;
    /**
     * 生成密码短语
     */
    generatePassphrase(options?: {
        wordCount?: number;
        separator?: string;
        capitalize?: boolean;
        includeNumbers?: boolean;
    }): string;
    /**
     * 获取强度描述
     */
    getStrengthDescription(strength: PasswordStrength): string;
    /**
     * 获取强度颜色（用于UI显示）
     */
    getStrengthColor(strength: PasswordStrength): string;
}
export declare const passwordStrengthChecker: PasswordStrengthChecker;
