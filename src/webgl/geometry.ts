export class Geometry {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private vertexArrayObject: WebGLVertexArrayObject | null = null;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
  }

  async initialize(): Promise<void> {
    const { gl } = this;
    
    // Create a full-screen quad
    const vertices = new Float32Array([
      -1, -1, 0, 1,  // bottom-left
       1, -1, 1, 1,  // bottom-right
       1,  1, 1, 0,  // top-right
      -1,  1, 0, 0   // top-left
    ]);

    const indices = new Uint16Array([
      0, 1, 2,  // first triangle
      0, 2, 3   // second triangle
    ]);

    // Create vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Create index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Create vertex array object (WebGL2 only)
    if ('createVertexArray' in gl) {
      this.vertexArrayObject = gl.createVertexArray();
      gl.bindVertexArray(this.vertexArrayObject);
      
      // Set up vertex attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.enableVertexAttribArray(0); // position
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); // texCoord
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
      
      gl.bindVertexArray(null);
    }
  }

  bind(): void {
    const { gl } = this;
    
    if (this.vertexArrayObject && 'bindVertexArray' in gl) {
      gl.bindVertexArray(this.vertexArrayObject);
    } else {
      // WebGL1 fallback
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      
      gl.enableVertexAttribArray(0); // position
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); // texCoord
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    }
  }

  draw(): void {
    const { gl } = this;
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  dispose(): void {
    const { gl } = this;
    
    if (this.vertexBuffer) {
      gl.deleteBuffer(this.vertexBuffer);
      this.vertexBuffer = null;
    }
    
    if (this.indexBuffer) {
      gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = null;
    }
    
    if (this.vertexArrayObject && 'deleteVertexArray' in gl) {
      gl.deleteVertexArray(this.vertexArrayObject);
      this.vertexArrayObject = null;
    }
  }
}