// Background pass for WebGL1
precision mediump float;

uniform vec4 uBackgroundColor;

void main() {
    gl_FragColor = uBackgroundColor;
}