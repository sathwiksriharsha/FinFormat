import type { NormalizedTransaction, AccountMetadata, ParseResult } from './types';

/**
 * Generates mathematically balanced double-entry QuickBooks Desktop .IIF content.
 * Enforces:
 * - Literal tab (\t) delimiters
 * - CRLF (\r\n) line breaks
 * - TRNS row + SPL row + ENDTRNS row for every transaction
 * - TRNS.AMOUNT + SPL.AMOUNT === 0.00
 */
export function generateIIF(
  transactions: NormalizedTransaction[],
  account: AccountMetadata
): string {
  const isCreditCard = account.accountType === 'CREDITCARD';
  const mainAccount = isCreditCard ? (account.bankName || 'Credit Card') : (account.bankName || 'Checking');
  const defaultOffset = account.iifOffsetAccount || 'Ask My Accountant';

  const CRLF = '\r\n';
  const lines: string[] = [];

  // Intuit Header definitions (Tab separated)
  lines.push(['!TRNS', 'TRNSTYPE', 'DATE', 'ACCNT', 'NAME', 'AMOUNT', 'DOCNUM', 'MEMO', 'CLEAR'].join('\t'));
  lines.push(['!SPL', 'TRNSTYPE', 'DATE', 'ACCNT', 'NAME', 'AMOUNT', 'DOCNUM', 'MEMO', 'CLEAR'].join('\t'));
  lines.push(['!ENDTRNS'].join('\t'));

  for (const t of transactions) {
    // Format date as MM/DD/YYYY for QuickBooks Desktop IIF
    const [y, m, d] = t.date.split('-');
    const iifDate = `${m}/${d}/${y}`;

    let trnsType = 'CHECK';
    if (isCreditCard) {
      trnsType = t.amount < 0 ? 'CREDIT CARD' : 'CCARD REFUND';
    } else {
      trnsType = t.amount < 0 ? (t.type === 'CHECK' ? 'CHECK' : 'CHECK') : 'DEPOSIT';
    }

    const cleanPayee = t.payee.replace(/[\t\r\n]/g, ' ').trim();
    const cleanMemo = (t.memo || t.payee).replace(/[\t\r\n]/g, ' ').trim();
    const docNum = t.checkNum || '';

    // Primary TRNS row
    const trnsAmount = t.amount;
    const trnsRow = [
      'TRNS',
      trnsType,
      iifDate,
      mainAccount,
      cleanPayee,
      trnsAmount.toFixed(2),
      docNum,
      cleanMemo,
      'N'
    ].join('\t');
    lines.push(trnsRow);

    // Balanced SPL row: exactly -trnsAmount
    const splAmount = -trnsAmount;
    const offsetAccount = t.category || defaultOffset;
    const splRow = [
      'SPL',
      trnsType,
      iifDate,
      offsetAccount,
      cleanPayee,
      splAmount.toFixed(2),
      docNum,
      cleanMemo,
      'N'
    ].join('\t');
    lines.push(splRow);

    // End of transaction block
    lines.push('ENDTRNS');
  }

  return lines.join(CRLF) + CRLF;
}

/**
 * Parses QuickBooks Desktop IIF content into NormalizedTransaction array.
 */
export function parseIIF(iifText: string): ParseResult {
  const lines = iifText.split(/\r\n|\n|\r/);
  const transactions: NormalizedTransaction[] = [];
  const warnings: string[] = [];

  let rowIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('!')) continue;

    const cols = line.split('\t');
    const recordType = cols[0];

    if (recordType === 'TRNS') {
      rowIdx++;
      const trnsType = cols[1] || '';
      const rawDate = cols[2] || '';
      const payee = cols[4] || 'Payee';
      const amount = parseFloat(cols[5]) || 0;
      const docNum = cols[6] || undefined;
      const memo = cols[7] || payee;

      // Normalize date MM/DD/YYYY -> YYYY-MM-DD
      let date = new Date().toISOString().slice(0, 10);
      const dateParts = rawDate.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
      if (dateParts) {
        let m = dateParts[1].padStart(2, '0');
        let d = dateParts[2].padStart(2, '0');
        let y = dateParts[3];
        if (y.length === 2) y = parseInt(y, 10) > 70 ? `19${y}` : `20${y}`;
        date = `${y}-${m}-${d}`;
      }

      // Look ahead for SPL row(s) to capture category/offset account and verify balance
      let category: string | undefined;
      let splSum = 0;
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith('ENDTRNS') && !lines[j].trim().startsWith('TRNS')) {
        const splLine = lines[j].trim();
        if (splLine.startsWith('SPL')) {
          const splCols = splLine.split('\t');
          if (!category && splCols[3]) {
            category = splCols[3].trim();
          }
          splSum += parseFloat(splCols[5]) || 0;
        }
        j++;
      }

      if (Math.abs(amount + splSum) > 0.01 && splSum !== 0) {
        warnings.push(`Unbalanced IIF block on ${rawDate}: TRNS (${amount}) + SPL (${splSum}) !== 0`);
      }

      transactions.push({
        id: `iif_tx_${rowIdx}_${Date.now()}`,
        date,
        amount: Math.round(amount * 100) / 100,
        payee,
        memo,
        checkNum: docNum,
        category,
        type: amount < 0 ? (trnsType === 'CHECK' ? 'CHECK' : 'DEBIT') : 'CREDIT',
        fitId: `${date.replace(/-/g, '')}${rowIdx}${Math.abs(Math.round(amount * 100))}`,
        selected: true
      });
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
      accountType: 'CHECKING',
      accountNumber: '4492',
      routingNumber: '3000',
      bankId: '3000',
      bankName: 'QuickBooks Desktop IIF Account',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    },
    detectedFormat: 'IIF',
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
