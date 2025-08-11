
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],       // your entry file(s)
  format: ['cjs', 'esm'],    // output both CommonJS and ESM
  dts: true,                 // generate declaration files (.d.ts)
  sourcemap: true,           // generate source maps
  clean: true,               // clean dist folder before build
  external: ['https', 'child_process', 'fs', 'path'], // mark Node built-ins as external
  minify: true,              // minify output
});
