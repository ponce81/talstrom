// Mock data for the trading module. Delivery day is Saturday 14 Nov 2026; "now" is Fri 13 Nov, 16:30.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const h2 = (h: number) => `${String(h).padStart(2, "0")}h`;

export const portfolios = ["Talwerke supply", "Own production", "Battery Oberried"] as const;

/** Hourly position for Saturday: forecast need, already hedged, open (+ long / − short). */
export const positionRows = (() => {
  const r = rng(99);
  return Array.from({ length: 24 }, (_, h) => {
    const need = 118 + 30 * Math.exp(-((h - 9) ** 2) / 6) + 48 * Math.exp(-((h - 18.3) ** 2) / 4.5) - (h >= 9 && h <= 15 ? 14 * Math.sin(((h - 9) / 6) * Math.PI) : 0);
    let open = (r() - 0.5) * 2.4;
    if (h >= 17 && h <= 19) open = -5.6 - r() * 1.6;
    if (h >= 11 && h <= 13) open = 2.2 + r() * 1.4;
    const price = 84 + 0.45 * (need - 118) + (r() - 0.5) * 6 + (h >= 17 && h <= 20 ? 24 : 0);
    const idPrice = price + (h >= 17 && h <= 19 ? 9 : (r() - 0.5) * 4);
    return { t: h2(h), h, need: +need.toFixed(1), hedged: +(need + open).toFixed(1), open: +open.toFixed(1), price: +price.toFixed(2), idPrice: +idPrice.toFixed(2) };
  });
})();

export type DealStatus = "Confirmed" | "Awaiting confirmation" | "Awaiting approval";
export interface Deal {
  id: string; time: string; product: string; side: "Buy" | "Sell"; mw: number; price: number;
  venue: string; counterparty: string; trader: string; status: DealStatus;
}

export const deals: Deal[] = [
  { id: "D-88213", time: "16:12", product: "Sat 14, 18–19h", side: "Buy", mw: 5, price: 131.4, venue: "EPEX intraday", counterparty: "EPEX Spot", trader: "L. Meier", status: "Confirmed" },
  { id: "D-88207", time: "15:48", product: "Sat 14, base", side: "Sell", mw: 3, price: 92.1, venue: "EPEX intraday", counterparty: "EPEX Spot", trader: "L. Meier", status: "Confirmed" },
  { id: "D-88199", time: "14:51", product: "Jan 2027, base", side: "Buy", mw: 15, price: 109.3, venue: "Bilateral", counterparty: "Axpo Solutions", trader: "L. Meier", status: "Awaiting approval" },
  { id: "D-88190", time: "14:05", product: "Dec 2026, peak", side: "Buy", mw: 10, price: 118.75, venue: "EEX futures", counterparty: "ECC clearing", trader: "S. Rossi", status: "Confirmed" },
  { id: "D-88161", time: "11:30", product: "Q1 2027, base", side: "Buy", mw: 8, price: 104.2, venue: "Bilateral", counterparty: "Alpiq", trader: "S. Rossi", status: "Awaiting confirmation" },
  { id: "D-88140", time: "09:58", product: "Sat 14, 07–08h", side: "Sell", mw: 4, price: 88.6, venue: "EPEX intraday", counterparty: "EPEX Spot", trader: "L. Meier", status: "Confirmed" },
];

export const schedules = [
  { id: "SCH-1114-v3", delivery: "Sat 14 Nov", kind: "Intraday update", version: 3, sent: "16:14", status: "Accepted", mwh: 3_318.4, note: "" },
  { id: "SCH-1114-v2", delivery: "Sat 14 Nov", kind: "Intraday update", version: 2, sent: "15:50", status: "Accepted", mwh: 3_313.4, note: "" },
  { id: "SCH-1114-v1", delivery: "Sat 14 Nov", kind: "Day-ahead", version: 1, sent: "14:28", status: "Accepted", mwh: 3_310.2, note: "" },
  { id: "SCH-1113-v6", delivery: "Fri 13 Nov", kind: "Intraday update", version: 6, sent: "15:31", status: "Rejected", mwh: 3_402.0, note: "Counterparty schedule from Axpo does not match for 17:00–17:15." },
  { id: "SCH-1113-v5", delivery: "Fri 13 Nov", kind: "Intraday update", version: 5, sent: "13:02", status: "Accepted", mwh: 3_398.9, note: "" },
];

