import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { visualizer } from 'rollup-plugin-visualizer'
import dts from 'rollup-plugin-dts'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'

const isProduction = process.env.NODE_ENV === 'production'

// 外部依赖
const external = [
  'crypto-js',
  'node-forge',
  'vue',
  '@ldesign/engine',
  /^node:/,
]

// 共享的插件配置
const plugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  json(),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: false,
  }),
  alias({
    entries: [
      { find: '@', replacement: './src' },
    ],
  }),
]

// 生产环境插件
const productionPlugins = [
  ...plugins,
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.debug'],
      passes: 2,
    },
    mangle: {
      properties: {
        regex: /^_/,
      },
    },
    format: {
      comments: false,
    },
  }),
  visualizer({
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
  }),
]

export default defineConfig([
  // ESM 主包（完整版）
  {
    input: 'src/index.ts',
    output: {
      file: 'es/index.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // ESM 懒加载版本
  {
    input: 'src/index.lazy.ts',
    output: {
      file: 'es/index.lazy.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // CommonJS 主包
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'named',
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // UMD 包（浏览器直接使用）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/crypto.umd.js',
      format: 'umd',
      name: 'LDesignCrypto',
      sourcemap: !isProduction,
      globals: {
        'crypto-js': 'CryptoJS',
        'node-forge': 'forge',
      },
    },
    external: ['vue', '@ldesign/engine'],
    plugins: isProduction ? productionPlugins : plugins,
  },

  // UMD 压缩版
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/crypto.umd.min.js',
      format: 'umd',
      name: 'LDesignCrypto',
      sourcemap: false,
      globals: {
        'crypto-js': 'CryptoJS',
        'node-forge': 'forge',
      },
    },
    external: ['vue', '@ldesign/engine'],
    plugins: productionPlugins,
  },

  // 类型定义文件
  {
    input: 'src/index.ts',
    output: {
      file: 'es/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },

  // 懒加载版本的类型定义
  {
    input: 'src/index.lazy.ts',
    output: {
      file: 'es/index.lazy.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },

  // === 分包策略：按功能模块拆分 ===

  // 核心算法包
  {
    input: 'src/algorithms/index.ts',
    output: {
      file: 'es/algorithms.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // Worker 包
  {
    input: 'src/core/worker-crypto-manager.ts',
    output: {
      file: 'es/worker.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // WebAssembly 包
  {
    input: 'src/wasm/crypto-wasm.ts',
    output: {
      file: 'es/wasm.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // 工具包
  {
    input: 'src/utils/index.ts',
    output: {
      file: 'es/utils.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins: isProduction ? productionPlugins : plugins,
  },

  // Vue 适配器（单独打包）
  {
    input: 'src/adapt/vue/index.ts',
    output: {
      file: 'es/vue.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external: [...external, 'vue'],
    plugins: isProduction ? productionPlugins : plugins,
  },

  // Worker 文件（特殊处理）
  {
    input: 'src/workers/crypto.worker.ts',
    output: {
      file: 'dist/crypto.worker.js',
      format: 'iife',
      sourcemap: false,
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
      }),
      terser({
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
])
