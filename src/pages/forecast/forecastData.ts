// Mock data for the forecasting module. "Now" is Fri 13 Nov 2026, 16:30.
import { today, NOW_QH } from "../../data";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const feeds = [
  { name: "Smart-meter readings", source: "Head-end system", latency: "15 min", last: "16:15", status: "Connected", coverage: "87% of meters" },
  { name: "Weather, high resolution", source: "MeteoSwiss ICON-CH1", latency: "3 h runs", last: "15:00", status: "Connected", coverage: "1 km grid" },
  { name: "Weather, global", source: "ECMWF", latency: "6 h runs", last: "12:00", status: "Connected", coverage: "9 km grid" },
  { name: "Solar nowcast", source: "Satellite cloud images", latency: "15 min", last: "16:15", status: "Connected", coverage: "next 4 hours" },
  { name: "Installed solar register", source: "Pronovo", latency: "monthly", last: "01 Nov", status: "Connected", coverage: "4,812 systems" },
  { name: "Holidays and school breaks", source: "Cantonal calendars", latency: "yearly", last: "02 Jan", status: "Connected", coverage: "BE, SO, LU" },
  { name: "Balance group actuals", source: "Swissgrid", latency: "next day", last: "Today 09:30", status: "Delayed", coverage: "until 11 Nov" },
];

export const completeness = (() => {
  const r = rng(3);
  return Array.from({ length: 14 }, (_, i) => {
    const day = 31 + i;
    const label = day <= 31 ? `${day} Oct` : `${day - 31} Nov`;
    const received = i === 12 ? 99.4 : +(99.3 + r() * 0.65).toFixed(2);
    return { t: label, received, filled: +(100 - received).toFixed(2) };
  });
})();

export const segments = today.map((d) => {
  const h = d.i / 4;
  const hp = 9 + 13 * Math.exp(-((h - 7) ** 2) / 4) + 15 * Math.exp(-((h - 18.5) ** 2) / 5);
  const ev = 2 + 7 * Math.exp(-((h - 19.5) ** 2) / 3) + 3 * Math.exp(-((h - 8.5) ** 2) / 2);
  const ci = (h > 6.5 && h < 18.5 ? 52 : 30) + 6 * Math.sin((h / 24) * Math.PI);
  const households = Math.max(10, d.forecast + d.pv - hp - ev - ci);
  return { t: d.t, households: +households.toFixed(1), ci: +ci.toFixed(1), hp: +hp.toFixed(1), ev: +ev.toFixed(1), pv: -d.pv };
});

export const areas = [
  { name: "Oberried", peak: 48.2, error: 3.1, hp: 22, pv: 9.1 },
  { name: "Sonnenberg", peak: 39.6, error: 2.8, hp: 18, pv: 12.4 },
  { name: "Muri", peak: 61.4, error: 2.2, hp: 11, pv: 7.9 },
  { name: "Allmend", peak: 21.0, error: 3.6, hp: 9, pv: 11.6 },
];

/** Behind-the-meter: net measured load vs. estimated real consumption (net + hidden solar). */
export const btm = today.map((d) => {
  const hidden = d.pv * 1.32;
  const net = d.actual ?? d.forecast;
  return { t: d.t, net: +(net - hidden * 0.15).toFixed(1), gross: +(net + hidden * 0.85).toFixed(1), hidden: +hidden.toFixed(1) };
});

export const btmAreas = [
  { name: "Oberried", registered: 9.1, estimated: 10.6, unregistered: 41 },
  { name: "Sonnenberg", registered: 12.4, estimated: 14.9, unregistered: 63 },
  { name: "Muri", registered: 7.9, estimated: 8.4, unregistered: 12 },
  { name: "Allmend", registered: 11.6, estimated: 13.2, unregistered: 37 },
];

