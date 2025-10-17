# WebGL Avatar Glow Effect

A WebGL-powered circular avatar with customizable glow effect, targeting Safari with WebGL2/WebGL1 fallback support.

## Features

- **Circular Avatar Rendering**: Perfect circle clipping with antialiased edges
- **WebGL Glow Effect**: Separable Gaussian blur for performance
- **Safari Compatible**: WebGL2 preferred with WebGL1 fallback
- **High Quality**: ImageBitmap loading with mipmap generation
- **Deterministic Testing**: Screenshot comparison with Playwright
- **TypeScript**: Full type safety throughout

## Visual Pipeline

1. **Background**: Fill canvas with solid color `#25262d`
2. **Avatar Loading**: Load and scale avatar to 30% of canvas width (1:1 square)
3. **Circular Clipping**: Apply perfect circle mask with antialiasing
4. **Glow Generation**: Create blurred halo from clipped avatar
5. **Composition**: Render glow behind, avatar on top

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Update baseline screenshot
npm run test:update
```

## Development

### Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.ts                  # Main application logic
└── webgl/
    ├── renderer.ts         # WebGL context management
    ├── passes.ts           # Render pass orchestration
    ├── shader-manager.ts   # Shader compilation
    ├── texture-manager.ts  # Image loading
    ├── framebuffer-manager.ts # FBO management
    ├── geometry.ts         # Quad geometry
    └── shaders/            # GLSL shaders
        ├── common.vert     # Vertex shader
        ├── avatar.frag     # Avatar rendering
        ├── blurH.frag      # Horizontal blur
        ├── blurV.frag      # Vertical blur
        └── composite.frag  # Final composition
```

### Key Uniforms

- `uCanvasSize`: Canvas dimensions in CSS pixels
- `uAvatarCenterPx`: Avatar center position
- `uAvatarDiameterPx`: Avatar diameter (30% of canvas width)
- `uGlowRadiusPx`: Glow radius (clamped 70-210px)
- `uDevicePixelRatio`: DPR for pixel-perfect rendering

### Testing

Screenshot tests use Playwright with pixelmatch for visual regression testing:

- Fixed viewport: 1280×720
- DPR locked to 1.0
- Deterministic rendering
- 5% tolerance for antialiasing differences

## Technical Details

### WebGL Requirements

- **WebGL2**: Preferred for better performance and features
- **WebGL1**: Fallback with RGBA8 framebuffers
- **Safari**: Full compatibility with both versions

### Performance Optimizations

- Reused framebuffers and textures
- Separable Gaussian blur (H/V passes)
- Downscaling for large glow radii
- Premultiplied alpha blending
- Mipmap generation for quality downscaling

### Browser Support

- Chrome/Edge: WebGL2
- Firefox: WebGL2
- Safari: WebGL2 (fallback to WebGL1)
- Mobile: WebGL1/WebGL2 depending on device

## License

MIT