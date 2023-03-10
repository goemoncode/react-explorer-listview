import { isAbsolute } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/index.scss',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: 'src/index.ts',
      name: 'ListView',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !isAbsolute(id),
    },
  },
});
