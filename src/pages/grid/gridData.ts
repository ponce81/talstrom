// Mock data for the grid planning module. Grid: Talwerke Netz, 4 substations, 7 medium-voltage feeders.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const modelSources = [
  { name: "GIS export (lines, cables, stations)", system: "Smallworld GIS", last: "Today 05:00", records: "18,420 objects", status: "Connected" },
  { name: "Medium-voltage model", system: "NEPLAN file", last: "02 Nov 2026", records: "7 feeders, 212 nodes", status: "Connected" },
  { name: "Meter master data", system: "SAP IS-U", last: "Today 05:10", records: "48,210 metering points", status: "Connected" },
  { name: "Smart-meter readings", system: "Head-end system", last: "16:15", records: "15-min values", status: "Connected" },
  { name: "Building register", system: "Federal register (GWR)", last: "01 Nov 2026", records: "9,840 buildings", status: "Delayed" },
];

export const dataIssues = [
  { id: "Q-1", severity: "high", text: "Cable type missing on 14 low-voltage sections in Oberried.", fix: "Use the type of the neighbouring section (NAYY 4×150)" },
  { id: "Q-2", severity: "high", text: "38 smart meters are not linked to a low-voltage feeder.", fix: "Link by nearest connection point in the GIS" },
  { id: "Q-3", severity: "medium", text: "Transformer TS-0412 is rated 630 kVA in the GIS and 400 kVA in NEPLAN.", fix: "Ask the field team to confirm the nameplate" },
  { id: "Q-4", severity: "low", text: "112 buildings have no heating type in the building register.", fix: "Assume gas heating, as in the cantonal statistics" },
];

export const transformers = [
  { id: "TS-0412", name: "Oberried Schulhaus", rating: 400, peakMeasured: 371, peakEstimated: 262, pv: 410, meters: 96 },
  { id: "TS-0398", name: "Oberried Bahnhof", rating: 630, peakMeasured: 498, peakEstimated: 420, pv: 220, meters: 98 },
  { id: "TS-0221", name: "Sonnenberg Ost", rating: 400, peakMeasured: 322, peakEstimated: 300, pv: 515, meters: 91 },
  { id: "TS-0217", name: "Sonnenberg Mitte", rating: 630, peakMeasured: 401, peakEstimated: 410, pv: 160, meters: 88 },
  { id: "TS-0310", name: "Muri Dorfplatz", rating: 630, peakMeasured: 512, peakEstimated: 455, pv: 140, meters: 94 },
  { id: "TS-0305", name: "Muri Gewerbe", rating: 1000, peakMeasured: 604, peakEstimated: 640, pv: 380, meters: 79 },
  { id: "TS-0501", name: "Allmend Nord", rating: 400, peakMeasured: 188, peakEstimated: 230, pv: 95, meters: 85 },
];

/** A winter week of 15-min load for the selected transformer, in kVA (shape only; scaled per transformer). */
export function weekProfile(peak: number, seed: number) {
  const r = rng(seed);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const out: { t: string; kva: number }[] = [];
  days.forEach((d, di) => {
    for (let q = 0; q < 96; q += 2) {
      const h = q / 4;
      const shape = 0.38 + 0.25 * Math.exp(-((h - 7.5) ** 2) / 4) + 0.62 * Math.exp(-((h - 18.5) ** 2) / 5) - (h > 10 && h < 15 ? 0.1 : 0);
      const day = di === 2 ? 1.0 : 0.86 + r() * 0.1;
      out.push({ t: `${d} ${String(Math.floor(h)).padStart(2, "0")}h`, kva: Math.round(peak * shape * day + (r() - 0.5) * peak * 0.05) });
    }
  });
  return out;
}

