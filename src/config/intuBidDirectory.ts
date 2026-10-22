export interface IntuBidEntry {
  fid: string;
  name: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDITCARD';
  routingNumber?: string;
  webConnect: boolean;
  notes: string;
}

export const INTU_BID_DIRECTORY: IntuBidEntry[] = [
  { fid: '3000', name: 'Wells Fargo Bank (Universal Compatible Fallback)', accountType: 'CHECKING', routingNumber: '121000247', webConnect: true, notes: 'The most universally accepted Intuit FID across all QuickBooks versions. Recommended fallback for Error OL-301/OL-393.' },
  { fid: '10898', name: 'JPMorgan Chase Bank', accountType: 'CHECKING', routingNumber: '021000021', webConnect: true, notes: 'Full support for Chase Checking, Total Checking, Sapphire, and Ink Business cards.' },
  { fid: '6812', name: 'Bank of America', accountType: 'CHECKING', routingNumber: '054000030', webConnect: true, notes: 'BofA Advantage Checking, Savings, and Business accounts.' },
  { fid: '3101', name: 'American Express', accountType: 'CREDITCARD', webConnect: true, notes: 'Amex Business Gold, Platinum, Blue Business Plus. Auto-inverts charges.' },
  { fid: '12368', name: 'Capital One', accountType: 'CHECKING', routingNumber: '051405515', webConnect: true, notes: 'Capital One 360 Checking and Spark Business credit cards.' },
  { fid: '54103', name: 'Citibank', accountType: 'CHECKING', routingNumber: '021000089', webConnect: true, notes: 'Citi Priority, Access Checking, and Citi Double Cash.' },
  { fid: '1412', name: 'U.S. Bank', accountType: 'CHECKING', routingNumber: '091000022', webConnect: true, notes: 'US Bank Smartly Checking and Altitude credit cards.' },
  { fid: '4236', name: 'PNC Bank', accountType: 'CHECKING', routingNumber: '043000096', webConnect: true, notes: 'PNC Virtual Wallet and Business Checking.' },
  { fid: '10911', name: 'Truist Bank (formerly SunTrust & BB&T)', accountType: 'CHECKING', routingNumber: '061000104', webConnect: true, notes: 'Truist One Checking. Use FID 3000 if your Truist Web Connect triggers OL-222.' },
  { fid: '10028', name: 'TD Bank', accountType: 'CHECKING', routingNumber: '011103093', webConnect: true, notes: 'TD Beyond Checking and Convenience Checking.' },
  { fid: '19738', name: 'Navy Federal Credit Union', accountType: 'CHECKING', routingNumber: '256074974', webConnect: true, notes: 'Largest US Credit Union; Free Active Duty & Flagship Checking.' },
  { fid: '24591', name: 'USAA Federal Savings Bank', accountType: 'CHECKING', routingNumber: '314074269', webConnect: true, notes: 'Military financial services and checking.' },
  { fid: '7101', name: 'Discover Card & Bank', accountType: 'CREDITCARD', webConnect: true, notes: 'Discover It Card and Discover Cashback Debit.' },
  { fid: '10969', name: 'Charles Schwab Bank', accountType: 'CHECKING', routingNumber: '121202211', webConnect: true, notes: 'Schwab Bank High Yield Investor Checking.' },
  { fid: '05756', name: 'Fidelity Investments (Cash Management)', accountType: 'CHECKING', routingNumber: '101205681', webConnect: true, notes: 'Fidelity CMA and Brokerage sweeps.' },
  { fid: '11218', name: 'Ally Bank', accountType: 'CHECKING', routingNumber: '124003114', webConnect: true, notes: 'Ally Online Savings and Spending Accounts.' },
  { fid: '00138', name: 'Huntington National Bank', accountType: 'CHECKING', routingNumber: '044000024', webConnect: true, notes: 'Huntington Asterisk-Free and Voice Credit Card.' },
  { fid: '03681', name: 'Regions Bank', accountType: 'CHECKING', routingNumber: '062000019', webConnect: true, notes: 'Regions LifeGreen Checking.' },
  { fid: '02293', name: 'Citizens Bank', accountType: 'CHECKING', routingNumber: '211070010', webConnect: true, notes: 'Citizens EverValue and Quest Checking.' },
  { fid: '02844', name: 'Fifth Third Bank', accountType: 'CHECKING', routingNumber: '042000314', webConnect: true, notes: 'Fifth Third Momentum Checking.' },
  { fid: '03417', name: 'KeyBank', accountType: 'CHECKING', routingNumber: '041001039', webConnect: true, notes: 'Key Select and Hassle-Free Checking.' },
  { fid: '02446', name: 'M&T Bank', accountType: 'CHECKING', routingNumber: '022000046', webConnect: true, notes: 'M&T MyChoice Plus Checking.' },
  { fid: '02360', name: 'BMO Bank (formerly BMO Harris)', accountType: 'CHECKING', routingNumber: '071000288', webConnect: true, notes: 'BMO Premier and Smart Advantage Checking.' },
  { fid: '02717', name: 'First Citizens Bank', accountType: 'CHECKING', routingNumber: '053100300', webConnect: true, notes: 'First Citizens Free Checking & Commercial Banking.' },
  { fid: '01869', name: 'Barclays US Consumer Bank', accountType: 'CREDITCARD', webConnect: true, notes: 'Barclays View, JetBlue, and AAdvantage Mastercard.' },
  { fid: '01053', name: 'Comerica Bank', accountType: 'CHECKING', routingNumber: '111000753', webConnect: true, notes: 'Comerica Commercial and Personal Banking.' },
  { fid: '04505', name: 'Synchrony Bank', accountType: 'CREDITCARD', webConnect: true, notes: 'Synchrony Amazon Store Card, Lowe\'s, CareCredit, and Premier World.' },
  { fid: '02570', name: 'Zions First National Bank', accountType: 'CHECKING', routingNumber: '124000054', webConnect: true, notes: 'Zions Bank Anytime Checking.' },
  { fid: '04712', name: 'Silicon Valley Bank (SVB - First Citizens)', accountType: 'CHECKING', routingNumber: '121140399', webConnect: true, notes: 'Startup venture debt and checking accounts.' },
  { fid: '03102', name: 'American Express Centurion Bank', accountType: 'CREDITCARD', webConnect: true, notes: 'Personal Amex Platinum, Green, and Gold.' },
  { fid: '02476', name: 'Webster Bank', accountType: 'CHECKING', routingNumber: '211170101', webConnect: true, notes: 'Webster Premier and Business Checking.' },
  { fid: '01429', name: 'Synovus Bank', accountType: 'CHECKING', routingNumber: '061100606', webConnect: true, notes: 'Synovus Pro and Commercial accounts.' },
  { fid: '02914', name: 'Western Alliance Bank', accountType: 'CHECKING', routingNumber: '122105155', webConnect: true, notes: 'Tech and legal escrow commercial accounts.' },
  { fid: '02115', name: 'BOK Financial (Bank of Oklahoma)', accountType: 'CHECKING', routingNumber: '103900036', webConnect: true, notes: 'BOK Financial Choice Checking.' },
  { fid: '03514', name: 'First National Bank of Omaha (FNBO)', accountType: 'CHECKING', routingNumber: '104000016', webConnect: true, notes: 'FNBO First National Bank of Omaha checking, business and credit card accounts. Primary Web Connect BID.' },
  { fid: '14690', name: 'First National Bank of Omaha (FNBO Commercial & Credit)', accountType: 'CHECKING', routingNumber: '104000016', webConnect: true, notes: 'FNBO commercial treasury and credit card Web Connect BID.' },
  { fid: '03423', name: 'First National Bank of Omaha (FNBO)', accountType: 'CHECKING', routingNumber: '104000016', webConnect: true, notes: 'FNBO Access Checking.' },
  { fid: '01659', name: 'East West Bank', accountType: 'CHECKING', routingNumber: '122235821', webConnect: true, notes: 'Cross-border US-Asia commercial banking.' },
  { fid: '02798', name: 'Frost Bank', accountType: 'CHECKING', routingNumber: '114000093', webConnect: true, notes: 'Frost Personal and Commercial Checking.' },
  { fid: '03099', name: 'Commerce Bank', accountType: 'CHECKING', routingNumber: '101000019', webConnect: true, notes: 'Commerce Free Checking.' },
  { fid: '01918', name: 'Umpqua Bank', accountType: 'CHECKING', routingNumber: '123205054', webConnect: true, notes: 'Pacific Northwest regional checking and treasury.' },
  { fid: '02693', name: 'Pinnacle Financial Partners', accountType: 'CHECKING', routingNumber: '064008637', webConnect: true, notes: 'Southeastern commercial banking.' },
  { fid: '04918', name: 'First Horizon Bank', accountType: 'CHECKING', routingNumber: '084000026', webConnect: true, notes: 'Tennessee and southern regional banking.' },
  { fid: '02047', name: 'Old National Bank', accountType: 'CHECKING', routingNumber: '071921891', webConnect: true, notes: 'Midwest commercial checking.' },
  { fid: '03401', name: 'SouthState Bank', accountType: 'CHECKING', routingNumber: '053201607', webConnect: true, notes: 'Florida and Carolinas regional banking.' },
  { fid: '03808', name: 'Associated Bank', accountType: 'CHECKING', routingNumber: '075900575', webConnect: true, notes: 'Wisconsin and Illinois checking.' },
  { fid: '04312', name: 'FirstBank (Colorado)', accountType: 'CHECKING', routingNumber: '102001017', webConnect: true, notes: 'Colorado and Arizona checking accounts.' },
  { fid: '03310', name: 'Hancock Whitney Bank', accountType: 'CHECKING', routingNumber: '065400137', webConnect: true, notes: 'Gulf South commercial accounts.' },
  { fid: '02100', name: 'Glacier Bank', accountType: 'CHECKING', routingNumber: '092901683', webConnect: true, notes: 'Mountain West regional banking.' },
  { fid: '04819', name: 'Cadence Bank', accountType: 'CHECKING', routingNumber: '065200188', webConnect: true, notes: 'Southern commercial treasury.' },
  { fid: '03144', name: 'First Interstate Bank', accountType: 'CHECKING', routingNumber: '092900862', webConnect: true, notes: 'Northwest regional banking.' },
  { fid: '01888', name: 'Columbia Bank', accountType: 'CHECKING', routingNumber: '125106771', webConnect: true, notes: 'Pacific Northwest community banking.' },
  { fid: '02999', name: 'Arvest Bank', accountType: 'CHECKING', routingNumber: '103200121', webConnect: true, notes: 'Arkansas, Oklahoma, Missouri checking.' },
  { fid: '01515', name: 'First Commonwealth Bank', accountType: 'CHECKING', routingNumber: '043306822', webConnect: true, notes: 'Pennsylvania and Ohio banking.' },
  { fid: '03222', name: 'United Bank (West Virginia / Virginia)', accountType: 'CHECKING', routingNumber: '051500566', webConnect: true, notes: 'Mid-Atlantic regional banking.' },
  { fid: '02888', name: 'WesBanco Bank', accountType: 'CHECKING', routingNumber: '043400036', webConnect: true, notes: 'Ohio Valley commercial checking.' },
  { fid: '03555', name: 'Valley National Bank', accountType: 'CHECKING', routingNumber: '021202447', webConnect: true, notes: 'New York / New Jersey commercial accounts.' },
  { fid: '24823', name: 'SoFi Bank, N.A.', accountType: 'CHECKING', routingNumber: '031101344', webConnect: true, notes: 'SoFi Checking, High-Yield Savings, and SoFi Money Web Connect.' },
  { fid: '15894', name: 'Robinhood Gold Card (Coastal Community Bank)', accountType: 'CREDITCARD', routingNumber: '125108397', webConnect: true, notes: 'Robinhood Gold 3% Cash Back Credit Card Web Connect. Issued by Coastal Community Bank.' }
];

export function findIntuBid(query: string): IntuBidEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return INTU_BID_DIRECTORY;
  return INTU_BID_DIRECTORY.filter(entry => 
    entry.fid.includes(q) ||
    entry.name.toLowerCase().includes(q) ||
    (entry.routingNumber && entry.routingNumber.includes(q))
  );
}

export function getIntuBid(fid: string): IntuBidEntry {
  const found = INTU_BID_DIRECTORY.find(entry => entry.fid === fid);
  return found || {
    fid: '3000',
    name: 'Universal Wells Fargo Fallback',
    accountType: 'CHECKING',
    webConnect: true,
    notes: 'Universal fallback for QuickBooks Error OL-301 and OL-393.'
  };
}
