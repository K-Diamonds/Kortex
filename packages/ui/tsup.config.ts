import { defineConfig } from 'tsup';

const shared = {
  format: ['esm'] as const,
  sourcemap: true,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  esbuildOptions(options: { jsx?: string }) {
    options.jsx = 'automatic';
  },
};

export default defineConfig([
  {
    ...shared,
    entry: ['src/index.ts'],
    dts: true,
    clean: true,
    banner: { js: "'use client';" },
  },
  {
    ...shared,
    entry: ['src/element.ts'],
    dts: true,
    clean: false,
    banner: { js: "'use client';" },
  },
  {
    ...shared,
    entry: ['src/types.ts'],
    dts: true,
    clean: false,
  },
]);
