import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }) => { if (!page.isClosed()) await page.goto('about:blank'); });
test('combined site runs without external services and preserves a real 2D career through 3D play', async ({ page, context, baseURL }, info) => {
  test.setTimeout(180000);
  const origin = new URL(baseURL!).origin;
  const errors: string[] = [], assets: string[] = [];
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin !== origin) {
      errors.push(`External runtime dependency: ${route.request().url()}`);
      return route.abort();
    }
    return route.continue();
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    assets.push(new URL(response.url()).pathname);
  });
  await page.goto('../');
  await page.waitForFunction(() => (window as Window & { AV_TECH_RPG_READY?: boolean }).AV_TECH_RPG_READY === true);
  await page.getByRole('button', { name: 'New Career', exact: true }).click();
  await page.locator('.technician-card').filter({ has: page.getByRole('heading', { name: 'Alex', exact: true }) })
    .getByRole('button', { name: 'Start First Day' }).click();
  await expect(page.locator('#tech-name')).toContainText('Alex');
  const career = await page.evaluate(() => localStorage.getItem('av-tech-rpg-save-v1'));
  expect(career).toBeTruthy();
  await page.goto('./?debug=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('button', { name: 'Pause / settings' }).click();
  await page.getByRole('combobox', { name: 'Graphics quality' }).selectOption('low');
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.keyboard.down('w');
  try { await page.waitForFunction(() => window.__AV3D__!.snapshot().position[2]! > -1, null, { timeout: 20000 }); }
  finally { await page.keyboard.up('w'); }
  await page.keyboard.press('e');
  await expect(page.getByRole('heading', { name: 'Workbench checked', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to shop' }).click();
  await page.reload();
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  expect(await page.evaluate(() => window.__AV3D__!.snapshot().completedActions)).toContain('shop.inspect-workbench');
  expect(await page.evaluate(() => localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);
  for (const suffix of ['.js', '.css', '/technician.glb', '/engineering-toolcase.glb', '/shop-lighting.env']) {
    expect(assets.some(asset => asset.endsWith(suffix)), suffix).toBe(true);
  }
  await page.getByRole('link', { name: 'Original 2D career' }).click();
  await page.waitForFunction(() => (window as Window & { AV_TECH_RPG_READY?: boolean }).AV_TECH_RPG_READY === true);
  expect(await page.evaluate(() => localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);
  await page.getByRole('button', { name: 'Continue Career', exact: true }).click();
  await expect(page.locator('#tech-name')).toContainText('Alex');
  await page.screenshot({ path: info.outputPath('continued-2d-career.png') });
  expect(errors).toEqual([]);
});
