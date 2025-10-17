import { WebGLRenderer } from './webgl/renderer';
import { AvatarGlowApp } from './app';

async function main(): Promise<void> {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const loading = document.querySelector('.loading') as HTMLElement;
  
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  try {
    // Initialize WebGL renderer
    const renderer = new WebGLRenderer(canvas);
    await renderer.initialize();

    // Create and start the app
    const app = new AvatarGlowApp(renderer);
    await app.initialize();
    
    // Hide loading indicator
    if (loading) {
      loading.style.display = 'none';
    }

    // Start render loop
    app.start();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      app.handleResize();
    });
    resizeObserver.observe(canvas);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      app.destroy();
      renderer.destroy();
    });

  } catch (error) {
    console.error('Failed to initialize WebGL app:', error);
    if (loading) {
      loading.textContent = 'WebGL initialization failed';
    }
  }
}

// Start the application
main().catch(console.error);