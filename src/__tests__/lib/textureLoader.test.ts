/**
 * Unit tests for textureLoader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch and createImageBitmap
global.fetch = vi.fn();
global.createImageBitmap = vi.fn();

describe('textureLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен загрузить текстуру успешно', async () => {
    const mockBlob = new Blob(['fake image data'], { type: 'image/png' });
    const mockImageBitmap = {
      width: 100,
      height: 100
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });

    (global.createImageBitmap as any).mockResolvedValue(mockImageBitmap);

    // Mock WebGL context
    const mockGL = {
      createTexture: vi.fn().mockReturnValue({}),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      TEXTURE_2D: 0x0DE1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      LINEAR: 0x2601,
      CLAMP_TO_EDGE: 0x812F
    };

    const { loadTexture } = await import('@/lib/textureLoader');
    
    const texture = await loadTexture(mockGL as any, '/test.png', false);
    
    expect(texture).toBeDefined();
    expect(mockGL.createTexture).toHaveBeenCalled();
    expect(mockGL.bindTexture).toHaveBeenCalled();
  });

  it('должен выбросить ошибку при неудачной загрузке', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404
    });

    const mockGL = {
      createTexture: vi.fn().mockReturnValue({}),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      TEXTURE_2D: 0x0DE1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      LINEAR: 0x2601,
      CLAMP_TO_EDGE: 0x812F
    };

    const { loadTexture } = await import('@/lib/textureLoader');
    
    await expect(loadTexture(mockGL as any, '/missing.png', false))
      .rejects.toThrow('Failed to load texture: /missing.png');
  });

  it('должен выбросить ошибку при неудачном создании текстуры', async () => {
    const mockBlob = new Blob(['fake image data'], { type: 'image/png' });
    const mockImageBitmap = {
      width: 100,
      height: 100
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });

    (global.createImageBitmap as any).mockResolvedValue(mockImageBitmap);

    const mockGL = {
      createTexture: vi.fn().mockReturnValue(null), // Simulate failure
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      TEXTURE_2D: 0x0DE1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      LINEAR: 0x2601,
      CLAMP_TO_EDGE: 0x812F
    };

    const { loadTexture } = await import('@/lib/textureLoader');
    
    await expect(loadTexture(mockGL as any, '/test.png', false))
      .rejects.toThrow('Failed to create texture');
  });
});
