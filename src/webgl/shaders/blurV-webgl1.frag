// Vertical blur pass for WebGL1
precision mediump float;

uniform sampler2D uInputTexture;
uniform vec2 uTextureSize;
uniform float uBlurRadius;

varying vec2 vUV;

// Convert sRGB to linear
vec3 srgbToLinear(vec3 srgb) {
    return pow(srgb, vec3(2.2));
}

// Convert linear to sRGB
vec3 linearToSrgb(vec3 linear) {
    return pow(linear, vec3(1.0 / 2.2));
}

void main() {
    vec2 texelSize = 1.0 / uTextureSize;
    vec4 color = vec4(0.0);
    float totalWeight = 0.0;
    
    // Calculate blur kernel size based on radius
    float kernelSize = ceil(uBlurRadius * 2.0);
    
    for (float i = -kernelSize; i <= kernelSize; i += 1.0) {
        float weight = exp(-(i * i) / (2.0 * uBlurRadius * uBlurRadius));
        vec2 offset = vec2(0.0, i * texelSize.y);
        vec4 sampleColor = texture2D(uInputTexture, vUV + offset);
        
        // Convert to linear space for proper blur
        sampleColor.rgb = srgbToLinear(sampleColor.rgb);
        
        color += sampleColor * weight;
        totalWeight += weight;
    }
    
    color /= totalWeight;
    
    // Convert back to sRGB
    color.rgb = linearToSrgb(color.rgb);
    
    gl_FragColor = color;
}