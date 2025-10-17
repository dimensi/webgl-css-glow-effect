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
          'webgl-core': ['@/lib/webglContext', '@/lib/shaderLoader', '@/lib/textureLoader'],
          'scene': ['@/scene/RenderPipeline', '@/scene/BackgroundPass', '@/scene/AvatarPass', '@/scene/BlurPass', '@/scene/CompositePass'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true, // Автоматически открывать браузер
  },
  assetsInclude: ['**/*.glsl'], // Включаем .glsl файлы как статические ресурсы
});
