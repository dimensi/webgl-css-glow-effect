/**
 * Blur pass - separable Gaussian blur with ping-pong FBOs
 */

import { createProgram, getUniformLocation } from '@/lib/shaderLoader';
import { createFramebuffer } from '@/lib/framebuffer';
import { QuadGeometry } from '@/lib/geometry';
import { generateGaussianKernel } from '@/lib/mathUtils';

export class BlurPass {
  private programH: WebGLProgram;
  private programV: WebGLProgram;
  private fboA: { fbo: WebGLFramebuffer; texture: WebGLTexture };
  private fboB: { fbo: WebGLFramebuffer; texture: WebGLTexture };
  
  // Horizontal pass uniforms
  private uTextureH: WebGLUniformLocation | null;
  private uWeightsH: WebGLUniformLocation | null;
  private uOffsetsH: WebGLUniformLocation | null;
  private uTexelSizeH: WebGLUniformLocation | null;
  private uKernelSizeH: WebGLUniformLocation | null;
  
  // Vertical pass uniforms
  private uTextureV: WebGLUniformLocation | null;
  private uWeightsV: WebGLUniformLocation | null;
  private uOffsetsV: WebGLUniformLocation | null;
  private uTexelSizeV: WebGLUniformLocation | null;
  private uKernelSizeV: WebGLUniformLocation | null;

  constructor(
    gl: WebGLRenderingContext,
    isWebGL2: boolean,
    width: number,
    height: number
  ) {
    // Common vertex shader
    const vertSource = `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUV;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vUV = aPosition * 0.5 + 0.5;
}`;

    // Horizontal blur fragment shader
    const fragSourceH = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float uWeights[64];
uniform float uOffsets[64];
uniform vec2 uTexelSize;
uniform int uKernelSize;

in vec2 vUV;
out vec4 fragColor;

vec3 srgbToLinear(vec3 srgb) {
  return mix(srgb / 12.92, pow((srgb + 0.055) / 1.055, vec3(2.4)), 
             step(0.04045, srgb));
}

vec3 linearToSrgb(vec3 linear) {
  return mix(linear * 12.92, 1.055 * pow(linear, vec3(1.0/2.4)) - 0.055, 
             step(0.0031308, linear));
}

void main() {
  vec3 sum = vec3(0.0);
  float alphaSum = 0.0;
  
  for (int i = 0; i < uKernelSize; i++) {
    vec2 offset = uTexelSize * uOffsets[i];
    vec4 sample = texture(uTexture, vUV + offset);
    vec3 linear = srgbToLinear(sample.rgb);
    float weight = uWeights[i];
    
    sum += linear * sample.a * weight;
    alphaSum += sample.a * weight;
  }
  
  vec3 srgb = linearToSrgb(sum);
  fragColor = vec4(srgb, alphaSum);
}`;

    // Vertical blur fragment shader
    const fragSourceV = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float uWeights[64];
uniform float uOffsets[64];
uniform vec2 uTexelSize;
uniform int uKernelSize;

in vec2 vUV;
out vec4 fragColor;

vec3 srgbToLinear(vec3 srgb) {
  return mix(srgb / 12.92, pow((srgb + 0.055) / 1.055, vec3(2.4)), 
             step(0.04045, srgb));
}

vec3 linearToSrgb(vec3 linear) {
  return mix(linear * 12.92, 1.055 * pow(linear, vec3(1.0/2.4)) - 0.055, 
             step(0.0031308, linear));
}

void main() {
  vec3 sum = vec3(0.0);
  float alphaSum = 0.0;
  
  for (int i = 0; i < uKernelSize; i++) {
    vec2 offset = uTexelSize * uOffsets[i];
    vec4 sample = texture(uTexture, vUV + offset);
    vec3 linear = srgbToLinear(sample.rgb);
    float weight = uWeights[i];
    
    sum += linear * sample.a * weight;
    alphaSum += sample.a * weight;
  }
  
  vec3 srgb = linearToSrgb(sum);
  fragColor = vec4(srgb, alphaSum);
}`;

    this.programH = createProgram(gl, vertSource, fragSourceH, isWebGL2);
    this.programV = createProgram(gl, vertSource, fragSourceV, isWebGL2);

    // Get uniform locations for horizontal pass
    this.uTextureH = getUniformLocation(gl, this.programH, 'uTexture');
    this.uWeightsH = getUniformLocation(gl, this.programH, 'uWeights');
    this.uOffsetsH = getUniformLocation(gl, this.programH, 'uOffsets');
    this.uTexelSizeH = getUniformLocation(gl, this.programH, 'uTexelSize');
    this.uKernelSizeH = getUniformLocation(gl, this.programH, 'uKernelSize');

    // Get uniform locations for vertical pass
    this.uTextureV = getUniformLocation(gl, this.programV, 'uTexture');
    this.uWeightsV = getUniformLocation(gl, this.programV, 'uWeights');
    this.uOffsetsV = getUniformLocation(gl, this.programV, 'uOffsets');
    this.uTexelSizeV = getUniformLocation(gl, this.programV, 'uTexelSize');
    this.uKernelSizeV = getUniformLocation(gl, this.programV, 'uKernelSize');

    this.fboA = createFramebuffer(gl, width, height, isWebGL2);
    this.fboB = createFramebuffer(gl, width, height, isWebGL2);
  }

  render(
    gl: WebGLRenderingContext,
    quad: QuadGeometry,
    sourceTexture: WebGLTexture,
    radiusPx: number,
    texelSize: [number, number]
  ): WebGLTexture {
    // Safari optimization: half-res blur для больших радиусов
    const blurScale = radiusPx > 100 ? 0.5 : 1.0;
    const effectiveRadius = radiusPx * blurScale;
    
    const { weights, offsets } = generateGaussianKernel(effectiveRadius);
    const kernelSize = weights.length;
    
    // Horizontal pass: source → fboA
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA.fbo);
    gl.useProgram(this.programH);
    gl.uniform1fv(this.uWeightsH, weights);
    gl.uniform1fv(this.uOffsetsH, offsets);
    gl.uniform2f(this.uTexelSizeH, texelSize[0], 0);
    gl.uniform1i(this.uKernelSizeH, kernelSize);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.uniform1i(this.uTextureH, 0);
    quad.draw();
    
    // Vertical pass: fboA → fboB
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboB.fbo);
    gl.useProgram(this.programV);
    gl.uniform1fv(this.uWeightsV, weights);
    gl.uniform1fv(this.uOffsetsV, offsets);
    gl.uniform2f(this.uTexelSizeV, 0, texelSize[1]);
    gl.uniform1i(this.uKernelSizeV, kernelSize);
    gl.bindTexture(gl.TEXTURE_2D, this.fboA.texture);
    gl.uniform1i(this.uTextureV, 0);
    quad.draw();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this.fboB.texture;
  }

  resize(gl: WebGLRenderingContext, width: number, height: number, isWebGL2: boolean): void {
    // Recreate FBOs with new dimensions
    this.fboA = createFramebuffer(gl, width, height, isWebGL2);
    this.fboB = createFramebuffer(gl, width, height, isWebGL2);
  }
}
