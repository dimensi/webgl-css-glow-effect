#version 300 es
precision highp float;

uniform vec3 uBackgroundColor;

in vec2 vUV;
out vec4 fragColor;

void main() {
  fragColor = vec4(uBackgroundColor, 1.0);
}
