#version 300 es
precision highp float;

// Background pass - solid color fill
uniform vec4 uBackgroundColor;

out vec4 fragColor;

void main() {
    fragColor = uBackgroundColor;
}