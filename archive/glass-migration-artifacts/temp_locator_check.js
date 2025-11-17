import { chromium } from 'playwright';

async function checkLocators() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check /dashboard (or /home)
    console.log('=== /dashboard ===');
    await page.goto('http://localhost:4000/');
    console.log('glass-section-card count:', await page.locator('.glass-section-card').count());
    console.log('glassmorphic-card count:', await page.locator('.glassmorphic-card').count());
    console.log('allInnerTexts:', await page.locator('.glass-section-card').allInnerTexts());

    // Check /analytics
    console.log('\n=== /analytics ===');
    await page.goto('http://localhost:4000/analytics');
    console.log('glass-section-card count:', await page.locator('.glass-section-card').count());
    console.log('section classNames:', await page.locator('section').evaluateAll(nodes => nodes.map(n => n.className)));

    // Check /review
    console.log('\n=== /review ===');
    await page.goto('http://localhost:4000/review');
    console.log('glass-section-card count:', await page.locator('.glass-section-card').count());
    console.log('h3 allInnerTexts:', await page.locator('h3').allInnerTexts());

    // Check /commandview
    console.log('\n=== /commandview ===');
    await page.goto('http://localhost:4000/commandview');
    console.log('glass-section-card count:', await page.locator('.glass-section-card').count());
    console.log('glassmorphic-card count:', await page.locator('.glassmorphic-card').count());

    // Check /glass-test
    console.log('\n=== /glass-test ===');
    await page.goto('http://localhost:4000/glass-test');
    console.log('glass-section-card count:', await page.locator('.glass-section-card').count());
    console.log('allInnerTexts:', await page.locator('.glass-section-card').allInnerTexts());

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkLocators();