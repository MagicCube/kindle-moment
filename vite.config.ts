import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: './public',
  },
  plugins: [
    tsconfigPaths(),
    legacy({
      targets: ['defaults', 'chrome > 32'],
    }),
  ],
});
