import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          'webgl-core': ['src/lib/webglContext.ts', 'src/lib/shaderLoader.ts', 'src/lib/textureLoader.ts'],
          'scene': ['src/scene/RenderPipeline.ts', 'src/scene/BackgroundPass.ts', 'src/scene/AvatarPass.ts', 'src/scene/BlurPass.ts', 'src/scene/CompositePass.ts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
