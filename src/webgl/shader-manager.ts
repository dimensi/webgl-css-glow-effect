import { WebGLRenderer } from './renderer';

export class ShaderManager {
  private renderer: WebGLRenderer;
  private programs: Map<string, WebGLProgram> = new Map();

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
  }

  async initialize(): Promise<void> {
    const isWebGL2 = this.renderer.isWebGL2();
    
    // Load shader source files
    const shaderSources = await this.loadShaderSources();
    
    // Create shader programs
    this.createProgram('background', shaderSources.background.vert, shaderSources.background.frag);
    this.createProgram('avatar', shaderSources.avatar.vert, shaderSources.avatar.frag);
    this.createProgram('blurH', shaderSources.blurH.vert, shaderSources.blurH.frag);
    this.createProgram('blurV', shaderSources.blurV.vert, shaderSources.blurV.frag);
    this.createProgram('composite', shaderSources.composite.vert, shaderSources.composite.frag);
  }

  private async loadShaderSources(): Promise<Record<string, { vert: string; frag: string }>> {
    const isWebGL2 = this.renderer.isWebGL2();
    const suffix = isWebGL2 ? '' : '-webgl1';
    
    const shaders = ['background', 'avatar', 'blurH', 'blurV', 'composite'];
    const sources: Record<string, { vert: string; frag: string }> = {};
    
    for (const shader of shaders) {
      const vertResponse = await fetch(`/src/webgl/shaders/common${suffix}.vert`);
      const fragResponse = await fetch(`/src/webgl/shaders/${shader}${suffix}.frag`);
      
      sources[shader] = {
        vert: await vertResponse.text(),
        frag: await fragResponse.text()
      };
    }
    
    return sources;
  }

  private createProgram(name: string, vertexSource: string, fragmentSource: string): void {
    const gl = this.renderer.getGL();
    
    // Create shaders
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) {
      throw new Error(`Failed to create shaders for ${name}`);
    }
    
    // Create program
    const program = gl.createProgram();
    if (!program) {
      throw new Error(`Failed to create program for ${name}`);
    }
    
    // Attach shaders
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    // Link program
    gl.linkProgram(program);
    
    // Check for errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Failed to link program ${name}: ${error}`);
    }
    
    // Clean up shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    this.programs.set(name, program);
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.renderer.getGL();
    
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', error);
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  getBackgroundProgram(): WebGLProgram {
    return this.getProgram('background');
  }

  getAvatarProgram(): WebGLProgram {
    return this.getProgram('avatar');
  }

  getBlurHProgram(): WebGLProgram {
    return this.getProgram('blurH');
  }

  getBlurVProgram(): WebGLProgram {
    return this.getProgram('blurV');
  }

  getCompositeProgram(): WebGLProgram {
    return this.getProgram('composite');
  }

  private getProgram(name: string): WebGLProgram {
    const program = this.programs.get(name);
    if (!program) {
      throw new Error(`Program ${name} not found`);
    }
    return program;
  }

  destroy(): void {
    const gl = this.renderer.getGL();
    
    for (const program of this.programs.values()) {
      gl.deleteProgram(program);
    }
    
    this.programs.clear();
  }
}