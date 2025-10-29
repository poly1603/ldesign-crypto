import { defineConfig } from '@ldesign/builder'

/**
 * @ldesign/crypto 构建配置
 * 
 * 使用 @ldesign/builder 打包生成多种格式：
 * - ESM (es/) - ES Module 格式，用于现代打包工具
 * - CJS (lib/) - CommonJS 格式，用于 Node.js
 * - UMD (dist/) - Universal Module Definition，用于浏览器直接引用
 */
export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    // 输出格式：ESM、CJS、UMD
    format: ['esm', 'cjs', ],
    
    // ESM 输出配置
    esm: {
      dir: 'es',
      preserveStructure: true, // 保持源代码目录结构
      splitting: true, // 启用代码分割
    },
    
    // CJS 输出配置
    cjs: {
      dir: 'lib',
      preserveStructure: true,
      splitting: false, // CJS 不需要代码分割
    },
    
    // UMD 输出配置
    umd: {
      enabled: false,
      dir: 'dist',
      name: 'LDesignCrypto', // 全局变量名
      minify: true, // UMD 版本启用压缩
      globals: {
        // 外部依赖的全局变量映射
        'vue': 'Vue',
        'react': 'React',
        'react-dom': 'ReactDOM',
        'crypto-js': 'CryptoJS',
        'node-forge': 'forge',
      },
    },
  },

  // 生成 TypeScript 类型声明文件
  dts: true,

  // 生成 sourcemap 便于调试
  sourcemap: true,

  // ESM 和 CJS 不压缩，保持可读性
  minify: false,

  // 构建前清理输出目录
  clean: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    'react',
    'react-dom',
    'crypto-js',
    'node-forge',
    'tslib',
    /^@ldesign\//,
    /^node:/,
  ],

  // 构建目标环境
  target: 'es2020',

  // 平台
  platform: 'browser',

  // 保留注释（包含 license 等重要信息）
  comments: 'legal',
})
