import { chromium, webkit, firefox, Browser, Page } from 'playwright';

export interface TestServer {
  browser: Browser;
  page: Page;
  close: () => Promise<void>;
}

export async function createTestServer(): Promise<TestServer> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
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

  return {
    browser,
    page,
    close: async () => {
      await page.close();
      await browser.close();
    }
  };
}

export async function waitForWebGLReady(page: Page, timeout = 10000): Promise<void> {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas && canvas.width > 0 && canvas.height > 0;
  }, { timeout });
  
  // Additional wait for rendering to stabilize
  await page.waitForTimeout(1000);
}