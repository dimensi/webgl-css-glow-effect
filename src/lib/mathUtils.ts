/**
 * Mathematical utilities for WebGL avatar glow effect
 */

export function computeAvatarDiameter(canvasWidthCSS: number): number {
  return canvasWidthCSS * 0.3;
}

export function computeGlowRadius(canvasWidthCSS: number): number {
  const base = (70 / 320) * canvasWidthCSS;
  return Math.max(70, Math.min(base, 210));
}

export function generateGaussianKernel(radius: number): {
  weights: number[];
  offsets: number[];
} {
  // 1D Gaussian kernel для separable blur
  const sigma = radius / 3.0;
  const size = Math.ceil(radius) * 2 + 1;
  const weights: number[] = [];
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const x = i - Math.floor(size / 2);
    const w = Math.exp(-(x * x) / (2 * sigma * sigma));
    weights.push(w);
    sum += w;
  }
  
  // Normalize
  return {
    weights: weights.map(w => w / sum),
    offsets: weights.map((_, i) => i - Math.floor(size / 2))
  };
}

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