export const dayAheadPrices = (() => {
  const r = rng(5);
  return Array.from({ length: 24 }, (_, h) => {
    const base = 82 + 18 * Math.exp(-((h - 8.5) ** 2) / 5) + 44 * Math.exp(-((h - 18.5) ** 2) / 4) - (h >= 10 && h <= 15 ? 16 * Math.sin(((h - 10) / 5) * Math.PI) : 0);
    return { t: h2(h), ch: +(base + (r() - 0.5) * 5).toFixed(2), de: +(base - 6 + (r() - 0.5) * 6).toFixed(2), fr: +(base - 11 + (r() - 0.5) * 6).toFixed(2) };
  });
})();

export const connections = [
  { name: "EPEX Spot day-ahead", kind: "Auction results and prices", status: "Connected", last: "Today 12:58" },
  { name: "EPEX Spot intraday", kind: "Order book and own trades", status: "Connected", last: "16:30" },
  { name: "EEX futures", kind: "Settlement prices and trades", status: "Connected", last: "Today 18:05 (yesterday)" },
  { name: "Swissgrid", kind: "Schedules and imbalance prices", status: "Connected", last: "16:14" },
  { name: "Trade confirmations (eCM)", kind: "Bilateral confirmations", status: "Delayed", last: "Today 09:40" },
];

export const imbalanceDays = (() => {
  const r = rng(11);
  return Array.from({ length: 30 }, (_, i) => {
    const day = 14 + i;
    const label = day <= 31 ? `${day} Oct` : `${day - 31} Nov`;
    const load = Math.round(1800 + r() * 3500 + (i === 21 ? 9000 : 0));
    const pv = Math.round(r() * 2200 + (i === 9 ? 5400 : 0));
    const sched = i === 29 ? 2600 : Math.round(r() < 0.12 ? r() * 1800 : 0);
    return { t: label, load, pv, sched, total: load + pv + sched };
  });
})();

export const flexAssets = [
  { name: "Battery Oberried", type: "Battery", power: "4.0 MW", energy: "8.0 MWh", state: "12% charged", value: 1_240 },
  { name: "Heat-pump pool", type: "1,920 heat pumps", power: "2.1 MW", energy: "shift up to 2 h", state: "Available", value: 410 },
  { name: "EV charging, depots", type: "38 chargers", power: "0.9 MW", energy: "shift up to 4 h", state: "Available", value: 160 },
];

export const flexPlan = (() => {
  return positionRows.map((p) => {
    let dispatch = 0; // + discharge, − charge (MW)
    if (p.h >= 2 && p.h <= 4) dispatch = -1.8;
    if (p.h >= 11 && p.h <= 13) dispatch = -0.6;
    if (p.h >= 17 && p.h <= 19) dispatch = 2.6;
    return { t: p.t, dispatch, price: p.price };
  }).map((d, i, arr) => {
    const soc = arr.slice(0, i + 1).reduce((s, x) => s - x.dispatch * 0.95, 1.0);
    return { ...d, soc: +Math.min(8, Math.max(0, soc)).toFixed(2) };
  });
})();

export const ppas = [
  { name: "Solar park Gampel", type: "Pay-as-produced", seller: "Solargenossenschaft Wallis", capacity: "12 MW", price: 78.0, until: "2036", produced: 412, expected: 455, capture: 71.4, mtm: -182_000, goo: "Issued" },
  { name: "Wind Mont-Crosin", type: "Baseload, 2 MW", seller: "Juvent SA", capacity: "2 MW", price: 96.5, until: "2030", produced: 1_310, expected: 1_440, capture: 103.8, mtm: 214_000, goo: "Issued" },
  { name: "Run-of-river Aare 2", type: "Pay-as-produced", seller: "Kraftwerk Aarau", capacity: "6 MW", price: 84.0, until: "2032", produced: 3_020, expected: 2_960, capture: 98.1, mtm: 365_000, goo: "Pending" },
  { name: "Rooftop PV pool", type: "Pay-as-produced", seller: "128 prosumers", capacity: "4.6 MW", price: 70.0, until: "2028", produced: 148, expected: 170, capture: 69.9, mtm: -41_000, goo: "Issued" },
];

export const pnlDays = (() => {
  const r = rng(23);
  return Array.from({ length: 20 }, (_, i) => {
    const realised = Math.round((r() - 0.35) * 26_000);
    const unrealised = Math.round((r() - 0.5) * 18_000);
    return { t: `${i < 11 ? 24 + i + " Oct" : i - 10 + " Nov"}`.replace(/^3[2-9] Oct|^3[2-9]/, ""), realised, unrealised };
  }).map((d, i) => ({ ...d, t: i < 8 ? `${24 + i} Oct` : `${i - 7} Nov` }));
})();

