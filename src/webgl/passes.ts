import { WebGLRenderer } from './renderer';
import { GeometryManager, QuadGeometry } from './geometry';
import { ShaderManager } from './shader-manager';
import { FramebufferManager } from './framebuffer-manager';

export class RenderPasses {
  private renderer: WebGLRenderer;
  private geometry: GeometryManager;
  private shaders: ShaderManager;
  private framebuffers: FramebufferManager;
  private quad: QuadGeometry | null = null;

  // Canvas dimensions
  private canvasWidth = 0;
  private canvasHeight = 0;
  private devicePixelRatio = 1;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.geometry = new GeometryManager(renderer);
    this.shaders = new ShaderManager(renderer);
    this.framebuffers = new FramebufferManager(renderer);
  }

  async initialize(): Promise<void> {
    // Initialize subsystems
    await this.shaders.initialize();
    await this.framebuffers.initialize();
    
    // Get quad geometry
    this.quad = this.geometry.getQuadGeometry();
  }

  handleResize(width: number, height: number, dpr: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.devicePixelRatio = dpr;
    
    // Resize framebuffers
    this.framebuffers.resize(width, height, dpr);
  }

  renderBackground(): void {
    const gl = this.renderer.getGL();
    
    // Clear with background color
    gl.clearColor(0x25 / 255, 0x26 / 255, 0x2d / 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  renderAvatarMask(avatarTexture: WebGLTexture | null, centerX: number, centerY: number, diameter: number): void {
    if (!avatarTexture || !this.quad) return;

    const gl = this.renderer.getGL();
    const program = this.shaders.getAvatarProgram();
    
    // Bind framebuffer for avatar mask
    this.framebuffers.bindAvatarMaskFBO();
    
    // Clear framebuffer
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use avatar shader
    gl.useProgram(program);
    
    // Set uniforms
    const canvasSizeLocation = gl.getUniformLocation(program, 'uCanvasSize');
    const centerLocation = gl.getUniformLocation(program, 'uAvatarCenterPx');
    const diameterLocation = gl.getUniformLocation(program, 'uAvatarDiameterPx');
    const dprLocation = gl.getUniformLocation(program, 'uDevicePixelRatio');
    
    gl.uniform2f(canvasSizeLocation, this.canvasWidth, this.canvasHeight);
    gl.uniform2f(centerLocation, centerX, centerY);
    gl.uniform1f(diameterLocation, diameter);
    gl.uniform1f(dprLocation, this.devicePixelRatio);
    
    // Bind avatar texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, avatarTexture);
    const textureLocation = gl.getUniformLocation(program, 'uAvatarTexture');
    gl.uniform1i(textureLocation, 0);
    
    // Bind geometry
    this.bindQuadGeometry(program);
    
    // Draw
    gl.drawElements(gl.TRIANGLES, this.quad.vertexCount, gl.UNSIGNED_SHORT, 0);
  }

  renderGlow(radius: number): void {
    if (!this.quad) return;

    const gl = this.renderer.getGL();
    const isWebGL2 = this.renderer.isWebGL2();
    
    // Get glow framebuffers
    const glowFBO1 = this.framebuffers.getGlowFBO1();
    const glowFBO2 = this.framebuffers.getGlowFBO2();
    const glowTexture1 = this.framebuffers.getGlowTexture1();
    const glowTexture2 = this.framebuffers.getGlowTexture2();
    
    if (!glowFBO1 || !glowFBO2 || !glowTexture1 || !glowTexture2) return;

    // Horizontal blur pass
    this.renderBlurPass(
      this.framebuffers.getAvatarMaskTexture()!,
      glowFBO1,
      glowTexture1,
      radius,
      true // horizontal
    );

    // Vertical blur pass
    this.renderBlurPass(
      glowTexture1,
      glowFBO2,
      glowTexture2,
      radius,
      false // vertical
    );
  }

  private renderBlurPass(
    inputTexture: WebGLTexture,
    outputFBO: WebGLFramebuffer,
    outputTexture: WebGLTexture,
    radius: number,
    isHorizontal: boolean
  ): void {
    if (!this.quad) return;

    const gl = this.renderer.getGL();
    const program = isHorizontal ? this.shaders.getBlurHProgram() : this.shaders.getBlurVProgram();
    
    // Bind output framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, outputFBO);
    
    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use blur shader
    gl.useProgram(program);
    
    // Set uniforms
    const textureSizeLocation = gl.getUniformLocation(program, 'uTextureSize');
    const radiusLocation = gl.getUniformLocation(program, 'uBlurRadius');
    
    gl.uniform2f(textureSizeLocation, this.canvasWidth * this.devicePixelRatio, this.canvasHeight * this.devicePixelRatio);
    gl.uniform1f(radiusLocation, radius);
    
    // Bind input texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    const textureLocation = gl.getUniformLocation(program, 'uInputTexture');
    gl.uniform1i(textureLocation, 0);
    
    // Bind geometry
    this.bindQuadGeometry(program);
    
    // Draw
    gl.drawElements(gl.TRIANGLES, this.quad.vertexCount, gl.UNSIGNED_SHORT, 0);
  }

  renderComposite(): void {
    if (!this.quad) return;

    const gl = this.renderer.getGL();
    const program = this.shaders.getCompositeProgram();
    
    // Bind default framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // Use composite shader
    gl.useProgram(program);
    
    // Set uniforms
    const glowOpacityLocation = gl.getUniformLocation(program, 'uGlowOpacity');
    gl.uniform1f(glowOpacityLocation, 1.0);
    
    // Bind glow texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffers.getGlowTexture2()!);
    const glowTextureLocation = gl.getUniformLocation(program, 'uGlowTexture');
    gl.uniform1i(glowTextureLocation, 0);
    
    // Bind avatar texture
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffers.getAvatarMaskTexture()!);
    const avatarTextureLocation = gl.getUniformLocation(program, 'uAvatarTexture');
    gl.uniform1i(avatarTextureLocation, 1);
    
    // Bind geometry
    this.bindQuadGeometry(program);
    
    // Draw
    gl.drawElements(gl.TRIANGLES, this.quad.vertexCount, gl.UNSIGNED_SHORT, 0);
  }

  private bindQuadGeometry(program: WebGLProgram): void {
    if (!this.quad) return;

    const gl = this.renderer.getGL();
    
    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.positionBuffer);
    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Bind UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.uvBuffer);
    const uvLocation = gl.getAttribLocation(program, 'aUV');
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);
  }

  destroy(): void {
    this.geometry.destroy();
    this.shaders.destroy();
    this.framebuffers.destroy();
  }
}