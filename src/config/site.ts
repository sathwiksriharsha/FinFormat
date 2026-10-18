const siteUrl = process.env.PUBLIC_SITE_URL || 'https://finformat.pages.dev';

export const SITE = {
  name: 'FinFormat',
  title: 'FinFormat — 100% Client-Side US Bank Statement & Accounting File Converter',
  description: 'Convert, repair, and clean bank & credit card statements (CSV, QBO, OFX, QFX, IIF, QIF, MT940, CAMT.053) for QuickBooks, Xero, and Excel. 100% private in browser memory.',
  url: siteUrl,
  canonicalDomain: siteUrl,
  disclaimer: 'FinFormat is an independent utility and is not affiliated with, endorsed by, or sponsored by Intuit Inc. (QuickBooks®, Quicken®), Xero Limited, or any referenced financial institution. All trademarks are the property of their respective owners.',
  nav: [
    { label: 'Converters', href: '/#converters' },
    { label: 'Bank Presets', href: '/#banks' },
    { label: 'INTU.BID Lookup', href: '/intu-bid-lookup' },
    { label: 'Security & Privacy', href: '/security-privacy' },
    { label: 'Documentation', href: '/documentation' }
  ],
  footerLinks: [
    { label: 'CSV to QBO', href: '/csv-to-qbo' },
    { label: 'QBO to CSV', href: '/qbo-to-csv' },
    { label: 'CSV to IIF', href: '/csv-to-iif' },
    { label: 'QBO to IIF', href: '/qbo-to-iif' },
    { label: 'Fix QuickBooks OL-222', href: '/fix-quickbooks-ol-222-error' },
    { label: 'Fix QuickBooks OL-301', href: '/fix-quickbooks-ol-301-error' },
    { label: 'INTU.BID Directory', href: '/intu-bid-lookup' },
    { label: 'Batch Merge Files', href: '/merge-qbo-ofx-files' },
    { label: 'About', href: '/about' },
    { label: 'Security & Privacy', href: '/security-privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' }
  ]
};
