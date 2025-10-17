import { WebGLRenderer } from './renderer';

export interface QuadGeometry {
  positionBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vertexCount: number;
}

export class GeometryManager {
  private renderer: WebGLRenderer;
  private quadGeometry: QuadGeometry | null = null;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
  }

  createQuadGeometry(): QuadGeometry {
    const gl = this.renderer.getGL();

    // Position data for a full-screen quad (in clip space)
    const positions = new Float32Array([
      -1, -1,  // Bottom left
       1, -1,  // Bottom right
       1,  1,  // Top right
      -1,  1   // Top left
    ]);

    // UV coordinates
    const uvs = new Float32Array([
      0, 0,  // Bottom left
      1, 0,  // Bottom right
      1, 1,  // Top right
      0, 1   // Top left
    ]);

    // Indices for two triangles
    const indices = new Uint16Array([
      0, 1, 2,  // First triangle
      0, 2, 3   // Second triangle
    ]);

    // Create buffers
    const positionBuffer = gl.createBuffer();
    const uvBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    if (!positionBuffer || !uvBuffer || !indexBuffer) {
      throw new Error('Failed to create geometry buffers');
    }

    // Upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Upload UV data
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    // Upload index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {
      positionBuffer,
      uvBuffer,
      indexBuffer,
      vertexCount: indices.length
    };
  }

  getQuadGeometry(): QuadGeometry {
    if (!this.quadGeometry) {
      this.quadGeometry = this.createQuadGeometry();
    }
    return this.quadGeometry;
  }

  destroy(): void {
    if (this.quadGeometry) {
      const gl = this.renderer.getGL();
      
      gl.deleteBuffer(this.quadGeometry.positionBuffer);
      gl.deleteBuffer(this.quadGeometry.uvBuffer);
      gl.deleteBuffer(this.quadGeometry.indexBuffer);
      
      this.quadGeometry = null;
    }
  }
}