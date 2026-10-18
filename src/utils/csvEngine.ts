import type { NormalizedTransaction, ParseResult } from './types';

/**
 * Robust RFC-4180 CSV / TSV line parser that respects quoted fields containing commas and newlines.
 */
export function parseCSVToRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  // Clean BOM if present
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1);
  }

  // Detect delimiter: comma, tab, or semicolon
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t') && !firstLine.includes(',')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  }

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentField.trim());
      // Only push non-empty rows
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Final row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes any common date string to ISO YYYY-MM-DD.
 */
export function normalizeDate(raw: string): string {
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return new Date().toISOString().slice(0, 10);

  // Match ISO YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Match US MM/DD/YYYY or MM/DD/YY
  const usMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (usMatch) {
    let m = usMatch[1].padStart(2, '0');
    let d = usMatch[2].padStart(2, '0');
    let y = usMatch[3];
    if (y.length === 2) {
      y = parseInt(y, 10) > 70 ? `19${y}` : `20${y}`;
    }
    return `${y}-${m}-${d}`;
  }

  // Fallback to JS Date parse
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Parses financial amount string into a signed floating point number.
 * Handles ($45.99), -$45.99, +45.99, "1,234.56 CR", etc.
 */
export function parseAmount(val: string | undefined): number {
  if (!val) return 0;
  let s = val.trim();
  if (!s) return 0;

  // Check for parenthesis negative: ($120.50) -> -120.50
  const isParenNeg = /^\(.*\)$/.test(s);
  // Check for trailing CR or DR
  const isCR = /CR$/i.test(s);
  const isDR = /DR$/i.test(s);

  // Strip currency symbols, commas, spaces, quotes, and parentheses
  s = s.replace(/[$€£¥,()'"\s]/g, '').replace(/CR|DR/gi, '');

  let num = parseFloat(s);
  if (isNaN(num)) return 0;

  if (isParenNeg || isDR) {
    num = -Math.abs(num);
  } else if (isCR) {
    num = Math.abs(num);
  }

  return Math.round(num * 100) / 100;
}

export function isNumericString(val: string | undefined): boolean {
  if (!val) return false;
  const s = val.trim().replace(/[$€£¥,()'"\s]/g, '').replace(/CR|DR/gi, '');
  return s.length > 0 && !isNaN(Number(s));
}

/**
 * Finds the actual table header row index by looking for keywords like Date, Amount, Description.
 * Skips Bank of America / PayPal top metadata/summary rows.
 */
export function findHeaderRowIndex(rows: string[][]): number {
  const headerKeywords = ['date', 'amount', 'description', 'payee', 'memo', 'debit', 'credit', 'balance', 'trans', 'created', 'payout'];

  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rowStr = rows[i].map(c => c.toLowerCase()).join(' ');
    let matchCount = 0;
    for (const kw of headerKeywords) {
      if (rowStr.includes(kw)) matchCount++;
    }
    // If at least 2 key terms match, this is our header row
    if (matchCount >= 2) {
      return i;
    }
  }

  // Headerless 5-column detection (Wells Fargo or Synthetic):
  // e.g. "01/15/2026", "-45.00", "*", "", "CHEVRON 1234"
  // or "01/05/2026", "SHOPIFY PAYOUT", "1250.00", "", "FFTEST..."
  if (rows.length > 0 && rows[0].length >= 3) {
    const col0IsDate = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(rows[0][0]) || /^\d{4}[/-]\d{1,2}[/-]\d{1,2}/.test(rows[0][0]);
    const col1IsNum = isNumericString(rows[0][1]);
    const col2IsNum = rows[0].length >= 3 && isNumericString(rows[0][2]);
    if (col0IsDate && (col1IsNum || col2IsNum)) {
      return -1; // -1 indicates headerless format
    }
  }

  return 0;
}

/**
 * Parses raw CSV string into NormalizedTransaction array with auto-detection of columns.
 */
export function parseCSV(
  csvText: string,
  options: {
    flipSigns?: boolean;
    splitFees?: boolean;
    deduplicate?: boolean;
    defaultAccountType?: 'CHECKING' | 'SAVINGS' | 'CREDITCARD';
    bankId?: string;
  } = {}
): ParseResult {
  const rows = parseCSVToRows(csvText);
  const warnings: string[] = [];

  if (rows.length === 0) {
    return {
      transactions: [],
      account: {
        accountType: options.defaultAccountType || 'CHECKING',
        accountNumber: '0000',
        routingNumber: '3000',
        bankId: options.bankId || '3000',
        bankName: 'Imported Statement',
        currency: 'USD',
        iifOffsetAccount: 'Ask My Accountant'
      },
      detectedFormat: 'CSV',
      warnings: ['File appears to be empty.'],
      diagnostics: { totalRows: 0, credits: 0, debits: 0, netAmount: 0, duplicateCount: 0, repairedCount: 0 }
    };
  }

  const headerIdx = findHeaderRowIndex(rows);
  let dateCol = -1;
  let payeeCol = -1;
  let memoCol = -1;
  let amountCol = -1;
  let debitCol = -1;
  let creditCol = -1;
  let checkCol = -1;
  let grossCol = -1;
  let feeCol = -1;
  let netCol = -1;
  let fitIdCol = -1;
  let categoryCol = -1;

  let startDataRow = 0;

  if (headerIdx === -1) {
    dateCol = 0;
    if (rows[0].length >= 3 && isNumericString(rows[0][2]) && !isNumericString(rows[0][1])) {
      // Synthetic 5-column headerless: Date(0), Description(1), Amount(2), Check(3), FITID(4)
      payeeCol = 1;
      amountCol = 2;
      checkCol = 3;
      fitIdCol = rows[0].length > 4 ? 4 : -1;
    } else {
      // Classic Wells Fargo: Date(0), Amount(1), Star(2), CheckNum(3), Payee(4)
      amountCol = 1;
      checkCol = 3;
      payeeCol = rows[0].length > 4 ? 4 : 1;
    }
    startDataRow = 0;
  } else {
    const headers = rows[headerIdx].map(h => h.toLowerCase().trim());
    startDataRow = headerIdx + 1;

    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (/date|posted|trans_date|time|created/i.test(h) && dateCol === -1) dateCol = c;
      else if (/description|payee|merchant|vendor/i.test(h) && payeeCol === -1) payeeCol = c;
      else if (/^name$|target name|party/i.test(h) && payeeCol === -1) payeeCol = c;
      else if (/memo|notes|comment/i.test(h) && memoCol === -1) memoCol = c;
      else if (/check|chk|slip/i.test(h) && checkCol === -1) checkCol = c;
      else if (/gross/i.test(h) && grossCol === -1) grossCol = c;
      else if (/fee/i.test(h) && feeCol === -1) feeCol = c;
      else if (/^net$|net amount|net payout/i.test(h) && netCol === -1) netCol = c;
      else if (/^amount$|trans.*amt|total|target amount/i.test(h) && amountCol === -1) amountCol = c;
      else if (/debit|withdrawal|outflow|paid.*out|charge/i.test(h) && debitCol === -1) debitCol = c;
      else if (/credit|deposit|inflow|paid.*in/i.test(h) && creditCol === -1) creditCol = c;
      else if (/fitid|payout id|reference|ref_no/i.test(h) && fitIdCol === -1) fitIdCol = c;
      else if (/category|class|account/i.test(h) && categoryCol === -1) categoryCol = c;
    }

    // Fallbacks if columns were not recognized
    if (dateCol === -1) dateCol = 0;
    if (payeeCol === -1) payeeCol = headers.length > 1 ? 1 : 0;
    if (amountCol === -1 && debitCol === -1 && creditCol === -1) {
      if (netCol !== -1) {
        amountCol = netCol;
      } else {
        // Find first column with numeric values
        for (let c = 0; c < headers.length; c++) {
          if (c !== dateCol && c !== payeeCol && c !== checkCol && c !== fitIdCol) {
            amountCol = c;
            break;
          }
        }
      }
    }
  }

  const transactions: NormalizedTransaction[] = [];
  const seenHashes = new Set<string>();
  let duplicateCount = 0;

  for (let r = startDataRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || row.every(c => !c)) continue;

    const rawDate = row[dateCol] || '';
    if (!rawDate) continue;
    const date = normalizeDate(rawDate);

    // Check for ambiguous date
    const dateMatch = rawDate.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (dateMatch) {
      const p1 = parseInt(dateMatch[1], 10);
      const p2 = parseInt(dateMatch[2], 10);
      if (p1 <= 12 && p2 <= 12 && p1 !== p2) {
        warnings.push(`Ambiguous date "${rawDate}" detected in row ${r + 1}. Defaulted to MM/DD/YYYY convention.`);
      }
    }

    const payee = (row[payeeCol] || row[memoCol] || 'Bank Transaction').trim();
    const memo = memoCol !== -1 ? (row[memoCol] || '').trim() : '';
    const checkNum = checkCol !== -1 ? (row[checkCol] || '').trim() : undefined;
    const rawFitId = fitIdCol !== -1 ? (row[fitIdCol] || '').trim() : '';
    const category = categoryCol !== -1 ? (row[categoryCol] || '').trim() : undefined;

    let amount = 0;
    let fee: number | undefined;
    let gross: number | undefined;

    // Check for Stripe / PayPal fee columns
    if (options.splitFees && (grossCol !== -1 || amountCol !== -1) && feeCol !== -1) {
      gross = grossCol !== -1 ? parseAmount(row[grossCol]) : parseAmount(row[amountCol]);
      fee = parseAmount(row[feeCol]);
      amount = netCol !== -1 ? parseAmount(row[netCol]) : gross + fee;
    } else if (debitCol !== -1 || creditCol !== -1) {
      const debitVal = debitCol !== -1 ? parseAmount(row[debitCol]) : 0;
      const creditVal = creditCol !== -1 ? parseAmount(row[creditCol]) : 0;
      if (debitVal !== 0) {
        amount = -Math.abs(debitVal);
      } else if (creditVal !== 0) {
        amount = Math.abs(creditVal);
      }
    } else if (amountCol !== -1) {
      amount = parseAmount(row[amountCol]);
    } else if (netCol !== -1) {
      amount = parseAmount(row[netCol]);
    }

    // Amex / Credit Card sign flipper: expenses are positive, so flip to negative
    if (options.flipSigns) {
      amount = -amount;
    }

    // Type classification
    let type: NormalizedTransaction['type'] = amount < 0 ? 'DEBIT' : 'CREDIT';
    if (checkNum && checkNum.length > 0) {
      type = 'CHECK';
    }

    // Generate unique deterministic FITID if not provided in file
    const cleanDate = date.replace(/-/g, '');
    const absCents = Math.round(Math.abs(amount) * 100);
    const payeeKey = payee.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const fitId = rawFitId || `${cleanDate}${r}${absCents}${payeeKey}`;

    // Deduplication check: key by FITID if available, or (date + amount + payee)
    const dedupHash = rawFitId ? `fit_${rawFitId}` : `${date}_${amount}_${payee.toLowerCase().slice(0, 20)}`;
    if (options.deduplicate && seenHashes.has(dedupHash)) {
      duplicateCount++;
      continue;
    }
    seenHashes.add(dedupHash);

    transactions.push({
      id: `tx_${r}_${Date.now()}`,
      date,
      amount,
      payee,
      memo: memo || payee,
      checkNum,
      type,
      fitId,
      fee,
      gross,
      category,
      selected: true
    });
  }

  // Calculate summary metrics
  let credits = 0;
  let debits = 0;
  let netAmount = 0;

  for (const t of transactions) {
    if (t.amount > 0) credits += t.amount;
    else debits += Math.abs(t.amount);
    netAmount += t.amount;
  }

  return {
    transactions,
    account: {
      accountType: options.defaultAccountType || 'CHECKING',
      accountNumber: '4492',
      routingNumber: '3000',
      bankId: options.bankId || '3000',
      bankName: 'Bank Account',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    },
    detectedFormat: 'CSV',
    warnings,
    diagnostics: {
      totalRows: transactions.length,
      credits: Math.round(credits * 100) / 100,
      debits: Math.round(debits * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      duplicateCount,
      repairedCount: 0
    }
  };
}

/**
 * Escapes CSV field value per RFC-4180: quotes only if field contains comma, quote, or newline.
 */
export function escapeCSVField(str: string | undefined): string {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports transactions as standard CSV.
 */
export function exportToCSV(transactions: NormalizedTransaction[]): string {
  const headers = ['Date', 'Payee / Description', 'Amount', 'Type', 'Check #', 'Memo', 'FITID'];
  const lines = [headers.join(',')];

  for (const t of transactions) {
    const row = [
      t.date,
      escapeCSVField(t.payee),
      t.amount.toFixed(2),
      t.type,
      t.checkNum || '',
      escapeCSVField(t.memo),
      t.fitId
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Formats transactions to QuickBooks Online 3-column CSV: Date, Description, Amount.
 */
export function exportToQuickBooks3Col(transactions: NormalizedTransaction[]): string {
  const headers = ['Date', 'Description', 'Amount'];
  const lines = [headers.join(',')];

  for (const t of transactions) {
    const [y, m, d] = t.date.split('-');
    const usDate = `${m}/${d}/${y}`;
    const row = [
      usDate,
      escapeCSVField(t.payee),
      t.amount.toFixed(2)
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Formats transactions to QuickBooks Online 4-column CSV: Date, Description, Credit, Debit.
 */
export function exportToQuickBooks4Col(transactions: NormalizedTransaction[]): string {
  const headers = ['Date', 'Description', 'Credit', 'Debit'];
  const lines = [headers.join(',')];

  for (const t of transactions) {
    const [y, m, d] = t.date.split('-');
    const usDate = `${m}/${d}/${y}`;
    const credit = t.amount > 0 ? t.amount.toFixed(2) : '';
    const debit = t.amount < 0 ? Math.abs(t.amount).toFixed(2) : '';
    const row = [
      usDate,
      escapeCSVField(t.payee),
      credit,
      debit
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Formats transactions to Xero Bank Statement CSV format:
 * Date, Amount, Payee, Description, Reference, Check Number.
 */
export function exportToXeroCSV(
  transactions: NormalizedTransaction[],
  options: { standardFeed?: boolean } = {}
): string {
  if (options.standardFeed) {
    const headers = ['Date', 'Amount', 'Payee', 'Description', 'Reference'];
    const lines = [headers.join(',')];

    for (const t of transactions) {
      const [y, m, d] = t.date.split('-');
      const usDate = `${m}/${d}/${y}`;
      const row = [
        usDate,
        t.amount.toFixed(2),
        escapeCSVField(t.payee),
        escapeCSVField(t.memo),
        t.fitId
      ];
      lines.push(row.join(','));
    }

    return lines.join('\r\n');
  }

  const headers = ['*Date', '*Amount', 'Payee', 'Description', 'Reference', 'Check Number'];
  const lines = [headers.join(',')];

  for (const t of transactions) {
    const [y, m, d] = t.date.split('-');
    const usDate = `${m}/${d}/${y}`;
    const row = [
      usDate,
      t.amount.toFixed(2),
      escapeCSVField(t.payee),
      escapeCSVField(t.memo),
      t.fitId,
      t.checkNum || ''
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Exports transactions as TSV for immediate clipboard pasting into Excel or Google Sheets.
 */
export function exportToTSV(transactions: NormalizedTransaction[]): string {
  const headers = ['Date', 'Payee', 'Amount', 'Type', 'Check #', 'Memo'];
  const lines = [headers.join('\t')];

  for (const t of transactions) {
    const row = [
      t.date,
      t.payee,
      t.amount.toFixed(2),
      t.type,
      t.checkNum || '',
      t.memo
    ];
    lines.push(row.join('\t'));
  }

  return lines.join('\n');
}
