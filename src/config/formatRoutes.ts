import type { FormatRoute } from '../utils/types';

export const FORMAT_ROUTES: FormatRoute[] = [
  {
    slug: 'csv-to-qbo',
    title: 'CSV to QBO Converter — Convert Bank CSV to QuickBooks Web Connect',
    h1: 'Convert Bank CSV to QuickBooks QBO Web Connect',
    sourceFormat: 'CSV',
    targetFormat: 'QBO',
    metaDescription: 'Convert bank and credit card CSV exports to QuickBooks Online and Desktop Web Connect (.QBO) format. Automatic OL-222 sanitization and INTU.BID injection.',
    summary: 'Turn any bank or credit card CSV download into an official QuickBooks Web Connect (.QBO) file with valid OFX 1.02 SGML headers.',
    whyNeeded: 'QuickBooks Online and Desktop frequently reject generic CSV files due to date format mismatches, inverted credit card signs, or missing FITID transaction codes. Converting to native .QBO guarantees seamless 1-click import into bank feeds.',
    technicalDetails: [
      'Emits valid OFX 1.02 SGML specification with CRLF line endings',
      'Includes mandatory <INTU.BID> bank identifier tag (default: 3000 Wells Fargo universal)',
      'Sanitizes special characters (&, <, >, :) to prevent Error OL-222',
      'Generates deterministic FITID hashes (YYYYMMDD + hash) to eliminate duplicate imports',
      'Includes required <LEDGERBAL><BALAMT>0.00 block to prevent import rejection'
    ],
    faq: [
      { question: 'Will this work with QuickBooks Online and QuickBooks Desktop?', answer: 'Yes. FinFormat generates standard Web Connect .QBO files supported by QuickBooks Online (Simple Start, Essentials, Plus, Advanced) and all versions of QuickBooks Desktop (Pro, Premier, Enterprise).' },
      { question: 'What bank FID should I use?', answer: 'FinFormat defaults to 3000 (Wells Fargo), which is universally accepted by all Intuit software regardless of active subscriptions. You can also select your specific bank FID from the dropdown.' },
      { question: 'Are my financial records uploaded to any server?', answer: 'Never. The entire parsing, sanitization, and QBO generation process runs client-side in your browser RAM. Zero bytes are uploaded.' }
    ]
  },
  {
    slug: 'qbo-to-csv',
    title: 'QBO to CSV & Excel Converter — Open QuickBooks Files in Spreadsheets',
    h1: 'Convert QuickBooks QBO to CSV and Excel',
    sourceFormat: 'QBO',
    targetFormat: 'CSV',
    metaDescription: 'Convert QuickBooks Web Connect (.QBO) files into clean, readable CSV and Excel spreadsheets. Works 100% in browser with zero server uploads.',
    summary: 'Extract transactions from archaic SGML .QBO files into clean CSV format ready for Microsoft Excel, Google Sheets, or Apple Numbers.',
    whyNeeded: 'QuickBooks Web Connect files use unclosed 1997 SGML tags (e.g. <TRNAMT>-45.99 without a closing tag), which breaks standard XML importers and Power Query in Excel.',
    technicalDetails: [
      'Dual-parser handles unclosed SGML tags and strict XML tags',
      'Extracts posted date, amount, transaction type, payee name, memo, and FITID',
      'Formats dates to standard ISO YYYY-MM-DD or US MM/DD/YYYY',
      'Preserves sign convention (+ for deposits, - for expenses)'
    ],
    faq: [
      { question: 'Why can’t Excel open .QBO files directly?', answer: 'Excel expects modern XML with closing tags. OFX 1.02 SGML used in .QBO files omits closing tags on value fields, causing Excel XML parser errors.' },
      { question: 'Can I copy the table directly to Google Sheets?', answer: 'Yes, FinFormat includes a 1-click "Copy Table (TSV)" button to paste directly into Google Sheets or Excel.' }
    ]
  },
  {
    slug: 'csv-to-iif',
    title: 'CSV to IIF Converter — Balanced QuickBooks Desktop Import',
    h1: 'Convert CSV to QuickBooks Desktop IIF Format',
    sourceFormat: 'CSV',
    targetFormat: 'IIF',
    metaDescription: 'Convert bank and credit card CSV exports to QuickBooks Desktop .IIF format. Generates balanced double-entry TRNS and SPL transactions.',
    summary: 'Create mathematically balanced .IIF files for QuickBooks Desktop with proper TRNS, SPL, and ENDTRNS double-entry blocks.',
    whyNeeded: 'Intuit discontinues older versions of QuickBooks Desktop and disables Web Connect .QBO imports. However, QuickBooks Desktop imports .IIF files indefinitely without an active subscription.',
    technicalDetails: [
      'Generates balanced double-entry: TRNS amount + SPL amount === 0.00',
      'Configurable bank account name and offset account (e.g., Ask My Accountant)',
      'Uses tab-delimited formatting with CRLF line breaks per Intuit specification',
      'Assigns proper TRNSTYPE (CHECK, DEPOSIT, CREDIT CARD, CCARD REFUND)'
    ],
    faq: [
      { question: 'Does IIF import require an active QuickBooks subscription?', answer: 'No. QuickBooks Desktop versions (2018–2024+) allow .IIF file imports locally without any Intuit subscription or Web Connect service.' },
      { question: 'How are the double-entry rows balanced?', answer: 'Each transaction generates a TRNS row posting to your Bank/Credit Card account and an equal-and-opposite SPL row posting to your selected offset account.' }
    ]
  },
  {
    slug: 'qbo-to-iif',
    title: 'QBO to IIF Converter — Bypass Discontinued QuickBooks Desktop Web Connect',
    h1: 'Convert QuickBooks QBO to Desktop IIF Format',
    sourceFormat: 'QBO',
    targetFormat: 'IIF',
    metaDescription: 'Convert QuickBooks .QBO Web Connect files into .IIF format to bypass Intuit sunset restrictions on QuickBooks Desktop 2020-2023.',
    summary: 'Import transactions from bank .QBO downloads directly into discontinued or older QuickBooks Desktop editions using balanced .IIF syntax.',
    whyNeeded: 'When Intuit discontinues a QuickBooks Desktop version, importing a .QBO file throws Error OL-221 or blocks Web Connect. Converting the .QBO to .IIF bypasses this restriction completely.',
    technicalDetails: [
      'Parses .QBO SGML and XML structures into normalized ledger entries',
      'Generates balanced TRNS/SPL rows with matching document numbers and check numbers',
      'Maps <NAME> to payee and <MEMO> to transaction memo',
      'Zero subscription required to import .IIF into QuickBooks Pro/Premier/Enterprise'
    ],
    faq: [
      { question: 'Will this work on QuickBooks Desktop 2021 or 2022?', answer: 'Yes. .IIF is the universal interchange format supported by all versions of QuickBooks Desktop since 1992.' }
    ]
  },
  {
    slug: 'ofx-to-iif',
    title: 'OFX & QFX to IIF Converter — Bank Statements to QuickBooks Desktop',
    h1: 'Convert Bank OFX & Quicken QFX to QuickBooks IIF',
    sourceFormat: 'OFX',
    targetFormat: 'IIF',
    metaDescription: 'Convert standard OFX and Quicken QFX bank statement files into balanced QuickBooks Desktop IIF format.',
    summary: 'Transform Open Financial Exchange (.OFX) and Quicken (.QFX) downloads into balanced double-entry QuickBooks Desktop IIF files.',
    whyNeeded: 'QuickBooks Desktop does not allow importing standard Open Financial Exchange (.OFX) or Quicken (.QFX) files without Intuit branding tags.',
    technicalDetails: [
      'Supports both SGML OFX 1.02 and XML OFX 2.x formats',
      'Extracts bank routing, account number, and transaction details',
      'Produces verified tab-separated IIF syntax'
    ],
    faq: [
      { question: 'Can I choose my expense account name in IIF?', answer: 'Yes. In the Account Settings panel you can designate any offset account name, such as "Uncategorized Expense" or "Office Supplies".' }
    ]
  },
  {
    slug: 'ofx-to-csv',
    title: 'OFX to CSV Converter — Open OFX Bank Statements in Excel',
    h1: 'Convert Bank OFX Statements to CSV and Excel',
    sourceFormat: 'OFX',
    targetFormat: 'CSV',
    metaDescription: 'Convert Open Financial Exchange (.OFX) bank and credit card files into standard CSV spreadsheets for Excel and Google Sheets.',
    summary: 'Extract financial transactions from bank OFX downloads into clean, organized CSV rows.',
    whyNeeded: 'Most banks offer OFX downloads, but modern spreadsheet applications cannot parse unclosed SGML tags natively.',
    technicalDetails: [
      'Universal regex SGML tag reader',
      'Handles both single-tag (<TRNAMT>-12.50) and dual-tag (<TRNAMT>-12.50</TRNAMT>) syntax',
      'Outputs clean Date, Payee, Amount, Type, Memo, and FITID columns'
    ],
    faq: [
      { question: 'Does this preserve transaction IDs (FITID)?', answer: 'Yes. The unique bank FITID is preserved in a dedicated column for audit trails.' }
    ]
  },
  {
    slug: 'csv-to-ofx',
    title: 'CSV to OFX Converter — Generate Open Financial Exchange Statements',
    h1: 'Convert CSV to Standard OFX Format',
    sourceFormat: 'CSV',
    targetFormat: 'OFX',
    metaDescription: 'Convert CSV bank statement exports into standardized Open Financial Exchange (OFX 1.02) files for accounting software.',
    summary: 'Generate standardized OFX files from any bank, credit card, or payment processor CSV export.',
    whyNeeded: 'Many ERP and specialized accounting systems only accept standardized OFX feeds for automated bank reconciliation.',
    technicalDetails: [
      'Valid OFX 1.02 SGML headers and message blocks',
      'Supports <BANKMSGSRSV1> (checking/savings) and <CREDITCARDMSGSRSV1> (credit cards)',
      'Deterministic FITID generation'
    ],
    faq: [
      { question: 'Can I set the currency?', answer: 'Yes, USD, CAD, EUR, GBP, and AUD are supported.' }
    ]
  },
  {
    slug: 'qfx-to-csv',
    title: 'QFX to CSV Converter — Convert Quicken Files to Excel',
    h1: 'Convert Quicken QFX to CSV and Excel',
    sourceFormat: 'QFX',
    targetFormat: 'CSV',
    metaDescription: 'Convert Quicken Web Connect (.QFX) bank statements into CSV and Excel spreadsheets online.',
    summary: 'Parse Quicken .QFX statement downloads into clean Excel and Google Sheets spreadsheets.',
    whyNeeded: 'Quicken .QFX files are encrypted with proprietary SGML tags that standard spreadsheet software cannot read.',
    technicalDetails: [
      'Parses Quicken proprietary tags while extracting standard OFX data elements',
      'Exports clean CSV with date, payee, amount, category, and memo',
      'Runs 100% in client-side memory'
    ],
    faq: [
      { question: 'Is QFX the same as QBO?', answer: 'They share the underlying OFX format, but QFX targets Quicken while QBO targets QuickBooks.' }
    ]
  },
  {
    slug: 'csv-to-qfx',
    title: 'CSV to QFX Converter — Quicken Web Connect Generator',
    h1: 'Convert CSV to Quicken QFX Web Connect',
    sourceFormat: 'CSV',
    targetFormat: 'QFX',
    metaDescription: 'Convert bank and credit card CSV exports to Quicken Web Connect (.QFX) format for easy import into Quicken.',
    summary: 'Create Quicken-compatible .QFX Web Connect files from any bank statement CSV.',
    whyNeeded: 'Allows importing transactions into Quicken even if your financial institution only provides CSV downloads.',
    technicalDetails: [
      'Includes valid Quicken FID and INTU.BID tags',
      'Full support for checking, savings, and credit card account types',
      'Sanitized payee names and deterministic IDs'
    ],
    faq: [
      { question: 'Does this work on Quicken for Mac and Windows?', answer: 'Yes, both Quicken for Windows and Quicken for Mac support .QFX Web Connect files.' }
    ]
  },
  {
    slug: 'qfx-to-qbo',
    title: 'QFX to QBO Converter — Convert Quicken Files to QuickBooks',
    h1: 'Convert Quicken QFX to QuickBooks QBO',
    sourceFormat: 'QFX',
    targetFormat: 'QBO',
    metaDescription: 'Convert Quicken .QFX files into QuickBooks .QBO Web Connect format by rewriting INTU.BID and header identifiers.',
    summary: 'Quickly patch and convert Quicken statement files so QuickBooks recognizes and imports them into bank feeds.',
    whyNeeded: 'QuickBooks refuses to import .QFX files, throwing Error OL-222 or "QuickBooks cannot verify the financial institution." Converting rewrites the headers to valid QuickBooks Web Connect format.',
    technicalDetails: [
      'Rewrites Intuit application header from Quicken to QuickBooks',
      'Injects verified QuickBooks INTU.BID code',
      'Preserves all transaction dates, amounts, and FITIDs'
    ],
    faq: [
      { question: 'Why does QuickBooks reject Quicken QFX files?', answer: 'QuickBooks checks the header for QuickBooks application flags and INTU.BID codes. Quicken files lack these specific flags.' }
    ]
  },
  {
    slug: 'ofx-to-qbo',
    title: 'OFX to QBO Converter — Bank OFX to QuickBooks Web Connect',
    h1: 'Convert Bank OFX to QuickBooks QBO',
    sourceFormat: 'OFX',
    targetFormat: 'QBO',
    metaDescription: 'Convert raw bank OFX downloads into QuickBooks .QBO Web Connect files with valid INTU.BID and OL-222 sanitization.',
    summary: 'Transform standard Open Financial Exchange (.OFX) files into QuickBooks Web Connect (.QBO) files.',
    whyNeeded: 'Banks often provide generic OFX files, but QuickBooks requires specific Intuit-authorized headers and INTU.BID identifiers to import.',
    technicalDetails: [
      'Injects compliant OFX 1.02 SGML header',
      'Injects verified INTU.BID (default 3000)',
      'Sanitizes special characters to guarantee zero import errors'
    ],
    faq: [
      { question: 'Will this cause duplicate transactions?', answer: 'No. FinFormat preserves the bank’s original FITID codes so QuickBooks detects previously imported rows.' }
    ]
  },
  {
    slug: 'csv-to-qif',
    title: 'CSV to QIF Converter — Quicken Interchange Format Generator',
    h1: 'Convert CSV to Quicken QIF Format',
    sourceFormat: 'CSV',
    targetFormat: 'QIF',
    metaDescription: 'Convert bank statement CSV files to Quicken QIF format for Quicken, GnuCash, and Moneydance.',
    summary: 'Generate classic Quicken Interchange Format (.QIF) files from any bank or credit card CSV export.',
    whyNeeded: 'QIF is universally supported across older versions of Quicken, open-source personal finance managers (GnuCash), and Moneydance.',
    technicalDetails: [
      'Supports !Type:Bank and !Type:CCard headers',
      'Formats D (date), T (amount), P (payee), M (memo), and N (check number)',
      'Terminates each record with caret (^)'
    ],
    faq: [
      { question: 'What software can open QIF files?', answer: 'Quicken (all desktop versions), GnuCash, Moneydance, KMyMoney, and YNAB 4.' }
    ]
  },
  {
    slug: 'qif-to-csv',
    title: 'QIF to CSV Converter — Convert QIF Files to Excel',
    h1: 'Convert Quicken QIF to CSV and Excel',
    sourceFormat: 'QIF',
    targetFormat: 'CSV',
    metaDescription: 'Convert Quicken Interchange Format (.QIF) files into clean CSV spreadsheets for Excel and Google Sheets.',
    summary: 'Extract historical financial records from legacy QIF files into modern spreadsheet tables.',
    whyNeeded: 'Older accounting archives stored in .QIF cannot be viewed in modern spreadsheets without conversion.',
    technicalDetails: [
      'Parses line-by-line QIF tags (D, T, P, M, N, C)',
      'Normalizes dates to standard format',
      'Outputs tabular CSV with full transaction details'
    ],
    faq: [
      { question: 'Does this handle multi-year QIF files?', answer: 'Yes, FinFormat parses unlimited rows entirely within your browser memory.' }
    ]
  },
  {
    slug: 'qif-to-qbo',
    title: 'QIF to QBO Converter — Convert QIF to QuickBooks Web Connect',
    h1: 'Convert Quicken QIF to QuickBooks QBO',
    sourceFormat: 'QIF',
    targetFormat: 'QBO',
    metaDescription: 'Convert Quicken QIF files to QuickBooks .QBO Web Connect format for direct bank feed import.',
    summary: 'Upgrade legacy Quicken .QIF statements into modern QuickBooks Web Connect (.QBO) files.',
    whyNeeded: 'QuickBooks Online and newer desktop editions no longer support importing QIF files directly.',
    technicalDetails: [
      'Translates QIF records into OFX 1.02 SGML transactions',
      'Synthesizes unique FITID hashes for reconciliation tracking',
      'Applies OL-222 name truncation and character sanitization'
    ],
    faq: [
      { question: 'Can I import QIF directly into QuickBooks Online?', answer: 'No, QBO does not support QIF. Converting to .QBO enables seamless direct import.' }
    ]
  },
  {
    slug: 'qif-to-iif',
    title: 'QIF to IIF Converter — Convert QIF to QuickBooks Desktop IIF',
    h1: 'Convert Quicken QIF to QuickBooks Desktop IIF',
    sourceFormat: 'QIF',
    targetFormat: 'IIF',
    metaDescription: 'Convert Quicken .QIF files to balanced QuickBooks Desktop .IIF format.',
    summary: 'Transform Quicken QIF files into double-entry balanced IIF files for QuickBooks Desktop Pro, Premier, and Enterprise.',
    whyNeeded: 'Migrating legacy Quicken registers to QuickBooks Desktop requires converting single-entry QIF into double-entry IIF blocks.',
    technicalDetails: [
      'Creates balanced TRNS/SPL rows for each QIF entry',
      'Preserves check numbers and categories as offset accounts',
      'Strict tab-delimited formatting'
    ],
    faq: [
      { question: 'Does this balance my chart of accounts?', answer: 'Yes, every transaction sums to exactly $0.00 between TRNS and SPL.' }
    ]
  },
  {
    slug: 'iif-to-csv',
    title: 'IIF to CSV Converter — Inspect QuickBooks Desktop IIF in Excel',
    h1: 'Convert QuickBooks IIF to CSV and Excel',
    sourceFormat: 'IIF',
    targetFormat: 'CSV',
    metaDescription: 'Convert and inspect QuickBooks Desktop .IIF files in clean CSV and Excel format.',
    summary: 'Parse complex QuickBooks IIF ledger files into readable spreadsheet rows.',
    whyNeeded: 'QuickBooks IIF files contain complex multi-line transactions (TRNS, SPL, ENDTRNS) that are difficult to review without parsing.',
    technicalDetails: [
      'Extracts transaction headers, split rows, amounts, and account names',
      'Associates SPL offset rows with parent TRNS entries',
      'Generates clean tabular CSV'
    ],
    faq: [
      { question: 'Can I see the offset expense accounts?', answer: 'Yes, both the primary bank account and offset accounts are clearly displayed.' }
    ]
  },
  {
    slug: 'mt940-to-csv',
    title: 'MT940 to CSV Converter — SWIFT Bank Statements to Excel',
    h1: 'Convert SWIFT MT940 to CSV and Excel',
    sourceFormat: 'MT940',
    targetFormat: 'CSV',
    metaDescription: 'Convert SWIFT MT940 (.sta / .mt940) electronic bank statements into CSV spreadsheets for Excel.',
    summary: 'Parse international SWIFT MT940 bank statements into standard CSV format.',
    whyNeeded: 'European and corporate bank accounts export in SWIFT MT940, a format with complex :61: statement line and :86: information tags.',
    technicalDetails: [
      'Parses SWIFT MT940 :61: (value date, entry date, debit/credit mark, amount, transaction type)',
      'Extracts payee and transaction details from :86: information blocks',
      'Normalizes international currency and dates'
    ],
    faq: [
      { question: 'What file extensions are supported?', answer: '.mt940, .sta, and .txt files containing SWIFT MT940 blocks.' }
    ]
  },
  {
    slug: 'mt940-to-qbo',
    title: 'MT940 to QBO Converter — SWIFT Bank Statements to QuickBooks',
    h1: 'Convert SWIFT MT940 to QuickBooks QBO',
    sourceFormat: 'MT940',
    targetFormat: 'QBO',
    metaDescription: 'Convert SWIFT MT940 international bank statements into QuickBooks .QBO Web Connect format.',
    summary: 'Import international SWIFT MT940 corporate statements into QuickBooks Online and Desktop.',
    whyNeeded: 'QuickBooks does not support direct SWIFT MT940 import, making international reconciliation difficult.',
    technicalDetails: [
      'Translates SWIFT :61: lines into OFX 1.02 transactions',
      'Sanitizes European payee text and special characters',
      'Injects universal compatible INTU.BID code'
    ],
    faq: [
      { question: 'Does this handle multi-currency statements?', answer: 'Yes, USD, EUR, GBP, and other major currencies are properly mapped.' }
    ]
  },
  {
    slug: 'camt053-to-csv',
    title: 'CAMT.053 to CSV Converter — ISO 20022 XML to Excel',
    h1: 'Convert ISO 20022 CAMT.053 XML to CSV',
    sourceFormat: 'CAMT.053',
    targetFormat: 'CSV',
    metaDescription: 'Convert ISO 20022 CAMT.053 XML electronic bank statements into CSV spreadsheets for Excel and Google Sheets.',
    summary: 'Extract transactions from modern ISO 20022 CAMT.053 XML bank statement files into clean CSV tables.',
    whyNeeded: 'Global banks are transitioning from SWIFT MT940 to ISO 20022 CAMT.053 XML, which standard spreadsheets cannot parse directly.',
    technicalDetails: [
      'Parses <Ntry> (entries), <Amt> (amounts), <CdtDbtInd> (credit/debit indicator), and <BookgDt> (booking date)',
      'Extracts remittance info <RmtInf> and party details <RltdPties>',
      'Outputs clean normalized tabular data'
    ],
    faq: [
      { question: 'Is CAMT.052 or CAMT.054 supported?', answer: 'Yes, the engine parses ISO 20022 XML transaction entry blocks across the CAMT specification.' }
    ]
  },
  {
    slug: 'quickbooks-csv-formatter',
    title: 'QuickBooks CSV Formatter — Clean Bank CSV for QuickBooks Online',
    h1: 'Format Bank CSV for QuickBooks Online Bank Feeds',
    sourceFormat: 'CSV',
    targetFormat: 'QB_CSV',
    metaDescription: 'Clean and format any bank CSV into strict QuickBooks 3-column or 4-column format with zero errors.',
    summary: 'Format messy bank CSV downloads into the exact 3-column (Date, Description, Amount) or 4-column (Date, Description, Credit, Debit) layout required by QuickBooks Online.',
    whyNeeded: 'QuickBooks Online rejects CSV files with summary header lines, inverted signs, extra columns, or invalid date formats.',
    technicalDetails: [
      'Strips bank summary headers and disclaimers',
      'Normalizes dates to MM/DD/YYYY format',
      'Cleans numbers, removes currency symbols, and validates signs',
      'Offers both 3-column and 4-column output formats'
    ],
    faq: [
      { question: 'What is the 3-column format?', answer: 'Date, Description, Amount (with negative numbers for expenses and positive for deposits).' }
    ]
  },
  {
    slug: 'xero-csv-formatter',
    title: 'Xero CSV Formatter — Convert Bank CSV to Xero Format',
    h1: 'Format Bank Statements for Xero Bank Feeds',
    sourceFormat: 'CSV',
    targetFormat: 'XERO_CSV',
    metaDescription: 'Convert bank statements and credit card CSVs into official Xero bank statement CSV format.',
    summary: 'Transform any bank download into Xero-compliant 5-column CSV format ready for immediate import.',
    whyNeeded: 'Xero requires a specific column layout (Date, Amount, Payee, Description, Reference, Check Number).',
    technicalDetails: [
      'Generates official Xero CSV header specification',
      'Maps description to payee and transaction details to reference',
      'Enforces standard signed amount formatting'
    ],
    faq: [
      { question: 'Does Xero support 2-column amounts?', answer: 'Xero prefers a single signed Amount column, which this formatter generates by default.' }
    ]
  },
  {
    slug: 'fix-quickbooks-ol-222-error',
    title: 'Fix QuickBooks Error OL-222 — QBO File Repair Tool',
    h1: 'Fix QuickBooks Error OL-222 QBO File Repair',
    sourceFormat: 'QBO',
    targetFormat: 'QBO',
    isRepairTool: true,
    metaDescription: 'Fix QuickBooks Error OL-222 instantly. 1-click tool sanitizes illegal SGML characters, truncates <NAME> to 32 chars, and repairs headers.',
    summary: 'Repair corrupt .QBO files that trigger QuickBooks Error OL-222 with automated character sanitization and field capping.',
    whyNeeded: 'When a bank statement contains an unescaped ampersand (&), illegal symbols (<, >, :), or a payee name exceeding 32 characters, QuickBooks throws Error OL-222 and aborts the entire import without identifying the bad row.',
    technicalDetails: [
      'Replaces & with "and", removes illegal SGML tags (<, >, :, /)',
      'Truncates <NAME> to 32 characters and moves overflow description to <MEMO> (up to 255 chars)',
      'Injects required <LEDGERBAL><BALAMT>0.00 block',
      'Rewrites with valid OFX 1.02 SGML headers and CRLF line breaks'
    ],
    faq: [
      { question: 'Why does QuickBooks throw Error OL-222?', answer: 'Intuit’s SGML parser is strictly limited: any ampersand (&) or payee name longer than 32 characters causes an instant parse crash.' },
      { question: 'Do I lose long payee descriptions?', answer: 'No! FinFormat caps <NAME> at 32 characters and automatically preserves the full description in the <MEMO> field.' }
    ]
  },
  {
    slug: 'fix-quickbooks-ol-301-error',
    title: 'Fix QuickBooks Error OL-301 & OL-393 — INTU.BID Repair Tool',
    h1: 'Fix QuickBooks Error OL-301 & OL-393 Bank ID Repair',
    sourceFormat: 'QBO',
    targetFormat: 'QBO',
    isRepairTool: true,
    metaDescription: 'Fix QuickBooks Error OL-301 and OL-393 by injecting a verified, universally compatible INTU.BID code into your .QBO file.',
    summary: 'Repair .QBO files rejected by QuickBooks due to expired, unrecognized, or discontinued financial institution identifiers.',
    whyNeeded: 'QuickBooks Error OL-301 or OL-393 occurs when QuickBooks cannot verify the bank’s INTU.BID code, or when your bank’s Web Connect agreement with Intuit has lapsed.',
    technicalDetails: [
      'Scans and replaces invalid <INTU.BID> codes with verified ID 3000 (Wells Fargo universal fallback)',
      'Maintains original account numbers and transaction IDs',
      'Re-validates OFX 1.02 header integrity'
    ],
    faq: [
      { question: 'Why does INTU.BID 3000 work for all banks?', answer: 'FID 3000 (Wells Fargo) is the most widely supported Intuit bank identifier and is active across every version of QuickBooks since 2003.' }
    ]
  },
  {
    slug: 'merge-qbo-ofx-files',
    title: 'Merge QBO & OFX Files — Batch Statement Combiner & Deduplicator',
    h1: 'Merge Multiple QBO, OFX, and CSV Bank Files into One',
    sourceFormat: 'MULTI',
    targetFormat: 'QBO',
    isRepairTool: true,
    metaDescription: 'Batch merge multiple monthly QBO, OFX, or CSV bank statements into a single file with automatic FITID deduplication.',
    summary: 'Combine multiple monthly statements into a single unified file sorted chronologically, with duplicate transactions automatically removed.',
    whyNeeded: 'Downloading 12 individual monthly statements means importing 12 separate files into QuickBooks. Merging them into one master file saves hours of tedious import steps and catches duplicate entries.',
    technicalDetails: [
      'Multi-file drag-and-drop batch upload',
      'Automatic chronological sorting across months and years',
      'Deduplicates transactions using deterministic FITID and (date + amount + payee) hash',
      'Outputs single master .QBO, .IIF, or .CSV file'
    ],
    faq: [
      { question: 'How are duplicate rows detected?', answer: 'FinFormat compares unique bank FITID tags as well as date + amount + description combinations across all uploaded statements.' }
    ]
  },
  {
    slug: 'credit-card-csv-sign-flipper',
    title: 'Credit Card Sign Flipper — Invert Positive/Negative Charges',
    h1: 'Credit Card CSV Sign Flipper for QuickBooks & Xero',
    sourceFormat: 'CSV',
    targetFormat: 'CSV',
    isRepairTool: true,
    metaDescription: 'Invert positive and negative transaction signs on credit card CSV downloads from American Express, Chase, and Citi.',
    summary: 'Instantly flip debit and credit signs on credit card statements so charges import as expenses rather than deposits.',
    whyNeeded: 'Institutions like American Express export charges as positive numbers (+45.99) and payments as negative numbers (-200.00). When imported into QuickBooks, charges appear as deposits/income unless inverted.',
    technicalDetails: [
      '1-click instantaneous math inversion: -45.99 becomes +45.99, and +45.99 becomes -45.99',
      'Supports split Debit/Credit columns and single signed Amount column',
      'Exports clean inverted CSV ready for QuickBooks Online and Desktop'
    ],
    faq: [
      { question: 'Why does American Express export positive charges?', answer: 'From the credit card issuer’s perspective, your charge increases your balance (positive). In double-entry accounting, however, an expense is a negative cash flow.' }
    ]
  }
];

export function getFormatRoute(slug: string): FormatRoute | undefined {
  return FORMAT_ROUTES.find(r => r.slug === slug);
}
