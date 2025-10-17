import { mat4 } from 'gl-matrix';

export interface WebGLContext {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  isWebGL2: boolean;
  maxTextureSize: number;
  maxRenderbufferSize: number;
}

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private context: WebGLContext | null = null;
  private projectionMatrix: mat4;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.projectionMatrix = mat4.create();
  }

  async initialize(): Promise<void> {
    // Try WebGL2 first, fallback to WebGL1
    let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
    let isWebGL2 = false;

    // Try WebGL2
    const gl2 = this.canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: true
    });

    if (gl2) {
      gl = gl2;
      isWebGL2 = true;
    } else {
      // Fallback to WebGL1
      const gl1 = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        premultipliedAlpha: true
      });

      if (!gl1) {
        throw new Error('WebGL not supported');
      }

      gl = gl1;
      isWebGL2 = false;
    }

    // Get WebGL capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

    this.context = {
      gl,
      isWebGL2,
      maxTextureSize,
      maxRenderbufferSize
    };

    // Set initial viewport
    this.updateViewport();

    // Enable blending for premultiplied alpha
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Disable depth testing (we're doing 2D rendering)
    gl.disable(gl.DEPTH_TEST);

    // Set clear color to background
    gl.clearColor(0x25 / 255, 0x26 / 255, 0x2d / 255, 1.0);
  }

  getGL(): WebGL2RenderingContext | WebGLRenderingContext {
    if (!this.context) {
      throw new Error('WebGL not initialized');
    }
    return this.context.gl;
  }

  isWebGL2(): boolean {
    if (!this.context) {
      throw new Error('WebGL not initialized');
    }
    return this.context.isWebGL2;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getMaxTextureSize(): number {
    if (!this.context) {
      throw new Error('WebGL not initialized');
    }
    return this.context.maxTextureSize;
  }

  getMaxRenderbufferSize(): number {
    if (!this.context) {
      throw new Error('WebGL not initialized');
    }
    return this.context.maxRenderbufferSize;
  }

  getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }

  updateProjectionMatrix(width: number, height: number): void {
    // Orthographic projection for 2D rendering
    mat4.ortho(this.projectionMatrix, 0, width, height, 0, -1, 1);
  }

  private updateViewport(): void {
    if (!this.context) return;

    const gl = this.context.gl;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size in CSS pixels
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Set viewport
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Update projection matrix
    this.updateProjectionMatrix(rect.width, rect.height);
  }

  destroy(): void {
    if (this.context) {
      const gl = this.context.gl;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.context = null;
    }
  }
}