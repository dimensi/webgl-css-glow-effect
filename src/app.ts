import { WebGLRenderer } from './webgl/renderer';
import { RenderPasses } from './webgl/passes';
import { TextureManager } from './webgl/texture-manager';

export class AvatarGlowApp {
  private renderer: WebGLRenderer;
  private passes: RenderPasses;
  private textureManager: TextureManager;
  private animationId: number | null = null;
  private isInitialized = false;

  // Canvas dimensions (CSS pixels)
  private canvasWidth = 0;
  private canvasHeight = 0;
  private devicePixelRatio = 1;

  // Avatar properties
  private avatarDiameter = 0;
  private avatarCenterX = 0;
  private avatarCenterY = 0;
  private glowRadius = 70;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.passes = new RenderPasses(renderer);
    this.textureManager = new TextureManager(renderer);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize render passes
    await this.passes.initialize();

    // Load avatar texture
    await this.textureManager.loadAvatar('/avatar.png');

    // Set initial canvas size
    this.updateCanvasSize();
    this.calculateAvatarProperties();

    this.isInitialized = true;
  }

  start(): void {
    if (!this.isInitialized) {
      throw new Error('App not initialized');
    }

    const render = (): void => {
      this.render();
      this.animationId = requestAnimationFrame(render);
    };

    render();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  handleResize(): void {
    this.updateCanvasSize();
    this.calculateAvatarProperties();
    this.passes.handleResize(this.canvasWidth, this.canvasHeight, this.devicePixelRatio);
  }

  private updateCanvasSize(): void {
    const canvas = this.renderer.getCanvas();
    const rect = canvas.getBoundingClientRect();
    
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  private calculateAvatarProperties(): void {
    // Avatar diameter = 30% of canvas width
    this.avatarDiameter = this.canvasWidth * 0.3;
    
    // Center the avatar
    this.avatarCenterX = this.canvasWidth / 2;
    this.avatarCenterY = this.canvasHeight / 2;

    // Glow radius scaling: clamp(70, 70/320 * canvasWidth, 210)
    const baseWidth = 320;
    const minRadius = 70;
    const maxRadius = 210;
    const scaleFactor = this.canvasWidth / baseWidth;
    this.glowRadius = Math.max(minRadius, Math.min(maxRadius, minRadius * scaleFactor));
  }

  private render(): void {
    if (!this.isInitialized) return;

    const gl = this.renderer.getGL();
    
    // Set viewport
    gl.viewport(0, 0, this.canvasWidth * this.devicePixelRatio, this.canvasHeight * this.devicePixelRatio);

    // Pass 1: Background
    this.passes.renderBackground();

    // Pass 2: Avatar mask
    this.passes.renderAvatarMask(
      this.textureManager.getAvatarTexture(),
      this.avatarCenterX,
      this.avatarCenterY,
      this.avatarDiameter
    );

    // Pass 3: Glow effect
    this.passes.renderGlow(this.glowRadius);

    // Pass 4: Composite
    this.passes.renderComposite();
  }

  destroy(): void {
    this.stop();
    this.passes.destroy();
    this.textureManager.destroy();
    this.isInitialized = false;
  }
}