export const books = [
  { book: "Supply hedge 2026", realised: 412_300, unrealised: -38_200, open: "64 MW avg" },
  { book: "Supply hedge 2027", realised: 0, unrealised: 291_500, open: "71 MW avg" },
  { book: "Intraday optimisation", realised: 88_420, unrealised: 0, open: "flat" },
  { book: "Own production (PPAs)", realised: 156_700, unrealised: 356_000, open: "−24 MW avg" },
  { book: "Battery Oberried", realised: 41_250, unrealised: 2_100, open: "flat" },
];

export const limits = [
  { name: "Value at risk, 1 day, 95%", owner: "Whole company", used: 1.62, limit: 2.5, unit: "CHF m" },
  { name: "Open volume, next 7 days", owner: "Intraday desk", used: 38, limit: 50, unit: "MW" },
  { name: "Single deal size", owner: "L. Meier", used: 15, limit: 10, unit: "MW" },
  { name: "Credit exposure, Axpo Solutions", owner: "Counterparty", used: 2.9, limit: 4.0, unit: "CHF m" },
  { name: "Credit exposure, Alpiq", owner: "Counterparty", used: 1.1, limit: 3.0, unit: "CHF m" },
  { name: "Credit exposure, Energie 360°", owner: "Counterparty", used: 0.4, limit: 1.5, unit: "CHF m" },
];

export const reports = [
  { id: "R-ELC-1113-07", regime: "ElCom (Swiss)", content: "Intraday trades, 13 Nov", due: "Today 23:59", status: "Ready to send", count: 14 },
  { id: "R-REMIT-1113-02", regime: "REMIT (EU, via RRM)", content: "EEX futures, 13 Nov", due: "Tomorrow", status: "Sent", count: 1 },
  { id: "R-ELC-1112-07", regime: "ElCom (Swiss)", content: "Intraday trades, 12 Nov", due: "Done", status: "Accepted", count: 19 },
  { id: "R-ELC-1112-08", regime: "ElCom (Swiss)", content: "Bilateral contracts, 12 Nov", due: "Done", status: "Rejected", count: 2 },
  { id: "R-REMIT-1112-02", regime: "REMIT (EU, via RRM)", content: "EEX futures, 12 Nov", due: "Done", status: "Accepted", count: 2 },
];

export const approvals = [
  { id: "A-311", what: "Bilateral deal D-88199: buy 15 MW Jan 2027 base from Axpo at 109.30", why: "Over the 10 MW single-deal limit of L. Meier", by: "L. Meier", at: "14:52" },
  { id: "A-310", what: "New counterparty: Energie 360°, credit limit CHF 1.5 m", why: "New counterparties need a second sign-off", by: "S. Rossi", at: "11:05" },
  { id: "A-309", what: "Change to PPA Run-of-river Aare 2: price indexation from 2027", why: "Contract changes need a second sign-off", by: "S. Rossi", at: "Yesterday" },
];

export const audit = [
  { at: "16:14", who: "System", what: "Schedule SCH-1114-v3 accepted by Swissgrid" },
  { at: "16:12", who: "L. Meier", what: "Deal D-88213 created: buy 5 MW Sat 18–19h at 131.40" },
  { at: "15:50", who: "L. Meier", what: "Schedule SCH-1114-v2 sent" },
  { at: "15:31", who: "System", what: "Schedule SCH-1113-v6 rejected: counterparty mismatch 17:00–17:15" },
  { at: "14:52", who: "L. Meier", what: "Deal D-88199 created and sent for approval (over limit)" },
  { at: "14:05", who: "S. Rossi", what: "Deal D-88190 imported from EEX" },
  { at: "11:05", who: "S. Rossi", what: "Counterparty Energie 360° created, limit CHF 1.5 m proposed" },
];

export const invoices = [
  { id: "INV-AX-2610", counterparty: "Axpo Solutions", period: "October 2026", expected: 1_284_310.4, invoiced: 1_284_310.4, status: "Matched" },
  { id: "INV-AL-2610", counterparty: "Alpiq", period: "October 2026", expected: 842_190.0, invoiced: 845_402.5, status: "Difference" },
  { id: "INV-EPEX-2610", counterparty: "EPEX Spot", period: "October 2026", expected: 211_480.2, invoiced: 211_480.2, status: "Matched" },
  { id: "INV-ECC-2610", counterparty: "ECC clearing", period: "October 2026", expected: 96_300.0, invoiced: 96_300.0, status: "Matched" },
  { id: "INV-SG-2610", counterparty: "Swissgrid (imbalance)", period: "October 2026", expected: 58_912.7, invoiced: 61_004.1, status: "Difference" },
  { id: "INV-JU-2610", counterparty: "Juvent SA (PPA)", period: "October 2026", expected: 126_415.0, invoiced: null as number | null, status: "Not received" },
];
