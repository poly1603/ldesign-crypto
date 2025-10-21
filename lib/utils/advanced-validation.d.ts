/**
 * 高级输入验证系统
 * 提供更严格的安全验证，防止常见的安全问题
 */
/**
 * 验证结果
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * 高级验证工具类
 */
export declare class AdvancedValidator {
    /**
     * 验证加密数据
     */
    static validateEncryptionInput(data: string, options?: {
        minLength?: number;
        maxLength?: number;
        allowEmpty?: boolean;
    }): ValidationResult;
    /**
     * 验证密钥强度
     */
    static validateKeyStrength(key: string, algorithm: string, options?: {
        requireComplex?: boolean;
        minEntropy?: number;
    }): ValidationResult;
    /**
     * 验证 AES 选项
     */
    static validateAESOptions(options: {
        keySize?: number;
        mode?: string;
        iv?: string;
    }): ValidationResult;
    /**
     * 计算字符串熵值
     */
    private static calculateEntropy;
    /**
     * 验证 Base64 字符串
     */
    static validateBase64(str: string): ValidationResult;
    /**
     * 验证十六进制字符串
     */
    static validateHex(str: string): ValidationResult;
    /**
     * 批量验证
     */
    static validateAll(validations: Array<() => ValidationResult>): ValidationResult;
}
