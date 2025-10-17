/**
 * Main render pipeline orchestrating all 4 passes
 */

import { BackgroundPass } from './BackgroundPass';
import { AvatarPass } from './AvatarPass';
import { BlurPass } from './BlurPass';
import { CompositePass } from './CompositePass';
import { QuadGeometry } from '@/lib/geometry';
import { computeAvatarDiameter, computeGlowRadius } from '@/lib/mathUtils';

export interface RenderParams {
  canvasWidthCSS: number;
  canvasHeightCSS: number;
  dpr: number;
  glowRadiusPx: number;
  glowOpacity: number;
}

export interface RenderTimings {
  background: number;
  avatar: number;
  blur: number;
  composite: number;
  total: number;
}

export class RenderPipeline {
  private backgroundPass: BackgroundPass;
  private avatarPass: AvatarPass;
  private blurPass: BlurPass;
  private compositePass: CompositePass;
  private measurePerformance: boolean;

  constructor(
    private gl: WebGLRenderingContext,
    private isWebGL2: boolean,
    private quad: QuadGeometry,
    private avatarTexture: WebGLTexture
  ) {
    const { width, height } = gl.canvas;
    this.backgroundPass = new BackgroundPass(gl, isWebGL2);
    this.avatarPass = new AvatarPass(gl, isWebGL2, width, height);
    this.blurPass = new BlurPass(gl, isWebGL2, width, height);
    this.compositePass = new CompositePass(gl, isWebGL2);
    
    // Check for debug mode
    this.measurePerformance = new URLSearchParams(window.location.search).has('debug');
  }

  render(params: RenderParams): { timings?: RenderTimings } {
    const { gl, avatarTexture, quad } = this;
    const { canvasWidthCSS, canvasHeightCSS, dpr, glowRadiusPx, glowOpacity } = params;
    
    const canvasSize: [number, number] = [
      canvasWidthCSS * dpr,
      canvasHeightCSS * dpr
    ];
    const centerPx: [number, number] = [canvasSize[0] / 2, canvasSize[1] / 2];
    const diameterPx = computeAvatarDiameter(canvasWidthCSS) * dpr;
    
    if (!this.measurePerformance) {
      // Normal render without timing
      this.renderPasses(gl, quad, avatarTexture, {
        canvasSize,
        centerPx,
        diameterPx,
        glowRadiusPx: glowRadiusPx * dpr,
        texelSize: [1 / canvasSize[0], 1 / canvasSize[1]],
        glowOpacity
      });
      return {};
    }
    
    // Performance measurement mode
    const timings: RenderTimings = {
      background: 0,
      avatar: 0,
      blur: 0,
      composite: 0,
      total: 0
    };
    
    const t0 = performance.now();
    
    // Pass 1: Background
    const t1 = performance.now();
    this.backgroundPass.render(gl, quad);
    timings.background = performance.now() - t1;
    
    // Pass 2: Avatar с circular clip → FBO
    const t2 = performance.now();
    const avatarFBO = this.avatarPass.render(gl, quad, avatarTexture, {
      canvasSize,
      centerPx,
      diameterPx
    });
    timings.avatar = performance.now() - t2;
    
    // Pass 3: Blur для glow
    const t3 = performance.now();
    const texelSize: [number, number] = [1 / canvasSize[0], 1 / canvasSize[1]];
    const glowFBO = this.blurPass.render(gl, quad, avatarFBO, glowRadiusPx * dpr, texelSize);
    timings.blur = performance.now() - t3;
    
    // Pass 4: Composite
    const t4 = performance.now();
    this.compositePass.render(gl, quad, glowFBO, avatarFBO, glowOpacity);
    timings.composite = performance.now() - t4;
    
    timings.total = performance.now() - t0;
    
    // Log timings to console
    console.table(timings);
    
    return { timings };
  }

  private renderPasses(
    gl: WebGLRenderingContext,
    quad: QuadGeometry,
    avatarTexture: WebGLTexture,
    params: {
      canvasSize: [number, number];
      centerPx: [number, number];
      diameterPx: number;
      glowRadiusPx: number;
      texelSize: [number, number];
      glowOpacity: number;
    }
  ): void {
    // Pass 1: Background
    this.backgroundPass.render(gl, quad);
    
    // Pass 2: Avatar с circular clip → FBO
    const avatarFBO = this.avatarPass.render(gl, quad, avatarTexture, {
      canvasSize: params.canvasSize,
      centerPx: params.centerPx,
      diameterPx: params.diameterPx
    });
    
    // Pass 3: Blur для glow
    const glowFBO = this.blurPass.render(gl, quad, avatarFBO, params.glowRadiusPx, params.texelSize);
    
    // Pass 4: Composite
    this.compositePass.render(gl, quad, glowFBO, avatarFBO, params.glowOpacity);
  }

  resize(width: number, height: number): void {
    // Recreate FBOs for avatarPass and blurPass
    this.avatarPass.resize(this.gl, width, height, this.isWebGL2);
    this.blurPass.resize(this.gl, width, height, this.isWebGL2);
  }
}
