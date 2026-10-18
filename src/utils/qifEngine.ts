import type { NormalizedTransaction, AccountMetadata, ParseResult } from './types';

/**
 * Generates valid Quicken Interchange Format (.QIF) content.
 * Enforces !Type:Bank or !Type:CCard header and standalone ^ record terminators.
 */
export function generateQIF(
  transactions: NormalizedTransaction[],
  account: AccountMetadata
): string {
  const isCreditCard = account.accountType === 'CREDITCARD';
  const CRLF = '\r\n';
  const lines: string[] = [];

  // QIF header
  lines.push(isCreditCard ? '!Type:CCard' : '!Type:Bank');

  for (const t of transactions) {
    const [y, m, d] = t.date.split('-');
    // Standard QIF Date: MM/DD/YYYY
    lines.push(`D${m}/${d}/${y}`);
    lines.push(`T${t.amount.toFixed(2)}`);
    lines.push(`P${t.payee.replace(/[\r\n]/g, ' ')}`);
    if (t.memo) {
      lines.push(`M${t.memo.replace(/[\r\n]/g, ' ')}`);
    }
    if (t.checkNum) {
      lines.push(`N${t.checkNum.replace(/[\r\n]/g, ' ')}`);
    }
    if (t.category) {
      lines.push(`L${t.category.replace(/[\r\n]/g, ' ')}`);
    }
    // Standalone record terminator
    lines.push('^');
  }

  return lines.join(CRLF) + CRLF;
}

/**
 * Parses Quicken QIF content into NormalizedTransaction array.
 */
export function parseQIF(qifContent: string): ParseResult {
  const lines = qifContent.split(/\r\n|\n|\r/);
  const transactions: NormalizedTransaction[] = [];
  const warnings: string[] = [];

  let accountType: AccountMetadata['accountType'] = 'CHECKING';
  let curDate = '';
  let curAmount = 0;
  let curPayee = '';
  let curMemo = '';
  let curCheckNum: string | undefined;
  let curCategory: string | undefined;
  let rowIdx = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('!Type:')) {
      const typeHeader = line.slice(6).toLowerCase();
      if (typeHeader.includes('ccard') || typeHeader.includes('credit')) {
        accountType = 'CREDITCARD';
      }
      continue;
    }

    const code = line[0];
    const val = line.slice(1).trim();

    switch (code) {
      case 'D': {
        // Date parsing (MM/DD/YYYY or DD/MM/YYYY)
        const dateMatch = val.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
        if (dateMatch) {
          let m = dateMatch[1].padStart(2, '0');
          let d = dateMatch[2].padStart(2, '0');
          let y = dateMatch[3];
          if (y.length === 2) y = parseInt(y, 10) > 70 ? `19${y}` : `20${y}`;
          curDate = `${y}-${m}-${d}`;
        } else {
          curDate = new Date().toISOString().slice(0, 10);
        }
        break;
      }
      case 'T':
      case 'U': {
        curAmount = parseFloat(val.replace(/[$,]/g, '')) || 0;
        break;
      }
      case 'P': {
        curPayee = val;
        break;
      }
      case 'M': {
        curMemo = val;
        break;
      }
      case 'N': {
        curCheckNum = val;
        break;
      }
      case 'L': {
        curCategory = val;
        break;
      }
      case '^': {
        // End of transaction record
        if (curDate && !isNaN(curAmount)) {
          rowIdx++;
          const amount = Math.round(curAmount * 100) / 100;
          const payee = curPayee || curMemo || 'QIF Transaction';
          transactions.push({
            id: `qif_tx_${rowIdx}_${Date.now()}`,
            date: curDate,
            amount,
            payee,
            memo: curMemo || payee,
            checkNum: curCheckNum,
            category: curCategory,
            type: amount < 0 ? (curCheckNum ? 'CHECK' : 'DEBIT') : 'CREDIT',
            fitId: `${curDate.replace(/-/g, '')}${rowIdx}${Math.abs(Math.round(amount * 100))}`,
            selected: true
          });
        }
        // Reset current record state
        curDate = '';
        curAmount = 0;
        curPayee = '';
        curMemo = '';
        curCheckNum = undefined;
        curCategory = undefined;
        break;
      }
    }
  }

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
      accountType,
      accountNumber: '4492',
      routingNumber: '3000',
      bankId: '3000',
      bankName: accountType === 'CREDITCARD' ? 'Quicken Credit Card' : 'Quicken Bank Account',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    },
    detectedFormat: 'QIF',
    warnings,
    diagnostics: {
      totalRows: transactions.length,
      credits: Math.round(credits * 100) / 100,
      debits: Math.round(debits * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      duplicateCount: 0,
      repairedCount: 0
    }
  };
}
