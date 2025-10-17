# Development Guide

## Prerequisites

- Node.js 20+
- npm or yarn
- Modern browser with WebGL support

## Setup

```bash
# Clone and install
git clone <repository-url>
cd webgl-avatar-glow
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

### Screenshot Tests

```bash
# Run all tests
npm test

# Run specific browser
npx playwright test --project=webkit

# Update baseline screenshot
npm run test:update

# Debug tests
npx playwright test --debug
```

### Test Structure

- `tests/screenshot.spec.ts` - Visual regression tests
- `tests/helpers/server.ts` - Test utilities
- `scripts/update-baseline.ts` - Baseline update script

## Architecture

### Render Pipeline

1. **Background Pass**: Clear with `#25262d`
2. **Avatar Mask Pass**: Render circular avatar to FBO
3. **Glow Pass**: Horizontal + vertical blur
4. **Composite Pass**: Blend glow behind avatar

### Key Classes

- `WebGLRenderer` - WebGL context management
- `AvatarGlowApp` - Main application logic
- `RenderPasses` - Render pipeline orchestration
- `ShaderManager` - Shader compilation and management
- `FramebufferManager` - FBO creation and management
- `TextureManager` - Image loading and texture creation

### Performance Considerations

- Reuse framebuffers and textures
- Use separable Gaussian blur
- Enable mipmap generation
- Optimize for mobile devices
- Handle WebGL1 fallback gracefully

## Browser Support

| Browser | WebGL Version | Status |
|---------|---------------|--------|
| Chrome  | WebGL2        | ✅ Full |
| Firefox | WebGL2        | ✅ Full |
| Safari  | WebGL2/WebGL1 | ✅ Full |
| Edge    | WebGL2        | ✅ Full |

## Troubleshooting

### Common Issues

1. **WebGL not supported**: Check browser compatibility
2. **Black screen**: Check console for shader errors
3. **Performance issues**: Reduce glow radius or enable downscaling
4. **Test failures**: Update baseline with `npm run test:update`

### Debug Mode

Enable WebGL debugging:

```javascript
// In browser console
window.DEBUG_WEBGL = true;
```

### Performance Profiling

Use browser dev tools:
- Chrome: Performance tab + WebGL inspector
- Firefox: Performance tab + WebGL debugger
- Safari: Web Inspector + WebGL profiler