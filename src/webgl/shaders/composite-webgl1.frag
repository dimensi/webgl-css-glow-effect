// Composite pass for WebGL1
precision mediump float;

uniform sampler2D uGlowTexture;
uniform sampler2D uAvatarTexture;
uniform float uGlowOpacity;

varying vec2 vUV;

void main() {
    // Sample glow and avatar textures
    vec4 glowColor = texture2D(uGlowTexture, vUV);
    vec4 avatarColor = texture2D(uAvatarTexture, vUV);
    
    // Apply glow opacity
    glowColor.a *= uGlowOpacity;
    
    // Blend glow behind avatar
    // Since we're using premultiplied alpha, we can use simple alpha blending
    vec3 finalColor = glowColor.rgb + avatarColor.rgb * (1.0 - glowColor.a);
    float finalAlpha = glowColor.a + avatarColor.a * (1.0 - glowColor.a);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}