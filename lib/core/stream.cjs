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

var aes = require('../algorithms/aes.cjs');
require('crypto-js');
var index = require('../utils/index.cjs');
require('../algorithms/encoding.cjs');
require('node-forge');

class StreamCipher {
  constructor() {
    this.defaultOptions = {
      chunkSize: 64 * 1024,
      // 64KB chunks
      algorithm: "AES",
      encryptionOptions: {},
      onProgress: () => {
      },
      parallel: false,
      workers: 4
    };
  }
  /**
   * 流式加密文本
   */
  async encryptStream(input, key, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const iv = index.RandomUtils.generateIV(16);
    const inputStream = typeof input === "string" ? new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    }) : input;
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const encrypted = await encryptChunk(chunk, key, iv, opts.algorithm);
          controller.enqueue(encrypted);
        } catch (error) {
          controller.error(error);
        }
      }
    });
    const outputStream = inputStream.pipeThrough(transformStream);
    return {
      stream: outputStream,
      metadata: {
        iv,
        algorithm: opts.algorithm,
        chunkSize: opts.chunkSize
      }
    };
  }
  /**
   * 流式解密
   */
  async decryptStream(input, key, iv, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const decrypted = await decryptChunk(chunk, key, iv, opts.algorithm);
          controller.enqueue(decrypted);
        } catch (error) {
          controller.error(error);
        }
      }
    });
    return input.pipeThrough(transformStream);
  }
  /**
   * 处理大文件加密
   */
  async encryptLargeData(data, key, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const uint8Data = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    const totalSize = uint8Data.length;
    const encryptedChunks = [];
    const iv = index.RandomUtils.generateIV(16);
    let offset = 0;
    let processedBytes = 0;
    while (offset < totalSize) {
      const chunkSize = Math.min(opts.chunkSize, totalSize - offset);
      const chunk = uint8Data.slice(offset, offset + chunkSize);
      const encryptedChunk = await this.processChunkEncrypt(chunk, key, iv, opts.algorithm);
      encryptedChunks.push(encryptedChunk);
      processedBytes += chunkSize;
      offset += chunkSize;
      if (opts.onProgress) {
        opts.onProgress(processedBytes / totalSize);
      }
    }
    const combinedEncrypted = encryptedChunks.join("|");
    const result = new TextEncoder().encode(combinedEncrypted);
    return {
      data: result.buffer,
      metadata: {
        iv,
        algorithm: opts.algorithm,
        originalSize: totalSize
      }
    };
  }
  /**
   * 处理大文件解密
   */
  async decryptLargeData(encryptedData, key, iv, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const uint8Data = encryptedData instanceof ArrayBuffer ? new Uint8Array(encryptedData) : encryptedData;
    const combinedEncrypted = new TextDecoder().decode(uint8Data);
    const encryptedChunks = combinedEncrypted.split("|");
    const decryptedChunks = [];
    let processedChunks = 0;
    for (const encryptedChunk of encryptedChunks) {
      if (encryptedChunk.trim() === "") {
        continue;
      }
      const decryptedChunk = await this.processChunkDecrypt(encryptedChunk, key, iv, opts.algorithm);
      decryptedChunks.push(decryptedChunk);
      processedChunks++;
      if (opts.onProgress) {
        opts.onProgress(processedChunks / encryptedChunks.length);
      }
    }
    const totalLength = decryptedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let resultOffset = 0;
    for (const chunk of decryptedChunks) {
      result.set(chunk, resultOffset);
      resultOffset += chunk.length;
    }
    return result.buffer;
  }
  /**
   * 处理单个块
   */
  async processChunkEncrypt(chunk, key, iv, _algorithm) {
    const chunkStr = btoa(String.fromCharCode(...chunk));
    const result = aes.aes.encrypt(chunkStr, key, { iv });
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.error || "Encryption failed");
  }
  async processChunkDecrypt(encryptedChunk, key, iv, _algorithm) {
    const result = aes.aes.decrypt(encryptedChunk, key, { iv });
    if (result.success && result.data) {
      try {
        const binaryString = atob(result.data);
        return new Uint8Array(binaryString.split("").map((char) => char.charCodeAt(0)));
      } catch {
        throw new Error("Failed to decode decrypted data");
      }
    }
    throw new Error(result.error || "Decryption failed");
  }
  /**
   * 创建加密管道
   */
  createEncryptionPipeline(key, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const iv = index.RandomUtils.generateIV(16);
    return new TransformStream({
      async transform(chunk, controller) {
        try {
          const encrypted = await encryptChunk(chunk, key, iv, opts.algorithm);
          controller.enqueue(encrypted);
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
  /**
   * 创建解密管道
   */
  createDecryptionPipeline(key, iv, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    return new TransformStream({
      async transform(chunk, controller) {
        try {
          const decrypted = await decryptChunk(chunk, key, iv, opts.algorithm);
          controller.enqueue(decrypted);
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
}
async function encryptChunk(chunk, key, iv, _algorithm) {
  const chunkStr = new TextDecoder().decode(chunk);
  const result = aes.aes.encrypt(chunkStr, key, { iv });
  if (result.success && result.data) {
    return new TextEncoder().encode(result.data);
  }
  throw new Error(result.error || "Encryption failed");
}
async function decryptChunk(chunk, key, iv, _algorithm) {
  const chunkStr = new TextDecoder().decode(chunk);
  const result = aes.aes.decrypt(chunkStr, key, { iv });
  if (result.success && result.data) {
    return new TextEncoder().encode(result.data);
  }
  throw new Error(result.error || "Decryption failed");
}
class FileEncryptor {
  constructor() {
    this.streamCipher = new StreamCipher();
  }
  /**
   * 加密文件（浏览器环境）
   */
  async encryptFile(file, key, options = {}) {
    const arrayBuffer = await file.arrayBuffer();
    const { data, metadata } = await this.streamCipher.encryptLargeData(arrayBuffer, key, options);
    const fullMetadata = {
      originalName: file.name,
      originalSize: file.size,
      mimeType: file.type,
      iv: metadata.iv,
      algorithm: metadata.algorithm,
      encryptedAt: Date.now()
    };
    const metadataStr = JSON.stringify(fullMetadata);
    const metadataBytes = new TextEncoder().encode(metadataStr);
    const metadataLength = new Uint32Array([metadataBytes.length]);
    const totalLength = 4 + metadataBytes.length + data.byteLength;
    const result = new Uint8Array(totalLength);
    result.set(new Uint8Array(metadataLength.buffer), 0);
    result.set(metadataBytes, 4);
    result.set(new Uint8Array(data), 4 + metadataBytes.length);
    return {
      blob: new Blob([result], { type: "application/octet-stream" }),
      metadata: fullMetadata
    };
  }
  /**
   * 解密文件（浏览器环境）
   */
  async decryptFile(encryptedBlob, key, options = {}) {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const metadataLength = new Uint32Array(uint8Array.slice(0, 4).buffer)[0];
    const metadataBytes = uint8Array.slice(4, 4 + metadataLength);
    const metadataStr = new TextDecoder().decode(metadataBytes);
    const metadata = JSON.parse(metadataStr);
    const encryptedData = uint8Array.slice(4 + metadataLength);
    const decryptedData = await this.streamCipher.decryptLargeData(encryptedData, key, metadata.iv, options);
    return {
      blob: new Blob([decryptedData], { type: metadata.mimeType }),
      metadata
    };
  }
  /**
   * 分块加密文件（用于超大文件）
   */
  async *encryptFileChunks(file, key, chunkSize = 1024 * 1024) {
    const iv = index.RandomUtils.generateIV(16);
    const totalChunks = Math.ceil(file.size / chunkSize);
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, file.size);
      const chunk = file.slice(start, end);
      const arrayBuffer = await chunk.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const encryptedChunk = await encryptChunk(uint8Array, key, iv);
      yield {
        chunk: encryptedChunk,
        index: i,
        total: totalChunks,
        progress: (i + 1) / totalChunks
      };
    }
  }
}
const streamCipher = new StreamCipher();
const fileEncryptor = new FileEncryptor();

exports.FileEncryptor = FileEncryptor;
exports.StreamCipher = StreamCipher;
exports.fileEncryptor = fileEncryptor;
exports.streamCipher = streamCipher;
//# sourceMappingURL=stream.cjs.map
