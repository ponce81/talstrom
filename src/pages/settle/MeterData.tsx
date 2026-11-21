import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { meterQuality, plausibility } from "./settleData";
import { axis, Head, Kpis, Status } from "../trading/ui";

export default function MeterData() {
  return (
    <div className="stack">
      <Head title="Metering data" text="All meter readings, checked before settlement. Values that fail a check are corrected or estimated by rule, and every change is marked." />
      <Kpis
        items={[
          { label: "Metering points", value: "48,210", note: "87% smart meters, 15-min values" },
          { label: "Measured, last 14 days", value: "99.3%", note: "of all 15-min values" },
          { label: "Estimated", value: "0.6%", note: "by rule, marked as estimated" },
          { label: "Held for review", value: "6", note: "values that look impossible", tone: "bad" },
        ]}
      />
      <section className="panel">
        <h2>Data status per day</h2>
        <p className="sub">Share of 15-min values, last 14 days</p>
        <div className="legend" style={{ marginBottom: 6 }}>
          <span><i style={{ background: "var(--hydro)", height: 10 }} /> Measured</span>
          <span><i style={{ background: "#f2c230", height: 10 }} /> Estimated</span>
          <span><i style={{ background: "var(--short)", height: 10 }} /> Missing</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={meterQuality} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={1} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={44} domain={[98.5, 100]} ticks={[98.5, 99, 99.5, 100]} unit="%" allowDataOverflow />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="measured" name="Measured" stackId="a" fill="#0e6b70" isAnimationActive={false} />
            <Bar dataKey="estimated" name="Estimated" stackId="a" fill="#f2c230" isAnimationActive={false} />
            <Bar dataKey="missing" name="Missing" stackId="a" fill="#b8443a" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>Checks this week</h2>
        <p className="sub">Each check is a versioned rule. Changing a rule creates a new version, so old runs stay reproducible.</p>
        <table>
          <thead><tr><th>Check</th><th className="r">Found</th><th>What happened</th><th>Status</th></tr></thead>
          <tbody>
            {plausibility.map((p) => (
              <tr key={p.rule}>
                <td>{p.rule}</td>
                <td className="r">{p.found}</td>
                <td>{p.action}</td>
                <td><Status s={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
