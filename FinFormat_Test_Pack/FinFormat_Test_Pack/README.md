# FinFormat Converter Test Pack (Synthetic Data)

This pack is designed to exercise the 25 core converter, formatter, repair, and merge routes plus all 35 bank/processor preset landing routes in FinFormat. All account identifiers, transaction descriptions, IDs, and amounts are synthetic. Do not treat any institution code in this pack as a verified bank identifier.

## Start here

1. Start FinFormat locally and open each route listed in `docs/ROUTE_TEST_MATRIX.csv`.
2. Use `docs/ROUTE_TEST_MATRIX.csv` for the 25 core routes and `docs/BANK_PRESET_TEST_MATRIX.csv` for the 35 bank/processor preset pages. Upload the listed fixture(s), choose explicit source/target formats when the UI permits, and run the workflow.
3. Compare records with `expected/normalized-transactions.csv`; compare common export shapes with the other files under `expected/`.
4. Test both the happy path and the edge-case files under `fixtures/csv/` and `fixtures/qbo/`.
5. For imports requiring QuickBooks or another third-party application, test against the exact application/version you claim to support. A parse/serialize round-trip is not proof of external compatibility.

## Fixtures by format

- `fixtures/csv/csv-basic-single-amount.csv` — canonical five-transaction sample; net change USD 2,054.49.
- `fixtures/csv/csv-split-debit-credit.csv` — separate debit/credit columns.
- `fixtures/csv/csv-bank-metadata-rows.csv` — synthetic account/statement metadata before the column header.
- `fixtures/csv/csv-quoted-commas-and-quotes.csv` — quoted commas and escaped double quotes.
- `fixtures/csv/csv-ambiguous-dates.csv` — verify date-order selection or ambiguity warning.
- `fixtures/csv/credit-card-positive-charges.csv` — charges positive and payments/refunds negative; test sign-flip mode.
- `fixtures/csv/csv-duplicate-rows.csv` — repeated FITID/row for deduplication.
- `fixtures/csv/headerless-five-column-synthetic.csv` — synthetic headerless edge case with this pack's assumed five-column mapping. It is NOT an authentic export from Wells Fargo or any bank.
- `fixtures/csv/stripe-payout-gross-fee-net.csv`, `paypal-activity-synthetic.csv`, `shopify-payouts-synthetic.csv`, and `wise-multicurrency-synthetic.csv` — processor-specific edge fixtures; all are synthetic.
- `fixtures/ofx/sample-bank.ofx` — synthetic OFX SGML 1.02-style source.
- `fixtures/qbo/sample-bank.qbo` — QBO-style source with a test-only INTU.BID value.
- `fixtures/qfx/sample-quicken.qfx` — QFX-style source fixture.
- `fixtures/qbo/malformed-ol222.qbo` — deliberately problematic payee text for sanitizer testing.
- `fixtures/qbo/unrecognized-bank-id-test-only.qbo` — uses a deliberately fake bank ID 999999 to test warning/repair handling.
- `fixtures/qif/sample-bank.qif` — QIF transaction sample.
- `fixtures/iif/sample-quickbooks.iif` — IIF sample with balanced synthetic TRNS/SPL blocks.
- `fixtures/mt940/sample-bank.mt940` — synthetic SWIFT MT940 statement.
- `fixtures/camt053/sample-statement-camt053.xml` — synthetic CAMT.053 XML sample (namespace version camt.053.001.02).
- `fixtures/merge/` — overlapping QBO statements plus an extra duplicate for merge/dedup testing.

## Route coverage

- `docs/ROUTE_TEST_MATRIX.csv`: all 25 core conversion, formatting, repair, and merge routes.
- `docs/BANK_PRESET_TEST_MATRIX.csv`: all 35 bank/payment-processor preset routes. The preset matrix is a route/configuration smoke test, not evidence that synthetic input exactly matches the bank's real export schema.

## Canonical expected values

The canonical five transactions have these signed amounts:

- 2026-01-05 Shopify payout: +1250.00
- 2026-01-06 Office Depot, #441: -84.17
- 2026-01-07 Stripe processing fee: -18.35
- 2026-01-08 ACME client payment: +950.00
- 2026-01-09 Amazon Web Services: -42.99

Expected net change: **+USD 2,054.49**. All five FITIDs in the canonical CSV are unique. The merge case intentionally repeats `FFTEST20260107-003`; a deduplicated merge should contain five unique transactions, not six or more.

## How to judge a converter

Do not check only that a file downloads. For every route, verify:

1. The transaction count is correct.
2. Each date is preserved or transformed according to the explicitly selected date convention.
3. Debit and credit signs are correct.
4. Amounts sum to the expected net change where applicable.
5. Names, memos, references, and check numbers are retained or intentionally mapped.
6. Output can be parsed again by the matching reader (round-trip test).
7. Invalid or ambiguous inputs generate a clear warning rather than silent data corruption.
8. Sensitive data is not sent to a server or written to persistent browser storage.

## Important limitations

These fixtures are regression aids, not certification files. Financial formats and target applications can be version-sensitive. The QBO/OFX/QFX examples are representative test data; compatibility must be confirmed against each supported accounting workflow. The sample INTU.BID `3000` is present only as test data and is **not** a claim that the ID is universal. The `999999` value is deliberately fake. Never use these fixtures as real statements or as evidence of verified compatibility with a bank.
