#version 300 es
precision highp float;

// Composite pass - blend glow and avatar
uniform sampler2D uGlowTexture;
uniform sampler2D uAvatarTexture;
uniform float uGlowOpacity;

in vec2 vUV;
out vec4 fragColor;

void main() {
    // Sample glow and avatar textures
    vec4 glowColor = texture(uGlowTexture, vUV);
    vec4 avatarColor = texture(uAvatarTexture, vUV);
    
    // Apply glow opacity
    glowColor.a *= uGlowOpacity;
    
    // Blend glow behind avatar
    // Since we're using premultiplied alpha, we can use simple alpha blending
    vec3 finalColor = glowColor.rgb + avatarColor.rgb * (1.0 - glowColor.a);
    float finalAlpha = glowColor.a + avatarColor.a * (1.0 - glowColor.a);
    
    fragColor = vec4(finalColor, finalAlpha);
}