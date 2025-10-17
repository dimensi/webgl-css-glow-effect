/**
 * Texture loading utilities with high-quality downscaling
 */

export async function loadTexture(
  gl: WebGLRenderingContext,
  url: string,
  isWebGL2: boolean
): Promise<WebGLTexture> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load texture: ${url}`);
  }
  
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'default',
    resizeQuality: 'high'
  });
  
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Failed to create texture');
  }
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // WebGL2: gl.RGBA8, WebGL1: gl.RGBA + gl.UNSIGNED_BYTE
  const internalFormat = isWebGL2 ? (gl as any).RGBA8 : gl.RGBA;
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, gl.RGBA, 
                gl.UNSIGNED_BYTE, imageBitmap);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  return texture;
}
