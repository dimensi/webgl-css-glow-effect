/**
 * Avatar pass - renders avatar with circular clipping to FBO
 */

import { createProgram, getUniformLocation, getAttribLocation } from '@/lib/shaderLoader';
import { createFramebuffer } from '@/lib/framebuffer';
import { QuadGeometry } from '@/lib/geometry';

export interface AvatarPassParams {
  canvasSize: [number, number];
  centerPx: [number, number];
  diameterPx: number;
}

export class AvatarPass {
  private program: WebGLProgram;
  private fbo: WebGLFramebuffer;
  private texture: WebGLTexture;
  private uAvatarTexture: WebGLUniformLocation | null;
  private uCanvasSize: WebGLUniformLocation | null;
  private uAvatarCenterPx: WebGLUniformLocation | null;
  private uAvatarDiameterPx: WebGLUniformLocation | null;
  private aPosition: number;

  constructor(
    gl: WebGLRenderingContext,
    isWebGL2: boolean,
    width: number,
    height: number
  ) {
    // Load shaders
    const vertSource = `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUV;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vUV = aPosition * 0.5 + 0.5;
}`;

    const fragSource = `#version 300 es
precision highp float;

uniform sampler2D uAvatarTexture;
uniform vec2 uCanvasSize;
uniform vec2 uAvatarCenterPx;
uniform float uAvatarDiameterPx;

in vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 pixelCoord = vUV * uCanvasSize;
  vec2 delta = pixelCoord - uAvatarCenterPx;
  float dist = length(delta);
  float radius = uAvatarDiameterPx * 0.5;
  
  // Smooth antialiased edge (1px transition)
  float alpha = 1.0 - smoothstep(radius - 1.0, radius + 1.0, dist);
  
  if (alpha < 0.01) discard;
  
  // Map pixel to avatar texture UV (contain mode: вписываем квадрат 1:1)
  vec2 avatarUV = (delta / uAvatarDiameterPx) + 0.5;
  vec4 avatarColor = texture(uAvatarTexture, avatarUV);
  
  fragColor = vec4(avatarColor.rgb, avatarColor.a * alpha);
}`;

    this.program = createProgram(gl, vertSource, fragSource, isWebGL2);
    this.uAvatarTexture = getUniformLocation(gl, this.program, 'uAvatarTexture');
    this.uCanvasSize = getUniformLocation(gl, this.program, 'uCanvasSize');
    this.uAvatarCenterPx = getUniformLocation(gl, this.program, 'uAvatarCenterPx');
    this.uAvatarDiameterPx = getUniformLocation(gl, this.program, 'uAvatarDiameterPx');
    this.aPosition = getAttribLocation(gl, this.program, 'aPosition');

    const { fbo, texture } = createFramebuffer(gl, width, height, isWebGL2);
    this.fbo = fbo;
    this.texture = texture;
  }

  render(
    gl: WebGLRenderingContext,
    quad: QuadGeometry,
    avatarTexture: WebGLTexture,
    params: AvatarPassParams
  ): WebGLTexture {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    
    gl.uniform2f(this.uCanvasSize, ...params.canvasSize);
    gl.uniform2f(this.uAvatarCenterPx, ...params.centerPx);
    gl.uniform1f(this.uAvatarDiameterPx, params.diameterPx);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, avatarTexture);
    gl.uniform1i(this.uAvatarTexture, 0);
    
    quad.draw();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this.texture;
  }

  resize(gl: WebGLRenderingContext, width: number, height: number, isWebGL2: boolean): void {
    // Recreate FBO with new dimensions
    const { fbo, texture } = createFramebuffer(gl, width, height, isWebGL2);
    this.fbo = fbo;
    this.texture = texture;
  }
}
