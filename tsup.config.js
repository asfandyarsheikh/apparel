import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.js' },
  format: ['esm'],
  clean: false,
  minify: true,
});