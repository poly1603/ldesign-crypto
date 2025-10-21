/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:49 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var CryptoJS = require('crypto-js');

class DataCompressor {
  /**
   * 压缩数据
   *
   * @param data 要压缩的数据
   * @param options 压缩选项
   * @returns 压缩结果
   *
   * @example
   * ```typescript
   * const result = DataCompressor.compress('Hello World Hello World')
   *  // 压缩率
   * ```
   */
  static compress(data, options = {}) {
    try {
      const originalSize = new Blob([data]).size;
      let compressed = this.dictionaryCompress(data);
      if (options.base64) {
        compressed = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(compressed));
      }
      const compressedSize = new Blob([compressed]).size;
      const compressionRatio = originalSize > 0 ? (originalSize - compressedSize) / originalSize * 100 : 0;
      return {
        success: true,
        data: compressed,
        originalSize,
        compressedSize,
        compressionRatio
      };
    } catch (error) {
      return {
        success: false,
        data: "",
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  /**
   * 解压缩数据
   *
   * @param compressedData 压缩的数据
   * @param options 解压选项
   * @returns 解压结果
   *
   * @example
   * ```typescript
   * const result = DataCompressor.decompress(compressed.data)
   *  // 原始数据
   * ```
   */
  static decompress(compressedData, options = {}) {
    try {
      let data = compressedData;
      if (options.base64) {
        data = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(data));
      }
      const decompressed = this.dictionaryDecompress(data);
      return {
        success: true,
        data: decompressed
      };
    } catch (error) {
      return {
        success: false,
        data: "",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  /**
   * 字典压缩算法
   * 查找重复的字符串模式并用较短的标记替换
   */
  static dictionaryCompress(data) {
    if (data.length < 10) {
      return data;
    }
    const dictionary = /* @__PURE__ */ new Map();
    let dictIndex = 0;
    let result = data;
    for (let len = 20; len >= 3; len--) {
      const patterns = /* @__PURE__ */ new Map();
      for (let i = 0; i <= data.length - len; i++) {
        const pattern = data.substring(i, i + len);
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
      for (const [pattern, count] of patterns.entries()) {
        if (count >= 2 && pattern.length > 3) {
          const token = `\0${dictIndex}\0`;
          if (token.length < pattern.length) {
            dictionary.set(token, pattern);
            result = result.split(pattern).join(token);
            dictIndex++;
          }
        }
      }
    }
    if (dictionary.size > 0) {
      const dictStr = JSON.stringify(Array.from(dictionary.entries()));
      return `${dictStr}${result}`;
    }
    return result;
  }
  /**
   * 字典解压缩算法
   */
  static dictionaryDecompress(data) {
    if (!data.startsWith("")) {
      return data;
    }
    const endOfDict = data.indexOf("", 1);
    if (endOfDict === -1) {
      return data;
    }
    const dictStr = data.substring(1, endOfDict);
    let result = data.substring(endOfDict + 1);
    try {
      const dictArray = JSON.parse(dictStr);
      const dictionary = new Map(dictArray);
      for (const [token, pattern] of dictionary.entries()) {
        result = result.split(token).join(pattern);
      }
      return result;
    } catch {
      return data;
    }
  }
  /**
   * 估算压缩效果
   *
   * @param data 要压缩的数据
   * @returns 预估的压缩率
   */
  static estimateCompressionRatio(data) {
    if (data.length < 100) {
      return 0;
    }
    const charCount = /* @__PURE__ */ new Map();
    for (const char of data) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    let repetitions = 0;
    for (const count of charCount.values()) {
      if (count > 1) {
        repetitions += count - 1;
      }
    }
    return repetitions / data.length * 100;
  }
  /**
   * 判断数据是否值得压缩
   *
   * @param data 要检查的数据
   * @returns 是否建议压缩
   */
  static shouldCompress(data) {
    if (data.length < 100) {
      return false;
    }
    return this.estimateCompressionRatio(data) > 10;
  }
}
function compress(data, options) {
  return DataCompressor.compress(data, options);
}
function decompress(data, options) {
  return DataCompressor.decompress(data, options);
}

exports.DataCompressor = DataCompressor;
exports.compress = compress;
exports.decompress = decompress;
//# sourceMappingURL=compression.cjs.map
