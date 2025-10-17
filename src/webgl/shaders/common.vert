#version 300 es

// Common vertex shader for all passes
in vec2 aPosition;
in vec2 aUV;

out vec2 vUV;

void main() {
    vUV = aUV;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}