// Avatar pass for WebGL1
precision mediump float;

uniform sampler2D uAvatarTexture;
uniform vec2 uCanvasSize;
uniform vec2 uAvatarCenterPx;
uniform float uAvatarDiameterPx;
uniform float uDevicePixelRatio;

varying vec2 vUV;

// Convert UV coordinates to pixel coordinates
vec2 uvToPixels(vec2 uv) {
    return uv * uCanvasSize * uDevicePixelRatio;
}

// Calculate distance from center for circular clipping
float getCircleMask(vec2 pixelPos) {
    vec2 center = uAvatarCenterPx * uDevicePixelRatio;
    float radius = uAvatarDiameterPx * uDevicePixelRatio * 0.5;
    
    float dist = distance(pixelPos, center);
    
    // Smooth antialiased edge
    float edge = 1.0;
    float aaWidth = 1.0; // 1 pixel antialiasing
    float alpha = 1.0 - smoothstep(radius - aaWidth, radius + aaWidth, dist);
    
    return alpha;
}

void main() {
    // Sample avatar texture
    vec4 avatarColor = texture2D(uAvatarTexture, vUV);
    
    // Apply circular mask with antialiasing
    float mask = getCircleMask(uvToPixels(vUV));
    
    // Output with premultiplied alpha
    gl_FragColor = vec4(avatarColor.rgb * mask, avatarColor.a * mask);
}