export type ConnStatus = "Approved" | "Approved with conditions" | "Needs study" | "New";
export const connectionRequests: { id: string; address: string; kind: string; kw: number; received: string; status: ConnStatus; note: string; feeder: string }[] = [
  { id: "CR-2611-041", address: "Schulweg 7, Oberried", kind: "Rooftop PV", kw: 28, received: "Today 14:10", status: "New", note: "", feeder: "Oberried 3" },
  { id: "CR-2611-040", address: "Bahnhofstrasse 22, Muri", kind: "Wallbox", kw: 22, received: "Today 11:02", status: "Approved", note: "Fits within the transformer's free capacity.", feeder: "Muri Dorf" },
  { id: "CR-2611-038", address: "Sonnenhalde 3, Sonnenberg", kind: "Rooftop PV", kw: 45, received: "Yesterday", status: "Approved with conditions", note: "Feed-in limited to 70% of panel power at noon. Voltage would reach 1.09 p.u. otherwise.", feeder: "Sonnenberg 2" },
  { id: "CR-2611-031", address: "Industrieweg 14, Muri", kind: "Battery", kw: 250, received: "Tue 10 Nov", status: "Needs study", note: "Above 100 kW, so a detailed medium-voltage study is required.", feeder: "Muri Industrie" },
  { id: "CR-2611-027", address: "Kirchgasse 5, Oberried", kind: "Heat pump", kw: 11, received: "Mon 09 Nov", status: "Approved", note: "Fits within the transformer's free capacity.", feeder: "Oberried 1" },
  { id: "CR-2611-019", address: "Allmendstrasse 40, Allmend", kind: "Rooftop PV", kw: 95, received: "Thu 05 Nov", status: "Approved", note: "Fits. 2.4 MW of solar can still connect on this feeder.", feeder: "Allmend 2" },
];

/** Areas for the hosting-capacity map (stylised village quarters). Capacity left in kW. */
export const areas = [
  { id: "A1", name: "Oberried Dorf", pts: "40,60 210,40 250,150 120,190 30,150", pv: 60, hp: 140, ev: 90 },
  { id: "A2", name: "Oberried Schulhaus", pts: "210,40 360,30 390,130 250,150", pv: 0, hp: 35, ev: 20 },
  { id: "A3", name: "Oberried Bahnhof", pts: "120,190 250,150 300,260 160,300", pv: 180, hp: 210, ev: 150 },
  { id: "A4", name: "Sonnenberg Ost", pts: "360,30 540,50 560,160 390,130", pv: 30, hp: 260, ev: 180 },
  { id: "A5", name: "Sonnenberg Mitte", pts: "390,130 560,160 520,270 300,260 250,150", pv: 240, hp: 120, ev: 110 },
  { id: "A6", name: "Muri Dorfplatz", pts: "160,300 300,260 330,380 180,410 110,360", pv: 310, hp: 80, ev: 40 },
  { id: "A7", name: "Muri Gewerbe", pts: "300,260 520,270 560,390 330,380", pv: 520, hp: 400, ev: 350 },
  { id: "A8", name: "Allmend Nord", pts: "540,50 700,70 720,250 560,160", pv: 820, hp: 520, ev: 480 },
  { id: "A9", name: "Allmend Süd", pts: "560,160 720,250 700,390 560,390 520,270", pv: 690, hp: 440, ev: 400 },
];

export const scenarioDefaults = [
  { municipality: "Oberried", pv: 60, hp: 35, ev: 40 },
  { municipality: "Sonnenberg", pv: 75, hp: 40, ev: 35 },
  { municipality: "Muri", pv: 45, hp: 30, ev: 50 },
  { municipality: "Allmend", pv: 90, hp: 25, ev: 30 },
];

export const measures = [
  { id: "M1", name: "Second cable, Oberried 3", kind: "Reinforcement", capex: 480_000, opex: 2_000, lead: "14 months", solvesUntil: 2045, note: "Permanent fix. Road works on Schulweg needed." },
  { id: "M2", name: "Larger transformer TS-0412 (630 kVA)", kind: "Reinforcement", capex: 95_000, opex: 500, lead: "6 months", solvesUntil: 2033, note: "Fixes the transformer, not the cable." },
  { id: "M3", name: "Battery at feeder end, 1 MW / 2 MWh", kind: "Flexibility", capex: 820_000, opex: -38_000, lead: "9 months", solvesUntil: 2038, note: "Earns trading revenue when the grid doesn't need it." },
  { id: "M4", name: "Solar peak curtailment (3%)", kind: "Flexibility", capex: 15_000, opex: 4_000, lead: "2 months", solvesUntil: 2029, note: "Allowed by the new electricity law. Solves noon voltage only." },
  { id: "M5", name: "Heat-pump flexibility contracts", kind: "Flexibility", capex: 20_000, opex: 18_000, lead: "3 months", solvesUntil: 2031, note: "Shifts 0.8 MW out of the evening peak; customers get a lower tariff." },
];

