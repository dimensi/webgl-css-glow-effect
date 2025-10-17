export class ShaderProgram {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private uniforms: Map<string, WebGLUniformLocation | null> = new Map();

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
  }

  async initialize(): Promise<void> {
    const { gl } = this;
    
    const vertexShader = this.createShader(gl.VERTEX_SHADER, this.getVertexShaderSource());
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, this.getFragmentShaderSource());
    
    this.program = gl.createProgram();
    if (!this.program) {
      throw new Error('Failed to create shader program');
    }
    
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(this.program);
      throw new Error(`Failed to link shader program: ${info}`);
    }
    
    // Cache uniform locations
    this.cacheUniformLocations();
    
    // Clean up shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  use(): void {
    const { gl } = this;
    if (this.program) {
      gl.useProgram(this.program);
    }
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.uniforms.get(name) || null;
  }

  setUniform1f(name: string, value: number): void {
    const { gl } = this;
    const location = this.getUniformLocation(name);
    if (location !== null) {
      gl.uniform1f(location, value);
    }
  }

  setUniform2f(name: string, x: number, y: number): void {
    const { gl } = this;
    const location = this.getUniformLocation(name);
    if (location !== null) {
      gl.uniform2f(location, x, y);
    }
  }

  setUniform2fv(name: string, value: Float32Array | number[]): void {
    const { gl } = this;
    const location = this.getUniformLocation(name);
    if (location !== null) {
      gl.uniform2fv(location, value);
    }
  }

  setUniform1i(name: string, value: number): void {
    const { gl } = this;
    const location = this.getUniformLocation(name);
    if (location !== null) {
      gl.uniform1i(location, value);
    }
  }

  private createShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${info}`);
    }
    
    return shader;
  }

  private cacheUniformLocations(): void {
    const { gl } = this;
    if (!this.program) return;
    
    const uniformNames = [
      'uCanvasSize',
      'uAvatarCenterPx',
      'uAvatarDiameterPx',
      'uGlowRadiusPx',
      'uGlowOpacity',
      'uGamma',
      'uDevicePixelRatio',
      'uTexture',
      'uGlowTexture',
      'uBlurTexture',
      'uDirection',
      'uResolution'
    ];
    
    for (const name of uniformNames) {
      const location = gl.getUniformLocation(this.program, name);
      this.uniforms.set(name, location);
    }
  }

  private getVertexShaderSource(): string {
    return `#version 300 es
    in vec2 aPosition;
    in vec2 aTexCoord;
    
    out vec2 vTexCoord;
    
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
      vTexCoord = aTexCoord;
    }`;
  }

  private getFragmentShaderSource(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 vTexCoord;
    out vec4 fragColor;
    
    uniform vec2 uCanvasSize;
    uniform vec2 uAvatarCenterPx;
    uniform float uAvatarDiameterPx;
    uniform float uGlowRadiusPx;
    uniform float uGlowOpacity;
    uniform float uGamma;
    uniform float uDevicePixelRatio;
    
    void main() {
      // Convert texture coordinates to pixel coordinates
      vec2 pixelCoord = vTexCoord * uCanvasSize;
      
      // Calculate distance from avatar center
      vec2 avatarCenter = uAvatarCenterPx;
      float distance = length(pixelCoord - avatarCenter);
      float radius = uAvatarDiameterPx * 0.5;
      
      // Create circular mask with smooth antialiasing
      float mask = 1.0 - smoothstep(radius - 1.0, radius + 1.0, distance);
      
      // Set background color
      fragColor = vec4(0.145, 0.149, 0.176, 1.0); // #25262d
    }`;
  }

  dispose(): void {
    const { gl } = this;
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
  }
}