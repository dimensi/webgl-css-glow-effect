/**
 * Geometry utilities for WebGL rendering
 */

export interface QuadGeometry {
  vao: WebGLVertexArrayObject | null;
  draw: () => void;
}

export function createFullscreenQuad(
  gl: WebGLRenderingContext, 
  isWebGL2: boolean
): QuadGeometry {
  const vertices = new Float32Array([
    -1, -1,  // bottom-left
    -1,  1,  // top-left
     1, -1,  // bottom-right
     1,  1   // top-right
  ]);
  
  const vbo = gl.createBuffer();
  if (!vbo) {
    throw new Error('Failed to create vertex buffer');
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  let vao: WebGLVertexArrayObject | null = null;
  
  if (isWebGL2) {
    // WebGL2: use VAO
    vao = gl.createVertexArray();
    if (!vao) {
      throw new Error('Failed to create vertex array object');
    }
    
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }
  
  const draw = (): void => {
    if (isWebGL2 && vao) {
      gl.bindVertexArray(vao);
    } else {
      // WebGL1: manual binding
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    }
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    if (isWebGL2 && vao) {
      gl.bindVertexArray(null);
    }
  };
  
  return { vao, draw };
}
