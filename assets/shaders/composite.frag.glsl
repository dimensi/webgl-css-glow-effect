#version 300 es
precision highp float;

uniform sampler2D uGlowTexture;
uniform sampler2D uAvatarTexture;
uniform float uGlowOpacity;
uniform int uMode; // 0=glow, 1=avatar

in vec2 vUV;
out vec4 fragColor;

void main() {
  if (uMode == 0) {
    // Glow layer
    vec4 glow = texture(uGlowTexture, vUV);
    fragColor = vec4(glow.rgb * uGlowOpacity, glow.a * uGlowOpacity);
  } else {
    // Avatar layer (already premultiplied in AvatarPass)
    fragColor = texture(uAvatarTexture, vUV);
  }
}
