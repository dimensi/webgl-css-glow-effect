import { WebGLContext } from './context';
import { Geometry } from './geometry';
import { ShaderProgram } from './shader-program';
import { Texture } from './texture';
import { Framebuffer } from './framebuffer';

export interface Uniforms {
  canvasSize: [number, number];
  avatarCenterPx: [number, number];
  avatarDiameterPx: number;
  glowRadiusPx: number;
  glowOpacity: number;
  gamma: number;
  devicePixelRatio: number;
}

export class WebGLRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: WebGLContext;
  public readonly geometry: Geometry;
  public readonly shaderProgram: ShaderProgram;
  public readonly avatarTexture: Texture;
  public readonly glowFramebuffer: Framebuffer;
  public readonly blurFramebuffer: Framebuffer;

  private uniforms: Uniforms = {
    canvasSize: [0, 0],
    avatarCenterPx: [0, 0],
    avatarDiameterPx: 0,
    glowRadiusPx: 70,
    glowOpacity: 0.8,
    gamma: 2.2,
    devicePixelRatio: 1
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = new WebGLContext(canvas);
    this.geometry = new Geometry(this.context.gl);
    this.shaderProgram = new ShaderProgram(this.context.gl);
    this.avatarTexture = new Texture(this.context.gl);
    this.glowFramebuffer = new Framebuffer(this.context.gl);
    this.blurFramebuffer = new Framebuffer(this.context.gl);
  }

  async initialize(): Promise<void> {
    await this.context.initialize();
    await this.geometry.initialize();
    await this.shaderProgram.initialize();
    await this.avatarTexture.initialize();
    await this.glowFramebuffer.initialize();
    await this.blurFramebuffer.initialize();

    this.setupCanvas();
    this.setupResizeObserver();
  }

  updateUniforms(uniforms: Partial<Uniforms>): void {
    this.uniforms = { ...this.uniforms, ...uniforms };
  }

  getUniforms(): Uniforms {
    return { ...this.uniforms };
  }

  private setupCanvas(): void {
    const { canvas, context } = this;
    const { devicePixelRatio } = window;
    
    // Set canvas size in CSS pixels
    canvas.width = 1280;
    canvas.height = 720;
    
    // Set canvas size in device pixels
    canvas.style.width = '1280px';
    canvas.style.height = '720px';
    
    // Set viewport for WebGL
    context.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      const { canvas, context } = this;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      context.gl.viewport(0, 0, canvas.width, canvas.height);
    });

    resizeObserver.observe(this.canvas);
  }
}