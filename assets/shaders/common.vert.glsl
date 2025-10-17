#version 300 es
precision highp float;

// Fullscreen quad vertex shader
// Input: NDC coordinates (-1 to 1)
// Output: UV coordinates (0 to 1) for fragment shader

in vec2 aPosition;

out vec2 vUV;

void main() {
  // Pass through NDC coordinates
  gl_Position = vec4(aPosition, 0.0, 1.0);
  
  // Convert NDC to UV coordinates
  vUV = aPosition * 0.5 + 0.5;
}
