// Mock data for the settlement module. Period in focus: October 2026; today is Fri 13 Nov 2026.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const meterQuality = (() => {
  const r = rng(8);
  return Array.from({ length: 14 }, (_, i) => {
    const day = 31 + i;
    const label = day <= 31 ? `${day} Oct` : `${day - 31} Nov`;
    const measured = i === 12 ? 99.0 : +(99.1 + r() * 0.5).toFixed(2);
    const missing = i === 12 ? 0.35 : i === 13 ? 0.2 : +(r() * 0.04).toFixed(2);
    const estimated = +(100 - measured - missing).toFixed(2);
    return { t: label, measured, estimated, missing };
  });
})();

export const plausibility = [
  { rule: "Gap in 15-min series", found: 312, action: "Estimated from similar days", status: "Estimated" },
  { rule: "Value above connection capacity", found: 4, action: "Held for review", status: "Needs review" },
  { rule: "Negative consumption on a consumption-only meter", found: 2, action: "Held for review", status: "Needs review" },
  { rule: "Daily total differs from register reading by > 1%", found: 17, action: "Replaced by register-based profile", status: "Corrected" },
  { rule: "Meter replaced during the day", found: 6, action: "Joined old and new meter series", status: "Corrected" },
];

export const exceptions = [
  { id: "E-1041", severity: "high", what: "Meter CH1012301234500000000000000098765 shows 412 kW at 03:15 on 12 Nov. Connection limit is 25 kW.", suggestion: "Replace with the average of the same quarter-hour on the last 4 Thursdays (1.8 kW)", area: "Metering data" },
  { id: "E-1040", severity: "high", what: "Swissgrid rejected the aggregation message for balance group 12XENERGIE360-B: unknown metering point list version.", suggestion: "Resend with list version 2026-11-01", area: "Balance groups" },
  { id: "E-1038", severity: "medium", what: "Heat-pump volumes in October revision 1 are 1.8% above the initial run.", suggestion: "Accept: 2,140 late corrections explain the change", area: "Runs" },
  { id: "E-1036", severity: "medium", what: "LEG Sonnenhalde: member Sonnenhalde 9 has no smart meter since 3 Nov.", suggestion: "Allocate on the standard profile and flag the member", area: "LEG and ZEV" },
  { id: "E-1033", severity: "low", what: "Supplier switch for Bahnhofstrasse 22 arrived 2 days before the 10-day deadline.", suggestion: "Accept with switch date 1 Dec", area: "Supplier switching" },
];

export const balanceGroups = [
  { id: "12XTALWERKE-VERT", name: "Talwerke Vertrieb", supplier: "Talwerke (basic supply)", points: 41_208, mwh: 64_810.2, sent: "10 Nov 06:00", status: "Accepted" },
  { id: "12XENERGIE360-B", name: "Energie 360°", supplier: "Energie 360°", points: 2_102, mwh: 9_840.6, sent: "10 Nov 06:00", status: "Rejected" },
  { id: "12XAXPO-SALES", name: "Axpo Solutions", supplier: "Axpo (free market)", points: 1_480, mwh: 18_221.4, sent: "10 Nov 06:00", status: "Accepted" },
  { id: "12XALPIQ-RETAIL", name: "Alpiq", supplier: "Alpiq (free market)", points: 812, mwh: 6_910.9, sent: "10 Nov 06:00", status: "Accepted" },
  { id: "12XTALWERKE-NETZ", name: "Grid losses", supplier: "Talwerke Netz", points: 0, mwh: 1_499.6, sent: "10 Nov 06:00", status: "Accepted" },
];

export const tariffs = [
  { name: "Households, standard", kind: "Per kWh, high/low time", customers: 36_410, energy: 7.9, power: null as number | null, base: 5.0, revenue: 2_904_300 },
  { name: "Households, dynamic", kind: "Price per quarter-hour from the grid load", customers: 1_820, energy: 6.8, power: null, base: 5.0, revenue: 124_600 },
  { name: "Heat pumps, interruptible", kind: "Per kWh, lower rate, can be switched off 2 h", customers: 1_920, energy: 5.2, power: null, base: 3.0, revenue: 362_100 },
  { name: "Small business", kind: "Per kWh and peak power", customers: 4_890, energy: 6.1, power: 4.2, base: 8.0, revenue: 1_402_500 },
  { name: "Industry, medium voltage", kind: "Per kWh and monthly peak", customers: 96, energy: 3.4, power: 7.8, base: 120.0, revenue: 1_218_900 },
];

