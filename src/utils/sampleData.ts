/**
 * Realistic built-in sample data for 1-click testing.
 */

// 1. Standard Chase Checking Bank Statement CSV
export const CHASE_CHECKING_SAMPLE_CSV = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,10/12/2026,"AMAZON WEB SERVICES AWS.AMAZON.CO WA",-149.20,DEBIT_CARD,14520.80,
DEBIT,10/13/2026,"GUSTO PAYROLL PE1024 SAN FRANCISCO CA",-3240.50,ACH_DEBIT,11280.30,
CREDIT,10/14/2026,"CLIENT INVOICE WIRE REF 98402 ACME CORP",4850.00,WIRE_INCOMING,16130.30,
DEBIT,10/15/2026,"GOOGLE WORKSPACE GOOGLE.COM/CH CA",-72.00,DEBIT_CARD,16058.30,
DEBIT,10/16/2026,"CHECK #1042 OFFICE RENT LANDLORD CORP",-2200.00,CHECK,13858.30,1042
CREDIT,10/17/2026,"STRIPE TRANSFER ST-9884214810 E-COMM",1890.45,ACH_CREDIT,15748.75,
DEBIT,10/18/2026,"FEDEX 849204 MEMPHIS TN",-38.40,DEBIT_CARD,15710.35,`;

// 2. American Express Credit Card CSV (Positive Charges that need sign flip!)
export const AMEX_CREDIT_CARD_SAMPLE_CSV = `Date,Description,Card Member,Account #,Amount
10/05/2026,"DELTA AIR LINES ATLANTA GA","JOHN DOE","-31002",485.60
10/08/2026,"HILTON HOTELS DALLAS TX","JOHN DOE","-31002",312.40
10/10/2026,"UBER EATS SAN FRANCISCO CA","JOHN DOE","-31002",42.75
10/12/2026,"APPLE STORE ONLINE CUPERTINO CA","JOHN DOE","-31002",1299.00
10/15/2026,"ONLINE PAYMENT - THANK YOU","JOHN DOE","-31002",-2500.00
10/16/2026,"SLACK TECHNOLOGIES ANNUAL RENEWAL","JOHN DOE","-31002",150.00
10/17/2026,"STAPLES #0492 OFFICE SUPPLIES","JOHN DOE","-31002",89.15,`;

// 3. Stripe Gross-Fee-Net Payout CSV
export const STRIPE_PROCESSOR_SAMPLE_CSV = `id,Created (UTC),Amount,Fee,Net,Description,Customer Email
ch_3M001,2026-10-14 14:20:00,150.00,4.65,145.35,"Order #10492 - Annual Software Subscription",sarah@example.com
ch_3M002,2026-10-15 09:12:00,299.00,8.97,290.03,"Order #10493 - Pro Tier License Setup",dev@techfirm.co
ch_3M003,2026-10-16 11:45:00,45.00,1.61,43.39,"Order #10494 - Add-on Storage Block",ops@startup.io
ch_3M004,2026-10-17 18:30:00,850.00,24.95,825.05,"Order #10495 - Enterprise Implementation Consultation",cfo@enterprise.net
ch_3M005,2026-10-18 16:05:00,75.00,2.48,72.52,"Order #10496 - Support Maintenance Pack",billing@agency.org,`;

// 4. Broken QBO File with OL-222 & OL-301 Triggers:
// - Contains unescaped '&' (AT&T & Sons)
// - Contains <NAME> exceeding 32 characters (48 chars!)
// - Contains invalid <INTU.BID>999999 (triggers OL-301)
// - Missing <LEDGERBAL> (triggers OL-222)
export const BROKEN_OL222_QBO_SAMPLE = `OFXHEADER:100\r
DATA:OFXSGML\r
VERSION:102\r
SECURITY:NONE\r
ENCODING:USASCII\r
CHARSET:1252\r
COMPRESSION:NONE\r
OLDFILEUID:NONE\r
NEWFILEUID:NONE\r
\r
<OFX>\r
  <SIGNONMSGSRSV1>\r
    <SONRS>\r
      <STATUS>\r
        <CODE>0\r
        <SEVERITY>INFO\r
      </STATUS>\r
      <DTSERVER>20261018120000\r
      <LANGUAGE>ENG\r
      <INTU.BID>999999\r
    </SONRS>\r
  </SIGNONMSGSRSV1>\r
  <BANKMSGSRSV1>\r
    <STMTTRNRS>\r
      <TRNUID>1\r
      <STATUS>\r
        <CODE>0\r
        <SEVERITY>INFO\r
      </STATUS>\r
      <STMTRS>\r
        <CURDEF>USD\r
        <BANKACCTFROM>\r
          <BANKID>999999999\r
          <ACCTID>984210\r
          <ACCTTYPE>CHECKING\r
        </BANKACCTFROM>\r
          <BANKTRANLIST>\r
            <DTSTART>20261001120000\r
            <DTEND>20261018120000\r
            <STMTTRN>\r
              <TRNTYPE>DEBIT\r
              <DTPOSTED>20261012120000\r
              <TRNAMT>-185.40\r
              <FITID>202610120118540\r
              <NAME>AT&T MOBILITY & WIRELESS BROADBAND SERVICES NORTH AMERICA\r
              <MEMO>Monthly telecom invoice & data roaming</MEMO>\r
            </STMTTRN>\r
            <STMTTRN>\r
              <TRNTYPE>DEBIT\r
              <DTPOSTED>20261014120000\r
              <TRNAMT>-45.00\r
              <FITID>20261014024500\r
              <NAME>BARNES & NOBLE BOOKSELLERS #4928 NEW YORK CITY NY\r
              <MEMO>Accounting manuals <2026 Edition></MEMO>\r
            </STMTTRN>\r
            <STMTTRN>\r
              <TRNTYPE>CREDIT\r
              <DTPOSTED>20261016120000\r
              <TRNAMT>3250.00\r
              <FITID>2026101603325000\r
              <NAME>ACME HOLDINGS & INDUSTRIAL MANUFACTURING CORP WIRE\r
              <MEMO>Invoice #4920 retainer deposit</MEMO>\r
            </STMTTRN>\r
          </BANKTRANLIST>\r
      </STMTRS>\r
    </STMTTRNRS>\r
  </BANKMSGSRSV1>\r
