import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
  },
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['@ldesign/crypto-core'],
  target: 'es2020',
  platform: 'browser',
})


