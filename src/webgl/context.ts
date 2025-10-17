export class WebGLContext {
  public readonly gl: WebGL2RenderingContext | WebGLRenderingContext;
  public readonly isWebGL2: boolean;

  constructor(canvas: HTMLCanvasElement) {
    const gl2 = canvas.getContext('webgl2', {
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      alpha: true
    });

    if (gl2) {
      this.gl = gl2;
      this.isWebGL2 = true;
    } else {
      const gl1 = canvas.getContext('webgl', {
        premultipliedAlpha: true,
        antialias: true,
        depth: false,
        stencil: false,
        alpha: true
      });

      if (!gl1) {
        throw new Error('WebGL not supported');
      }

      this.gl = gl1;
      this.isWebGL2 = false;
    }
  }

  async initialize(): Promise<void> {
    const { gl } = this;
    
    // Enable blending for premultiplied alpha
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    // Disable depth testing since we're doing 2D rendering
    gl.disable(gl.DEPTH_TEST);
    
    // Enable culling for better performance
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }
}