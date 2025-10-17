import { WebGLRenderer } from './renderer';

export class FramebufferManager {
  private renderer: WebGLRenderer;
  private framebuffers: Map<string, WebGLFramebuffer> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();
  
  // Canvas dimensions
  private canvasWidth = 0;
  private canvasHeight = 0;
  private devicePixelRatio = 1;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
  }

  async initialize(): Promise<void> {
    // Initial framebuffers will be created on first resize
  }

  resize(width: number, height: number, dpr: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.devicePixelRatio = dpr;
    
    // Recreate all framebuffers with new dimensions
    this.destroy();
    this.createFramebuffers();
  }

  private createFramebuffers(): void {
    const gl = this.renderer.getGL();
    const isWebGL2 = this.renderer.isWebGL2();
    
    const width = Math.floor(this.canvasWidth * this.devicePixelRatio);
    const height = Math.floor(this.canvasHeight * this.devicePixelRatio);
    
    // Create avatar mask framebuffer
    this.createFramebuffer('avatarMask', width, height);
    
    // Create glow framebuffers (ping-pong)
    this.createFramebuffer('glow1', width, height);
    this.createFramebuffer('glow2', width, height);
  }

  private createFramebuffer(name: string, width: number, height: number): void {
    const gl = this.renderer.getGL();
    const isWebGL2 = this.renderer.isWebGL2();
    
    // Create framebuffer
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
      throw new Error(`Failed to create framebuffer: ${name}`);
    }
    
    // Create texture
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error(`Failed to create texture: ${name}`);
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // Allocate texture storage
    if (isWebGL2) {
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    
    // Attach texture to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
    // Check framebuffer status
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer ${name} is not complete: ${status}`);
    }
    
    // Unbind
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    // Store references
    this.framebuffers.set(name, framebuffer);
    this.textures.set(name, texture);
  }

  bindAvatarMaskFBO(): void {
    const gl = this.renderer.getGL();
    const fbo = this.framebuffers.get('avatarMask');
    if (fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    }
  }

  getAvatarMaskTexture(): WebGLTexture | null {
    return this.textures.get('avatarMask') || null;
  }

  getGlowFBO1(): WebGLFramebuffer | null {
    return this.framebuffers.get('glow1') || null;
  }

  getGlowFBO2(): WebGLFramebuffer | null {
    return this.framebuffers.get('glow2') || null;
  }

  getGlowTexture1(): WebGLTexture | null {
    return this.textures.get('glow1') || null;
  }

  getGlowTexture2(): WebGLTexture | null {
    return this.textures.get('glow2') || null;
  }

  destroy(): void {
    const gl = this.renderer.getGL();
    
    // Delete framebuffers
    for (const fbo of this.framebuffers.values()) {
      gl.deleteFramebuffer(fbo);
    }
    this.framebuffers.clear();
    
    // Delete textures
    for (const texture of this.textures.values()) {
      gl.deleteTexture(texture);
    }
    this.textures.clear();
  }
}