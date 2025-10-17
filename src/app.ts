import { WebGLRenderer } from './webgl/renderer';
import { AvatarPass } from './webgl/passes/avatar-pass';
import { BlurPass } from './webgl/passes/blur-pass';
import { CompositePass } from './webgl/passes/composite-pass';
import { BackgroundPass } from './webgl/passes/background-pass';

export class AvatarGlowApp {
  private renderer: WebGLRenderer;
  private backgroundPass: BackgroundPass;
  private avatarPass: AvatarPass;
  private blurPass: BlurPass;
  private compositePass: CompositePass;
  private animationId: number | null = null;
  private isInitialized = false;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.backgroundPass = new BackgroundPass(renderer);
    this.avatarPass = new AvatarPass(renderer);
    this.blurPass = new BlurPass(renderer);
    this.compositePass = new CompositePass(renderer);
  }

  async initialize(): Promise<void> {
    await this.renderer.initialize();
    await this.backgroundPass.initialize();
    await this.avatarPass.initialize();
    await this.blurPass.initialize();
    await this.compositePass.initialize();
    
    this.setupControls();
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

  private render(): void {
    const { canvas } = this.renderer;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    
    // Calculate avatar dimensions (30% of canvas width)
    const avatarDiameter = Math.floor(canvasWidth * 0.3);
    const avatarCenterX = Math.floor(canvasWidth / 2);
    const avatarCenterY = Math.floor(canvasHeight / 2);
    
    // Calculate glow radius with scaling
    const glowRadius = Math.max(70, Math.min(210, (70 / 320) * canvasWidth));
    const glowOpacity = this.getGlowOpacity();

    // Update uniforms
    this.renderer.updateUniforms({
      canvasSize: [canvasWidth, canvasHeight],
      avatarCenterPx: [avatarCenterX, avatarCenterY],
      avatarDiameterPx: avatarDiameter,
      glowRadiusPx: glowRadius,
      glowOpacity,
      gamma: 2.2,
      devicePixelRatio: window.devicePixelRatio
    });

    // Render passes in order
    this.backgroundPass.render();
    this.avatarPass.render();
    this.blurPass.render();
    this.compositePass.render();
  }

  private setupControls(): void {
    const glowRadiusSlider = document.getElementById('glowRadius') as HTMLInputElement;
    const glowOpacitySlider = document.getElementById('glowOpacity') as HTMLInputElement;
    const glowRadiusValue = document.getElementById('glowRadiusValue') as HTMLElement;
    const glowOpacityValue = document.getElementById('glowOpacityValue') as HTMLElement;

    if (glowRadiusSlider && glowRadiusValue) {
      glowRadiusSlider.addEventListener('input', () => {
        glowRadiusValue.textContent = glowRadiusSlider.value;
      });
    }

    if (glowOpacitySlider && glowOpacityValue) {
      glowOpacitySlider.addEventListener('input', () => {
        glowOpacityValue.textContent = parseFloat(glowOpacitySlider.value).toFixed(1);
      });
    }
  }

  private getGlowOpacity(): number {
    const slider = document.getElementById('glowOpacity') as HTMLInputElement;
    return slider ? parseFloat(slider.value) : 0.8;
  }
}