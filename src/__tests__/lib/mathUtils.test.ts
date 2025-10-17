/**
 * Unit tests for mathUtils
 */

import { describe, it, expect } from 'vitest';
import { 
  computeAvatarDiameter, 
  computeGlowRadius, 
  generateGaussianKernel,
  srgbToLinear,
  linearToSrgb
} from '@/lib/mathUtils';

describe('mathUtils', () => {
  describe('computeAvatarDiameter', () => {
    it('должен вычислить диаметр аватара как 30% от ширины', () => {
      expect(computeAvatarDiameter(1000)).toBe(300);
      expect(computeAvatarDiameter(320)).toBe(96);
      expect(computeAvatarDiameter(0)).toBe(0);
    });
  });

  describe('computeGlowRadius', () => {
    it('должен ограничить радиус glow в диапазоне [70, 210]', () => {
      expect(computeGlowRadius(100)).toBe(70); // min clamp
      expect(computeGlowRadius(320)).toBe(70);
      expect(computeGlowRadius(1000)).toBe(210); // max clamp
    });

    it('должен масштабировать радиус пропорционально ширине', () => {
      const width640 = computeGlowRadius(640);
      const width1280 = computeGlowRadius(1280);
      expect(width1280).toBeGreaterThan(width640);
    });
  });

  describe('generateGaussianKernel', () => {
    it('должен сгенерировать Gaussian kernel с суммой весов = 1', () => {
      const { weights } = generateGaussianKernel(10);
      const sum = weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('должен создать массив offsets с правильным центром', () => {
      const { offsets } = generateGaussianKernel(5);
      const center = Math.floor(offsets.length / 2);
      expect(offsets[center]).toBe(0);
    });

    it('должен создать kernel с нечетным размером', () => {
      const { weights } = generateGaussianKernel(7);
      expect(weights.length % 2).toBe(1);
    });
  });

  describe('srgbToLinear', () => {
    it('должен корректно конвертировать sRGB в linear', () => {
      expect(srgbToLinear(0)).toBe(0);
      expect(srgbToLinear(1)).toBe(1);
      expect(srgbToLinear(0.5)).toBeCloseTo(0.214, 3);
    });

    it('должен обрабатывать граничные значения', () => {
      expect(srgbToLinear(0.04045)).toBeCloseTo(0.0031308, 5);
    });
  });

  describe('linearToSrgb', () => {
    it('должен корректно конвертировать linear в sRGB', () => {
      expect(linearToSrgb(0)).toBe(0);
      expect(linearToSrgb(1)).toBe(1);
      expect(linearToSrgb(0.214)).toBeCloseTo(0.5, 3);
    });

    it('должен обрабатывать граничные значения', () => {
      expect(linearToSrgb(0.0031308)).toBeCloseTo(0.04045, 5);
    });
  });
});
