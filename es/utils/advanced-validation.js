/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class AdvancedValidator {
  /**
   * 验证加密数据
   */
  static validateEncryptionInput(data, options = {}) {
    const errors = [];
    const warnings = [];
    const minLength = options.minLength || 0;
    const maxLength = options.maxLength || 10 * 1024 * 1024;
    const allowEmpty = options.allowEmpty || false;
    if (!data || data.length === 0) {
      if (!allowEmpty) {
        errors.push("\u6570\u636E\u4E0D\u80FD\u4E3A\u7A7A");
      }
      return { valid: errors.length === 0, errors, warnings };
    }
    if (data.length < minLength) {
      errors.push(`\u6570\u636E\u957F\u5EA6\u4E0D\u80FD\u5C0F\u4E8E ${minLength} \u5B57\u7B26`);
    }
    if (data.length > maxLength) {
      errors.push(`\u6570\u636E\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 ${maxLength} \u5B57\u7B26`);
    }
    if (/[\x00-\x08\v\f\x0E-\x1F\x7F]/.test(data)) {
      warnings.push("\u6570\u636E\u5305\u542B\u63A7\u5236\u5B57\u7B26\uFF0C\u53EF\u80FD\u5BFC\u81F4\u7F16\u7801\u95EE\u9898");
    }
    try {
      encodeURIComponent(data);
    } catch {
      errors.push("\u6570\u636E\u5305\u542B\u65E0\u6548\u7684 UTF-8 \u5B57\u7B26");
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  /**
   * 验证密钥强度
   */
  static validateKeyStrength(key, algorithm, options = {}) {
    const errors = [];
    const warnings = [];
    const requireComplex = options.requireComplex || false;
    const minEntropy = options.minEntropy || 50;
    if (!key || key.length === 0) {
      errors.push("\u5BC6\u94A5\u4E0D\u80FD\u4E3A\u7A7A");
      return { valid: false, errors, warnings };
    }
    const algorithmRequirements = {
      "AES": { min: 16, recommended: 32 },
      "DES": { min: 8, recommended: 8 },
      "3DES": { min: 24, recommended: 24 },
      "RSA": { min: 128, recommended: 256 },
      "BLOWFISH": { min: 4, recommended: 16 }
    };
    const requirement = algorithmRequirements[algorithm.toUpperCase()];
    if (requirement) {
      if (key.length < requirement.min) {
        errors.push(`${algorithm} \u5BC6\u94A5\u957F\u5EA6\u81F3\u5C11\u9700\u8981 ${requirement.min} \u5B57\u8282`);
      } else if (key.length < requirement.recommended) {
        warnings.push(`${algorithm} \u63A8\u8350\u5BC6\u94A5\u957F\u5EA6\u4E3A ${requirement.recommended} \u5B57\u8282`);
      }
    }
    if (requireComplex) {
      const hasLower = /[a-z]/.test(key);
      const hasUpper = /[A-Z]/.test(key);
      const hasDigit = /\d/.test(key);
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(key);
      const complexity = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
      if (complexity < 3) {
        warnings.push("\u5BC6\u94A5\u590D\u6742\u5EA6\u8F83\u4F4E\uFF0C\u5EFA\u8BAE\u5305\u542B\u5927\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u7279\u6B8A\u5B57\u7B26");
      }
    }
    const entropy = this.calculateEntropy(key);
    if (entropy < minEntropy) {
      warnings.push(`\u5BC6\u94A5\u71B5\u503C\u8F83\u4F4E (${entropy.toFixed(2)} < ${minEntropy})\uFF0C\u53EF\u80FD\u4E0D\u591F\u5B89\u5168`);
    }
    const weakKeys = ["password", "123456", "admin", "qwerty", "secret"];
    if (weakKeys.some((weak) => key.toLowerCase().includes(weak))) {
      warnings.push("\u5BC6\u94A5\u5305\u542B\u5E38\u89C1\u5F31\u53E3\u4EE4\u6A21\u5F0F");
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  /**
   * 验证 AES 选项
   */
  static validateAESOptions(options) {
    const errors = [];
    const warnings = [];
    if (options.keySize !== void 0) {
      const validKeySizes = [128, 192, 256];
      if (!validKeySizes.includes(options.keySize)) {
        errors.push(`\u65E0\u6548\u7684 AES \u5BC6\u94A5\u5927\u5C0F: ${options.keySize}\u3002\u6709\u6548\u503C: 128, 192, 256`);
      } else if (options.keySize < 256) {
        warnings.push("\u5EFA\u8BAE\u4F7F\u7528 AES-256 \u4EE5\u83B7\u5F97\u66F4\u597D\u7684\u5B89\u5168\u6027");
      }
    }
    if (options.mode !== void 0) {
      const validModes = ["CBC", "ECB", "CFB", "OFB", "CTR", "GCM"];
      if (!validModes.includes(options.mode.toUpperCase())) {
        errors.push(`\u65E0\u6548\u7684 AES \u6A21\u5F0F: ${options.mode}`);
      }
      if (options.mode.toUpperCase() === "ECB") {
        warnings.push("ECB \u6A21\u5F0F\u4E0D\u63A8\u8350\u4F7F\u7528\uFF0C\u56E0\u4E3A\u5B83\u4E0D\u63D0\u4F9B\u8BED\u4E49\u5B89\u5168\u6027");
      }
    }
    if (options.iv !== void 0) {
      if (options.mode !== "ECB") {
        if (options.iv.length !== 32) {
          errors.push(`IV \u957F\u5EA6\u5E94\u4E3A 32 \u4E2A\u5341\u516D\u8FDB\u5236\u5B57\u7B26 (16 \u5B57\u8282)`);
        }
        if (!/^[0-9a-f]+$/i.test(options.iv)) {
          errors.push("IV \u5E94\u4E3A\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E32");
        }
      }
    } else {
      if (options.mode !== "ECB") {
        warnings.push("\u672A\u63D0\u4F9B IV\uFF0C\u5C06\u81EA\u52A8\u751F\u6210");
      }
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  /**
   * 计算字符串熵值
   */
  static calculateEntropy(str) {
    const len = str.length;
    const frequencies = /* @__PURE__ */ new Map();
    for (const char of str) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }
    let entropy = 0;
    for (const freq of frequencies.values()) {
      const p = freq / len;
      entropy -= p * Math.log2(p);
    }
    return entropy * len;
  }
  /**
   * 验证 Base64 字符串
   */
  static validateBase64(str) {
    const errors = [];
    const warnings = [];
    if (!str || str.length === 0) {
      errors.push("Base64 \u5B57\u7B26\u4E32\u4E0D\u80FD\u4E3A\u7A7A");
      return { valid: false, errors, warnings };
    }
    if (str.length % 4 !== 0) {
      errors.push("Base64 \u5B57\u7B26\u4E32\u957F\u5EA6\u5E94\u4E3A 4 \u7684\u500D\u6570");
    }
    if (!/^[A-Z0-9+/]*={0,2}$/i.test(str)) {
      errors.push("Base64 \u5B57\u7B26\u4E32\u5305\u542B\u65E0\u6548\u5B57\u7B26");
    }
    const paddingCount = (str.match(/=/g) || []).length;
    if (paddingCount > 2) {
      errors.push("Base64 \u586B\u5145\u5B57\u7B26\u8FC7\u591A");
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  /**
   * 验证十六进制字符串
   */
  static validateHex(str) {
    const errors = [];
    const warnings = [];
    if (!str || str.length === 0) {
      errors.push("\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E32\u4E0D\u80FD\u4E3A\u7A7A");
      return { valid: false, errors, warnings };
    }
    if (!/^[0-9a-f]+$/i.test(str)) {
      errors.push("\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E32\u5305\u542B\u65E0\u6548\u5B57\u7B26");
    }
    if (str.length % 2 !== 0) {
      errors.push("\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E32\u957F\u5EA6\u5E94\u4E3A\u5076\u6570");
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  /**
   * 批量验证
   */
  static validateAll(validations) {
    const allErrors = [];
    const allWarnings = [];
    let allValid = true;
    for (const validate of validations) {
      const result = validate();
      if (!result.valid) {
        allValid = false;
      }
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }
    return {
      valid: allValid,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

export { AdvancedValidator };
//# sourceMappingURL=advanced-validation.js.map
