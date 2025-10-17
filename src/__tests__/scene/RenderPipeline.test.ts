/**
 * Unit tests for RenderPipeline
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('RenderPipeline', () => {
  let mockGL: any;
  let mockQuad: any;
  let mockAvatarTexture: any;

  beforeEach(() => {
    mockGL = {
      canvas: { width: 1280, height: 720 },
      useProgram: vi.fn(),
      bindFramebuffer: vi.fn(),
      clear: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      blendFunc: vi.fn(),
      activeTexture: vi.fn(),
      bindTexture: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform1i: vi.fn(),
      uniform1fv: vi.fn(),
      TEXTURE_2D: 0x0DE1,
      FRAMEBUFFER: 0x8D40,
      COLOR_BUFFER_BIT: 0x00004000,
      BLEND: 0x0BE2,
      ONE: 1,
      ONE_MINUS_SRC_ALPHA: 0x0303,
      TEXTURE0: 0x84C0,
      TEXTURE1: 0x84C1,
      TRIANGLE_STRIP: 0x0005
    };

    mockQuad = {
      draw: vi.fn()
    };

    mockAvatarTexture = {};

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: ''
      },
      writable: true
    });
  });

  it('должен создать RenderPipeline без ошибок', () => {
    const { RenderPipeline } = require('@/scene/RenderPipeline');
    
    expect(() => {
      new RenderPipeline(mockGL, true, mockQuad, mockAvatarTexture);
    }).not.toThrow();
  });

  it('должен вызвать render без ошибок', () => {
    const { RenderPipeline } = require('@/scene/RenderPipeline');
    const pipeline = new RenderPipeline(mockGL, true, mockQuad, mockAvatarTexture);
    
    const params = {
      canvasWidthCSS: 1280,
      canvasHeightCSS: 720,
      dpr: 1,
      glowRadiusPx: 70,
      glowOpacity: 0.8
    };

    expect(() => {
      pipeline.render(params);
    }).not.toThrow();
  });

  it('должен обработать resize без ошибок', () => {
    const { RenderPipeline } = require('@/scene/RenderPipeline');
    const pipeline = new RenderPipeline(mockGL, true, mockQuad, mockAvatarTexture);
    
    expect(() => {
      pipeline.resize(1920, 1080);
    }).not.toThrow();
  });

  it('должен включить performance measurement в debug режиме', () => {
    // Mock debug mode
    Object.defineProperty(window, 'location', {
      value: {
        search: '?debug=1'
      },
      writable: true
    });

    const { RenderPipeline } = require('@/scene/RenderPipeline');
    const pipeline = new RenderPipeline(mockGL, true, mockQuad, mockAvatarTexture);
    
    const params = {
      canvasWidthCSS: 1280,
      canvasHeightCSS: 720,
      dpr: 1,
      glowRadiusPx: 70,
      glowOpacity: 0.8
    };

    const result = pipeline.render(params);
    expect(result.timings).toBeDefined();
    expect(result.timings?.total).toBeGreaterThan(0);
  });

  it('должен вычислить правильные параметры для рендера', () => {
    const { RenderPipeline } = require('@/scene/RenderPipeline');
    const pipeline = new RenderPipeline(mockGL, true, mockQuad, mockAvatarTexture);
    
    const params = {
      canvasWidthCSS: 1000,
      canvasHeightCSS: 600,
      dpr: 2,
      glowRadiusPx: 100,
      glowOpacity: 0.5
    };

    // Spy on uniform calls to verify parameters
    const uniform1fSpy = vi.spyOn(mockGL, 'uniform1f');
    const uniform2fSpy = vi.spyOn(mockGL, 'uniform2f');

    pipeline.render(params);

    // Verify that uniforms were called with expected values
    expect(uniform2fSpy).toHaveBeenCalledWith(expect.anything(), 2000, 1200); // canvasSize * dpr
    expect(uniform1fSpy).toHaveBeenCalledWith(expect.anything(), 300); // diameter = 30% of 1000
  });
});
