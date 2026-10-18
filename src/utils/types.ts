export interface NormalizedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // Signed: negative for expenses/outflows, positive for deposits/inflows
  payee: string; // Description or Payee Name
  memo: string;
  checkNum?: string;
  type: 'DEBIT' | 'CREDIT' | 'CHECK' | 'PAYMENT' | 'FEE' | 'OTHER';
  category?: string;
  fitId: string; // Deterministic unique transaction hash
  gross?: number;
  fee?: number;
  selected?: boolean;
}

export interface AccountMetadata {
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDITCARD';
  accountNumber: string; // Last 4 or account ID
  routingNumber: string; // Bank routing or branch code
  bankId: string; // INTU.BID code (e.g., 3000 for Wells Fargo universal fallback)
  bankName: string;
  currency: string; // USD, CAD, GBP, EUR, AUD
  iifOffsetAccount: string; // Offset / category account (e.g., "Ask My Accountant")
  balance?: number;
  balanceDate?: string;
}

export interface ConversionOptions {
  targetFormat: 'QBO' | 'IIF' | 'CSV' | 'OFX' | 'QFX' | 'QIF' | 'QB_CSV' | 'XERO_CSV';
  sourceFormat?: string;
  flipSigns?: boolean; // Flip +/- for credit card statements where expenses are positive
  ol222SafeMode?: boolean; // Cap <NAME> to 32 chars, strip illegal SGML chars, overflow to <MEMO>
  splitFees?: boolean; // For Stripe / PayPal CSVs with Gross, Fee, Net
  deduplicate?: boolean; // Filter duplicate FITIDs or identical date+amount+payee rows
}

export interface ParseResult {
  transactions: NormalizedTransaction[];
  account: AccountMetadata;
  detectedFormat: string;
  warnings: string[];
  diagnostics: {
    totalRows: number;
    credits: number;
    debits: number;
    netAmount: number;
    duplicateCount: number;
    repairedCount: number;
  };
}

export interface BankPreset {
  slug: string;
  name: string;
  intuBid: string;
  defaultAccountType: 'CHECKING' | 'SAVINGS' | 'CREDITCARD';
  category: 'bank' | 'fintech' | 'processor';
  dateFormats: string[];
  requiresSignFlip: boolean;
  hasFees: boolean;
  description: string;
  exportInstructions: string[];
  sampleFileName: string;
}

export interface FormatRoute {
  slug: string;
  title: string;
  h1: string;
  sourceFormat: string;
  targetFormat: 'QBO' | 'IIF' | 'CSV' | 'OFX' | 'QFX' | 'QIF' | 'QB_CSV' | 'XERO_CSV';
  isRepairTool?: boolean;
  metaDescription: string;
  summary: string;
  whyNeeded: string;
  technicalDetails: string[];
  faq: { question: string; answer: string }[];
}
