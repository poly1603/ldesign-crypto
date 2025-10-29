import { defineConfig } from '@ldesign/builder'

/**
 * @ldesign/crypto-core 构建配置
 * 
 * 核心加密功能包 - 框架无关
 */
export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],

    esm: {
      dir: 'es',
      preserveStructure: true,
      splitting: true,
    },

    cjs: {
      dir: 'lib',
      preserveStructure: true,
      splitting: false,
    },

    umd: {
      dir: 'dist',
      name: 'LDesignCryptoCore',
      minify: true,
      globals: {
        'crypto-js': 'CryptoJS',
        'node-forge': 'forge',
      },
    },
  },

  // 生成类型声明
  dts: true,

  // 生成 sourcemap
  sourcemap: true,

  // ESM/CJS 不压缩
  minify: false,

  // 构建前清理
  clean: true,

  // 外部依赖
  external: [
    'crypto-js',
    'node-forge',
    'tslib',
    /^node:/,
  ],

  // 构建目标
  target: 'es2020',

  // 平台
  platform: 'browser',

  // 保留法律注释
  comments: 'legal',
})


