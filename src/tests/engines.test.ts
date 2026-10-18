import { describe, it, expect } from 'vitest';
import { parseCSV, exportToQuickBooks3Col, exportToXeroCSV, parseAmount, normalizeDate } from '../utils/csvEngine';
import { generateQBO, sanitizePayeeName, sanitizeSGMLString } from '../utils/qboGenerator';
import { parseOFX } from '../utils/ofxParser';
import { generateIIF, parseIIF } from '../utils/iifEngine';
import { generateQIF, parseQIF } from '../utils/qifEngine';
import { parseMT940, parseCAMT053 } from '../utils/mt940CamtEngine';
import { CHASE_CHECKING_SAMPLE_CSV, AMEX_CREDIT_CARD_SAMPLE_CSV, STRIPE_PROCESSOR_SAMPLE_CSV, BROKEN_OL222_QBO_SAMPLE } from '../utils/sampleData';
import type { AccountMetadata } from '../utils/types';

describe('FinFormat Conversion & Repair Engines', () => {

  describe('1. CSV Engine & Smart Detection', () => {
    it('parses amounts correctly with parentheses, currency symbols, and commas', () => {
      expect(parseAmount('$1,234.56')).toBe(1234.56);
      expect(parseAmount('($45.99)')).toBe(-45.99);
      expect(parseAmount('-$120.00')).toBe(-120.00);
      expect(parseAmount('+50.25')).toBe(50.25);
      expect(parseAmount(' 100.50 CR ')).toBe(100.50);
      expect(parseAmount(' 100.50 DR ')).toBe(-100.50);
    });

    it('normalizes various date formats to ISO YYYY-MM-DD', () => {
      expect(normalizeDate('10/18/2026')).toBe('2026-10-18');
      expect(normalizeDate('2026-10-18')).toBe('2026-10-18');
      expect(normalizeDate('1/5/26')).toBe('2026-01-05');
      expect(normalizeDate('12/31/1999')).toBe('1999-12-31');
    });

    it('parses standard Chase CSV with debit/credit signs and check numbers', () => {
      const res = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      expect(res.transactions.length).toBe(7);
      
      const checkTx = res.transactions.find(t => t.checkNum === '1042');
      expect(checkTx).toBeDefined();
      expect(checkTx?.amount).toBe(-2200.00);
      expect(checkTx?.type).toBe('CHECK');

      const wireTx = res.transactions.find(t => t.payee.includes('ACME CORP'));
      expect(wireTx).toBeDefined();
      expect(wireTx?.amount).toBe(4850.00);
      expect(wireTx?.type).toBe('CREDIT');
    });

    it('flips signs correctly for Credit Card mode (American Express)', () => {
      // Raw Amex CSV has positive charges
      const normalRes = parseCSV(AMEX_CREDIT_CARD_SAMPLE_CSV, { flipSigns: false });
      const deltaNormal = normalRes.transactions.find(t => t.payee.includes('DELTA AIR'));
      expect(deltaNormal?.amount).toBe(485.60);

      // Flipped Amex CSV has negative charges (expenses)
      const flippedRes = parseCSV(AMEX_CREDIT_CARD_SAMPLE_CSV, { flipSigns: true });
      const deltaFlipped = flippedRes.transactions.find(t => t.payee.includes('DELTA AIR'));
      expect(deltaFlipped?.amount).toBe(-485.60);

      // Payment on credit card (-2500 in Amex) becomes positive deposit (+2500)
      const paymentFlipped = flippedRes.transactions.find(t => t.payee.includes('ONLINE PAYMENT'));
      expect(paymentFlipped?.amount).toBe(2500.00);
    });

    it('splits Gross, Fee, and Net columns for Stripe/PayPal processor CSVs', () => {
      const res = parseCSV(STRIPE_PROCESSOR_SAMPLE_CSV, { splitFees: true });
      expect(res.transactions.length).toBe(5);
      const first = res.transactions[0];
      expect(first.gross).toBe(150.00);
      expect(first.fee).toBe(4.65);
      expect(first.amount).toBe(145.35); // Net payout
    });

    it('exports QuickBooks 3-column CSV and Xero format', () => {
      const res = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      const qb3 = exportToQuickBooks3Col(res.transactions);
      expect(qb3).toContain('Date,Description,Amount');
      expect(qb3).toContain('10/12/2026');

      const xero = exportToXeroCSV(res.transactions);
      expect(xero).toContain('*Date,*Amount,Payee,Description,Reference,Check Number');
    });
  });

  describe('2. QuickBooks QBO Generation & OL-222 Sanitization', () => {
    const mockAccount: AccountMetadata = {
      accountType: 'CHECKING',
      accountNumber: '9984',
      routingNumber: '121000247',
      bankId: '3000',
      bankName: 'Wells Fargo',
      currency: 'USD',
      iifOffsetAccount: 'Ask My Accountant'
    };

    it('sanitizes illegal SGML characters (&, <, >, :) and collapses spaces', () => {
      expect(sanitizeSGMLString('AT&T & Sons <Telecom> : 2026')).toBe('ATandT and Sons Telecom 2026');
    });

    it('strictly caps <NAME> at 32 characters and routes overflow to memo', () => {
      const longPayee = 'BARNES & NOBLE BOOKSELLERS #4928 NEW YORK CITY NY';
      const { name, overflow } = sanitizePayeeName(longPayee, true);
      expect(name.length).toBeLessThanOrEqual(32);
      expect(overflow.length).toBeGreaterThan(0);
      expect(name).toBe('BARNES and NOBLE BOOKSELLERS #49');
    });

    it('generates valid OFX 1.02 SGML with CRLF endings and blank line before <OFX>', () => {
      const parsed = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      const qbo = generateQBO(parsed.transactions, mockAccount);

      // Must use CRLF
      expect(qbo).toContain('\r\n');
      // Must contain explicit blank line between header and <OFX>
      expect(qbo).toContain('NEWFILEUID:NONE\r\n\r\n<OFX>');
      // Must contain INTU.BID
      expect(qbo).toContain('<INTU.BID>3000');
      // Must contain mandatory LEDGERBAL block to prevent OL-222
      expect(qbo).toContain('<LEDGERBAL>');
      expect(qbo).toContain('<BALAMT>');
      expect(qbo).toContain('<DTASOF>');
      // Must contain BANKMSGSRSV1 for checking
      expect(qbo).toContain('<BANKMSGSRSV1>');
      expect(qbo).toContain('<BANKID>121000247');
      expect(qbo).toContain('<ACCTID>9984');
    });

    it('generates CREDITCARDMSGSRSV1 when account type is CREDITCARD', () => {
      const ccAccount: AccountMetadata = { ...mockAccount, accountType: 'CREDITCARD' };
      const parsed = parseCSV(AMEX_CREDIT_CARD_SAMPLE_CSV, { flipSigns: true });
      const qbo = generateQBO(parsed.transactions, ccAccount);

      expect(qbo).toContain('<CREDITCARDMSGSRSV1>');
      expect(qbo).toContain('<CCSTMTRS>');
      expect(qbo).toContain('<CCACCTFROM>');
      expect(qbo).not.toContain('<BANKACCTFROM>');
    });

    it('guarantees deterministic FITID generation for duplicate prevention', () => {
      const parsed1 = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      const parsed2 = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      expect(parsed1.transactions[0].fitId).toBe(parsed2.transactions[0].fitId);
    });
  });

  describe('3. Dual OFX/QFX/QBO Parser & Round-Trip Equivalence', () => {
    it('parses corrupt broken QBO with unescaped ampersands and fixes it', () => {
      const parsed = parseOFX(BROKEN_OL222_QBO_SAMPLE);
      expect(parsed.transactions.length).toBe(3);
      expect(parsed.transactions[0].amount).toBe(-185.40);
      expect(parsed.transactions[1].amount).toBe(-45.00);
      expect(parsed.transactions[2].amount).toBe(3250.00);

      // Now generate clean QBO from parsed transactions
      const cleanQbo = generateQBO(parsed.transactions, parsed.account, { targetFormat: 'QBO', ol222SafeMode: true });
      expect(cleanQbo).not.toContain('& '); // All & replaced with and
      expect(cleanQbo).toContain('<LEDGERBAL>'); // LEDGERBAL injected
    });

    it('round-trip test: CSV -> QBO -> CSV transactions are equivalent', () => {
      const initial = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      const qboText = generateQBO(initial.transactions, initial.account);
      const reParsed = parseOFX(qboText);

      expect(reParsed.transactions.length).toBe(initial.transactions.length);
      for (let i = 0; i < initial.transactions.length; i++) {
        expect(reParsed.transactions[i].date).toBe(initial.transactions[i].date);
        expect(reParsed.transactions[i].amount).toBe(initial.transactions[i].amount);
      }
    });
  });

  describe('4. QuickBooks Desktop Balanced IIF Engine', () => {
    it('generates tab-delimited IIF where TRNS.amount + SPL.amount === 0.00 for 100% of rows', () => {
      const parsed = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      const iifText = generateIIF(parsed.transactions, parsed.account);

      expect(iifText).toContain('!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\tCLEAR');
      expect(iifText).toContain('!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\tCLEAR');
      expect(iifText).toContain('!ENDTRNS');

      // Verify every transaction has balanced TRNS and SPL
      const lines = iifText.split('\r\n');
      let currentTrnsAmount = 0;
      let hasOpenTrns = false;

      for (const line of lines) {
        if (!line || line.startsWith('!')) continue;
        const cols = line.split('\t');
        if (cols[0] === 'TRNS') {
          currentTrnsAmount = parseFloat(cols[5]);
          hasOpenTrns = true;
        } else if (cols[0] === 'SPL') {
          const splAmount = parseFloat(cols[5]);
          expect(hasOpenTrns).toBe(true);
          // Mathematical double-entry balance check:
          expect(Math.abs(currentTrnsAmount + splAmount)).toBeLessThanOrEqual(0.0001);
        } else if (cols[0] === 'ENDTRNS') {
          hasOpenTrns = false;
        }
      }

      // Verify parsing back
      const reParsedIIF = parseIIF(iifText);
      expect(reParsedIIF.transactions.length).toBe(parsed.transactions.length);
    });
  });

  describe('5. Quicken QIF Engine', () => {
    it('generates valid QIF with !Type header and ^ terminators', () => {
      const parsed = parseCSV(CHASE_CHECKING_SAMPLE_CSV);
      const qifText = generateQIF(parsed.transactions, parsed.account);

      expect(qifText).toContain('!Type:Bank');
      expect(qifText).toContain('^');

      const reParsed = parseQIF(qifText);
      expect(reParsed.transactions.length).toBe(parsed.transactions.length);
      expect(reParsed.transactions[0].amount).toBe(parsed.transactions[0].amount);
    });
  });

  describe('6. SWIFT MT940 and CAMT.053 XML Parsers', () => {
    it('parses SWIFT MT940 statement lines (:61:) and info (:86:)', () => {
      const mt940Sample = `:20:START
:25:123456789
:28C:00001
:60F:C261001USD10000,00
:61:2610121012D150,00NTRFNONREF//ACME
:86:WIRE PAYMENT TO VENDOR
:61:2610151015C3200,50NTRFNONREF//CLIENT
:86:CLIENT INVOICE SETTLEMENT
:62F:C261018USD13050,50`;

      const parsed = parseMT940(mt940Sample);
      expect(parsed.transactions.length).toBe(2);
      expect(parsed.transactions[0].amount).toBe(-150.00);
      expect(parsed.transactions[0].date).toBe('2026-10-12');
      expect(parsed.transactions[1].amount).toBe(3200.50);
      expect(parsed.transactions[1].date).toBe('2026-10-15');
    });

    it('parses ISO 20022 CAMT.053 XML statement entries', () => {
      const camtSample = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="USD">480.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2026-10-16</Dt></BookgDt>
        <RltdPties><Cdtr><Nm>OFFICE SUPPLIES CORP</Nm></Cdtr></RltdPties>
        <RmtInf><Ustrd>Monthly paper order</Ustrd></RmtInf>
      </Ntry>
      <Ntry>
        <Amt Ccy="USD">1500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2026-10-17</Dt></BookgDt>
        <RltdPties><Dbtr><Nm>CUSTOMER DEPOSIT</Nm></Dbtr></RltdPties>
        <RmtInf><Ustrd>Retainer fee</Ustrd></RmtInf>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

      const parsed = parseCAMT053(camtSample);
      expect(parsed.transactions.length).toBe(2);
      expect(parsed.transactions[0].amount).toBe(-480.00);
      expect(parsed.transactions[0].date).toBe('2026-10-16');
      expect(parsed.transactions[1].amount).toBe(1500.00);
      expect(parsed.transactions[1].date).toBe('2026-10-17');
    });
  });

});
