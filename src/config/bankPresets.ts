import type { BankPreset } from '../utils/types';

export const BANK_PRESETS: BankPreset[] = [
  {
    slug: 'chase-csv-to-qbo',
    name: 'JPMorgan Chase (Checking, Savings & Ink Credit Cards)',
    intuBid: '10898',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Chase checking, savings, and Chase Ink Business credit card CSV files to QuickBooks Web Connect (.QBO).',
    exportInstructions: [
      'Log into Chase Online Banking and navigate to your account activity',
      'Click the download icon (arrow pointing into tray) near the search bar',
      'Choose "Spreadsheet (Excel, CSV)" and select your date range',
      'Drag the downloaded Chase CSV directly into FinFormat'
    ],
    sampleFileName: 'chase_sample_statement.csv'
  },
  {
    slug: 'bank-of-america-csv-to-qbo',
    name: 'Bank of America (Advantage Checking & Credit Cards)',
    intuBid: '6812',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert BofA CSV statements to QuickBooks .QBO with automatic stripping of top summary lines and disclaimer rows.',
    exportInstructions: [
      'Log into Bank of America Online Banking',
      'Select your checking or credit card account and click "Statements & Documents"',
      'Select "Custom Date Range" under Download Transactions and choose "Microsoft Excel format (CSV)"',
      'Upload to FinFormat (metadata rows are removed automatically)'
    ],
    sampleFileName: 'bofa_sample_statement.csv'
  },
  {
    slug: 'wells-fargo-csv-to-qbo',
    name: 'Wells Fargo Bank (Checking, Savings & Business)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY', 'MM/DD/YY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Wells Fargo CSV statements into QuickBooks .QBO format. Auto-detects headerless 5-column formats.',
    exportInstructions: [
      'Log into Wells Fargo Online',
      'Under Account Activity, click "Download Account Activity"',
      'Select "Comma Delimited (CSV)" and download your file',
      'FinFormat auto-detects Wells Fargo columns even if headers are absent'
    ],
    sampleFileName: 'wells_fargo_sample_statement.csv'
  },
  {
    slug: 'american-express-csv-to-qbo',
    name: 'American Express (Business Platinum, Gold, Blue)',
    intuBid: '3101',
    defaultAccountType: 'CREDITCARD',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: true,
    hasFees: false,
    description: 'Convert Amex CSV downloads to QuickBooks .QBO. Automatically flips positive charges to negative outflows so expenses do not import as deposits.',
    exportInstructions: [
      'Log into your American Express account',
      'Go to "Statements & Activity"',
      'Click the Download icon and choose "CSV"',
      'FinFormat automatically inverts Amex positive charge amounts'
    ],
    sampleFileName: 'amex_sample_statement.csv'
  },
  {
    slug: 'capital-one-csv-to-qbo',
    name: 'Capital One (Spark Business & 360 Checking)',
    intuBid: '12368',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Capital One 360 and Spark Business CSV downloads to QuickBooks .QBO. Seamlessly merges split Debit and Credit columns.',
    exportInstructions: [
      'Log into Capital One and view transaction history',
      'Click "Download Transactions" and select CSV format',
      'Drop your file into FinFormat'
    ],
    sampleFileName: 'capital_one_sample_statement.csv'
  },
  {
    slug: 'citi-csv-to-qbo',
    name: 'Citibank (Checking & Double Cash Credit Card)',
    intuBid: '54103',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Citi CSV statement files to QuickBooks .QBO Web Connect format with clean column mapping.',
    exportInstructions: [
      'Log into Citi.com and navigate to Account Activity',
      'Click "Download" and select "CSV"',
      'Import directly into FinFormat'
    ],
    sampleFileName: 'citi_sample_statement.csv'
  },
  {
    slug: 'us-bank-csv-to-qbo',
    name: 'U.S. Bank (Smartly Checking & Business Cards)',
    intuBid: '1412',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert U.S. Bank CSV exports into QuickBooks Online and Desktop Web Connect format.',
    exportInstructions: [
      'Log into US Bank Online Banking',
      'Select your account and click "Download Transactions"',
      'Select "Standard CSV" and upload to FinFormat'
    ],
    sampleFileName: 'usbank_sample_statement.csv'
  },
  {
    slug: 'pnc-bank-csv-to-qbo',
    name: 'PNC Bank (Virtual Wallet & Business Checking)',
    intuBid: '4236',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert PNC Virtual Wallet and commercial checking CSV statements into QuickBooks .QBO format.',
    exportInstructions: [
      'Log into PNC Online Banking',
      'Under Activity, click the Download icon and choose CSV',
      'Upload file into FinFormat'
    ],
    sampleFileName: 'pnc_sample_statement.csv'
  },
  {
    slug: 'truist-csv-to-qbo',
    name: 'Truist Bank (formerly SunTrust & BB&T)',
    intuBid: '10911',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Truist CSV downloads to QuickBooks .QBO format with built-in OL-222 prevention.',
    exportInstructions: [
      'Log into Truist Online Banking',
      'Export activity as CSV',
      'Upload into FinFormat (uses verified Truist FID 10911)'
    ],
    sampleFileName: 'truist_sample_statement.csv'
  },
  {
    slug: 'td-bank-csv-to-qbo',
    name: 'TD Bank (Beyond Checking & Commercial)',
    intuBid: '10028',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert TD Bank CSV statement downloads into QuickBooks .QBO Web Connect format.',
    exportInstructions: [
      'Log into TD Bank Online Banking',
      'Navigate to Account Activity and click Download',
      'Choose Comma Separated Values (.csv) and drop into FinFormat'
    ],
    sampleFileName: 'td_sample_statement.csv'
  },
  {
    slug: 'navy-federal-csv-to-qbo',
    name: 'Navy Federal Credit Union (Checking & Savings)',
    intuBid: '19738',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Navy Federal Credit Union CSV files into QuickBooks .QBO format.',
    exportInstructions: [
      'Log into NFCU Online Banking',
      'Click Download Transactions and select CSV',
      'Upload to FinFormat'
    ],
    sampleFileName: 'navy_federal_sample_statement.csv'
  },
  {
    slug: 'usaa-csv-to-qbo',
    name: 'USAA Federal Savings Bank (Checking & Credit)',
    intuBid: '24591',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert USAA statement CSV files to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into USAA.com',
      'Navigate to My Accounts > Account History > Export',
      'Select Comma Separated Values (.csv) and drop into FinFormat'
    ],
    sampleFileName: 'usaa_sample_statement.csv'
  },
  {
    slug: 'discover-card-csv-to-qbo',
    name: 'Discover Card & Discover Bank',
    intuBid: '7101',
    defaultAccountType: 'CREDITCARD',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: true,
    hasFees: false,
    description: 'Convert Discover Card CSV statements to QuickBooks .QBO with automatic sign inversion.',
    exportInstructions: [
      'Log into Discover Card account center',
      'Go to Activity & Statements > Download Transactions',
      'Choose CSV and drop into FinFormat'
    ],
    sampleFileName: 'discover_sample_statement.csv'
  },
  {
    slug: 'charles-schwab-csv-to-qbo',
    name: 'Charles Schwab Bank (High Yield Investor Checking)',
    intuBid: '10969',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Charles Schwab Bank CSV transactions to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Schwab.com and go to Accounts > History',
      'Click the Export icon and choose CSV',
      'Upload to FinFormat'
    ],
    sampleFileName: 'schwab_sample_statement.csv'
  },
  {
    slug: 'fidelity-csv-to-qbo',
    name: 'Fidelity Investments (Cash Management Account)',
    intuBid: '05756',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Fidelity CMA and brokerage cash CSV files to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Fidelity and open Activity & Orders',
      'Click Download and select CSV',
      'Upload into FinFormat'
    ],
    sampleFileName: 'fidelity_sample_statement.csv'
  },
  {
    slug: 'huntington-bank-csv-to-qbo',
    name: 'Huntington National Bank (Asterisk-Free Checking)',
    intuBid: '00138',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Huntington National Bank CSV exports to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Huntington Online Banking',
      'Download account history as CSV and upload to FinFormat'
    ],
    sampleFileName: 'huntington_sample_statement.csv'
  },
  {
    slug: 'regions-bank-csv-to-qbo',
    name: 'Regions Bank (LifeGreen Checking)',
    intuBid: '03681',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Regions Bank statement CSV files to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Regions Online Banking',
      'Export transactions as CSV and drop into FinFormat'
    ],
    sampleFileName: 'regions_sample_statement.csv'
  },
  {
    slug: 'citizens-bank-csv-to-qbo',
    name: 'Citizens Bank (EverValue & Quest Checking)',
    intuBid: '02293',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Citizens Bank CSV files into QuickBooks .QBO Web Connect format.',
    exportInstructions: [
      'Log into Citizens Bank Online',
      'Click Download Transactions, choose CSV, and upload to FinFormat'
    ],
    sampleFileName: 'citizens_sample_statement.csv'
  },
  {
    slug: 'fifth-third-bank-csv-to-qbo',
    name: 'Fifth Third Bank (Momentum Checking)',
    intuBid: '02844',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Fifth Third Bank CSV statements into QuickBooks .QBO files.',
    exportInstructions: [
      'Log into Fifth Third Online Banking',
      'Download activity as CSV and upload to FinFormat'
    ],
    sampleFileName: 'fifth_third_sample_statement.csv'
  },
  {
    slug: 'keybank-csv-to-qbo',
    name: 'KeyBank (Hassle-Free Checking)',
    intuBid: '03417',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert KeyBank CSV transaction records to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into KeyBank Online Banking',
      'Export activity as CSV and upload to FinFormat'
    ],
    sampleFileName: 'keybank_sample_statement.csv'
  },
  {
    slug: 'm-and-t-bank-csv-to-qbo',
    name: 'M&T Bank (MyChoice Plus Checking)',
    intuBid: '02446',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert M&T Bank statement CSV downloads into QuickBooks .QBO format.',
    exportInstructions: [
      'Log into M&T Online Banking',
      'Export transactions as CSV and drop into FinFormat'
    ],
    sampleFileName: 'mt_bank_sample_statement.csv'
  },
  {
    slug: 'ally-bank-csv-to-qbo',
    name: 'Ally Bank (Interest Checking & Savings)',
    intuBid: '11218',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Ally Bank CSV exports to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Ally Online Banking',
      'Select account, click Download Transactions, and select CSV'
    ],
    sampleFileName: 'ally_sample_statement.csv'
  },
  {
    slug: 'bmo-us-csv-to-qbo',
    name: 'BMO Bank (formerly BMO Harris)',
    intuBid: '02360',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert BMO US statement CSV files into QuickBooks .QBO format.',
    exportInstructions: [
      'Log into BMO Digital Banking',
      'Download transactions as CSV and upload to FinFormat'
    ],
    sampleFileName: 'bmo_sample_statement.csv'
  },
  {
    slug: 'first-citizens-bank-csv-to-qbo',
    name: 'First Citizens Bank (Free & Commercial Checking)',
    intuBid: '02717',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert First Citizens Bank CSV files to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into First Citizens Digital Banking',
      'Download account activity as CSV and upload to FinFormat'
    ],
    sampleFileName: 'first_citizens_sample_statement.csv'
  },
  {
    slug: 'mercury-bank-csv-to-qbo',
    name: 'Mercury (Startup Banking Checking & Credit)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'fintech',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Mercury Bank CSV exports to QuickBooks .QBO and balanced .IIF format.',
    exportInstructions: [
      'Log into Mercury dashboard and go to Transactions',
      'Click the Export button at top right and choose CSV',
      'Upload the Mercury CSV directly into FinFormat'
    ],
    sampleFileName: 'mercury_sample_statement.csv'
  },
  {
    slug: 'relay-financial-csv-to-qbo',
    name: 'Relay Financial (Small Business Checking)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'fintech',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Relay Financial business banking CSV statements to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Relay Financial and click Accounts',
      'Select your checking account and click Export > CSV',
      'Drop into FinFormat'
    ],
    sampleFileName: 'relay_sample_statement.csv'
  },
  {
    slug: 'brex-csv-to-qbo',
    name: 'Brex (Corporate Card & Cash Accounts)',
    intuBid: '3000',
    defaultAccountType: 'CREDITCARD',
    category: 'fintech',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Brex corporate card and cash account CSV exports to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Brex dashboard and navigate to Transactions',
      'Click Export > CSV',
      'Upload to FinFormat'
    ],
    sampleFileName: 'brex_sample_statement.csv'
  },
  {
    slug: 'ramp-csv-to-qbo',
    name: 'Ramp (Corporate Card & Expense Management)',
    intuBid: '3000',
    defaultAccountType: 'CREDITCARD',
    category: 'fintech',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Ramp corporate card transaction CSV files to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Ramp and go to Accounting > Transactions',
      'Click Export > CSV and upload to FinFormat'
    ],
    sampleFileName: 'ramp_sample_statement.csv'
  },
  {
    slug: 'stripe-csv-to-quickbooks',
    name: 'Stripe (Balance History & Payouts)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'],
    requiresSignFlip: false,
    hasFees: true,
    description: 'Convert Stripe Balance History CSV into QuickBooks .QBO or balanced .IIF. Automatically splits Gross revenue, Stripe processing fees, and Net deposits.',
    exportInstructions: [
      'Log into Stripe Dashboard > Balances > All transactions',
      'Click Export and choose Balance change from activity (CSV)',
      'Include Gross, Fee, and Net columns',
      'FinFormat automatically splits processing fees into separate journal entries'
    ],
    sampleFileName: 'stripe_sample_statement.csv'
  },
  {
    slug: 'paypal-csv-to-quickbooks',
    name: 'PayPal (Activity & Business Transactions)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['MM/DD/YYYY', 'DD/MM/YYYY'],
    requiresSignFlip: false,
    hasFees: true,
    description: 'Convert PayPal Activity CSV to QuickBooks .QBO and IIF. Filters out currency conversion holds and splits PayPal transaction fees.',
    exportInstructions: [
      'Log into PayPal > Activity > All Reports > Activity Download',
      'Choose Balance Affecting Transactions and download CSV',
      'Upload to FinFormat (fees are automatically separated)'
    ],
    sampleFileName: 'paypal_sample_statement.csv'
  },
  {
    slug: 'square-csv-to-quickbooks',
    name: 'Square (Transactions & Daily Sales Summary)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD'],
    requiresSignFlip: false,
    hasFees: true,
    description: 'Convert Square POS transactions and payout CSVs to QuickBooks .QBO with gross-fee-net separation.',
    exportInstructions: [
      'Log into Square Dashboard > Reports > Transactions',
      'Click Export > Transaction CSV and drop into FinFormat'
    ],
    sampleFileName: 'square_sample_statement.csv'
  },
  {
    slug: 'shopify-payouts-csv-to-quickbooks',
    name: 'Shopify (Payouts & Transactions Export)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: true,
    description: 'Convert Shopify Payouts and Orders CSV to QuickBooks .QBO format with fee breakdown.',
    exportInstructions: [
      'Log into Shopify Admin > Finances > Payouts',
      'Export payout transactions as CSV and drop into FinFormat'
    ],
    sampleFileName: 'shopify_sample_statement.csv'
  },
  {
    slug: 'venmo-csv-to-quickbooks',
    name: 'Venmo (Business & Personal Statements)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Venmo transaction statement CSV downloads to QuickBooks .QBO format.',
    exportInstructions: [
      'Log into Venmo.com from a web browser',
      'Go to Statement > Download CSV and drop into FinFormat'
    ],
    sampleFileName: 'venmo_sample_statement.csv'
  },
  {
    slug: 'cash-app-csv-to-quickbooks',
    name: 'Cash App (Activity Statement Export)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Cash App activity CSV statement downloads into QuickBooks .QBO format.',
    exportInstructions: [
      'Log into cash.app/account from a computer',
      'Navigate to Activity > Statements > Export CSV',
      'Upload file to FinFormat'
    ],
    sampleFileName: 'cash_app_sample_statement.csv'
  },
  {
    slug: 'wise-csv-to-quickbooks',
    name: 'Wise (formerly TransferWise Business)',
    intuBid: '3000',
    defaultAccountType: 'CHECKING',
    category: 'processor',
    dateFormats: ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: true,
    description: 'Convert Wise multi-currency account statements into QuickBooks .QBO format with foreign exchange fee tracking.',
    exportInstructions: [
      'Log into Wise Business > Account Balance > Statements',
      'Select CSV format and choose your date range and balance currency',
      'Upload Wise CSV to FinFormat'
    ],
    sampleFileName: 'wise_sample_statement.csv'
  }
