import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { FORMAT_ROUTES } from '../config/formatRoutes';
import { BANK_PRESETS } from '../config/bankPresets';

describe('Responsive Layout Invariants & Mobile-First Spec', () => {

  it('ensures all built static HTML files contain responsive viewport meta tags', () => {
    const distDir = path.resolve(process.cwd(), 'dist');
    expect(fs.existsSync(distDir)).toBe(true);

    const routesToCheck = [
      'index.html',
      'security-privacy/index.html',
      'documentation/index.html',
      'intu-bid-lookup/index.html',
      'about/index.html',
      'contact/index.html',
      'privacy/index.html',
      'terms/index.html',
      'csv-to-qbo/index.html',
      'fix-quickbooks-ol-222-error/index.html',
      'banks/chase-csv-to-qbo/index.html',
      'banks/american-express-csv-to-qbo/index.html'
    ];

    routesToCheck.forEach(relativePath => {
      const fullPath = path.join(distDir, relativePath);
      expect(fs.existsSync(fullPath), `Route file ${relativePath} must exist in dist`).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0"');
      expect(content).toContain('FinFormat');
    });
  });

  it('verifies mobile navigation drawer and touch accessibility elements are rendered with default display none', () => {
    const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
    expect(indexHtml).toContain('id="mobileMenuToggle"');
    expect(indexHtml).toContain('id="mobileNavDrawer"');
    expect(indexHtml).toContain('style="display: none;"');
    expect(indexHtml).toContain('aria-controls="mobileNavDrawer"');
    expect(indexHtml).toContain('id="mobileDrawerBackdrop"');
    expect(indexHtml).toContain('mobile-drawer-link');
  });

  it('verifies responsive table horizontal scroll wrappers and hints are rendered in workspace', () => {
    const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
    expect(indexHtml).toContain('class="table-scroll-wrapper"');
    expect(indexHtml).toContain('class="mobile-table-hint"');
    expect(indexHtml).toContain('format-selector-row');
    expect(indexHtml).toContain('download-action-row');
  });

  it('confirms 60+ routes have valid slugs with no dots or malformed URLs', () => {
    FORMAT_ROUTES.forEach(r => {
      expect(r.slug).not.toContain('.');
      expect(r.slug).not.toContain('//');
      expect(r.slug).toBe(r.slug.toLowerCase());
    });

    BANK_PRESETS.forEach(b => {
      expect(b.slug).not.toContain('.');
      expect(b.slug).toBe(b.slug.toLowerCase());
      expect(b.intuBid).toMatch(/^\d+$/);
    });
  });

  it('validates design-tokens.css includes responsive breakpoints and reduced-motion rules', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/design-tokens.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('@media (max-width: 480px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('table-scroll-wrapper');
  });
});
