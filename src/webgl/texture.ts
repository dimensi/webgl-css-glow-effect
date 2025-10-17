export class Texture {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private texture: WebGLTexture | null = null;
  private width = 0;
  private height = 0;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
  }

  async initialize(): Promise<void> {
    const { gl } = this;
    this.texture = gl.createTexture();
    
    if (!this.texture) {
      throw new Error('Failed to create texture');
    }
    
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  async loadFromUrl(url: string): Promise<void> {
    const { gl } = this;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      
      this.width = imageBitmap.width;
      this.height = imageBitmap.height;
      
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
      
      imageBitmap.close();
    } catch (error) {
      throw new Error(`Failed to load texture from ${url}: ${error}`);
    }
  }

  bind(unit: number = 0): void {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  dispose(): void {
    const { gl } = this;
    if (this.texture) {
      gl.deleteTexture(this.texture);
      this.texture = null;
    }
  }
}