/**
 * @ldesign/crypto-vue 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: {
    index: 'src/index.ts',
    'composables/index': 'src/composables/index.ts',
  },

  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: { dir: 'dist', name: 'LDesignCryptoVue', minify: true },
  },

  dts: true,
  external: ['vue', '@ldesign/crypto-core'],
  globals: { vue: 'Vue', '@ldesign/crypto-core': 'LDesignCryptoCore' },
  clean: true,
  sourcemap: false,
})
