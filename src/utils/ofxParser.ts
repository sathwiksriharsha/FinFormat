import type { NormalizedTransaction, AccountMetadata, ParseResult } from './types';

/**
 * Universal OFX 1.x (SGML unclosed tags) and OFX 2.x (XML closed tags) parser.
 * Works seamlessly with .QBO, .OFX, and .QFX files.
 */
export function parseOFX(ofxContent: string): ParseResult {
  const warnings: string[] = [];
  const transactions: NormalizedTransaction[] = [];

  // Extract INTU.BID if present
  let bankId = '3000';
  const bidMatch = ofxContent.match(/<INTU\.BID>([^\r\n<]+)/i);
  if (bidMatch && bidMatch[1]) {
    bankId = bidMatch[1].trim();
  }

  // Determine Account Type and Account ID
  let accountType: AccountMetadata['accountType'] = 'CHECKING';
  let accountNumber = '4492';
  let routingNumber = '3000';

  if (/<CREDITCARDMSGSRSV1>|<CCSTMTRS>|<CCACCTFROM>/i.test(ofxContent)) {
    accountType = 'CREDITCARD';
  } else if (/<ACCTTYPE>SAVINGS/i.test(ofxContent)) {
    accountType = 'SAVINGS';
  }

  const acctMatch = ofxContent.match(/<ACCTID>([^\r\n<]+)/i);
  if (acctMatch && acctMatch[1]) {
    accountNumber = acctMatch[1].trim();
  }

  const bankIdMatch = ofxContent.match(/<BANKID>([^\r\n<]+)/i);
  if (bankIdMatch && bankIdMatch[1]) {
    routingNumber = bankIdMatch[1].trim();
  }

  // Extract STMTTRN blocks
  // In OFX SGML, transactions are delimited by <STMTTRN> ... </STMTTRN> (or next <STMTTRN> / </BANKTRANLIST>)
  const stmtMatches = ofxContent.match(/<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>|<\/BANKTRANLIST>))/gi) || [];

  let rowIdx = 0;
  for (const block of stmtMatches) {
    rowIdx++;

    // Extract tags: works for both <TAG>value and <TAG>value</TAG>
    const getTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^\r\n<]+)(?:<\\/${tag}>)?`, 'i');
      const m = block.match(regex);
      return m && m[1] ? m[1].trim() : '';
    };

    const trnType = getTag('TRNTYPE').toUpperCase();
    const rawDtPosted = getTag('DTPOSTED');
    const rawAmt = getTag('TRNAMT');
    const fitId = getTag('FITID');
    const checkNum = getTag('CHECKNUM');
    const name = getTag('NAME');
    const memo = getTag('MEMO');

    if (!rawDtPosted || !rawAmt) continue;

    // Parse OFX Date: YYYYMMDD...
    let date = new Date().toISOString().slice(0, 10);
    const dateDigits = rawDtPosted.replace(/[^0-9]/g, '');
    if (dateDigits.length >= 8) {
      const y = dateDigits.slice(0, 4);
      const m = dateDigits.slice(4, 6);
      const d = dateDigits.slice(6, 8);
      date = `${y}-${m}-${d}`;
    }

    const amount = parseFloat(rawAmt) || 0;
    const payee = name || memo || 'Transaction';

    transactions.push({
      id: `ofx_tx_${rowIdx}_${Date.now()}`,
      date,
      amount: Math.round(amount * 100) / 100,
      payee,
      memo: memo || payee,
      checkNum: checkNum || undefined,
      type: amount < 0 ? (trnType === 'CHECK' ? 'CHECK' : 'DEBIT') : 'CREDIT',
      fitId: fitId || `${date.replace(/-/g, '')}${rowIdx}${Math.abs(Math.round(amount * 100))}`,
      selected: true
    });
  }

  // Metrics
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
      accountNumber,
      routingNumber,
      bankId,
      bankName: accountType === 'CREDITCARD' ? 'Credit Card Account' : 'Checking Account',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    },
    detectedFormat: /<INTU\.BID>/i.test(ofxContent) ? 'QBO' : 'OFX',
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
