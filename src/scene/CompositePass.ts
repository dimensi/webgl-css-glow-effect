/**
 * Composite pass - final composition of glow behind avatar
 */

import { createProgram, getUniformLocation } from '@/lib/shaderLoader';
import { QuadGeometry } from '@/lib/geometry';

export class CompositePass {
  private program: WebGLProgram;
  private uGlowTexture: WebGLUniformLocation | null;
  private uAvatarTexture: WebGLUniformLocation | null;
  private uGlowOpacity: WebGLUniformLocation | null;
  private uMode: WebGLUniformLocation | null;

  constructor(gl: WebGLRenderingContext, isWebGL2: boolean) {
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

uniform sampler2D uGlowTexture;
uniform sampler2D uAvatarTexture;
uniform float uGlowOpacity;
uniform int uMode; // 0=glow, 1=avatar

in vec2 vUV;
out vec4 fragColor;

void main() {
  if (uMode == 0) {
    // Glow layer
    vec4 glow = texture(uGlowTexture, vUV);
    fragColor = vec4(glow.rgb * uGlowOpacity, glow.a * uGlowOpacity);
  } else {
    // Avatar layer (already premultiplied in AvatarPass)
    fragColor = texture(uAvatarTexture, vUV);
  }
}`;

    this.program = createProgram(gl, vertSource, fragSource, isWebGL2);
    this.uGlowTexture = getUniformLocation(gl, this.program, 'uGlowTexture');
    this.uAvatarTexture = getUniformLocation(gl, this.program, 'uAvatarTexture');
    this.uGlowOpacity = getUniformLocation(gl, this.program, 'uGlowOpacity');
    this.uMode = getUniformLocation(gl, this.program, 'uMode');
  }

  render(
    gl: WebGLRenderingContext,
    quad: QuadGeometry,
    glowTexture: WebGLTexture,
    avatarTexture: WebGLTexture,
    opacity: number
  ): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.program);
    
    // Premultiplied alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    // Draw glow first
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glowTexture);
    gl.uniform1i(this.uGlowTexture, 0);
    gl.uniform1f(this.uGlowOpacity, opacity);
    gl.uniform1i(this.uMode, 0); // 0 = glow mode
    quad.draw();
    
    // Draw avatar on top
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, avatarTexture);
    gl.uniform1i(this.uAvatarTexture, 1);
    gl.uniform1i(this.uMode, 1); // 1 = avatar mode
    quad.draw();
    
    gl.disable(gl.BLEND);
  }
}