export const legs = [
  { name: "LEG Sonnenhalde", members: 14, producers: 3, shared: 18.4, discount: 40, status: "Needs review" },
  { name: "LEG Oberried Dorf", members: 31, producers: 6, shared: 42.9, discount: 40, status: "Completed" },
  { name: "ZEV Muri Wohnpark", members: 48, producers: 1, shared: 26.1, discount: 0, status: "Completed" },
];

/** Hourly view of a LEG day: production of members, consumption of members, shared within the LEG. */
export const legDay = Array.from({ length: 24 }, (_, h) => {
  const prod = h >= 8 && h <= 16 ? 62 * Math.sin(((h - 8) / 8) * Math.PI) : 0;
  const cons = 18 + 10 * Math.exp(-((h - 7.5) ** 2) / 3) + 22 * Math.exp(-((h - 19) ** 2) / 5) + (h > 10 && h < 15 ? 6 : 0);
  const shared = Math.min(prod, cons);
  return { t: `${String(h).padStart(2, "0")}h`, prod: +prod.toFixed(1), cons: +cons.toFixed(1), shared: +shared.toFixed(1), grid: +(cons - shared).toFixed(1), export: +(prod - shared).toFixed(1) };
});

export const legMembers = [
  { name: "Sonnenhalde 1", role: "Producer and consumer", consumed: 412, fromLeg: 168, produced: 1_820 },
  { name: "Sonnenhalde 3", role: "Producer and consumer", consumed: 388, fromLeg: 141, produced: 2_140 },
  { name: "Sonnenhalde 5", role: "Consumer", consumed: 296, fromLeg: 102, produced: 0 },
  { name: "Sonnenhalde 7", role: "Consumer", consumed: 341, fromLeg: 119, produced: 0 },
  { name: "Sonnenhalde 9", role: "Consumer (no smart meter)", consumed: 305, fromLeg: 98, produced: 0 },
];

export const feedIn = [
  { kind: "Rooftop solar, under 30 kW", systems: 4_210, mwh: 1_884.2, rate: 9.6, amount: 180_883, goo: 1_884 },
  { kind: "Rooftop solar, 30–100 kW", systems: 488, mwh: 1_402.7, rate: 8.9, amount: 124_840, goo: 1_402 },
  { kind: "Solar, over 100 kW", systems: 114, mwh: 2_210.1, rate: 8.1, amount: 179_018, goo: 2_210 },
  { kind: "Small hydro", systems: 3, mwh: 610.4, rate: 11.2, amount: 68_365, goo: 610 },
  { kind: "Home batteries (feed-in)", systems: 362, mwh: 41.3, rate: 9.6, amount: 3_965, goo: 0 },
];

export const switches = [
  { id: "SW-2611-118", address: "Bahnhofstrasse 22, Muri", from: "Talwerke (basic supply)", to: "Axpo Solutions", date: "1 Dec 2026", received: "Today 10:12", status: "Needs review" },
  { id: "SW-2611-117", address: "Industrieweg 14, Muri", from: "Alpiq", to: "Talwerke Vertrieb", date: "1 Jan 2027", received: "Thu 12 Nov", status: "Accepted" },
  { id: "SW-2611-112", address: "Allmendstrasse 40, Allmend", from: "Talwerke (basic supply)", to: "Energie 360°", date: "1 Jan 2027", received: "Mon 09 Nov", status: "Accepted" },
  { id: "SW-2611-108", address: "Kirchgasse 5, Oberried", from: "Energie 360°", to: "Talwerke (basic supply)", date: "1 Dec 2026", received: "Thu 05 Nov", status: "Completed" },
  { id: "SW-2610-099", address: "Gewerbering 3, Muri", from: "Talwerke (basic supply)", to: "Alpiq", date: "1 Nov 2026", received: "15 Oct", status: "Completed" },
];

