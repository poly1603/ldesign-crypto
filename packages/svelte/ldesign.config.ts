import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm'],
    esm: { dir: 'es', preserveStructure: true },
  },
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['svelte', 'svelte/store', '@ldesign/crypto-core'],
  target: 'es2020',
})

