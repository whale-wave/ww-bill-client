import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

// Run against the existing local development server; no account or real business data required.
const origin = process.env.STUDIO_URL ?? 'http://localhost:3231';
const artifacts = mkdtempSync(join(tmpdir(), 'ww-studio-ios-'));
const browser = await chromium.launch({ headless: true });
const errors = [];
const writes = [];
const results = [];
const viewportWidths = (process.env.STUDIO_VIEWPORT_WIDTHS ?? '375,430').split(',').map(value => Number(value.trim())).filter(Number.isFinite);
const theme = (page, template = 'konsta-ios', overrides = {}) => page.evaluate(({ template, overrides }) => window.postMessage({ type: 'ww-design-studio:theme', template, overrides }, location.origin), { template, overrides });
const wait = page => page.waitForTimeout(500);
try {
  for (const width of viewportWidths) {
    const page = await browser.newPage({ viewport: { width, height: 820 }, hasTouch: true });
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && request.resourceType() !== 'websocket')
        writes.push(request.url());
    });
    await page.goto(`${origin}/#/design-system/preview?tab=showcase`);
    await page.locator('[data-design-studio-preview]').waitFor();
    await theme(page);
    await wait(page);
    for (const tab of ['showcase', 'detail', 'chart', 'create', 'discovery', 'mine', 'asset-overview']) {
      await page.evaluate((tab) => {
        location.hash = `#/design-system/preview?tab=${tab}`;
      }, tab);
      await page.waitForTimeout(1400); // Allow chart drawing as well as theme/selection transitions to settle.
      const scrollContainer = page.locator('[data-design-studio-preview]');
      await scrollContainer.evaluate((element) => {
        element.scrollTop = 0;
      });
      const metrics = await scrollContainer.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
      assert.ok(metrics.scrollWidth <= metrics.width + 1, `${width}/${tab} overflow`);
      if (['detail', 'chart', 'discovery', 'mine', 'asset-overview'].includes(tab))
        assert.equal(await page.locator('.studio-ios-navbar').count(), 0, `${width}/${tab} has a candidate navbar`);
      if (tab === 'create') {
        assert.equal(await page.getByRole('button', { name: '返回预览', exact: true }).count(), 1, `${width}/create lacks the existing back example`);
        assert.equal(await page.getByRole('button', { name: '返回预览', exact: true }).evaluate(element => element.getBoundingClientRect().width), 44);
      }
      await page.screenshot({ path: join(artifacts, `${tab}-${width}.png`) });
      if (tab === 'asset-overview') {
        const navigationPage = page.locator('[data-studio-navigation-example="true"]');
        const back = page.getByRole('button', { name: '返回', exact: true });
        assert.equal(await back.count(), 1);
        assert.equal(await back.evaluate(element => element.getBoundingClientRect().width), 44);
        assert.equal(await scrollContainer.getAttribute('data-local-scroll'), 'true');
        assert.equal(await scrollContainer.evaluate(element => getComputedStyle(element).overflowY), 'hidden');
        const scrollMetrics = await navigationPage.evaluate(element => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
        assert.ok(scrollMetrics.scrollHeight > scrollMetrics.clientHeight, `${width}/asset-overview is not scrollable`);
        await page.mouse.move(width / 2, 400);
        await page.mouse.wheel(0, 220);
        await wait(page);
        assert.equal(await scrollContainer.evaluate(element => element.scrollTop), 0);
        assert.ok(await navigationPage.evaluate(element => element.scrollTop > 4));
        const contentUnderHeader = await navigationPage.evaluate((element) => {
          const headerElement = element.querySelector('[data-page-header]');
          const contentElement = element.querySelector('main');
          if (!headerElement || !contentElement)
            return false;
          const header = headerElement.getBoundingClientRect();
          const content = contentElement.getBoundingClientRect();
          return content.top < header.bottom;
        });
        assert.equal(contentUnderHeader, true);
        const navbarBackground = await page.locator('[data-studio-navigation-example="true"] [data-page-header]').evaluate((element) => {
          const pseudo = getComputedStyle(element, '::before');
          return { backdropFilter: pseudo.backdropFilter, background: pseudo.backgroundColor, opacity: pseudo.opacity };
        });
        assert.equal(navbarBackground.opacity, '1');
        assert.equal(navbarBackground.background, 'rgba(0, 0, 0, 0)');
        assert.ok(navbarBackground.backdropFilter.includes('blur(2px)'));
        await page.screenshot({ path: join(artifacts, `asset-overview-scrolled-${width}.png`) });
      }
      results.push({ width, tab, ...metrics });
    }
    await page.evaluate(() => {
      location.hash = '#/design-system/preview?tab=showcase';
    });
    await wait(page);
    const segment = page.getByRole('radio', { name: '本月', exact: true });
    await segment.click();
    assert.equal(await segment.getAttribute('aria-checked'), 'true');
    await page.locator('.studio-ios-field').filter({ hasText: '浮动备注' }).locator('input').fill('晚餐');
    assert.equal(await page.locator('.studio-ios-field').filter({ hasText: '浮动备注' }).getAttribute('data-empty'), 'false');
    const search = page.getByRole('searchbox');
    await search.fill('午餐');
    assert.equal(await page.locator('.studio-ios-searchbar').getAttribute('data-enabled'), 'true');
    await page.getByRole('button', { name: '取消搜索' }).click();
    assert.equal(await search.inputValue(), '');
    const toggle = page.getByRole('switch', { name: '显示金额', exact: true });
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-checked'), 'false');
    await page.getByRole('button', { name: '更新进度' }).click();
    assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '50');
    assert.equal(await page.getByRole('switch', { name: '禁用开关' }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: '不可用' }).isDisabled(), true);
    await page.getByRole('button', { name: '确认弹窗', exact: true }).click();
    await wait(page);
    const dialog = page.locator('dialog');
    assert.equal(await dialog.evaluate(element => element.open), true);
    assert.equal(await dialog.getAttribute('data-open'), 'true');
    assert.equal(await dialog.locator('.studio-ios-overlay-mask').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0.5)');
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog'))), true);
    await page.screenshot({ path: join(artifacts, `dialog-${width}.png`) });
    await page.keyboard.press('Escape');
    await wait(page);
    assert.equal(await dialog.evaluate(element => element.open), false);
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), '确认弹窗');
    await page.getByRole('button', { name: '底部弹层', exact: true }).click();
    await wait(page);
    assert.equal(await dialog.getAttribute('data-kind'), 'sheet');
    await page.screenshot({ path: join(artifacts, `sheet-${width}.png`) });
    await page.getByRole('button', { name: '关闭浮层预览', exact: true }).click();
    await wait(page);
    await page.evaluate(() => window.postMessage({ type: 'ww-design-studio:motion', reduced: true }, location.origin));
    await wait(page);
    assert.equal(await page.locator('[data-design-studio-preview]').getAttribute('data-motion-enabled'), 'false');
    await page.getByRole('button', { name: '确认弹窗', exact: true }).click();
    assert.equal(await dialog.locator('.studio-ios-overlay-panel').evaluate(element => getComputedStyle(element).transitionDuration), '0s');
    await page.keyboard.press('Escape');
    await wait(page);
    await theme(page, 'konsta-ios', { '--ww-ios-press-scale': '1.08', '--ww-ios-overlay-duration': '350ms' });
    await wait(page);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ww-ios-press-scale').trim()), '1.08');
    await theme(page, 'glass');
    await wait(page);
    assert.equal(await page.locator('.studio-ios-field').count(), 0);
    assert.equal(await page.locator('dialog').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--ww-ios-press-scale')), '');
    await theme(page);
    await wait(page);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ww-ios-press-scale').trim()), '1.12');
    // Dispatch a real touch sequence to verify follow/release and native click suppression together.
    const navBox = await page.getByRole('tablist').boundingBox();
    assert.ok(navBox);
    const session = await page.context().newCDPSession(page);
    const y = navBox.y + navBox.height / 2;
    const x = navBox.x + navBox.width / 10;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: navBox.x + navBox.width * 0.9, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(page);
    assert.ok(page.url().endsWith('tab=mine'), `touch release selected wrong tab: ${page.url()}`);
    await page.close();
  }
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto(`${origin}/#/design-system/preview?tab=showcase`);
  await reducedPage.locator('[data-design-studio-preview]').waitFor();
  await theme(reducedPage);
  await wait(reducedPage);
  assert.equal(await reducedPage.locator('[data-design-studio-preview]').getAttribute('data-motion-enabled'), 'false');
  await reducedPage.close();
  const consolePage = await browser.newPage({ viewport: { width: 1540, height: 1000 } });
  consolePage.on('pageerror', error => errors.push(error.message));
  await consolePage.goto(`${origin}/#/design-system`);
  await consolePage.locator('iframe').waitFor();
  await consolePage.locator('.design-studio__template').filter({ hasText: 'konsta-ios' }).click();
  await consolePage.getByRole('button', { name: '风格组件', exact: true }).click();
  await wait(consolePage);
  const preview = consolePage.frames().find(frame => frame.url().includes('/preview'));
  assert.ok(preview);
  assert.equal(await preview.evaluate(() => innerWidth), 375);
  const pressInput = consolePage.getByLabel('iOS 候选 · 按压比例 自定义值', { exact: true });
  await pressInput.evaluate((element) => {
    element.closest('details').open = true;
  });
  await pressInput.fill('1.08');
  await wait(consolePage);
  assert.equal(await preview.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ww-ios-press-scale').trim()), '1.08');
  await consolePage.getByRole('button', { name: '保存记录', exact: true }).click();
  const recordId = await consolePage.getByLabel('选择调试记录').inputValue();
  assert.ok(recordId);
  await consolePage.getByRole('button', { name: '复制 JSON', exact: true }).click();
  const exported = JSON.parse(await consolePage.getByLabel('导出内容').inputValue());
  assert.equal(exported.tokens['--ww-ios-press-scale'], '1.08');
  assert.ok(exported.requiresStyleSupport);
  await consolePage.locator('.design-studio__template').filter({ hasText: '玻璃鲸浪' }).click();
  await wait(consolePage);
  await consolePage.getByLabel('选择调试记录').selectOption(recordId);
  await wait(consolePage);
  assert.equal(await preview.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ww-ios-press-scale').trim()), '1.08');
  await consolePage.getByRole('button', { name: '重置当前主题', exact: true }).click();
  await wait(consolePage);
  assert.equal(await preview.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ww-ios-press-scale').trim()), '1.12');
  await consolePage.getByLabel('减少动态效果', { exact: true }).check();
  await wait(consolePage);
  assert.equal(await preview.locator('[data-design-studio-preview]').getAttribute('data-motion-enabled'), 'false');
  await consolePage.getByLabel('减少动态效果', { exact: true }).uncheck();
  await consolePage.getByRole('button', { name: '检查预览元素', exact: true }).click();
  await preview.locator('.studio-ios-toggle-thumb-glass').first().click({ force: true });
  await wait(consolePage);
  assert.equal(await consolePage.getByRole('combobox', { name: 'iOS 候选 · thumb 材质', exact: true }).count(), 1);
  assert.equal(await consolePage.getByLabel('玻璃 · 边缘高光 颜色', { exact: true }).count(), 1);
  await consolePage.getByRole('button', { name: '退出元素检查', exact: true }).click();
  await preview.getByRole('button', { name: '确认弹窗', exact: true }).click();
  await wait(consolePage);
  assert.ok((await preview.locator('.studio-ios-overlay-panel').evaluate(element => getComputedStyle(element).backdropFilter)).includes('blur(20px)'));
  await preview.locator('dialog').screenshot({ path: join(artifacts, 'dialog-blur-final.png') });
  await consolePage.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, []);
  writeFileSync(join(artifacts, 'results.json'), JSON.stringify({ results, errors, writes, interactions: 'passed' }, null, 2));
  console.log(`Studio iOS: ${results.length} viewport/page checks and interaction/isolation checks passed. Artifacts: ${artifacts}`);
}
finally {
  await browser.close();
}
