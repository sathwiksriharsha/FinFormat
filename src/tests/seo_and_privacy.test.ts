import { describe, it, expect } from 'vitest';
import { SITE } from '../config/site';
import { FORMAT_ROUTES } from '../config/formatRoutes';
import { BANK_PRESETS } from '../config/bankPresets';
import { INTU_BID_DIRECTORY } from '../config/intuBidDirectory';

describe('FinFormat SEO, Canonical & Privacy Architecture', () => {

  it('unifies brand name as FinFormat and canonical domain strictly', () => {
    expect(SITE.name).toBe('FinFormat');
    expect(SITE.url).toMatch(/^https:\/\/(finformat\.pages\.dev|localhost)/);
    expect(SITE.canonicalDomain).toBe(SITE.url);
  });

  it('guarantees ZERO literal dots in any route slug (preventing dot-in-slug server bugs)', () => {
    // Audit all 25 core format routes
    for (const r of FORMAT_ROUTES) {
      expect(r.slug).not.toContain('.');
      expect(r.slug).toMatch(/^[a-z0-9-]+$/);
    }

    // Specifically verify CAMT.053 is mapped as camt053
    const camt = FORMAT_ROUTES.find(r => r.slug.includes('camt'));
    expect(camt?.slug).toBe('camt053-to-csv');

    // Audit all 35 bank preset routes
    for (const b of BANK_PRESETS) {
      expect(b.slug).not.toContain('.');
      expect(b.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('ensures 100% of routes have unique slugs, titles, and meta descriptions', () => {
    const slugs = new Set<string>();
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const r of FORMAT_ROUTES) {
      expect(slugs.has(r.slug)).toBe(false);
      slugs.add(r.slug);

      expect(titles.has(r.title)).toBe(false);
      titles.add(r.title);

      expect(descriptions.has(r.metaDescription)).toBe(false);
      descriptions.add(r.metaDescription);
    }

    const bankSlugs = new Set<string>();
    for (const b of BANK_PRESETS) {
      expect(bankSlugs.has(b.slug)).toBe(false);
      bankSlugs.add(b.slug);
    }

    // Verify minimum counts: 25 format routes + 35 bank presets = 60+ static routes
    expect(FORMAT_ROUTES.length).toBeGreaterThanOrEqual(25);
    expect(BANK_PRESETS.length).toBeGreaterThanOrEqual(35);
  });

  it('verifies INTU.BID directory has verified bank IDs and fallbacks', () => {
    expect(INTU_BID_DIRECTORY.length).toBeGreaterThanOrEqual(50);
    // Universal Wells Fargo fallback must exist
    const fallback = INTU_BID_DIRECTORY.find(b => b.fid === '3000');
    expect(fallback).toBeDefined();
    expect(fallback?.name).toContain('Wells Fargo');

    // Major banks
    expect(INTU_BID_DIRECTORY.find(b => b.fid === '10898')).toBeDefined(); // Chase
    expect(INTU_BID_DIRECTORY.find(b => b.fid === '6812')).toBeDefined();  // BofA
    expect(INTU_BID_DIRECTORY.find(b => b.fid === '3101')).toBeDefined();  // Amex
    expect(INTU_BID_DIRECTORY.find(b => b.fid === '12368')).toBeDefined(); // Capital One
  });

  it('verifies non-affiliation trademark disclaimers are present', () => {
    expect(SITE.disclaimer).toContain('FinFormat is an independent utility');
    expect(SITE.disclaimer).toContain('Intuit Inc.');
    expect(SITE.disclaimer).toContain('QuickBooks®');
  });

  it('verifies dist/sitemap-index.xml, robots.txt, _headers, and _redirects exist for Cloudflare Pages', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const distDir = path.resolve(__dirname, '../../dist');

    // If dist doesn't exist yet in a cold environment, skip or ensure build has run
    if (!fs.existsSync(distDir)) {
      return;
    }

    // 1. dist/sitemap-index.xml & dist/sitemap-0.xml
    const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
    expect(fs.existsSync(sitemapIndexPath)).toBe(true);
    const sitemapIndex = fs.readFileSync(sitemapIndexPath, 'utf-8');
    expect(sitemapIndex).toContain('https://finformat.pages.dev/sitemap-0.xml');

    const sitemap0Path = path.join(distDir, 'sitemap-0.xml');
    expect(fs.existsSync(sitemap0Path)).toBe(true);
    const sitemap0 = fs.readFileSync(sitemap0Path, 'utf-8');
    expect(sitemap0).toContain('https://finformat.pages.dev/');
    expect(sitemap0).toContain('https://finformat.pages.dev/csv-to-qbo/');

    // 2. dist/robots.txt
    const robotsPath = path.join(distDir, 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);
    const robots = fs.readFileSync(robotsPath, 'utf-8');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('https://finformat.pages.dev/sitemap-index.xml');

    // 3. dist/_headers (Cloudflare security headers)
    const headersPath = path.join(distDir, '_headers');
    expect(fs.existsSync(headersPath)).toBe(true);
    const headers = fs.readFileSync(headersPath, 'utf-8');
    expect(headers).toContain('X-Frame-Options: DENY');
    expect(headers).toContain('X-Content-Type-Options: nosniff');

    // 4. dist/_redirects (Cloudflare 301 redirects)
    const redirectsPath = path.join(distDir, '_redirects');
    expect(fs.existsSync(redirectsPath)).toBe(true);
    const redirects = fs.readFileSync(redirectsPath, 'utf-8');
    expect(redirects).toContain('/camt053-to-csv');
  });

  it('audits all built HTML files in dist/ to ensure 0 broken internal links', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const distDir = path.resolve(__dirname, '../../dist');

    if (!fs.existsSync(distDir)) {
      return;
    }

    function getAllHtmlFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(getAllHtmlFiles(fullPath));
        } else if (file.endsWith('.html')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const htmlFiles = getAllHtmlFiles(distDir);
    expect(htmlFiles.length).toBeGreaterThanOrEqual(68);

    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    const brokenLinks: { sourceFile: string; href: string }[] = [];
    let scannedLinksCount = 0;

    for (const filePath of htmlFiles) {
      const html = fs.readFileSync(filePath, 'utf-8');
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];

        // Only audit root-relative internal links
        if (href.startsWith('/') && !href.startsWith('//')) {
          scannedLinksCount++;
          const [pathname] = href.split('#')[0].split('?');
          if (!pathname || pathname === '/') {
            if (!fs.existsSync(path.join(distDir, 'index.html'))) {
              brokenLinks.push({ sourceFile: path.relative(distDir, filePath), href });
            }
            continue;
          }

          const cleanPath = pathname.replace(/^\//, '').replace(/\/$/, '');
          const candidateDirectoryIndex = path.join(distDir, cleanPath, 'index.html');
          const candidateExactFile = path.join(distDir, cleanPath);
          const candidateHtmlFile = path.join(distDir, cleanPath + '.html');

          const exists = fs.existsSync(candidateDirectoryIndex) ||
                         fs.existsSync(candidateExactFile) ||
                         fs.existsSync(candidateHtmlFile);

          if (!exists) {
            brokenLinks.push({ sourceFile: path.relative(distDir, filePath), href });
          }
        }
      }
    }

    expect(scannedLinksCount).toBeGreaterThan(100);
    expect(brokenLinks).toEqual([]);
  });

});

