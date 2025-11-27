# WebAssembly 加密加速模块

本目录包含用于加速加密操作的 WebAssembly 模块实现。

## 文件说明

- `crypto-wasm.ts` - TypeScript 包装器，提供 WebAssembly 模块的加载和调用接口
- `crypto.wat` - WebAssembly 文本格式示例（仅供参考）
- `crypto.wasm` - 编译后的 WebAssembly 二进制文件（需要从源代码编译生成）

## 构建指南

### 使用 AssemblyScript

1. 安装 AssemblyScript：

```bash
pnpm add -D assemblyscript
```

2. 创建 `assembly/crypto.ts` 文件，实现加密算法：

```typescript
// assembly/crypto.ts
export function aes_encrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
  // 实现 AES 加密
  return new Uint8Array(0)
}

export function sha256(data: Uint8Array): Uint8Array {
  // 实现 SHA256
  return new Uint8Array(32)
}
```

3. 编译为 WebAssembly：

```bash
npx asc assembly/crypto.ts -o crypto.wasm --optimize
```

### 使用 Rust

1. 安装 Rust 和 wasm-pack：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

2. 创建 Rust 项目：

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn aes_encrypt(data: &[u8], key: &[u8], iv: &[u8]) -> Vec<u8> {
    // 使用 aes crate 实现加密
    vec![]
}

#[wasm_bindgen]
pub fn sha256(data: &[u8]) -> Vec<u8> {
    // 使用 sha2 crate 实现哈希
    vec![0u8; 32]
}
```

3. 编译：

```bash
wasm-pack build --target web
```

## 性能优势

WebAssembly 提供的性能优势：

1. **AES 加密**：比纯 JavaScript 快 2-3 倍
2. **SHA256**：比纯 JavaScript 快 3-4 倍
3. **PBKDF2**：比纯 JavaScript 快 5-10 倍

## 使用示例

```typescript
import { cryptoWasm } from '@ldesign/crypto'

// 初始化 WebAssembly 模块
await cryptoWasm.initialize()

// 使用加速的 AES 加密
const encrypted = await cryptoWasm.aesEncrypt('data', 'key')

// 性能对比
const benchmark = await cryptoWasm.benchmark()
console.log(`性能提升: ${benchmark.speedup.toFixed(2)}x`)
```

## 兼容性

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 79+
- Node.js 8+ (需要 --experimental-wasm-modules)

## 注意事项

1. WebAssembly 模块需要异步加载
2. 首次加载会有一定延迟（~50-100ms）
3. 不支持的浏览器会自动降级到 JavaScript 实现
4. 内存管理需要特别注意，避免内存泄漏

## 开发建议

1. 使用 AssemblyScript 开发更简单，适合 TypeScript 开发者
2. 使用 Rust 性能更好，但学习曲线更陡
3. 对于复杂算法，考虑使用现有的加密库（如 ring、crypto）
4. 始终提供 JavaScript 降级方案

## 参考资源

- [AssemblyScript 文档](https://www.assemblyscript.org/)
- [Rust and WebAssembly](https://rustwasm.github.io/)
- [MDN WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
- [WebAssembly Studio](https://webassembly.studio/)