,
  {
    slug: 'fnbo-first-national-bank-csv-to-qbo',
    name: 'FNBO (First National Bank of Omaha)',
    intuBid: '03514',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert First National Bank of Omaha (FNBO) CSV statements to QuickBooks .QBO format with official INTU.BID 03514 / 14690.',
    exportInstructions: [
      'Log into FNBO Online Banking or FNBO Direct',
      'Navigate to Account Activity and click the Download icon',
      'Choose "Comma Delimited (.CSV)" format and select your date range',
      'Drop your FNBO CSV file directly into FinFormat'
    ],
    sampleFileName: 'fnbo_sample_statement.csv'
  },
  {
    slug: 'comerica-bank-csv-to-qbo',
    name: 'Comerica Bank (Treasury & Small Business Checking)',
    intuBid: '01053',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Comerica Bank Treasury and Commercial checking CSV statements into QuickBooks .QBO format with INTU.BID 01053.',
    exportInstructions: [
      'Log into Comerica Web Banking or Comerica Treasury Management',
      'Go to Accounts > Activity and select Export',
      'Select CSV (Comma Separated Values) format and download your file',
      'Upload the Comerica CSV to FinFormat for instant QBO conversion'
    ],
    sampleFileName: 'comerica_sample_statement.csv'
  },
  {
    slug: 'zions-bank-csv-to-qbo',
    name: 'Zions Bank (Anytime Checking & Commercial Accounts)',
    intuBid: '02570',
    defaultAccountType: 'CHECKING',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert Zions First National Bank CSV transaction downloads into QuickBooks Web Connect .QBO format with INTU.BID 02570.',
    exportInstructions: [
      'Log into Zions Bank Online Banking',
      'Select your checking or business account and view Activity',
      'Click the Export icon and choose Comma Separated (CSV)',
      'Drop your Zions Bank CSV statement into FinFormat'
    ],
    sampleFileName: 'zions_sample_statement.csv'
  },
  {
    slug: 'synchrony-bank-csv-to-qbo',
    name: 'Synchrony Bank (Amazon Store Card, Lowe\'s & CareCredit)',
    intuBid: '04505',
    defaultAccountType: 'CREDITCARD',
    category: 'bank',
    dateFormats: ['MM/DD/YYYY'],
    requiresSignFlip: true,
    hasFees: false,
    description: 'Convert Synchrony Bank, Amazon Store Card, Lowe\'s, and CareCredit CSV statements into QuickBooks .QBO with automatic sign flipping.',
    exportInstructions: [
      'Log into your Synchrony Bank portal (Amazon Store Card, Lowe\'s, CareCredit, or Synchrony.com)',
      'Navigate to Statements & Activity > Download Transactions',
      'Select CSV format and save the statement to your computer',
      'Upload to FinFormat (card purchases are automatically formatted as expenses)'
    ],
    sampleFileName: 'synchrony_sample_statement.csv'
  },
  {
    slug: 'sofi-bank-csv-to-qbo',
    name: 'SoFi Bank (Checking, Savings & SoFi Money)',
    intuBid: '24823',
    defaultAccountType: 'CHECKING',
    category: 'fintech',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: false,
    hasFees: false,
    description: 'Convert SoFi Checking and High-Yield Savings CSV downloads into QuickBooks Web Connect .QBO format with INTU.BID 24823.',
    exportInstructions: [
      'Log into SoFi.com or the SoFi web dashboard',
      'Select your Banking account (Checking or Savings) and view Transactions',
      'Click Download / Export and select CSV format',
      'Drop your SoFi CSV into FinFormat for private in-browser conversion'
    ],
    sampleFileName: 'sofi_sample_statement.csv'
  },
  {
    slug: 'robinhood-gold-card-csv-to-qbo',
    name: 'Robinhood Gold Card (3% Cash Back Credit Card & Cash Management)',
    intuBid: '15894',
    defaultAccountType: 'CREDITCARD',
    category: 'fintech',
    dateFormats: ['YYYY-MM-DD', 'MM/DD/YYYY'],
    requiresSignFlip: true,
    hasFees: false,
    description: 'Convert Robinhood Gold 3% Cash Back Credit Card and Cash Management CSV statements to QuickBooks .QBO format with auto charge inversion.',
    exportInstructions: [
      'Open Robinhood on web or app > Spending > Statements & History',
      'Select your Robinhood Gold Card activity and export as CSV',
      'Upload the Robinhood CSV directly into FinFormat',
      'FinFormat auto-inverts positive charges so QuickBooks records them as expenses'
    ],
    sampleFileName: 'robinhood_gold_sample_statement.csv'
  }
];

export function getBankPreset(slug: string): BankPreset | undefined {
  return BANK_PRESETS.find(p => p.slug === slug);
}
