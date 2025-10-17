/**
 * Background pass - fills canvas with solid color #25262d
 */

import { createProgram, getUniformLocation } from '@/lib/shaderLoader';
import { QuadGeometry } from '@/lib/geometry';

export class BackgroundPass {
  private program: WebGLProgram;
  private uBackgroundColor: WebGLUniformLocation | null;

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

uniform vec3 uBackgroundColor;
in vec2 vUV;
out vec4 fragColor;

void main() {
  fragColor = vec4(uBackgroundColor, 1.0);
}`;

    this.program = createProgram(gl, vertSource, fragSource, isWebGL2);
    this.uBackgroundColor = getUniformLocation(gl, this.program, 'uBackgroundColor');
  }

  render(gl: WebGLRenderingContext, quad: QuadGeometry): void {
    gl.useProgram(this.program);
    gl.uniform3f(this.uBackgroundColor, 0x25/255, 0x26/255, 0x2d/255);
    quad.draw();
  }
}
