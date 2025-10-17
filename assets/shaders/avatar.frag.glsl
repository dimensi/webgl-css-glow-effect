#version 300 es
precision highp float;

uniform sampler2D uAvatarTexture;
uniform vec2 uCanvasSize;
uniform vec2 uAvatarCenterPx;
uniform float uAvatarDiameterPx;

in vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 pixelCoord = vUV * uCanvasSize;
  vec2 delta = pixelCoord - uAvatarCenterPx;
  float dist = length(delta);
  float radius = uAvatarDiameterPx * 0.5;
  
  // Smooth antialiased edge (1px transition)
  float alpha = 1.0 - smoothstep(radius - 1.0, radius + 1.0, dist);
  
  if (alpha < 0.01) discard;
  
  // Map pixel to avatar texture UV (contain mode: вписываем квадрат 1:1)
  vec2 avatarUV = (delta / uAvatarDiameterPx) + 0.5;
  vec4 avatarColor = texture(uAvatarTexture, avatarUV);
  
  fragColor = vec4(avatarColor.rgb, avatarColor.a * alpha);
}
