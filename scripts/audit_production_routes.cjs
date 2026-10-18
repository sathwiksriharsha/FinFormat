const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4322';
const VIEWPORTS = [
  { name: '320px (iPhone SE 1st gen)', width: 320, height: 568 },
  { name: '375px (iPhone SE / Mini)', width: 375, height: 667 },
  { name: '390px (iPhone 12/13/14 Pro)', width: 390, height: 844 },
  { name: '430px (iPhone 14/15/16 Pro Max)', width: 430, height: 932 }
];

function getHtmlRoutes(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlRoutes(fullPath, path.join(base, file)));
    } else if (file === 'index.html') {
      const route = base.replace(/\\/g, '/');
      results.push(route ? `/${route}` : '/');
    }
  }
  return results;
}

(async () => {
  const routes = getHtmlRoutes(path.resolve(__dirname, '../dist'));
  console.log(`Found ${routes.length} production routes to audit.`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
    .catch(() => chromium.launch({ channel: 'msedge', headless: true }));

  const results = [];
  let totalEvaluations = 0;
  let passedEvaluations = 0;
  let failedEvaluations = 0;

  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      totalEvaluations++;
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      });
      const page = await context.newPage();

      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('requestfailed', req => {
        failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText || 'failed'})`);
      });

      page.on('response', res => {
        if (res.status() >= 400) {
          failedRequests.push(`${res.status()} ${res.url()}`);
        }
      });

      let pageOverflow = false;
      let overflowingElements = [];
      let loadSuccess = false;

      try {
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (response && response.status() < 400) {
          loadSuccess = true;
          // Wait briefly for layout stability
          await page.waitForTimeout(100);

          const overflowData = await page.evaluate((vpWidth) => {
            const docWidth = document.documentElement.offsetWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            const windowInnerWidth = window.innerWidth;

            const isOverflow = (scrollWidth > windowInnerWidth + 1) || (bodyScrollWidth > windowInnerWidth + 1);

            const offenders = [];
            if (isOverflow) {
              const allElements = document.querySelectorAll('*');
              for (const el of allElements) {
                const rect = el.getBoundingClientRect();
                if (rect.right > windowInnerWidth + 2) {
                  offenders.push({
                    tag: el.tagName.toLowerCase(),
                    className: (el.className || '').toString().slice(0, 50),
                    id: el.id,
                    right: Math.round(rect.right),
                    width: Math.round(rect.width)
                  });
                }
              }
            }

            return {
              isOverflow,
              docWidth,
              scrollWidth,
              bodyScrollWidth,
              windowInnerWidth,
              offenders: offenders.slice(0, 5)
            };
          }, vp.width);

          pageOverflow = overflowData.isOverflow;
          overflowingElements = overflowData.offenders;
        } else {
          failedRequests.push(`HTTP ${response?.status() || 'none'}`);
        }
      } catch (err) {
        consoleErrors.push(`Navigation error: ${err.message}`);
      }

      const passed = loadSuccess && !pageOverflow && consoleErrors.length === 0 && failedRequests.length === 0;

      if (passed) passedEvaluations++;
      else failedEvaluations++;

      results.push({
        route,
        viewportWidth: vp.width,
        viewportName: vp.name,
        overflowResult: pageOverflow ? `OVERFLOW (scrollWidth > ${vp.width}px)` : 'None (0px overflow)',
        overflowingElements,
        consoleErrors,
        failedRequests,
        status: passed ? 'PASS' : 'FAIL'
      });

      await context.close();
    }
    process.stdout.write(`.` );
  }

  console.log(`\n\nAudit Completed.`);
  console.log(`Total evaluations: ${totalEvaluations} (68 routes x 4 viewports)`);
  console.log(`Passed: ${passedEvaluations}`);
  console.log(`Failed: ${failedEvaluations}`);

  const outputPath = path.resolve(__dirname, '../dist/qa-route-matrix.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Results saved to ${outputPath}`);

  const summaryPath = path.resolve(__dirname, '../dist/qa-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    totalRoutes: routes.length,
    viewportsTested: VIEWPORTS.map(v => v.width),
    totalEvaluations,
    passedEvaluations,
    failedEvaluations,
    failedList: results.filter(r => r.status === 'FAIL')
  }, null, 2), 'utf-8');

  await browser.close();
})();
