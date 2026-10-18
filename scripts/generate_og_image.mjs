import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040D0B"/>
      <stop offset="50%" stop-color="#081A16"/>
      <stop offset="100%" stop-color="#0F2823"/>
    </linearGradient>
    
    <radialGradient id="emeraldGlow" cx="80%" cy="25%" r="65%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#059669" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="goldGlow" cx="20%" cy="85%" r="55%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.15"/>
      <stop offset="60%" stop-color="#D97706" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10B981" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#132B25" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0B1A17" stop-opacity="0.95"/>
    </linearGradient>

    <linearGradient id="accentBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#34D399" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.3"/>
    </linearGradient>

    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#059669" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Background base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#emeraldGlow)"/>
  <rect width="1200" height="630" fill="url(#goldGlow)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Outer frame border with glowing inset -->
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="#10B981" stroke-opacity="0.18" stroke-width="1.5"/>

  <!-- Top bar: Brand + Tagline Pill + Domain -->
  <g transform="translate(64, 60)">
    <!-- Brand Icon -->
    <rect x="0" y="0" width="48" height="48" rx="12" fill="#10B981"/>
    <!-- Icon Symbol -->
    <path d="M14 24 L22 16 L22 32 Z M26 16 L34 24 L26 32 Z" fill="#040D0B"/>
    <text x="64" y="33" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="-0.5">FinFormat</text>
    
    <!-- Privacy Pill -->
    <rect x="230" y="8" width="260" height="32" rx="16" fill="url(#pillGrad)" stroke="#10B981" stroke-opacity="0.4" stroke-width="1"/>
    <circle cx="248" cy="24" r="4" fill="#34D399"/>
    <text x="262" y="29" fill="#A7F3D0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">100% IN-BROWSER &amp; PRIVATE</text>

    <!-- Domain badge -->
    <rect x="912" y="8" width="160" height="32" rx="8" fill="#0B1A17" stroke="#10B981" stroke-opacity="0.25" stroke-width="1"/>
    <text x="992" y="29" text-anchor="middle" fill="#6EE7B7" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600">finformat.pages.dev</text>
  </g>

  <!-- Hero Content -->
  <g transform="translate(64, 160)">
    <!-- Category label -->
    <text x="0" y="16" fill="#F59E0B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2">FINANCIAL FILE CONVERSION SUITE</text>

    <!-- Main Headline -->
    <text x="0" y="66" fill="#F9FAFB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="800" letter-spacing="-1">Bank Statement &amp; File Converter</text>
    <text x="0" y="118" fill="#34D399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="42" font-weight="800" letter-spacing="-1">for QuickBooks, Quicken &amp; Xero</text>

    <!-- Subhead -->
    <text x="0" y="168" fill="#9CA3AF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="400">
      Convert bank CSVs, PDFs, OFX, and QIF files into clean QuickBooks Web Connect (.qbo).
    </text>
    <text x="0" y="196" fill="#9CA3AF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="400">
      Zero server uploads — all data parsing happens securely right inside your browser.
    </text>
  </g>

  <!-- Feature Cards / Badges Row -->
  <g transform="translate(64, 410)">
    <!-- Card 1: CSV to QBO -->
    <rect x="0" y="0" width="248" height="92" rx="14" fill="url(#cardGrad)" stroke="#10B981" stroke-opacity="0.3" stroke-width="1"/>
    <text x="20" y="32" fill="#E5E7EB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700">CSV ➔ QBO</text>
    <text x="20" y="54" fill="#9CA3AF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12">QuickBooks Web Connect</text>
    <text x="20" y="74" fill="#34D399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600">RFC-4180 • Strict FitID</text>

    <!-- Card 2: PDF to CSV/QBO -->
    <rect x="272" y="0" width="248" height="92" rx="14" fill="url(#cardGrad)" stroke="#10B981" stroke-opacity="0.3" stroke-width="1"/>
    <text x="292" y="32" fill="#E5E7EB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700">PDF ➔ CSV / QBO</text>
    <text x="292" y="54" fill="#9CA3AF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12">Bank Statement OCR</text>
    <text x="292" y="74" fill="#34D399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600">Multi-Page Table Parser</text>

    <!-- Card 3: 35+ Bank Presets -->
    <rect x="544" y="0" width="248" height="92" rx="14" fill="url(#cardGrad)" stroke="#10B981" stroke-opacity="0.3" stroke-width="1"/>
    <text x="564" y="32" fill="#E5E7EB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700">35+ US Bank Presets</text>
    <text x="564" y="54" fill="#9CA3AF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12">Chase, Wells Fargo, BofA</text>
    <text x="564" y="74" fill="#34D399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600">Auto-Detect Dialect</text>

    <!-- Card 4: Security Guarantee -->
    <rect x="816" y="0" width="256" height="92" rx="14" fill="url(#cardGrad)" stroke="#10B981" stroke-opacity="0.3" stroke-width="1"/>
    <text x="836" y="32" fill="#E5E7EB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700">🔒 100% Client-Side</text>
    <text x="836" y="54" fill="#9CA3AF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12">Zero Server Storage</text>
    <text x="836" y="74" fill="#34D399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600">Never Leaves Your Machine</text>
  </g>

  <!-- Bottom trust strip -->
  <g transform="translate(64, 552)">
    <text x="0" y="16" fill="#6B7280" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13">
      Free &amp; Unlimited • No Account Required • Client-Side WebAssembly &amp; Web Workers • Works Offline
    </text>
  </g>
</svg>
`;

async function run() {
  const outputPath = path.resolve('public/images/og-image.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 95 })
    .toFile(outputPath);
  console.log('Successfully generated OG image at:', outputPath);
}

run().catch(console.error);
