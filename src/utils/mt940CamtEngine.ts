import type { NormalizedTransaction, ParseResult } from './types';

/**
 * Parses SWIFT MT940 (.sta / .mt940) electronic bank statements.
 * Extracts transactions from :61: statement line and :86: information tags.
 */
export function parseMT940(mtText: string): ParseResult {
  const transactions: NormalizedTransaction[] = [];
  const warnings: string[] = [];
  const lines = mtText.split(/\r\n|\n|\r/);

  let currentTx: Partial<NormalizedTransaction> | null = null;
  let rowIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Match :61: Tag (Statement Line)
    // Format: :61:YYMMDD[MMDD]C|D|RC|RD[CurrencyCode]Amount[TransactionType]Reference
    if (line.startsWith(':61:')) {
      if (currentTx && currentTx.date && currentTx.amount !== undefined) {
        rowIdx++;
        transactions.push({
          id: `mt_${rowIdx}_${Date.now()}`,
          date: currentTx.date,
          amount: currentTx.amount,
          payee: currentTx.payee || 'SWIFT Transfer',
          memo: currentTx.memo || currentTx.payee || '',
          type: currentTx.amount < 0 ? 'DEBIT' : 'CREDIT',
          fitId: currentTx.fitId || `${currentTx.date.replace(/-/g, '')}${rowIdx}`,
          selected: true
        });
      }

      currentTx = {};
      const payload = line.slice(4).trim();
      // Match Date: YYMMDD
      const dateMatch = payload.match(/^(\d{2})(\d{2})(\d{2})/);
      if (dateMatch) {
        const yy = parseInt(dateMatch[1], 10);
        const y = yy > 70 ? `19${dateMatch[1]}` : `20${dateMatch[1]}`;
        const m = dateMatch[2];
        const d = dateMatch[3];
        currentTx.date = `${y}-${m}-${d}`;
      } else {
        currentTx.date = new Date().toISOString().slice(0, 10);
      }

      // Match Credit/Debit Mark and Amount
      // D = Debit (-), C = Credit (+), RC = Reversal Credit (-), RD = Reversal Debit (+)
      const amtMatch = payload.match(/(?:[0-9]{6})([0-9]{4})?([A-Z]{1,2})([A-Z]{3})?([0-9]+[.,][0-9]{2})/);
      if (amtMatch) {
        const indicator = amtMatch[2].toUpperCase();
        const rawNum = amtMatch[4].replace(',', '.');
        let val = parseFloat(rawNum) || 0;
        if (indicator.includes('D') && !indicator.includes('RD')) {
          val = -Math.abs(val);
        } else {
          val = Math.abs(val);
        }
        currentTx.amount = Math.round(val * 100) / 100;
      } else {
        currentTx.amount = 0;
      }

      currentTx.payee = 'SWIFT Transaction';
      currentTx.memo = payload;

      const refMatch = payload.match(/\/\/([A-Za-z0-9\-_]+)/);
      currentTx.fitId = refMatch ? refMatch[1] : `${(currentTx.date || '').replace(/-/g, '')}${rowIdx}${Math.abs(Math.round((currentTx.amount || 0) * 100))}`;
    } else if (line.startsWith(':86:') && currentTx) {
      // Information to Account Owner
      const info = line.slice(4).trim().replace(/\?2[0-9]/g, ' ');
      if (info.includes('|')) {
        const parts = info.split('|').map(s => s.trim());
        currentTx.payee = parts[0];
        currentTx.memo = parts[1] || parts[0];
      } else {
        currentTx.payee = info.slice(0, 50).trim() || currentTx.payee;
        currentTx.memo = info.trim();
      }
    }
  }

  // Push final transaction
  if (currentTx && currentTx.date && currentTx.amount !== undefined) {
    rowIdx++;
    transactions.push({
      id: `mt_${rowIdx}_${Date.now()}`,
      date: currentTx.date,
      amount: currentTx.amount,
      payee: currentTx.payee || 'SWIFT Transfer',
      memo: currentTx.memo || currentTx.payee || '',
      type: currentTx.amount < 0 ? 'DEBIT' : 'CREDIT',
      fitId: currentTx.fitId || `${currentTx.date.replace(/-/g, '')}${rowIdx}`,
      selected: true
    });
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
      bankName: 'SWIFT MT940 Account',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    },
    detectedFormat: 'MT940',
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

/**
 * Parses ISO 20022 CAMT.053 XML bank statement files.
 */
export function parseCAMT053(xmlText: string): ParseResult {
  const transactions: NormalizedTransaction[] = [];
  const warnings: string[] = [];

  // Match each <Ntry>...</Ntry> block
  const entryMatches = xmlText.match(/<Ntry>([\s\S]*?)<\/Ntry>/gi) || [];
  let rowIdx = 0;

  for (const block of entryMatches) {
    rowIdx++;
    // Amount & Credit/Debit indicator
    const amtMatch = block.match(/<Amt[^>]*>([0-9.,]+)<\/Amt>/i);
    const indMatch = block.match(/<CdtDbtInd>([A-Z]+)<\/CdtDbtInd>/i);

    let amount = amtMatch ? parseFloat(amtMatch[1].replace(',', '.')) : 0;
    const isDebit = indMatch && indMatch[1].toUpperCase() === 'DBIT';
    if (isDebit) {
      amount = -Math.abs(amount);
    } else {
      amount = Math.abs(amount);
    }

    // Date
    let date = new Date().toISOString().slice(0, 10);
    const dateMatch = block.match(/<BookgDt>[\s\S]*?<Dt>([0-9]{4}-[0-9]{2}-[0-9]{2})<\/Dt>/i);
    if (dateMatch && dateMatch[1]) {
      date = dateMatch[1];
    }

    // Payee / Party
    let payee = 'ISO 20022 Transfer';
    const nmMatch = block.match(/<(?:Cdtr|Dbtr)>[\s\S]*?<Nm>([^<]+)<\/Nm>/i);
    if (nmMatch && nmMatch[1]) {
      payee = nmMatch[1].trim();
    }

    // Memo / Remittance Info
    let memo = payee;
    const rmtMatch = block.match(/<Ustrd>([^<]+)<\/Ustrd>/i);
    if (rmtMatch && rmtMatch[1]) {
      memo = rmtMatch[1].trim();
    }

    // Unique Entry Ref
    let fitId = `${date.replace(/-/g, '')}${rowIdx}${Math.abs(Math.round(amount * 100))}`;
    const refMatch = block.match(/<AcctSvcrRef>([^<]+)<\/AcctSvcrRef>/i);
    if (refMatch && refMatch[1]) {
      fitId = refMatch[1].trim();
    }

    transactions.push({
      id: `camt_${rowIdx}_${Date.now()}`,
      date,
      amount: Math.round(amount * 100) / 100,
      payee,
      memo,
      type: amount < 0 ? 'DEBIT' : 'CREDIT',
      fitId,
      selected: true
    });
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
      bankName: 'ISO 20022 CAMT Account',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    },
    detectedFormat: 'CAMT.053',
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