export const projects = [
  { name: "Heat-pump flexibility, Oberried", start: 2027, end: 2027, cost: 0.04, kind: "Flexibility", status: "Approved" },
  { name: "Transformer TS-0412 upgrade", start: 2027, end: 2027, cost: 0.1, kind: "Reinforcement", status: "Approved" },
  { name: "Solar peak curtailment, all feeders", start: 2027, end: 2027, cost: 0.02, kind: "Flexibility", status: "Planned" },
  { name: "Second cable Oberried 3", start: 2029, end: 2030, cost: 0.48, kind: "Reinforcement", status: "Planned" },
  { name: "Substation Sonnenberg, new 25 MVA unit", start: 2030, end: 2032, cost: 2.6, kind: "Reinforcement", status: "Planned" },
  { name: "Battery Muri Dorf, 1 MW", start: 2031, end: 2031, cost: 0.82, kind: "Flexibility", status: "Idea" },
  { name: "Low-voltage renewal, Muri old town", start: 2032, end: 2035, cost: 1.9, kind: "Renewal", status: "Planned" },
  { name: "Feeder Allmend 3 (new area)", start: 2034, end: 2035, cost: 1.2, kind: "Reinforcement", status: "Idea" },
];

export const congestion = (() => {
  const base: Record<string, number> = { "Oberried 3": 92, "Muri Dorf": 77, "Oberried 1": 71, "Sonnenberg 2": 64, "Muri Industrie": 58, "Sonnenberg 5": 48, "Allmend 2": 39 };
  const r = rng(77);
  return Object.entries(base).map(([name, peak]) => ({
    name,
    hours: Array.from({ length: 24 }, (_, h) => {
      const evening = Math.exp(-((h - 18.3) ** 2) / 4.5);
      const morning = 0.45 * Math.exp(-((h - 8) ** 2) / 5);
      const v = peak * (0.42 + 0.58 * Math.max(evening, morning)) * (0.97 + r() * 0.06) + (name === "Oberried 3" && h === 18 ? 5 : 0);
      return Math.round(v);
    }),
  }));
})();

export const versions = [
  { v: 142, at: "Today 09:12", by: "A. Keller", what: "Cable section MD-114 replaced (Muri Dorf), new type NA2XS2Y 3×1×240", source: "Field report" },
  { v: 141, at: "Today 05:00", by: "System", what: "Nightly GIS import: 6 changed objects", source: "Smallworld GIS" },
  { v: 140, at: "Thu 12 Nov", by: "P. Brunner (Ingenieurbüro Brunner)", what: "Study model for Sonnenberg substation extension", source: "Consultant" },
  { v: 139, at: "Wed 11 Nov", by: "A. Keller", what: "Transformer TS-0221 tap position changed to −2.5%", source: "Field report" },
  { v: 138, at: "Mon 09 Nov", by: "System", what: "Nightly GIS import: 2 changed objects", source: "Smallworld GIS" },
];

export const gridReports = [
  { name: "Network development plan 2027–2036", kind: "Regulator", period: "2027–2036", status: "Draft", updated: "Today" },
  { name: "Cost and investment report 2025", kind: "ElCom", period: "2025", status: "Accepted", updated: "30 Jun 2026" },
  { name: "Board summary Q4: grid capacity and investments", kind: "Board", period: "Q4 2026", status: "Ready to send", updated: "Yesterday" },
  { name: "Connection statistics, October", kind: "Internal", period: "October 2026", status: "Sent", updated: "02 Nov 2026" },
];

export const team = [
  { name: "Andrea Keller", role: "Grid engineer", access: "Edit model, run studies", org: "Talwerke", until: "" },
  { name: "Marco Huber", role: "Administrator", access: "Everything", org: "Talwerke", until: "" },
  { name: "Reto Zimmermann", role: "Field technician", access: "View model, report field changes", org: "Talwerke", until: "" },
  { name: "Peter Brunner", role: "External consultant", access: "Edit study models only", org: "Ingenieurbüro Brunner", until: "31 Mar 2027" },
  { name: "Gemeinde Oberried", role: "Municipality", access: "View scenarios for Oberried", org: "Municipality", until: "31 Dec 2026" },
];

export const comments = [
  { who: "Peter Brunner", at: "Thu 12 Nov", text: "The Sonnenberg study assumes 75% PV growth. The municipality's energy plan says 60%. Which should we use?" },
  { who: "Andrea Keller", at: "Thu 12 Nov", text: "Use 75%. The energy plan is from 2023 and connection requests are already above its forecast." },
  { who: "Gemeinde Oberried", at: "Today 08:40", text: "Can you share the 2035 heat-pump scenario for our new building zone?" },
];
