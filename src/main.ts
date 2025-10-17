import { WebGLRenderer } from './webgl/renderer';
import { AvatarGlowApp } from './app';

async function main(): Promise<void> {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  const renderer = new WebGLRenderer(canvas);
  const app = new AvatarGlowApp(renderer);

  try {
    await app.initialize();
    app.start();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

main().catch(console.error);