import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { accuracyByHorizon, accuracyBySegment, accuracyDays } from "./forecastData";
import { axis, Head, Kpis } from "../trading/ui";

export default function Accuracy() {
  return (
    <div className="stack">
      <Head title="Accuracy" text="How far the forecasts were from reality, compared with a simple baseline (same day last week, adjusted for temperature). Lower is better." />
      <Kpis
        items={[
          { label: "Day-ahead error", value: "2.4%", note: "last 30 days, grid load", tone: "good" },
          { label: "Better than baseline", value: "51%", note: "smaller error, day-ahead" },
          { label: "Worst day", value: "4 Nov", note: "cold snap, 5.0% error" },
          { label: "Value of the improvement", value: "CHF 162,000", note: "lower imbalance costs per year, estimated", tone: "good" },
        ]}
      />
      <div className="grid-2e">
        <section className="panel">
          <h2>Error by horizon</h2>
          <p className="sub">Average error (MAPE), last 30 days</p>
          <div className="legend" style={{ marginBottom: 6 }}>
            <span><i style={{ background: "var(--hydro)" }} /> Talstrom</span>
            <span><i style={{ background: "#c8d3d8" }} /> Baseline</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={accuracyByHorizon} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="horizon" tick={axis} tickLine={false} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={36} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="baseline" name="Baseline" fill="#c8d3d8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ours" name="Talstrom" fill="#0e6b70" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>Day-ahead error, day by day</h2>
          <p className="sub">Last 30 days</p>
          <div className="legend" style={{ marginBottom: 6 }}>
            <span><i style={{ background: "var(--hydro)" }} /> Talstrom</span>
            <span><i style={{ background: "#c8d3d8" }} /> Baseline</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={accuracyDays} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={6} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={36} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line dataKey="baseline" name="Baseline" stroke="#c8d3d8" dot={false} strokeWidth={2} />
              <Line dataKey="ours" name="Talstrom" stroke="#0e6b70" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
      <section className="panel">
        <h2>By segment</h2>
        <p className="sub">Day-ahead, last 30 days. Bias above zero means the forecast was too high on average.</p>
        <table>
          <thead><tr><th>Segment</th><th className="r">Error (MAPE)</th><th className="r">Bias</th><th>Compared with previous month</th></tr></thead>
          <tbody>
            {accuracyBySegment.map((s) => (
              <tr key={s.segment}>
                <td>{s.segment}</td>
                <td className="r">{s.mape.toFixed(1)}%</td>
                <td className="r" style={{ color: Math.abs(s.bias) > 1.5 ? "var(--short)" : undefined }}>{s.bias > 0 ? "+" : "−"}{Math.abs(s.bias).toFixed(1)}%</td>
                <td style={{ color: s.trend === "worse" ? "var(--short)" : s.trend === "better" ? "var(--long)" : "var(--muted)" }}>{s.trend === "worse" ? "Worse" : s.trend === "better" ? "Better" : "About the same"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
