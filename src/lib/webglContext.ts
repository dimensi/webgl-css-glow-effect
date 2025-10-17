/**
 * WebGL context creation and management utilities
 */

export interface WebGLContext {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  isWebGL2: boolean;
}

export function createContext(canvas: HTMLCanvasElement): WebGLContext {
  const options = { 
    premultipliedAlpha: true, // Safari requires this for proper alpha blending
    antialias: false, 
    alpha: false,
    powerPreference: 'high-performance' // Safari optimization
  };
  
  let gl = canvas.getContext('webgl2', options) as WebGL2RenderingContext | null;
  if (gl) return { gl, isWebGL2: true };
  
  gl = canvas.getContext('webgl', options) as WebGLRenderingContext | null;
  if (gl) return { gl, isWebGL2: false };
  
  throw new Error('WebGL not supported');
}

export function resizeCanvas(
  canvas: HTMLCanvasElement, 
  gl: WebGLRenderingContext, 
  dpr: number
): void {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  
  // Safari optimization: limit DPR to prevent memory issues
  const maxDPR = 3; // iPhone 14 Pro Max has 3x DPR
  const effectiveDPR = Math.min(dpr, maxDPR);
  
  canvas.width = Math.floor(cssWidth * effectiveDPR);
  canvas.height = Math.floor(cssHeight * effectiveDPR);
  gl.viewport(0, 0, canvas.width, canvas.height);
}
