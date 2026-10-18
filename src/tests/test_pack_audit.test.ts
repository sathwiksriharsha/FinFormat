import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseCSV, exportToCSV, exportToQuickBooks3Col, exportToQuickBooks4Col, exportToXeroCSV } from '../utils/csvEngine';
import { generateQBO, sanitizePayeeName, sanitizeSGMLString } from '../utils/qboGenerator';
import { parseOFX } from '../utils/ofxParser';
import { generateIIF, parseIIF } from '../utils/iifEngine';
import { generateQIF, parseQIF } from '../utils/qifEngine';
import { parseMT940, parseCAMT053 } from '../utils/mt940CamtEngine';
import { BANK_PRESETS } from '../config/bankPresets';
import { FORMAT_ROUTES } from '../config/formatRoutes';
import type { NormalizedTransaction, AccountMetadata } from '../utils/types';

// Path to FinFormat Test Pack
const TEST_PACK_DIR = path.resolve(process.cwd(), 'FinFormat_Test_Pack', 'FinFormat_Test_Pack');
const FIXTURES_DIR = path.join(TEST_PACK_DIR, 'fixtures');
const EXPECTED_DIR = path.join(TEST_PACK_DIR, 'expected');

function loadFixture(relPath: string): string {
  const fullPath = path.join(TEST_PACK_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Fixture file not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

const mockDefaultAccount: AccountMetadata = {
  accountType: 'CHECKING',
  accountNumber: '000012345678',
  routingNumber: '021000021',
  bankId: '3000',
  bankName: 'Test Bank',
  currency: 'USD',
  iifOffsetAccount: 'Ask My Accountant'
};

describe('FinFormat Synthetic Test Pack — Comprehensive Audit', () => {

  const invariants = JSON.parse(fs.readFileSync(path.join(EXPECTED_DIR, 'expected-invariants.json'), 'utf8'));

  describe('Part 1: Canonical 25 Core Converter, Formatter, Repair & Merge Routes', () => {

    it('Route 1 [csv-to-qbo]: converts canonical CSV to valid QBO and round-trips correctly', () => {
      const csvContent = loadFixture('fixtures/csv/csv-basic-single-amount.csv');
      const parsed = parseCSV(csvContent);
      expect(parsed.transactions.length).toBe(invariants.base_transaction_count);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);

      // Verify canonical FITIDs
      const fitIds = parsed.transactions.map(t => t.fitId);
      expect(fitIds).toEqual(invariants.base_fitids);

      // Generate QBO
      const qbo = generateQBO(parsed.transactions, mockDefaultAccount);
      expect(qbo).toContain('OFXHEADER:100');
      expect(qbo).toContain('<INTU.BID>3000');
      expect(qbo).toContain('<LEDGERBAL>');

      // Round-trip parse generated QBO
      const roundTrip = parseOFX(qbo);
      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
      expect(roundTrip.transactions.map(t => t.fitId)).toEqual(invariants.base_fitids);
    });

    it('Route 2 [qbo-to-csv]: converts QBO statement to clean CSV with matching net change', () => {
      const qboContent = loadFixture('fixtures/qbo/sample-bank.qbo');
      const parsed = parseOFX(qboContent);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
      expect(parsed.transactions.map(t => t.fitId)).toEqual(invariants.base_fitids);

      const csv = exportToCSV(parsed.transactions);
      expect(csv).toContain('Date,Payee / Description,Amount');
      expect(csv).toContain('Shopify payout');
      expect(csv).toContain('1250.00');
      expect(csv).toContain('-84.17');
    });

    it('Route 3 [csv-to-iif]: converts CSV to mathematically balanced IIF blocks (TRNS + SPL = 0)', () => {
      const csvContent = loadFixture('fixtures/csv/csv-basic-single-amount.csv');
      const parsed = parseCSV(csvContent);
      const iif = generateIIF(parsed.transactions, mockDefaultAccount);

      expect(iif).toContain('!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT');
      expect(iif).toContain('!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT');
      expect(iif).toContain('!ENDTRNS');

      // Round-trip verify double-entry balance
      const parsedIIF = parseIIF(iif);
      expect(parsedIIF.transactions.length).toBe(5);
      expect(parsedIIF.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 4 [qbo-to-iif]: converts QBO statement to balanced IIF with mapped accounts', () => {
      const qboContent = loadFixture('fixtures/qbo/sample-bank.qbo');
      const parsed = parseOFX(qboContent);
      const iif = generateIIF(parsed.transactions, mockDefaultAccount);
      const parsedIIF = parseIIF(iif);

      expect(parsedIIF.transactions.length).toBe(5);
      expect(parsedIIF.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 5 [ofx-to-iif]: converts standard OFX to balanced IIF format', () => {
      const ofxContent = loadFixture('fixtures/ofx/sample-bank.ofx');
      const parsed = parseOFX(ofxContent);
      const iif = generateIIF(parsed.transactions, mockDefaultAccount);
      const parsedIIF = parseIIF(iif);

      expect(parsedIIF.transactions.length).toBe(5);
      expect(parsedIIF.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 6 [ofx-to-csv]: converts standard OFX to tabular CSV', () => {
      const ofxContent = loadFixture('fixtures/ofx/sample-bank.ofx');
      const parsed = parseOFX(ofxContent);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
      expect(parsed.transactions.map(t => t.fitId)).toEqual(invariants.base_fitids);

      const csv = exportToCSV(parsed.transactions);
      expect(csv).toContain('Shopify payout');
    });

    it('Route 7 [csv-to-ofx]: converts CSV to standard OFX specification', () => {
      const csvContent = loadFixture('fixtures/csv/csv-basic-single-amount.csv');
      const parsed = parseCSV(csvContent);
      const ofx = generateQBO(parsed.transactions, mockDefaultAccount);
      const roundTrip = parseOFX(ofx);

      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 8 [qfx-to-csv]: converts Quicken QFX file to CSV', () => {
      const qfxContent = loadFixture('fixtures/qfx/sample-quicken.qfx');
      const parsed = parseOFX(qfxContent);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 9 [csv-to-qfx]: converts CSV to Quicken QFX specification', () => {
      const csvContent = loadFixture('fixtures/csv/csv-basic-single-amount.csv');
      const parsed = parseCSV(csvContent);
      const qfx = generateQBO(parsed.transactions, mockDefaultAccount);
      const roundTrip = parseOFX(qfx);

      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 10 [qfx-to-qbo]: patches Quicken QFX into QuickBooks QBO Web Connect format', () => {
      const qfxContent = loadFixture('fixtures/qfx/sample-quicken.qfx');
      const parsed = parseOFX(qfxContent);
      const qbo = generateQBO(parsed.transactions, { ...mockDefaultAccount, bankId: '3000' });

      expect(qbo).toContain('<INTU.BID>3000');
      const roundTrip = parseOFX(qbo);
      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 11 [ofx-to-qbo]: upgrades generic bank OFX to QuickBooks Web Connect QBO', () => {
      const ofxContent = loadFixture('fixtures/ofx/sample-bank.ofx');
      const parsed = parseOFX(ofxContent);
      const qbo = generateQBO(parsed.transactions, { ...mockDefaultAccount, bankId: '3000' });

      expect(qbo).toContain('<INTU.BID>3000');
      const roundTrip = parseOFX(qbo);
      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 12 [csv-to-qif]: converts CSV to Quicken QIF with proper delimiters and tags', () => {
      const csvContent = loadFixture('fixtures/csv/csv-basic-single-amount.csv');
      const parsed = parseCSV(csvContent);
      const qif = generateQIF(parsed.transactions, mockDefaultAccount);

      expect(qif).toContain('!Type:Bank');
      expect(qif).toContain('^');

      const parsedQIF = parseQIF(qif);
      expect(parsedQIF.transactions.length).toBe(5);
      expect(parsedQIF.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 13 [qif-to-csv]: converts Quicken QIF to tabular CSV', () => {
      const qifContent = loadFixture('fixtures/qif/sample-bank.qif');
      const parsed = parseQIF(qifContent);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);

      const csv = exportToCSV(parsed.transactions);
      expect(csv).toContain('Shopify payout');
      expect(csv).toContain('Office Depot, #441');
    });

    it('Route 14 [qif-to-qbo]: upgrades legacy Quicken QIF to modern QuickBooks QBO', () => {
      const qifContent = loadFixture('fixtures/qif/sample-bank.qif');
      const parsed = parseQIF(qifContent);
      const qbo = generateQBO(parsed.transactions, mockDefaultAccount);
      const roundTrip = parseOFX(qbo);

      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 15 [qif-to-iif]: converts Quicken QIF to balanced QuickBooks Desktop IIF', () => {
      const qifContent = loadFixture('fixtures/qif/sample-bank.qif');
      const parsed = parseQIF(qifContent);
      const iif = generateIIF(parsed.transactions, mockDefaultAccount);
      const parsedIIF = parseIIF(iif);

      expect(parsedIIF.transactions.length).toBe(5);
      expect(parsedIIF.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
    });

    it('Route 16 [iif-to-csv]: parses complex QuickBooks IIF ledger into clean CSV rows', () => {
      const iifContent = loadFixture('fixtures/iif/sample-quickbooks.iif');
      const parsed = parseIIF(iifContent);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);

      const csv = exportToCSV(parsed.transactions);
      expect(csv).toContain('Office Depot, #441');
      expect(csv).toContain('1250.00');
    });

    it('Route 17 [mt940-to-csv]: parses SWIFT MT940 comma decimals, :61: statement and :86: info', () => {
      const mt940Content = loadFixture('fixtures/mt940/sample-bank.mt940');
      const parsed = parseMT940(mt940Content);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
      expect(parsed.transactions.map(t => t.fitId)).toEqual(invariants.base_fitids);

      const csv = exportToCSV(parsed.transactions);
      expect(csv).toContain('Shopify payout');
      expect(csv).toContain('-84.17');
    });

    it('Route 18 [mt940-to-qbo]: converts SWIFT MT940 statement to QuickBooks QBO', () => {
      const mt940Content = loadFixture('fixtures/mt940/sample-bank.mt940');
      const parsed = parseMT940(mt940Content);
      const qbo = generateQBO(parsed.transactions, mockDefaultAccount);
      const roundTrip = parseOFX(qbo);

      expect(roundTrip.transactions.length).toBe(5);
      expect(roundTrip.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
      expect(roundTrip.transactions.map(t => t.fitId)).toEqual(invariants.base_fitids);
    });

    it('Route 19 [camt053-to-csv]: parses ISO 20022 CAMT.053 XML entries (CRDT +, DBIT -)', () => {
      const camtContent = loadFixture('fixtures/camt053/sample-statement-camt053.xml');
      const parsed = parseCAMT053(camtContent);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);
      expect(parsed.transactions.map(t => t.fitId)).toEqual(invariants.base_fitids);
    });

    it('Route 20 [quickbooks-csv-formatter]: strips bank metadata rows and outputs exact 3-col & 4-col format', () => {
      const metadataCsv = loadFixture('fixtures/csv/csv-bank-metadata-rows.csv');
      const parsed = parseCSV(metadataCsv);
      expect(parsed.transactions.length).toBe(5);
      expect(parsed.diagnostics.netAmount).toBe(invariants.base_net_change_usd);

      // Verify 3-column output
      const qb3 = exportToQuickBooks3Col(parsed.transactions);
      const expectedQb3 = loadFixture('expected/quickbooks-online-3-column.csv').trim().replace(/\r\n/g, '\n');
      expect(qb3.trim().replace(/\r\n/g, '\n')).toBe(expectedQb3);

      // Verify 4-column output
      const qb4 = exportToQuickBooks4Col(parsed.transactions);
      const expectedQb4 = loadFixture('expected/quickbooks-online-4-column.csv').trim().replace(/\r\n/g, '\n');
      expect(qb4.trim().replace(/\r\n/g, '\n')).toBe(expectedQb4);
    });

    it('Route 21 [xero-csv-formatter]: formats canonical CSV into exact Xero 5-column bank statement format', () => {
      const csvContent = loadFixture('fixtures/csv/csv-basic-single-amount.csv');
      const parsed = parseCSV(csvContent);
      const xeroOutput = exportToXeroCSV(parsed.transactions, { standardFeed: true });
      const expectedXero = loadFixture('expected/xero-bank-feed-example.csv').trim().replace(/\r\n/g, '\n');

      expect(xeroOutput.trim().replace(/\r\n/g, '\n')).toBe(expectedXero);
    });

    it('Route 22 [fix-quickbooks-ol-222-error]: repairs corrupt QBO (sanitizes &, caps NAME at 32 chars, routes overflow to MEMO)', () => {
      const malformedQbo = loadFixture('fixtures/qbo/malformed-ol222.qbo');
      expect(malformedQbo).toContain('&');
      expect(malformedQbo).toContain('Division: East/West');

      // Parse corrupt QBO
      const parsed = parseOFX(malformedQbo);
      expect(parsed.transactions.length).toBe(1);

      const tx = parsed.transactions[0];
      const { name, overflow } = sanitizePayeeName(tx.payee, true);
      expect(name.length).toBeLessThanOrEqual(32);
      expect(name).not.toContain('&');
      expect(overflow.length).toBeGreaterThan(0);

      // Regenerate sanitized QBO
      const cleanQbo = generateQBO(parsed.transactions, mockDefaultAccount);
      expect(cleanQbo).not.toContain('&');
      expect(cleanQbo).toContain('<LEDGERBAL>');
      expect(cleanQbo).toContain('<NAME>');

      const roundTrip = parseOFX(cleanQbo);
      expect(roundTrip.transactions.length).toBe(1);
      expect(roundTrip.transactions[0].amount).toBe(-84.17);
    });

    it('Route 23 [fix-quickbooks-ol-301-error]: flags unrecognized bank ID 999999 and repairs with valid profile 3000', () => {
      const unrecognizedQbo = loadFixture('fixtures/qbo/unrecognized-bank-id-test-only.qbo');
      expect(unrecognizedQbo).toContain('<INTU.BID>999999');

      const parsed = parseOFX(unrecognizedQbo);
      expect(parsed.account.bankId).toBe('999999');

      // Repair with fallback INTU.BID 3000 (Wells Fargo universal)
      const repairedQbo = generateQBO(parsed.transactions, {
        ...mockDefaultAccount,
        bankId: '3000'
      });

      expect(repairedQbo).toContain('<INTU.BID>3000');
      expect(repairedQbo).not.toContain('<INTU.BID>999999');

      const roundTrip = parseOFX(repairedQbo);
      expect(roundTrip.account.bankId).toBe('3000');
      expect(roundTrip.transactions.length).toBe(1);
      expect(roundTrip.transactions[0].amount).toBe(1250.00);
    });

    it('Route 24 [merge-qbo-ofx-files]: merges statement-a, statement-b-with-overlap, and extra-duplicate with deduplication', () => {
      const stmtA = loadFixture('fixtures/merge/statement-a.qbo');
      const stmtB = loadFixture('fixtures/merge/statement-b-with-overlap.qbo');
      const extraCsv = loadFixture('fixtures/merge/extra-duplicate.csv');

      const parsedA = parseOFX(stmtA);
      const parsedB = parseOFX(stmtB);
      const parsedCsv = parseCSV(extraCsv);

      expect(parsedA.transactions.length).toBe(3); // Jan 5, Jan 6, Jan 7
      expect(parsedB.transactions.length).toBe(3); // Jan 7, Jan 8, Jan 9
      expect(parsedCsv.transactions.length).toBe(1); // Jan 7 extra duplicate

      // Combine all transactions
      const combined = [...parsedA.transactions, ...parsedB.transactions, ...parsedCsv.transactions];
      expect(combined.length).toBe(7);

      // Deduplicate using FITID / date+amount+payee
      const seen = new Set<string>();
      const deduped: NormalizedTransaction[] = [];
      let duplicateCount = 0;

      for (const t of combined) {
        const key = t.fitId ? `fit_${t.fitId}` : `${t.date}_${t.amount}_${t.payee.toLowerCase().slice(0, 20)}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(t);
        } else {
          duplicateCount++;
        }
      }

      // Deduplicated unique count must equal 5
      expect(deduped.length).toBe(invariants.merge_expected_unique_fitid_count);
      expect(duplicateCount).toBe(2); // Jan 7 duplicate occurred in stmtB and extraCsv

      // Chronological order verification
      deduped.sort((a, b) => a.date.localeCompare(b.date));
      expect(deduped.map(t => t.fitId)).toEqual(invariants.base_fitids);

      const netSum = Math.round(deduped.reduce((acc, t) => acc + t.amount, 0) * 100) / 100;
      expect(netSum).toBe(invariants.base_net_change_usd);
    });

    it('Route 25 [credit-card-csv-sign-flipper]: inverts positive charges to negative and negative payments to positive', () => {
      const ccCsv = loadFixture('fixtures/csv/credit-card-positive-charges.csv');
      
      // Parse with sign flip enabled
      const flipped = parseCSV(ccCsv, { flipSigns: true });
      expect(flipped.transactions.length).toBe(4);

      const amounts = flipped.transactions.map(t => t.amount);
      expect(amounts).toEqual(invariants.csv_credit_card_flip_expected_amounts);

      // Verify sign flip can be disabled
      const unflipped = parseCSV(ccCsv, { flipSigns: false });
      expect(unflipped.transactions.map(t => t.amount)).toEqual(invariants.csv_credit_card_flip_input_amounts);
    });

  });

  describe('Part 2: Smoke-Testing All 35 Bank and Payment-Processor Preset Routes', () => {
    
    // Test each preset defined in BANK_PRESETS against its assigned fixture
    const presetMatrixRaw = fs.readFileSync(path.join(TEST_PACK_DIR, 'docs', 'BANK_PRESET_TEST_MATRIX.csv'), 'utf8');
    const presetRows = presetMatrixRaw.trim().split(/\r\n|\n/).slice(1);

    for (const row of presetRows) {
      const parts = row.split(',');
      const routeSlug = parts[0]?.trim();
      const fixtureRelPath = parts[1]?.trim();

      if (!routeSlug || !fixtureRelPath) continue;

      it(`Smoke-tests bank preset [${routeSlug}] with fixture [${path.basename(fixtureRelPath)}]`, () => {
        // 1. Verify preset configuration exists in site registry
        const preset = BANK_PRESETS.find(p => p.slug === routeSlug);
        expect(preset, `Preset definition missing for ${routeSlug}`).toBeDefined();

        // 2. Load fixture file
        const fixtureContent = loadFixture(fixtureRelPath);
        expect(fixtureContent.length).toBeGreaterThan(0);

        // 3. Process according to preset configuration
        let parsed;
        if (fixtureRelPath.endsWith('.xml')) {
          parsed = parseCAMT053(fixtureContent);
        } else if (fixtureRelPath.endsWith('.mt940')) {
          parsed = parseMT940(fixtureContent);
        } else if (fixtureRelPath.endsWith('.qbo') || fixtureRelPath.endsWith('.ofx')) {
          parsed = parseOFX(fixtureContent);
        } else {
          parsed = parseCSV(fixtureContent, {
            flipSigns: preset?.requiresSignFlip || false,
            splitFees: preset?.hasFees || false,
            defaultAccountType: preset?.defaultAccountType || 'CHECKING',
            bankId: preset?.intuBid || '3000'
          });
        }

        // 4. Validate output invariants
        expect(parsed.transactions.length).toBeGreaterThan(0);
        
        for (const tx of parsed.transactions) {
          expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(typeof tx.amount).toBe('number');
          expect(!isNaN(tx.amount)).toBe(true);
          expect(tx.payee.length).toBeGreaterThan(0);
          expect(tx.fitId.length).toBeGreaterThan(0);
        }

        // 5. Generate target QBO output using preset INTU.BID
        const targetQbo = generateQBO(parsed.transactions, {
          ...mockDefaultAccount,
          bankId: preset?.intuBid || '3000',
          accountType: preset?.defaultAccountType || 'CHECKING'
        });
        expect(targetQbo).toContain(`OFXHEADER:100`);
        expect(targetQbo).toContain(`<INTU.BID>${preset?.intuBid || '3000'}`);
      });
    }

  });

  describe('Part 3: Edge Cases, Ambiguous Dates, Quoted Commas & Processor Fee Splits', () => {

    it('handles ambiguous dates with warning (csv-ambiguous-dates.csv)', () => {
      const ambiguousCsv = loadFixture('fixtures/csv/csv-ambiguous-dates.csv');
      const parsed = parseCSV(ambiguousCsv);
      expect(parsed.transactions.length).toBe(2);
      expect(parsed.warnings.some(w => w.toLowerCase().includes('ambiguous'))).toBe(true);
    });

    it('handles quoted commas, embedded quotes, and multi-line fields cleanly (csv-quoted-commas-and-quotes.csv)', () => {
      const quotedCsv = loadFixture('fixtures/csv/csv-quoted-commas-and-quotes.csv');
      const parsed = parseCSV(quotedCsv);
      expect(parsed.transactions.length).toBe(3);

      const complexTx = parsed.transactions.find(t => t.payee.includes('Cafe, "The Corner"'));
      expect(complexTx).toBeDefined();
      expect(complexTx?.amount).toBe(-23.40);

      const quoteInMemo = parsed.transactions.find(t => t.memo.includes('Invoice "1042" payment'));
      expect(quoteInMemo).toBeDefined();
      expect(quoteInMemo?.amount).toBe(950.00);
    });

    it('handles synthetic headerless five-column CSV (headerless-five-column-synthetic.csv)', () => {
      const headerlessCsv = loadFixture('fixtures/csv/headerless-five-column-synthetic.csv');
      const parsed = parseCSV(headerlessCsv);
      expect(parsed.transactions.length).toBe(3);
      expect(parsed.transactions[0].payee).toBe('SHOPIFY PAYOUT');
      expect(parsed.transactions[0].amount).toBe(1250.00);
      expect(parsed.transactions[0].fitId).toBe('FFTEST20260105-001');
    });

    it('handles synthetic PayPal activity with fees and refunds (paypal-activity-synthetic.csv)', () => {
      const paypalCsv = loadFixture('fixtures/csv/paypal-activity-synthetic.csv');
      const parsed = parseCSV(paypalCsv, { splitFees: true });
      expect(parsed.transactions.length).toBe(3);
      expect(parsed.transactions[0].gross).toBe(100.00);
      expect(parsed.transactions[0].fee).toBe(-3.20);
    });

    it('handles synthetic Shopify payouts (shopify-payouts-synthetic.csv)', () => {
      const shopifyCsv = loadFixture('fixtures/csv/shopify-payouts-synthetic.csv');
      const parsed = parseCSV(shopifyCsv);
      expect(parsed.transactions.length).toBe(2);
      expect(parsed.transactions[0].amount).toBe(1250.00);
      expect(parsed.transactions[1].amount).toBe(950.00);
    });

    it('handles synthetic Wise multicurrency statements (wise-multicurrency-synthetic.csv)', () => {
      const wiseCsv = loadFixture('fixtures/csv/wise-multicurrency-synthetic.csv');
      const parsed = parseCSV(wiseCsv);
      expect(parsed.transactions.length).toBe(2);
      expect(parsed.transactions[0].amount).toBe(42.00);
      expect(parsed.transactions[0].payee).toBe('Office supplies');
      expect(parsed.transactions[0].fitId).toBe('WISE-TEST-001');
    });

    it('handles duplicate rows in single CSV when deduplication is toggled (csv-duplicate-rows.csv)', () => {
      const dupCsv = loadFixture('fixtures/csv/csv-duplicate-rows.csv');
      
      const unDeduped = parseCSV(dupCsv, { deduplicate: false });
      expect(unDeduped.transactions.length).toBe(4);

      const deduped = parseCSV(dupCsv, { deduplicate: true });
      expect(deduped.transactions.length).toBe(3);
      expect(deduped.diagnostics.duplicateCount).toBe(1);
    });

  });

});
