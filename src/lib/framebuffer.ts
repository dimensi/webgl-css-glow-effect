/**
 * Framebuffer creation utilities for WebGL2/WebGL1 compatibility
 */

export interface Framebuffer {
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
}

export function createFramebuffer(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  isWebGL2: boolean
): Framebuffer {
  const fbo = gl.createFramebuffer();
  if (!fbo) {
    throw new Error('Failed to create framebuffer');
  }
  
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Failed to create texture');
  }
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // WebGL2: gl.RGBA8, WebGL1: gl.RGBA + gl.UNSIGNED_BYTE
  const internalFormat = isWebGL2 ? (gl as any).RGBA8 : gl.RGBA;
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, 
                gl.RGBA, gl.UNSIGNED_BYTE, null);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                          gl.TEXTURE_2D, texture, 0);
  
  // Check framebuffer status
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer incomplete: ${status}`);
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  return { fbo, texture };
}
