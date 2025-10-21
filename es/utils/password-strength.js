/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
var PasswordStrength;
(function(PasswordStrength2) {
  PasswordStrength2[PasswordStrength2["VeryWeak"] = 0] = "VeryWeak";
  PasswordStrength2[PasswordStrength2["Weak"] = 1] = "Weak";
  PasswordStrength2[PasswordStrength2["Fair"] = 2] = "Fair";
  PasswordStrength2[PasswordStrength2["Good"] = 3] = "Good";
  PasswordStrength2[PasswordStrength2["Strong"] = 4] = "Strong";
  PasswordStrength2[PasswordStrength2["VeryStrong"] = 5] = "VeryStrong";
})(PasswordStrength || (PasswordStrength = {}));
class PasswordStrengthChecker {
  constructor() {
    this.commonPasswords = /* @__PURE__ */ new Set([
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "qwertyuiop",
      "abc123",
      "Password1",
      "password1",
      "123123",
      "welcome123",
      "admin123",
      "root",
      "toor",
      "pass",
      "pass123",
      "pass1234",
      "password1234",
      "qwerty123",
      "qwerty1234",
      "qazwsx",
      "password!",
      "p@ssword",
      "p@ssw0rd",
      "Password123",
      "admin@123",
      "Admin@123",
      "administrator",
      "Administrator"
    ]);
    this.keyboardPatterns = [
      "qwerty",
      "asdfgh",
      "zxcvbn",
      "qwertyuiop",
      "asdfghjkl",
      "zxcvbnm",
      "123456",
      "987654",
      "qazwsx",
      "qweasd",
      "!@#$%^",
      "1qaz2wsx"
    ];
    this.sequences = [
      "abcdef",
      "fedcba",
      "123456",
      "654321",
      "zyxwvu",
      "uvwxyz",
      "012345",
      "543210"
    ];
  }
  /**
   * 分析密码强度
   */
  analyze(password) {
    const length = password.length;
    const characterTypes = this.analyzeCharacterTypes(password);
    const entropy = this.calculateEntropy(password);
    const score = this.calculateScore(password, characterTypes, entropy);
    const strength = this.getStrengthLevel(score);
    const issues = this.identifyIssues(password, characterTypes);
    const suggestions = this.generateSuggestions(password, characterTypes, issues);
    const crackTime = this.estimateCrackTime(entropy);
    return {
      strength,
      score,
      length,
      characterTypes,
      entropy,
      crackTime,
      issues,
      suggestions,
      isCommon: this.isCommonPassword(password),
      hasRepeats: this.hasRepeatingCharacters(password),
      hasSequence: this.hasSequence(password),
      hasKeyboardPattern: this.hasKeyboardPattern(password)
    };
  }
  /**
   * 分析字符类型
   */
  analyzeCharacterTypes(password) {
    return {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-z0-9]/i.test(password),
      unicode: /[^\u0020-\u007E]/.test(password)
    };
  }
  /**
   * 计算熵值
   */
  calculateEntropy(password) {
    const charset = this.getCharsetSize(password);
    return password.length * Math.log2(charset);
  }
  /**
   * 获取字符集大小
   */
  getCharsetSize(password) {
    let size = 0;
    if (/[a-z]/.test(password)) {
      size += 26;
    }
    if (/[A-Z]/.test(password)) {
      size += 26;
    }
    if (/\d/.test(password)) {
      size += 10;
    }
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      size += 32;
    }
    if (/[^\u0020-\u007E]/.test(password)) {
      size += 128;
    }
    return size || 1;
  }
  /**
   * 计算分数
   */
  calculateScore(password, characterTypes, entropy) {
    let score = 0;
    score = Math.min(entropy * 1.5, 50);
    if (password.length >= 8) {
      score += 10;
    }
    if (password.length >= 12) {
      score += 10;
    }
    if (password.length >= 16) {
      score += 10;
    }
    if (password.length >= 20) {
      score += 10;
    }
    const typeCount = Object.values(characterTypes).filter(Boolean).length;
    score += typeCount * 5;
    if (this.isCommonPassword(password)) {
      score -= 50;
    }
    if (this.hasRepeatingCharacters(password)) {
      score -= 10;
    }
    if (this.hasSequence(password)) {
      score -= 15;
    }
    if (this.hasKeyboardPattern(password)) {
      score -= 15;
    }
    if (password.length < 8) {
      score -= 20;
    }
    if (characterTypes.symbols) {
      score += 10;
    }
    if (characterTypes.unicode) {
      score += 5;
    }
    return Math.max(0, Math.min(100, score));
  }
  /**
   * 获取强度级别
   */
  getStrengthLevel(score) {
    if (score < 20) {
      return PasswordStrength.VeryWeak;
    }
    if (score < 40) {
      return PasswordStrength.Weak;
    }
    if (score < 60) {
      return PasswordStrength.Fair;
    }
    if (score < 75) {
      return PasswordStrength.Good;
    }
    if (score < 90) {
      return PasswordStrength.Strong;
    }
    return PasswordStrength.VeryStrong;
  }
  /**
   * 识别问题
   */
  identifyIssues(password, characterTypes) {
    const issues = [];
    if (password.length < 8) {
      issues.push("\u5BC6\u7801\u592A\u77ED\uFF08\u5C11\u4E8E8\u4E2A\u5B57\u7B26\uFF09");
    }
    if (password.length < 12) {
      issues.push("\u5BC6\u7801\u957F\u5EA6\u5EFA\u8BAE\u81F3\u5C1112\u4E2A\u5B57\u7B26");
    }
    if (this.isCommonPassword(password)) {
      issues.push("\u5BC6\u7801\u8FC7\u4E8E\u5E38\u89C1\uFF0C\u5BB9\u6613\u88AB\u731C\u6D4B");
    }
    if (!characterTypes.uppercase) {
      issues.push("\u7F3A\u5C11\u5927\u5199\u5B57\u6BCD");
    }
    if (!characterTypes.lowercase) {
      issues.push("\u7F3A\u5C11\u5C0F\u5199\u5B57\u6BCD");
    }
    if (!characterTypes.numbers) {
      issues.push("\u7F3A\u5C11\u6570\u5B57");
    }
    if (!characterTypes.symbols) {
      issues.push("\u7F3A\u5C11\u7279\u6B8A\u5B57\u7B26");
    }
    if (this.hasRepeatingCharacters(password)) {
      issues.push("\u5305\u542B\u91CD\u590D\u5B57\u7B26");
    }
    if (this.hasSequence(password)) {
      issues.push("\u5305\u542B\u53EF\u9884\u6D4B\u7684\u5E8F\u5217");
    }
    if (this.hasKeyboardPattern(password)) {
      issues.push("\u5305\u542B\u952E\u76D8\u6A21\u5F0F");
    }
    if (this.containsPersonalInfo(password)) {
      issues.push("\u53EF\u80FD\u5305\u542B\u4E2A\u4EBA\u4FE1\u606F");
    }
    return issues;
  }
  /**
   * 生成建议
   */
  generateSuggestions(password, characterTypes, issues) {
    const suggestions = [];
    if (password.length < 12) {
      suggestions.push("\u589E\u52A0\u5BC6\u7801\u957F\u5EA6\u81F312\u4E2A\u5B57\u7B26\u4EE5\u4E0A");
    }
    if (password.length < 16) {
      suggestions.push("\u8003\u8651\u4F7F\u752816\u4E2A\u5B57\u7B26\u6216\u66F4\u957F\u7684\u5BC6\u7801\u4EE5\u83B7\u5F97\u66F4\u597D\u7684\u5B89\u5168\u6027");
    }
    if (!characterTypes.uppercase || !characterTypes.lowercase) {
      suggestions.push("\u6DF7\u5408\u4F7F\u7528\u5927\u5C0F\u5199\u5B57\u6BCD");
    }
    if (!characterTypes.numbers) {
      suggestions.push("\u6DFB\u52A0\u6570\u5B57\u589E\u5F3A\u590D\u6742\u5EA6");
    }
    if (!characterTypes.symbols) {
      suggestions.push("\u4F7F\u7528\u7279\u6B8A\u5B57\u7B26\u5982 !@#$%^&*");
    }
    if (issues.length > 3) {
      suggestions.push("\u8003\u8651\u4F7F\u7528\u5BC6\u7801\u7BA1\u7406\u5668\u751F\u6210\u548C\u5B58\u50A8\u5F3A\u5BC6\u7801");
    }
    if (this.isCommonPassword(password)) {
      suggestions.push("\u907F\u514D\u4F7F\u7528\u5E38\u89C1\u5BC6\u7801\uFF0C\u521B\u5EFA\u72EC\u7279\u7684\u5BC6\u7801");
    }
    suggestions.push("\u8003\u8651\u4F7F\u7528\u5BC6\u7801\u77ED\u8BED\uFF08\u591A\u4E2A\u5355\u8BCD\u7EC4\u5408\uFF09");
    suggestions.push("\u5B9A\u671F\u66F4\u65B0\u5BC6\u7801");
    suggestions.push("\u4E3A\u4E0D\u540C\u8D26\u6237\u4F7F\u7528\u4E0D\u540C\u7684\u5BC6\u7801");
    return suggestions;
  }
  /**
   * 估算破解时间
   */
  estimateCrackTime(entropy) {
    const onlineAttacksPerSecond = 100;
    const offlineAttacksPerSecond = 1e9;
    const offlineSlowHashAttacksPerSecond = 1e4;
    const possibleCombinations = 2 ** entropy;
    const averageAttempts = possibleCombinations / 2;
    const onlineSeconds = averageAttempts / onlineAttacksPerSecond;
    const offlineSeconds = averageAttempts / offlineAttacksPerSecond;
    const offlineSlowHashSeconds = averageAttempts / offlineSlowHashAttacksPerSecond;
    return {
      online: this.formatTime(onlineSeconds),
      offline: this.formatTime(offlineSeconds),
      offlineSlowHash: this.formatTime(offlineSlowHashSeconds)
    };
  }
  /**
   * 格式化时间
   */
  formatTime(seconds) {
    if (seconds < 1) {
      return "\u7ACB\u5373";
    }
    if (seconds < 60) {
      return `${Math.round(seconds)}\u79D2`;
    }
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)}\u5206\u949F`;
    }
    if (seconds < 86400) {
      return `${Math.round(seconds / 3600)}\u5C0F\u65F6`;
    }
    if (seconds < 2592e3) {
      return `${Math.round(seconds / 86400)}\u5929`;
    }
    if (seconds < 31536e3) {
      return `${Math.round(seconds / 2592e3)}\u4E2A\u6708`;
    }
    if (seconds < 31536e5) {
      return `${Math.round(seconds / 31536e3)}\u5E74`;
    }
    const years = seconds / 31536e3;
    if (years < 1e3) {
      return `${Math.round(years)}\u5E74`;
    }
    if (years < 1e6) {
      return `${Math.round(years / 1e3)}\u5343\u5E74`;
    }
    if (years < 1e9) {
      return `${Math.round(years / 1e6)}\u767E\u4E07\u5E74`;
    }
    return "\u6570\u5341\u4EBF\u5E74\u4EE5\u4E0A";
  }
  /**
   * 检查是否为常见密码
   */
  isCommonPassword(password) {
    return this.commonPasswords.has(password.toLowerCase());
  }
  /**
   * 检查重复字符
   */
  hasRepeatingCharacters(password) {
    return /(.)\1{2,}/.test(password);
  }
  /**
   * 检查序列
   */
  hasSequence(password) {
    const lower = password.toLowerCase();
    return this.sequences.some((seq) => lower.includes(seq));
  }
  /**
   * 检查键盘模式
   */
  hasKeyboardPattern(password) {
    const lower = password.toLowerCase();
    return this.keyboardPatterns.some((pattern) => lower.includes(pattern));
  }
  /**
   * 检查是否包含个人信息（简化版）
   */
  containsPersonalInfo(password) {
    const commonPersonalInfo = [
      /\d{4}/,
      // 年份
      /\d{2}[/-]\d{2}/,
      // 日期
      /[a-z]+\d{2,4}/
      // 名字+数字
    ];
    return commonPersonalInfo.some((pattern) => pattern.test(password.toLowerCase()));
  }
  /**
   * 生成强密码
   */
  generateStrongPassword(options = {}) {
    const opts = {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      ...options
    };
    let charset = "";
    let password = "";
    if (opts.includeLowercase) {
      charset += opts.excludeSimilar ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    }
    if (opts.includeUppercase) {
      charset += opts.excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (opts.includeNumbers) {
      charset += opts.excludeSimilar ? "23456789" : "0123456789";
    }
    if (opts.includeSymbols) {
      charset += opts.excludeAmbiguous ? "!@#$%^&*+-=" : "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }
    const requiredChars = [];
    if (opts.includeLowercase) {
      requiredChars.push(this.getRandomChar("abcdefghijklmnopqrstuvwxyz"));
    }
    if (opts.includeUppercase) {
      requiredChars.push(this.getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
    }
    if (opts.includeNumbers) {
      requiredChars.push(this.getRandomChar("0123456789"));
    }
    if (opts.includeSymbols) {
      requiredChars.push(this.getRandomChar("!@#$%^&*()_+-="));
    }
    for (let i = requiredChars.length; i < opts.length; i++) {
      password += this.getRandomChar(charset);
    }
    for (const char of requiredChars) {
      const position = Math.floor(Math.random() * (password.length + 1));
      password = password.slice(0, position) + char + password.slice(position);
    }
    return password;
  }
  /**
   * 获取随机字符
   */
  getRandomChar(charset) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    return charset[randomIndex];
  }
  /**
   * 生成密码短语
   */
  generatePassphrase(options = {}) {
    const opts = {
      wordCount: 4,
      separator: "-",
      capitalize: true,
      includeNumbers: false,
      ...options
    };
    const words = [
      "time",
      "person",
      "year",
      "way",
      "day",
      "thing",
      "man",
      "world",
      "life",
      "hand",
      "part",
      "child",
      "eye",
      "woman",
      "place",
      "work",
      "week",
      "case",
      "point",
      "company",
      "number",
      "group",
      "problem",
      "fact",
      "blue",
      "green",
      "red",
      "yellow",
      "orange",
      "purple",
      "black",
      "white",
      "happy",
      "sad",
      "angry",
      "calm",
      "brave",
      "clever",
      "kind",
      "strong",
      "run",
      "jump",
      "walk",
      "talk",
      "think",
      "know",
      "want",
      "see",
      "ocean",
      "mountain",
      "river",
      "forest",
      "desert",
      "island",
      "valley",
      "lake"
    ];
    const selectedWords = [];
    for (let i = 0; i < opts.wordCount; i++) {
      let word = words[Math.floor(Math.random() * words.length)];
      if (opts.capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      selectedWords.push(word);
    }
    let passphrase = selectedWords.join(opts.separator);
    if (opts.includeNumbers) {
      passphrase += opts.separator + Math.floor(Math.random() * 1e4);
    }
    return passphrase;
  }
  /**
   * 获取强度描述
   */
  getStrengthDescription(strength) {
    switch (strength) {
      case PasswordStrength.VeryWeak:
        return "\u975E\u5E38\u5F31";
      case PasswordStrength.Weak:
        return "\u5F31";
      case PasswordStrength.Fair:
        return "\u4E00\u822C";
      case PasswordStrength.Good:
        return "\u597D";
      case PasswordStrength.Strong:
        return "\u5F3A";
      case PasswordStrength.VeryStrong:
        return "\u975E\u5E38\u5F3A";
      default:
        return "\u672A\u77E5";
    }
  }
  /**
   * 获取强度颜色（用于UI显示）
   */
  getStrengthColor(strength) {
    switch (strength) {
      case PasswordStrength.VeryWeak:
        return "#d32f2f";
      // 红色
      case PasswordStrength.Weak:
        return "#f57c00";
      // 橙色
      case PasswordStrength.Fair:
        return "#fbc02d";
      // 黄色
      case PasswordStrength.Good:
        return "#689f38";
      // 浅绿色
      case PasswordStrength.Strong:
        return "#388e3c";
      // 绿色
      case PasswordStrength.VeryStrong:
        return "#1976d2";
      // 蓝色
      default:
        return "#757575";
    }
  }
}
const passwordStrengthChecker = new PasswordStrengthChecker();

export { PasswordStrength, PasswordStrengthChecker, passwordStrengthChecker };
//# sourceMappingURL=password-strength.js.map
