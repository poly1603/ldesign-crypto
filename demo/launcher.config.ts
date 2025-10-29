import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @ldesign/crypto 演示项目配置
 * 
 * 使用 @ldesign/launcher 启动 Vue 3 应用，展示 crypto 库的各项功能
 */
export default defineConfig({
  // 项目根目录
  root: '.',

  // 公共资源目录
  publicDir: 'public',

  // Vite 插件配置
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
    }),
  ],

  // 路径别名配置 - 直接使用源代码以便调试
  resolve: {
    alias: [
      { 
        find: '@ldesign/crypto', 
        replacement: path.resolve(__dirname, '../src/index.ts'),
      },
      { 
        find: '@', 
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
  },

  // 开发服务器配置
  server: {
    port: 5175,
    open: true,
    cors: true,
    host: true,
  },

  // 预览服务器配置
  preview: {
    port: 4175,
    open: true,
    host: true,
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue'],
    exclude: ['@ldesign/crypto'],
  },

  // 定义全局常量
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
})