</OFX>\r
`;

// 5. Multi-Month Batch Merge Samples (September + October)
export const BATCH_MERGE_SAMPLE_PART1 = `Date,Description,Amount
2026-09-15,"OFFICE DEPOT SUPPLIES",-64.20
2026-09-20,"CLIENT PAYMENT WIRE RETAINER",2500.00
2026-09-28,"ZOOM VIDEO COMMUNICATIONS",-15.99
2026-09-30,"CHEVRON FUEL GAS STATION",-48.50`;

export const BATCH_MERGE_SAMPLE_PART2 = `Date,Description,Amount
2026-09-30,"CHEVRON FUEL GAS STATION",-48.50
2026-10-04,"ADOBE CREATIVE CLOUD",-54.99
2026-10-10,"CLIENT PAYMENT WIRE CONSULTING",3200.00
2026-10-15,"AMAZON CLOUD HOSTING AWS",-149.20`;

/**
 * Returns context-aware sample data based on current page slug.
 */
export function getContextAwareSample(slug?: string): { name: string; content: string; format: string } {
  if (!slug) {
    return { name: 'chase_sample_statement.csv', content: CHASE_CHECKING_SAMPLE_CSV, format: 'CSV' };
  }

  // Error repair tools
  if (slug.includes('ol-222') || slug.includes('ol-301') || slug.includes('repair')) {
    return { name: 'corrupted_quickbooks_statement.qbo', content: BROKEN_OL222_QBO_SAMPLE, format: 'QBO' };
  }

  // Credit card sign flippers & Amex
  if (slug.includes('sign-flipper') || slug.includes('american-express') || slug.includes('discover') || slug.includes('credit-card')) {
    return { name: 'amex_charges_statement.csv', content: AMEX_CREDIT_CARD_SAMPLE_CSV, format: 'CSV' };
  }

  // Processors with fee splitting
  if (slug.includes('stripe') || slug.includes('paypal') || slug.includes('square') || slug.includes('shopify') || slug.includes('fees')) {
    return { name: 'stripe_balance_payouts.csv', content: STRIPE_PROCESSOR_SAMPLE_CSV, format: 'CSV' };
  }

  // Batch merge
  if (slug.includes('merge')) {
    return { name: 'monthly_statement_batch.csv', content: `${BATCH_MERGE_SAMPLE_PART1}\n${BATCH_MERGE_SAMPLE_PART2}`, format: 'CSV' };
  }

  // QBO / OFX to CSV converters
  if (slug.startsWith('qbo-') || slug.startsWith('ofx-') || slug.startsWith('qfx-')) {
    return { name: 'bank_web_connect.qbo', content: BROKEN_OL222_QBO_SAMPLE, format: 'QBO' };
  }

  return { name: 'chase_sample_statement.csv', content: CHASE_CHECKING_SAMPLE_CSV, format: 'CSV' };
}