export const priceForecast = (() => {
  const r = rng(19);
  return Array.from({ length: 24 }, (_, h) => {
    const base = 78 + 14 * Math.exp(-((h - 8.5) ** 2) / 5) + 40 * Math.exp(-((h - 18.5) ** 2) / 4) - (h >= 10 && h <= 15 ? 18 * Math.sin(((h - 10) / 5) * Math.PI) : 0);
    const f = base * 0.93;
    const sp = 6 + (h >= 17 && h <= 20 ? 9 : 3);
    return { t: `${String(h).padStart(2, "0")}h`, forecast: +f.toFixed(2), band: [+(f - sp).toFixed(2), +(f + sp).toFixed(2)], lastSunday: +(base * 0.88 + (r() - 0.5) * 8).toFixed(2) };
  });
})();

export const fan = today.map((d, i) => {
  const sp = 3 + (i / 96) * 4 + (i > 64 && i < 80 ? 5 : 0);
  const f = d.forecast * 0.97;
  return { t: d.t, p50: +f.toFixed(1), p10p90: [+(f - sp * 1.6).toFixed(1), +(f + sp * 1.6).toFixed(1)], p25p75: [+(f - sp * 0.8).toFixed(1), +(f + sp * 0.8).toFixed(1)] };
});

export const calibration = [
  { horizon: "1 hour", inside: 81 },
  { horizon: "6 hours", inside: 79 },
  { horizon: "Day-ahead", inside: 78 },
  { horizon: "Week", inside: 74 },
];

export const drivers = [
  { name: "Last Saturday", value: 3_190, type: "base" },
  { name: "Colder (−3 °C)", value: 96, type: "up" },
  { name: "Less sun (fog until 11h)", value: 41, type: "up" },
  { name: "New heat pumps since then", value: 18, type: "up" },
  { name: "Ski season not yet open", value: -27, type: "down" },
  { name: "Forecast for Saturday", value: 3_318, type: "total" },
];

export const changes = [
  { at: "15:00", text: "MeteoSwiss lowered Saturday's temperature by 1.2 °C: +31 MWh, mostly 17–20h." },
  { at: "12:00", text: "ECMWF delays the fog clearing by 2 hours: +14 MWh between 9h and 12h." },
  { at: "06:00", text: "Friday's meter data was 1.8% above forecast; the model has adjusted the trend: +9 MWh." },
];

export const events = [
  { date: "Sat 21 Nov", name: "Ski season opening, Oberried lifts", effect: "+4.5 MW, 8–17h", by: "A. Keller", kind: "Manual adjustment" },
  { date: "Tue 8 Dec", name: "Immaculate Conception (holiday in LU)", effect: "Sunday profile for Muri area", by: "Calendar", kind: "Holiday" },
  { date: "Thu 24 Dec – Sun 3 Jan", name: "Christmas break", effect: "Holiday profile, commerce −30%", by: "Calendar", kind: "Holiday" },
  { date: "Mon 30 Nov", name: "Planned outage, Muri Gewerbe factory", effect: "−2.8 MW, 6–18h", by: "L. Meier", kind: "Manual adjustment" },
];

/** Forecast vintages for today vs. actual (subset of the day for readability). */
export const vintages = today.filter((_, i) => i % 2 === 0).map((d, i) => {
  const k = i / 48;
  return {
    t: d.t,
    actual: d.actual,
    "Wed 12:00": +(d.forecast * (1.035 - 0.02 * Math.sin(k * 6))).toFixed(1),
    "Thu 15:00": +(d.forecast * (1.012 - 0.008 * Math.sin(k * 6))).toFixed(1),
    "Fri 06:00": +d.forecast.toFixed(1),
  };
});

export const issues = [
  { issued: "Fri 13 Nov 15:00", for: "Sat 14 Nov", by: "Live model v14", total: 3_318.4, error: null as number | null },
  { issued: "Fri 13 Nov 06:00", for: "Fri 13 Nov", by: "Live model v14", total: 3_402.0, error: 1.9 },
  { issued: "Thu 12 Nov 15:00", for: "Fri 13 Nov", by: "Live model v14", total: 3_436.5, error: 2.6 },
  { issued: "Wed 11 Nov 12:00", for: "Fri 13 Nov", by: "Live model v14", total: 3_498.1, error: 4.4 },
];

