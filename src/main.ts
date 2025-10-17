/**
 * Main entry point for WebGL Avatar Glow application
 */

import { createContext, resizeCanvas } from '@/lib/webglContext';
import { loadTexture } from '@/lib/textureLoader';
import { createFullscreenQuad } from '@/lib/geometry';
import { RenderPipeline } from '@/scene/RenderPipeline';
import { Controls } from '@/ui/Controls';
import { computeGlowRadius } from '@/lib/mathUtils';

async function main(): Promise<void> {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  const { gl, isWebGL2 } = createContext(canvas);
  console.log(`WebGL ${isWebGL2 ? '2' : '1'} initialized`);

  const dpr = window.devicePixelRatio || 1;
  resizeCanvas(canvas, gl, dpr);

  // Load avatar texture
  const avatarTexture = await loadTexture(gl, '/avatar.png', isWebGL2);
  console.log('Avatar texture loaded');

  // Create geometry and pipeline
  const quad = createFullscreenQuad(gl, isWebGL2);
  const pipeline = new RenderPipeline(gl, isWebGL2, quad, avatarTexture);

  // Create UI controls
  const controls = new Controls();
  let glowRadiusPx = computeGlowRadius(canvas.clientWidth);
  let glowOpacity = 0.8;

  // Set initial control values
  controls.setRadius(glowRadiusPx);
  controls.setOpacity(glowOpacity);

  // Setup control event listeners
  controls.onRadiusChange((value: number) => {
    glowRadiusPx = value;
    render();
  });

  controls.onOpacityChange((value: number) => {
    glowOpacity = value;
    render();
  });

  // Render function
  function render(): void {
    pipeline.render({
      canvasWidthCSS: canvas.clientWidth,
      canvasHeightCSS: canvas.clientHeight,
      dpr,
      glowRadiusPx,
      glowOpacity
    });
  }

  // Resize observer
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas(canvas, gl, dpr);
    pipeline.resize(canvas.width, canvas.height);
    
    // Recompute glow radius based on new canvas width
    const newGlowRadius = computeGlowRadius(canvas.clientWidth);
    controls.setRadius(newGlowRadius);
    glowRadiusPx = newGlowRadius;
    
    render();
  });
  resizeObserver.observe(canvas);

  // Initial render
  render();

  // Handle visibility change to pause/resume rendering
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Pause rendering when tab is hidden
      console.log('Tab hidden, pausing rendering');
    } else {
      // Resume rendering when tab becomes visible
      console.log('Tab visible, resuming rendering');
      render();
    }
  });

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    resizeObserver.disconnect();
  });
}

// Error handling
main().catch((error: Error) => {
  console.error('Application failed to start:', error);
  
  // Show user-friendly error message
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#25262d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WebGL not supported or failed to load', canvas.width / 2, canvas.height / 2);
      ctx.fillText('Please try a modern browser', canvas.width / 2, canvas.height / 2 + 30);
    }
  }
});
