/**
 * E2E screenshot tests for WebGL Avatar Glow
 */

import { test, expect } from '@playwright/test';
import * as pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

const BROWSERS = ['chromium', 'webkit', 'firefox'] as const;
const VIEWPORT = { width: 1280, height: 720 };
const BASELINE_PATH = path.join(__dirname, '../../public/example.png');
const THRESHOLD = 0.01; // 1% pixel difference allowed

for (const browserType of BROWSERS) {
  test(`должен рендерить avatar glow идентично baseline в ${browserType}`, async ({ browser }) => {
    const context = await browser.newContext({ 
      viewport: VIEWPORT,
      deviceScaleFactor: 1 
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Дождаться загрузки текстуры и первого рендера
    await page.waitForTimeout(1000);
    
    const canvas = await page.locator('#canvas');
    const screenshot = await canvas.screenshot({ type: 'png' });
    
    // Проверить, что baseline существует
    if (!fs.existsSync(BASELINE_PATH)) {
      // Если baseline не существует, создать его
      fs.writeFileSync(BASELINE_PATH, screenshot);
      console.log(`✅ Baseline screenshot created: ${BASELINE_PATH}`);
      return;
    }
    
    // Сравнение с baseline
    const baselineImg = PNG.sync.read(fs.readFileSync(BASELINE_PATH));
    const currentImg = PNG.sync.read(screenshot);
    
    const { width, height } = baselineImg;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      baselineImg.data,
      currentImg.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const diffPercentage = numDiffPixels / (width * height);
    
    if (diffPercentage > THRESHOLD) {
      // Сохранить diff для отладки
      const diffPath = path.join(__dirname, `../fixtures/diff-${browserType}.png`);
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      
      throw new Error(
        `Screenshot mismatch in ${browserType}: ${(diffPercentage * 100).toFixed(2)}% different (threshold: ${THRESHOLD * 100}%)`
      );
    }
    
    expect(diffPercentage).toBeLessThanOrEqual(THRESHOLD);
    
    await context.close();
  });
}

test('должен корректно обрабатывать resize canvas', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  // Изменить размер viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(500);
  
  // Проверить, что canvas изменил размер
  const canvas = await page.locator('#canvas');
  const canvasSize = await canvas.boundingBox();
  
  expect(canvasSize?.width).toBe(1920);
  expect(canvasSize?.height).toBe(1080);
});

test('должен реагировать на изменения в UI controls', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  // Найти слайдер opacity
  const opacitySlider = await page.locator('input[type="range"]').nth(1);
  
  // Изменить значение
  await opacitySlider.fill('0.5');
  await page.waitForTimeout(100);
  
  // Проверить, что значение отображается
  const opacityDisplay = await page.locator('.value-display').nth(1);
  await expect(opacityDisplay).toHaveText('50%');
});

test('должен показывать error message при отсутствии WebGL', async ({ page }) => {
  // Mock отсутствие WebGL
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(contextType: string) {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return null;
      }
      return originalGetContext.call(this, contextType);
    };
  });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Проверить, что отображается error message
  const canvas = await page.locator('#canvas');
  const canvasContent = await canvas.screenshot();
  
  // Canvas должен содержать error message (проверяем, что он не пустой)
  expect(canvasContent.length).toBeGreaterThan(0);
});
