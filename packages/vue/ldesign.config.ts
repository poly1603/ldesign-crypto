import { defineConfig } from '@ldesign/builder'

/**
 * @ldesign/crypto-vue 构建配置
 * 
 * Vue 3 适配器包
 */
export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs', 'umd'],

    esm: {
      dir: 'es',
      preserveStructure: true,
    },

    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },

    umd: {
      dir: 'dist',
      name: 'LDesignCryptoVue',
      minify: true,
      globals: {
        'vue': 'Vue',
        '@ldesign/crypto-core': 'LDesignCryptoCore',
      },
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'vue',
    '@ldesign/crypto-core',
    /^node:/,
  ],

  target: 'es2020',
  platform: 'browser',
  comments: 'legal',
})


