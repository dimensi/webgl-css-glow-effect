/**
 * Script to update baseline screenshot for E2E tests
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function updateBaseline(): Promise<void> {
  console.log('🚀 Starting baseline update...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting for WebGL initialization...');
    await page.waitForTimeout(1000);
    
    console.log('📸 Taking screenshot...');
    const canvas = await page.locator('#canvas');
    const screenshot = await canvas.screenshot({ type: 'png' });
    
    const outputPath = path.join(__dirname, '../public/example.png');
    
    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, screenshot);
    
    console.log(`✅ Baseline screenshot updated: ${outputPath}`);
    console.log(`📊 Image size: ${screenshot.length} bytes`);
    
  } catch (error) {
    console.error('❌ Failed to update baseline:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Check if dev server is running
async function checkDevServer(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:5173');
    return response.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🔍 Checking if dev server is running...');
  
  const isRunning = await checkDevServer();
  if (!isRunning) {
    console.error('❌ Dev server is not running on http://localhost:5173');
    console.log('💡 Please run "npm run dev" first');
    process.exit(1);
  }
  
  console.log('✅ Dev server is running');
  await updateBaseline();
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
