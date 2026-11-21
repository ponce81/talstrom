import { Area, Bar, BarChart, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calibration, fan } from "./forecastData";
import { axis, chf, Head, Kpis } from "../trading/ui";

export default function Ranges() {
  const evening = fan.filter((_, i) => i >= 68 && i < 80);
  const mwhAtRisk = evening.reduce((s, d) => s + (d.p10p90[1] - d.p50) / 4, 0);

  return (
    <div className="stack">
      <Head title="Ranges" text="Every forecast comes with a range, because the future is uncertain. A wide range means: keep more flexibility in reserve, or hedge more carefully." />
      <Kpis
        items={[
          { label: "Saturday 17–20h, upper range", value: `+${mwhAtRisk.toFixed(1)} MWh`, note: "above the central forecast (90% case)", tone: "bad" },
          { label: "Possible extra cost", value: chf(mwhAtRisk * 160), note: "if bought at imbalance prices" },
          { label: "Widest hour", value: "18–19h", note: "temperature and solar both uncertain" },
          { label: "Range reliability", value: "78%", note: "of day-ahead values fell inside the 80% range" },
        ]}
      />
      <section className="panel">
        <h2>Saturday 14 November, with ranges</h2>
        <p className="sub">Dark band: 50% likely. Light band: 80% likely. Line: central forecast.</p>
        <ResponsiveContainer width="100%" height={290}>
          <ComposedChart data={fan} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={11} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
            <Tooltip formatter={(v: number | number[]) => (Array.isArray(v) ? `${v[0]}–${v[1]} MW` : `${v} MW`)} />
            <Area dataKey="p10p90" name="80% range" fill="#d6ecea" stroke="none" />
            <Area dataKey="p25p75" name="50% range" fill="#9cc9c6" stroke="none" />
            <Line dataKey="p50" name="Central forecast" stroke="#0e6b70" dot={false} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>Can you trust the ranges?</h2>
        <p className="sub">Share of real values that fell inside the 80% range, last 90 days. 80% is perfect.</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={calibration} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
            <XAxis type="number" domain={[50, 100]} tick={axis} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="horizon" tick={axis} tickLine={false} axisLine={false} width={90} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <ReferenceLine x={80} stroke="#b8443a" strokeDasharray="4 4" />
            <Bar dataKey="inside" fill="#0e6b70" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="sub" style={{ margin: "8px 0 0" }}>Week-ahead ranges are slightly too narrow. They will be widened in the next model version.</p>
      </section>
    </div>
  );
}
