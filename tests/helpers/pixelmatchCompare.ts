/**
 * Helper functions for pixelmatch comparison
 */

import * as pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';

export interface ComparisonResult {
  isMatch: boolean;
  diffPercentage: number;
  diffPixels: number;
  totalPixels: number;
}

export function compareImages(
  baselinePath: string,
  currentImageBuffer: Buffer,
  threshold: number = 0.1,
  diffPath?: string
): ComparisonResult {
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`Baseline image not found: ${baselinePath}`);
  }

  const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
  const currentImg = PNG.sync.read(currentImageBuffer);

  const { width, height } = baselineImg;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    baselineImg.data,
    currentImg.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  const totalPixels = width * height;
  const diffPercentage = numDiffPixels / totalPixels;

  // Save diff image if path provided
  if (diffPath && numDiffPixels > 0) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return {
    isMatch: diffPercentage <= 0.01, // 1% threshold
    diffPercentage,
    diffPixels: numDiffPixels,
    totalPixels
  };
}

export function createBaseline(
  imageBuffer: Buffer,
  outputPath: string
): void {
  fs.writeFileSync(outputPath, imageBuffer);
  console.log(`✅ Baseline image created: ${outputPath}`);
}
