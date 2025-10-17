import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

test.describe('WebGL Avatar Glow Screenshot Tests', () => {
  test('renders avatar with glow effect correctly', async ({ page }) => {
    // Set deterministic viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Disable animations and set fixed DPR
    await page.addInitScript(() => {
      // Override devicePixelRatio for deterministic rendering
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 1,
        writable: true
      });
      
      // Disable animations
      const style = document.createElement('style');
      style.textContent = '* { animation-duration: 0s !important; transition-duration: 0s !important; }';
      document.head.appendChild(style);
    });

    // Navigate to the app
    await page.goto('/');
    
    // Wait for WebGL to initialize
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    }, { timeout: 10000 });

    // Wait a bit for rendering to stabilize
    await page.waitForTimeout(1000);

    // Take screenshot of the canvas
    const canvas = await page.$('canvas');
    expect(canvas).toBeTruthy();

    const screenshot = await canvas!.screenshot();
    
    // Load baseline image
    const baselinePath = path.join(__dirname, '../public/example.png');
    const baselineExists = fs.existsSync(baselinePath);
    
    if (!baselineExists) {
      // Save current screenshot as baseline
      fs.writeFileSync(baselinePath, screenshot);
      console.log('Baseline image saved. Run the test again to compare.');
      return;
    }
    
    const baseline = fs.readFileSync(baselinePath);
    
    // Compare images
    const img1 = PNG.sync.read(screenshot);
    const img2 = PNG.sync.read(baseline);
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1, // 10% threshold
        alpha: 0.1,
        diffColor: [255, 0, 0],
        diffColorAlt: [0, 255, 0]
      }
    );
    
    const diffPercentage = (numDiffPixels / (width * height)) * 100;
    
    // Save diff image for debugging
    if (numDiffPixels > 0) {
      const diffPath = path.join(__dirname, '../test-results/diff.png');
      fs.mkdirSync(path.dirname(diffPath), { recursive: true });
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      console.log(`Diff image saved to: ${diffPath}`);
    }
    
    // Allow up to 5% difference (for antialiasing and minor rendering differences)
    expect(diffPercentage).toBeLessThan(5);
    
    console.log(`Screenshot comparison: ${numDiffPixels} different pixels (${diffPercentage.toFixed(2)}%)`);
  });
});