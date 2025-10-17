#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float uWeights[64];
uniform float uOffsets[64];
uniform vec2 uTexelSize; // (1/width, 0) for H, (0, 1/height) for V
uniform int uKernelSize;

in vec2 vUV;
out vec4 fragColor;

// sRGB ↔ Linear helpers
vec3 srgbToLinear(vec3 srgb) {
  return mix(srgb / 12.92, pow((srgb + 0.055) / 1.055, vec3(2.4)), 
             step(0.04045, srgb));
}

vec3 linearToSrgb(vec3 linear) {
  return mix(linear * 12.92, 1.055 * pow(linear, vec3(1.0/2.4)) - 0.055, 
             step(0.0031308, linear));
}

void main() {
  vec3 sum = vec3(0.0);
  float alphaSum = 0.0;
  
  for (int i = 0; i < uKernelSize; i++) {
    vec2 offset = uTexelSize * uOffsets[i];
    vec4 texel = texture(uTexture, vUV + offset);
    vec3 linear = srgbToLinear(texel.rgb);
    float weight = uWeights[i];
    
    sum += linear * texel.a * weight;
    alphaSum += texel.a * weight;
  }
  
  vec3 srgb = linearToSrgb(sum);
  fragColor = vec4(srgb, alphaSum);
}