export const switchVolume = [
  { t: "2025", switches: 46 }, { t: "2026", switches: 61 }, { t: "2027*", switches: 420 }, { t: "2028*", switches: 1_900 }, { t: "2029*", switches: 3_400 },
];

export const reconciliation = [
  { item: "Imbalance volume, Swissgrid vs. ours", ours: "1,284.6 MWh", theirs: "1,298.8 MWh", diff: "+14.2 MWh", status: "Difference", cause: "Corrected meter data for 21 Oct arrived after Swissgrid's cut-off" },
  { item: "Imbalance cost, Swissgrid invoice", ours: "CHF 58,912.70", theirs: "CHF 61,004.10", diff: "+CHF 2,091.40", status: "Difference", cause: "Follows from the volume difference above" },
  { item: "Supplier volumes, Axpo", ours: "18,221.4 MWh", theirs: "18,221.4 MWh", diff: "0", status: "Matched", cause: "" },
  { item: "Supplier volumes, Alpiq", ours: "6,910.9 MWh", theirs: "6,910.9 MWh", diff: "0", status: "Matched", cause: "" },
  { item: "Grid usage, billed vs. settled", ours: "CHF 6,012,400", theirs: "CHF 6,011,980", diff: "−CHF 420", status: "Difference", cause: "3 customers billed before revision 1" },
];

export const auditTrail = [
  { at: "Today 16:02", who: "S. Rossi", what: "Opened October revision 1 for review", ref: "SR-2610-R1" },
  { at: "Today 09:14", who: "System", what: "Estimated 312 missing intervals (Muri, 12 Nov) from similar days", ref: "Rule G-01, v3" },
  { at: "Tue 10 Nov 06:00", who: "System", what: "October revision 1 calculated with meter data as of 10 Nov 05:00", ref: "SR-2610-R1" },
  { at: "Mon 09 Nov 15:40", who: "M. Huber", what: "Tariff 'Households, dynamic' price table for November published", ref: "Tariff T-HHD, v11" },
  { at: "Fri 06 Nov 11:20", who: "S. Rossi, approved by M. Huber", what: "September final run approved and period locked", ref: "SR-2609-FIN" },
];

export const periods = [
  { period: "November 2026", status: "Open", initial: "Daily", revision: "–", final: "–", locked: false },
  { period: "October 2026", status: "In review", initial: "Done", revision: "Revision 1 in review", final: "Due 5 Dec", locked: false },
  { period: "September 2026", status: "Locked", initial: "Done", revision: "Done", final: "Approved 6 Nov", locked: true },
  { period: "August 2026", status: "Locked", initial: "Done", revision: "Done", final: "Approved 7 Oct", locked: true },
];

export const closeChecklist = [
  { id: "c1", text: "All meter data received or estimated", done: true },
  { id: "c2", text: "No open high-priority exceptions", done: false },
  { id: "c3", text: "Revision run reviewed and differences explained", done: false },
  { id: "c4", text: "Balance group messages accepted by Swissgrid", done: false },
  { id: "c5", text: "Reconciliation with Swissgrid and suppliers done", done: false },
  { id: "c6", text: "Approved by a second person", done: false },
];

export const regReports = [
  { name: "ElCom cost and tariff report 2027", due: "31 Aug 2026", status: "Accepted", detail: "Grid costs, volumes per tariff, planned tariffs" },
  { name: "ElCom: dynamic tariff results, 2026 H1", due: "30 Sep 2026", status: "Accepted", detail: "Customers, load shifted, revenue effect" },
  { name: "Canton: LEG and ZEV register", due: "31 Dec 2026", status: "Ready to send", detail: "Communities, members, shared energy" },
  { name: "Swissgrid: yearly metering point statistics", due: "31 Jan 2027", status: "Pending", detail: "Points per balance group and meter type" },
  { name: "Federal statistics (BFE): electricity use by sector", due: "31 Mar 2027", status: "Pending", detail: "Yearly volumes per customer group" },
];
