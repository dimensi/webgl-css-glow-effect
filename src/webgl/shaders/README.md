# Shaders

This directory contains GLSL shaders for the WebGL avatar glow effect.

## Shader Files

### WebGL2 Shaders (preferred)
- `common.vert` - Common vertex shader for all passes
- `background.frag` - Solid background color
- `avatar.frag` - Circular avatar with antialiasing
- `blurH.frag` - Horizontal Gaussian blur
- `blurV.frag` - Vertical Gaussian blur  
- `composite.frag` - Final composition pass

### WebGL1 Fallback Shaders
- `common-webgl1.vert` - WebGL1 vertex shader
- `background-webgl1.frag` - WebGL1 background
- `avatar-webgl1.frag` - WebGL1 avatar
- `blurH-webgl1.frag` - WebGL1 horizontal blur
- `blurV-webgl1.frag` - WebGL1 vertical blur
- `composite-webgl1.frag` - WebGL1 composite

## Key Features

- **Circular Clipping**: Perfect circle mask with smooth antialiasing
- **Linear Space Blur**: Proper sRGB ↔ linear conversion for accurate blur
- **Premultiplied Alpha**: Correct alpha blending for composition
- **High Quality**: Mipmap generation and proper filtering

## Uniforms

### Common
- `uCanvasSize` - Canvas dimensions in CSS pixels
- `uDevicePixelRatio` - Device pixel ratio

### Avatar Pass
- `uAvatarCenterPx` - Avatar center position
- `uAvatarDiameterPx` - Avatar diameter (30% of canvas width)
- `uAvatarTexture` - Avatar image texture

### Blur Passes
- `uInputTexture` - Input texture to blur
- `uTextureSize` - Texture dimensions
- `uBlurRadius` - Blur radius in pixels

### Composite Pass
- `uGlowTexture` - Blurred glow texture
- `uAvatarTexture` - Clipped avatar texture
- `uGlowOpacity` - Glow opacity multiplier