export const accuracyByHorizon = [
  { horizon: "1 hour", ours: 1.1, baseline: 2.9 },
  { horizon: "6 hours", ours: 1.8, baseline: 3.8 },
  { horizon: "Day-ahead", ours: 2.4, baseline: 4.9 },
  { horizon: "2 days", ours: 3.3, baseline: 5.6 },
  { horizon: "Week", ours: 5.2, baseline: 6.8 },
];

export const accuracyDays = (() => {
  const r = rng(31);
  return Array.from({ length: 30 }, (_, i) => {
    const day = 14 + i;
    const label = day <= 31 ? `${day} Oct` : `${day - 31} Nov`;
    return { t: label, ours: +(1.6 + r() * 1.6 + (i === 21 ? 3.4 : 0)).toFixed(2), baseline: +(3.6 + r() * 2.8 + (i === 21 ? 4.2 : 0)).toFixed(2) };
  });
})();

export const accuracyBySegment = [
  { segment: "Total grid load", mape: 2.4, bias: 0.3, trend: "better" },
  { segment: "Households", mape: 3.9, bias: -0.6, trend: "same" },
  { segment: "Commerce and industry", mape: 3.1, bias: 0.4, trend: "same" },
  { segment: "Heat pumps", mape: 6.3, bias: 2.1, trend: "worse" },
  { segment: "Rooftop PV", mape: 7.8, bias: -1.2, trend: "better" },
  { segment: "Run-of-river hydro", mape: 5.1, bias: 0.8, trend: "same" },
];

export const shadow = (() => {
  const r = rng(41);
  return Array.from({ length: 21 }, (_, i) => {
    const day = 24 + i;
    const label = day <= 31 ? `${day} Oct` : `${day - 31} Nov`;
    const live = 1.7 + r() * 1.5;
    return { t: label, live: +live.toFixed(2), challenger: +(live - 0.25 - r() * 0.35).toFixed(2) };
  });
})();

export const deliveries = [
  { to: "Trading: positions and recommendations", how: "Built in", every: "Every 15 min", last: "16:30", status: "Connected" },
  { to: "Trading: Swissgrid schedules", how: "Built in", every: "With each schedule", last: "16:14", status: "Connected" },
  { to: "Grid planning: congestion forecast", how: "Built in", every: "Every 3 hours", last: "15:00", status: "Connected" },
  { to: "SAP IS-U (procurement)", how: "CSV via SFTP", every: "Daily 07:00", last: "Today 07:00", status: "Connected" },
  { to: "Control room dashboard", how: "REST API", every: "On request", last: "16:29", status: "Connected" },
  { to: "Daily PDF to management", how: "Email", every: "Daily 07:30", last: "Today 07:30", status: "Sent" },
];

export const alertRules = [
  { id: "r1", name: "Error above 5% for 2 hours in a row", channel: "Email and app", on: true },
  { id: "r2", name: "Meter data missing for more than 2% of meters", channel: "App", on: true },
  { id: "r3", name: "New weather run changes tomorrow by more than 3%", channel: "App and SMS to trader on duty", on: true },
  { id: "r4", name: "Model accuracy worse than baseline for 3 days", channel: "Email", on: true },
  { id: "r5", name: "Solar nowcast differs from forecast by more than 5 MW", channel: "App", on: false },
];

export const alertLog = [
  { at: "15:04", level: "medium", text: "New MeteoSwiss run raised Saturday by 0.9% (31 MWh). Below the 3% threshold, recorded only." },
  { at: "14:20", level: "high", text: "Heat-pump forecast error 7.8% for 2 hours (12–14h). Model retraining started." },
  { at: "09:12", level: "medium", text: "312 intervals missing from Muri for 12 Nov. Filled from similar days." },
  { at: "Thu 18:40", level: "low", text: "Swissgrid actuals delayed. Accuracy figures for 12 Nov will update tomorrow." },
];

export { today, NOW_QH };
