import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

async function updateBaseline(): Promise<void> {
  console.log('Updating baseline screenshot...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
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

    // Start dev server
    console.log('Starting dev server...');
    const { spawn } = await import('child_process');
    const devProcess = spawn('npm', ['run', 'dev'], { 
      stdio: 'pipe',
      cwd: process.cwd()
    });

    // Wait for server to start
    await new Promise<void>((resolve) => {
      devProcess.stdout?.on('data', (data) => {
        if (data.toString().includes('Local:')) {
          resolve();
        }
      });
    });

    // Navigate to the app
    console.log('Loading page...');
    await page.goto('http://localhost:5173');
    
    // Wait for WebGL to initialize
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    }, { timeout: 10000 });

    // Wait for rendering to stabilize
    await page.waitForTimeout(2000);

    // Take screenshot
    console.log('Taking screenshot...');
    const canvas = await page.$('canvas');
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    const screenshot = await canvas.screenshot();
    
    // Save as baseline
    const baselinePath = path.join(process.cwd(), 'public/example.png');
    fs.writeFileSync(baselinePath, screenshot);
    
    console.log(`Baseline updated: ${baselinePath}`);
    
  } finally {
    await browser.close();
    
    // Kill dev server
    devProcess.kill();
  }
}

updateBaseline().catch(console.error);