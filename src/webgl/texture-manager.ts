import { WebGLRenderer } from './renderer';

export class TextureManager {
  private renderer: WebGLRenderer;
  private avatarTexture: WebGLTexture | null = null;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
  }

  async loadAvatar(url: string): Promise<void> {
    const gl = this.renderer.getGL();
    
    // Create texture
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters for high quality downscaling
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Load image
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        try {
          // Upload image data
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          
          // Generate mipmaps for better quality downscaling
          gl.generateMipmap(gl.TEXTURE_2D);
          
          this.avatarTexture = texture;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      image.src = url;
    });
  }

  getAvatarTexture(): WebGLTexture | null {
    return this.avatarTexture;
  }

  destroy(): void {
    if (this.avatarTexture) {
      const gl = this.renderer.getGL();
      gl.deleteTexture(this.avatarTexture);
      this.avatarTexture = null;
    }
  }
}