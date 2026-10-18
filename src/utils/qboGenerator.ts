import type { NormalizedTransaction, AccountMetadata, ConversionOptions } from './types';

/**
 * Strictly sanitizes a text string for QuickBooks OL-222 compliance:
 * - Replaces & with "and"
 * - Strips <, >, :, /, control characters
 * - Collapses repeated whitespace
 */
export function sanitizeSGMLString(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, 'and')
    .replace(/[<>:\/\r\n\t]/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncates <NAME> strictly to 32 characters per QuickBooks specification.
 * If overflow occurs, returns { name, overflow }.
 */
export function sanitizePayeeName(raw: string, safeMode = true): { name: string; overflow: string } {
  const sanitized = sanitizeSGMLString(raw);
  if (!safeMode || sanitized.length <= 32) {
    return { name: sanitized.slice(0, 32), overflow: '' };
  }
  return {
    name: sanitized.slice(0, 32).trim(),
    overflow: sanitized.slice(32).trim()
  };
}

/**
 * Formats ISO YYYY-MM-DD or other date into OFX timestamp YYYYMMDD120000.
 */
export function toOFXDate(dateStr: string): string {
  const digits = dateStr.replace(/[^0-9]/g, '');
  if (digits.length >= 8) {
    return `${digits.slice(0, 8)}120000`;
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}120000`;
}

/**
 * Formats a JavaScript Date to OFX timestamp YYYYMMDDHHMMSS.
 */
export function formatOFXNow(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${hh}${mm}${ss}`;
}

/**
 * Generates valid OFX 1.02 SGML QuickBooks Web Connect (.QBO) / OFX / QFX content.
 * Enforces strict CRLF line endings, explicit blank line before <OFX>, <LEDGERBAL>, and OL-222 sanitization.
 */
export function generateQBO(
  transactions: NormalizedTransaction[],
  account: AccountMetadata,
  options: ConversionOptions = { targetFormat: 'QBO', ol222SafeMode: true }
): string {
  const isCreditCard = account.accountType === 'CREDITCARD';
  const intuBid = account.bankId || '3000';
  const acctId = account.accountNumber || '4492';
  const routing = account.routingNumber || '3000';
  const currency = account.currency || 'USD';
  const nowTimestamp = formatOFXNow();

  // Find min/max dates
  let minDate = nowTimestamp;
  let maxDate = nowTimestamp;
  if (transactions.length > 0) {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    minDate = toOFXDate(sorted[0].date);
    maxDate = toOFXDate(sorted[sorted.length - 1].date);
  }

  // Calculate balance if not provided
  let balance = account.balance !== undefined ? account.balance : 0;
  if (account.balance === undefined && transactions.length > 0) {
    balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  }
  const balanceStr = balance.toFixed(2);

  // CRLF line ending is strictly required by Intuit Web Connect
  const CRLF = '\r\n';

  // Strict OFX 1.02 header
  let output = [
    'OFXHEADER:100',
    'DATA:OFXSGML',
    'VERSION:102',
    'SECURITY:NONE',
    'ENCODING:USASCII',
    'CHARSET:1252',
    'COMPRESSION:NONE',
    'OLDFILEUID:NONE',
    'NEWFILEUID:NONE'
  ].join(CRLF);

  // Explicit blank line required between headers and <OFX> tag
  output += CRLF + CRLF;

  output += '<OFX>' + CRLF;

  // Signon message set
  output += '  <SIGNONMSGSRSV1>' + CRLF;
  output += '    <SONRS>' + CRLF;
  output += '      <STATUS>' + CRLF;
  output += '        <CODE>0' + CRLF;
  output += '        <SEVERITY>INFO' + CRLF;
  output += '      </STATUS>' + CRLF;
  output += `      <DTSERVER>${nowTimestamp}` + CRLF;
  output += '      <LANGUAGE>ENG' + CRLF;
  output += `      <INTU.BID>${intuBid}` + CRLF;
  output += '    </SONRS>' + CRLF;
  output += '  </SIGNONMSGSRSV1>' + CRLF;

  if (isCreditCard) {
    // Credit card message set
    output += '  <CREDITCARDMSGSRSV1>' + CRLF;
    output += '    <CCSTMTTRNRS>' + CRLF;
    output += '      <TRNUID>1' + CRLF;
    output += '      <STATUS>' + CRLF;
    output += '        <CODE>0' + CRLF;
    output += '        <SEVERITY>INFO' + CRLF;
    output += '      </STATUS>' + CRLF;
    output += '      <CCSTMTRS>' + CRLF;
    output += `        <CURDEF>${currency}` + CRLF;
    output += '        <CCACCTFROM>' + CRLF;
    output += `          <ACCTID>${acctId}` + CRLF;
    output += '        </CCACCTFROM>' + CRLF;
    output += '        <BANKTRANLIST>' + CRLF;
    output += `          <DTSTART>${minDate}` + CRLF;
    output += `          <DTEND>${maxDate}` + CRLF;

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      const safeMode = options.ol222SafeMode !== false;
      const { name, overflow } = sanitizePayeeName(t.payee, safeMode);
      let memo = sanitizeSGMLString(t.memo || '');
      if (overflow) {
        memo = memo ? `${overflow} - ${memo}` : overflow;
      }
      memo = memo.slice(0, 255);

      const trnType = t.amount < 0 ? 'DEBIT' : 'CREDIT';
      const dtPosted = toOFXDate(t.date);
      const fitId = t.fitId || `${dtPosted.slice(0, 8)}${i}${Math.abs(Math.round(t.amount * 100))}`;

      output += '          <STMTTRN>' + CRLF;
      output += `            <TRNTYPE>${trnType}` + CRLF;
      output += `            <DTPOSTED>${dtPosted}` + CRLF;
      output += `            <TRNAMT>${t.amount.toFixed(2)}` + CRLF;
      output += `            <FITID>${fitId}` + CRLF;
      if (t.checkNum) {
        output += `            <CHECKNUM>${sanitizeSGMLString(t.checkNum)}` + CRLF;
      }
      output += `            <NAME>${name}` + CRLF;
      if (memo) {
        output += `            <MEMO>${memo}` + CRLF;
      }
      output += '          </STMTTRN>' + CRLF;
    }

    output += '        </BANKTRANLIST>' + CRLF;
    // Critical: <LEDGERBAL> is required by QuickBooks Web Connect to avoid Error OL-222
    output += '        <LEDGERBAL>' + CRLF;
    output += `          <BALAMT>${balanceStr}` + CRLF;
    output += `          <DTASOF>${maxDate}` + CRLF;
    output += '        </LEDGERBAL>' + CRLF;
    output += '      </CCSTMTRS>' + CRLF;
    output += '    </CCSTMTTRNRS>' + CRLF;
    output += '  </CREDITCARDMSGSRSV1>' + CRLF;
  } else {
    // Bank message set (Checking / Savings)
    const acctType = account.accountType === 'SAVINGS' ? 'SAVINGS' : 'CHECKING';
    output += '  <BANKMSGSRSV1>' + CRLF;
    output += '    <STMTTRNRS>' + CRLF;
    output += '      <TRNUID>1' + CRLF;
    output += '      <STATUS>' + CRLF;
    output += '        <CODE>0' + CRLF;
    output += '        <SEVERITY>INFO' + CRLF;
    output += '      </STATUS>' + CRLF;
    output += '      <STMTRS>' + CRLF;
    output += `        <CURDEF>${currency}` + CRLF;
    output += '        <BANKACCTFROM>' + CRLF;
    output += `          <BANKID>${routing}` + CRLF;
    output += `          <ACCTID>${acctId}` + CRLF;
    output += `          <ACCTTYPE>${acctType}` + CRLF;
    output += '        </BANKACCTFROM>' + CRLF;
    output += '        <BANKTRANLIST>' + CRLF;
    output += `          <DTSTART>${minDate}` + CRLF;
    output += `          <DTEND>${maxDate}` + CRLF;

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      const safeMode = options.ol222SafeMode !== false;
      const { name, overflow } = sanitizePayeeName(t.payee, safeMode);
      let memo = sanitizeSGMLString(t.memo || '');
      if (overflow) {
        memo = memo ? `${overflow} - ${memo}` : overflow;
      }
      memo = memo.slice(0, 255);

      const trnType = t.amount < 0 ? (t.type === 'CHECK' ? 'CHECK' : 'DEBIT') : 'CREDIT';
      const dtPosted = toOFXDate(t.date);
      const fitId = t.fitId || `${dtPosted.slice(0, 8)}${i}${Math.abs(Math.round(t.amount * 100))}`;

      output += '          <STMTTRN>' + CRLF;
      output += `            <TRNTYPE>${trnType}` + CRLF;
      output += `            <DTPOSTED>${dtPosted}` + CRLF;
      output += `            <TRNAMT>${t.amount.toFixed(2)}` + CRLF;
      output += `            <FITID>${fitId}` + CRLF;
      if (t.checkNum) {
        output += `            <CHECKNUM>${sanitizeSGMLString(t.checkNum)}` + CRLF;
      }
      output += `            <NAME>${name}` + CRLF;
      if (memo) {
        output += `            <MEMO>${memo}` + CRLF;
      }
      output += '          </STMTTRN>' + CRLF;
    }

    output += '        </BANKTRANLIST>' + CRLF;
    // Critical: <LEDGERBAL> is required by QuickBooks Web Connect to avoid Error OL-222
    output += '        <LEDGERBAL>' + CRLF;
    output += `          <BALAMT>${balanceStr}` + CRLF;
    output += `          <DTASOF>${maxDate}` + CRLF;
    output += '        </LEDGERBAL>' + CRLF;
    output += '      </STMTRS>' + CRLF;
    output += '    </STMTTRNRS>' + CRLF;
    output += '  </BANKMSGSRSV1>' + CRLF;
  }

  output += '</OFX>' + CRLF;
  return output;
}
