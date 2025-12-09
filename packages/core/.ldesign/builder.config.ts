/**
 * @ldesign/crypto-core 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 多入口配置 - 支持子路径导出
  input: {
    index: 'src/index.ts',
    'algorithms/index': 'src/algorithms/index.ts',
    'core/index': 'src/core/index.ts',
    'stream/index': 'src/stream/index.ts',
    'types/index': 'src/types/index.ts',
    'utils/index': 'src/utils/index.ts',
    'wasm/index': 'src/wasm/crypto-wasm.ts',
    'workers/index': 'src/workers/index.ts',
  },

  // 输出配置 - 完整产物：es + lib + dist
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: { dir: 'dist', name: 'LDesignCryptoCore', minify: true },
  },

  dts: true,
  external: [],
  clean: true,
  sourcemap: false,
})
