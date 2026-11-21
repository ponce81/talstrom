// Deterministic mock data for the Talstrom demo. Nothing here talks to a server.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const TODAY = "Sat 21 Nov 2026";
export const NOW_QH = 66; // 16:30, the current quarter-hour index (0–95)

export function qhLabel(i: number) {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Grid load in MW for a mid-sized Swiss distribution grid on a November weekday. */
function loadShape(i: number) {
  const h = i / 4;
  const morning = 38 * Math.exp(-((h - 8.5) ** 2) / 6);
  const noon = 22 * Math.exp(-((h - 12.5) ** 2) / 3);
  const evening = 52 * Math.exp(-((h - 18.25) ** 2) / 4.5);
  return 118 + morning + noon + evening;
}

function pvShape(i: number) {
  const h = i / 4;
  if (h < 7.6 || h > 16.9) return 0;
  return 21 * Math.sin(((h - 7.6) / 9.3) * Math.PI) ** 1.4;
}

export interface QH {
  t: string;
  i: number;
  forecast: number;
  p10: number;
  p90: number;
  actual: number | null;
  pv: number;
  pvActual: number | null;
  price: number;
}

export const today: QH[] = (() => {
  const r = rng(42);
  return Array.from({ length: 96 }, (_, i) => {
    const f = loadShape(i);
    const pv = pvShape(i);
    const spread = 4 + (i / 96) * 6;
    const noise = (r() - 0.5) * 9 + Math.sin(i / 7) * 2.5;
    const pvNoise = pv * (0.85 + r() * 0.25);
    const price =
      78 + 0.55 * (f - 118) - 1.4 * pv + (r() - 0.5) * 8 + (i > 68 && i < 80 ? 22 : 0);
    return {
      t: qhLabel(i),
      i,
      forecast: +f.toFixed(1),
      p10: +(f - spread).toFixed(1),
      p90: +(f + spread).toFixed(1),
      actual: i <= NOW_QH ? +(f + noise).toFixed(1) : null,
      pv: +pv.toFixed(1),
      pvActual: i <= NOW_QH ? +pvNoise.toFixed(1) : null,
      price: +price.toFixed(2),
    };
  });
})();

export const forecastSeries = {
  "Total grid load": 1,
  Households: 0.46,
  "Commerce & industry": 0.41,
  "Heat pumps": 0.13,
} as const;

export const week = (() => {
  const r = rng(7);
  const days = ["Sat 14", "Sun 15", "Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20"];
  const out: { t: string; forecast: number; p10: number; p90: number }[] = [];
  days.forEach((d, di) => {
    const weekend = di < 2 ? 0.82 : 1;
    for (let h = 0; h < 24; h += 2) {
      const f = loadShape(h * 4) * weekend * (1 + (r() - 0.5) * 0.04);
      const sp = 6 + di * 2.2;
      out.push({ t: `${d} ${String(h).padStart(2, "0")}h`, forecast: +f.toFixed(1), p10: +(f - sp).toFixed(1), p90: +(f + sp).toFixed(1) });
    }
  });
  return out;
})();

export const weather = [
  { t: "06h", temp: 2, irr: 0 },
  { t: "09h", temp: 4, irr: 180 },
  { t: "12h", temp: 8, irr: 390 },
  { t: "15h", temp: 7, irr: 240 },
  { t: "18h", temp: 4, irr: 0 },
  { t: "21h", temp: 2, irr: 0 },
];

export const models = [
  { name: "Grid load – gradient boosting", target: "Total grid load", mape: 2.4, trained: "Today 03:10", status: "Live" },
  { name: "Grid load – seasonal baseline", target: "Total grid load", mape: 4.9, trained: "Today 03:10", status: "Fallback" },
  { name: "Rooftop PV – irradiance model", target: "PV production", mape: 7.8, trained: "Yesterday 22:40", status: "Live" },
  { name: "Run-of-river – inflow model", target: "Hydro production", mape: 5.1, trained: "Mon 09 Nov", status: "Live" },
  { name: "Heat pumps – temperature model", target: "Heat pumps", mape: 6.3, trained: "Today 03:10", status: "Retraining" },
];

export type RunStatus = "Completed" | "Running" | "Needs review" | "Queued";

export interface SettlementRun {
  id: string;
  period: string;
  kind: "Initial" | "Revision 1" | "Revision 2" | "Final";
  group: string;
  status: RunStatus;
  mwh: number;
  chf: number;
  delta: number | null;
  created: string;
  points: number;
  missing: number;
}

export const runs: SettlementRun[] = [
  { id: "SR-2611-014", period: "12 Nov 2026", kind: "Initial", group: "Talwerke Netz", status: "Running", mwh: 3412.6, chf: 512_890, delta: null, created: "Today 06:00", points: 48_210, missing: 312 },
  { id: "SR-2611-013", period: "11 Nov 2026", kind: "Initial", group: "Talwerke Netz", status: "Completed", mwh: 3388.1, chf: 506_118, delta: null, created: "Yesterday 06:00", points: 48_205, missing: 41 },
  { id: "SR-2610-R1", period: "October 2026", kind: "Revision 1", group: "Talwerke Netz", status: "Needs review", mwh: 101_244.9, chf: 15_402_310, delta: 0.62, created: "Tue 10 Nov", points: 48_190, missing: 0 },
  { id: "SR-2610-R1B", period: "October 2026", kind: "Revision 1", group: "Talwerke Vertrieb", status: "Completed", mwh: 64_810.2, chf: 9_871_440, delta: -0.18, created: "Tue 10 Nov", points: 31_022, missing: 0 },
  { id: "SR-2609-FIN", period: "September 2026", kind: "Final", group: "Talwerke Netz", status: "Completed", mwh: 94_102.3, chf: 13_660_920, delta: 0.04, created: "Fri 06 Nov", points: 48_102, missing: 0 },
  { id: "SR-2608-R2", period: "August 2026", kind: "Revision 2", group: "Talwerke Netz", status: "Completed", mwh: 89_877.0, chf: 12_840_005, delta: -0.09, created: "Mon 02 Nov", points: 48_011, missing: 0 },
  { id: "SR-2611-015", period: "13 Nov 2026", kind: "Initial", group: "Talwerke Netz", status: "Queued", mwh: 0, chf: 0, delta: null, created: "Tomorrow 06:00", points: 0, missing: 0 },
];

export const runBreakdown = [
  { category: "Households (H4)", mwh: 38_902.4, chf: 6_120_400, prev: 38_655.0 },
  { category: "Small business (C2)", mwh: 21_480.7, chf: 3_301_220, prev: 21_402.9 },
  { category: "Industry (load profiled)", mwh: 29_340.2, chf: 4_210_880, prev: 29_310.6 },
  { category: "Heat pumps (dynamic tariff)", mwh: 7_118.4, chf: 1_102_310, prev: 6_990.2 },
  { category: "Energy communities (LEG)", mwh: 2_903.6, chf: 401_870, prev: 2_812.4 },
  { category: "Grid losses", mwh: 1_499.6, chf: 265_630, prev: 1_488.1 },
];

/** Tomorrow's hourly position: positive = long (bought more than forecast need). */
export const position = (() => {
  const r = rng(99);
  return Array.from({ length: 24 }, (_, h) => {
    const need = loadShape(h * 4) - pvShape(h * 4) * 0.8;
    let open = (r() - 0.5) * 2.4;
    if (h >= 17 && h <= 19) open = -5.6 - r() * 1.6; // evening peak not yet covered
    if (h >= 11 && h <= 13) open = 2.2 + r() * 1.4; // PV surplus at midday
    const price = 82 + 0.5 * (need - 118) + (r() - 0.5) * 6 + (h >= 17 && h <= 20 ? 24 : 0);
    return { t: `${String(h).padStart(2, "0")}h`, open: +open.toFixed(1), price: +price.toFixed(2) };
  });
})();

export const deals = [
  { id: "D-88213", time: "16:12", product: "Sat 14 · 18–19h", side: "Buy", mw: 5, price: 131.4, venue: "EPEX intraday", trader: "L. Meier" },
  { id: "D-88207", time: "15:48", product: "Sat 14 · base", side: "Sell", mw: 3, price: 92.1, venue: "EPEX intraday", trader: "L. Meier" },
  { id: "D-88190", time: "14:05", product: "Dec 2026 · peak", side: "Buy", mw: 10, price: 118.75, venue: "EEX futures", trader: "S. Rossi" },
  { id: "D-88161", time: "11:30", product: "Q1 2027 · base", side: "Buy", mw: 8, price: 104.2, venue: "Bilateral – Axpo", trader: "S. Rossi" },
  { id: "D-88140", time: "09:58", product: "Sat 14 · 07–08h", side: "Sell", mw: 4, price: 88.6, venue: "EPEX intraday", trader: "L. Meier" },
];

export interface Feeder {
  id: string;
  name: string;
  substation: string;
  loading: number; // % today peak
  loading2030: number;
  loading2035: number;
  pvHosting: number; // MW remaining
  voltageMin: number; // p.u.
}

export const feeders: Feeder[] = [
  { id: "F-OB-03", name: "Oberried 3", substation: "UW Oberried", loading: 92, loading2030: 104, loading2035: 121, pvHosting: 0.4, voltageMin: 0.95 },
  { id: "F-OB-01", name: "Oberried 1", substation: "UW Oberried", loading: 71, loading2030: 83, loading2035: 97, pvHosting: 1.8, voltageMin: 0.97 },
  { id: "F-SB-02", name: "Sonnenberg 2", substation: "UW Sonnenberg", loading: 64, loading2030: 88, loading2035: 112, pvHosting: 0.9, voltageMin: 0.96 },
  { id: "F-SB-05", name: "Sonnenberg 5", substation: "UW Sonnenberg", loading: 48, loading2030: 59, loading2035: 72, pvHosting: 3.2, voltageMin: 0.98 },
  { id: "F-MU-01", name: "Muri Dorf", substation: "UW Muri", loading: 77, loading2030: 86, loading2035: 101, pvHosting: 1.1, voltageMin: 0.96 },
  { id: "F-MU-04", name: "Muri Industrie", substation: "UW Muri", loading: 58, loading2030: 66, loading2035: 74, pvHosting: 2.6, voltageMin: 0.98 },
  { id: "F-AL-02", name: "Allmend 2", substation: "UW Allmend", loading: 39, loading2030: 52, loading2035: 69, pvHosting: 4.1, voltageMin: 0.99 },
];

export const alerts = [
  { level: "high", text: "Feeder Oberried 3 is forecast at 92% loading between 18:00 and 19:15.", where: "Grid planning", to: "/grid/power-flow" },
  { level: "medium", text: "Meter data from Muri for 12 Nov is missing 312 intervals. The initial settlement run will estimate them.", where: "Settlement", to: "/settlement/exceptions" },
  { level: "medium", text: "Saturday 17–20h is about 6 MW short. Positions has a recommendation ready.", where: "Trading", to: "/trading/positions" },
  { level: "low", text: "The heat-pump model is retraining after a 3 °C forecast drop.", where: "Forecasting", to: "/forecasting/models" },
];
