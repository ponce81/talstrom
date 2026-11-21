import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { btm, btmAreas } from "./forecastData";
import { useToast } from "../../App";
import { axis, Head, Kpis } from "../trading/ui";

export default function BehindMeter() {
  const toast = useToast();
  const reg = btmAreas.reduce((s, a) => s + a.registered, 0);
  const est = btmAreas.reduce((s, a) => s + a.estimated, 0);
  const unreg = btmAreas.reduce((s, a) => s + a.unregistered, 0);
  const noon = btm[52];

  return (
    <div className="stack">
      <Head title="Behind-the-meter solar" text="Rooftop solar that customers use themselves never shows up at the meter, so it hides real consumption. Talstrom estimates it from meter data, weather and the solar register." />
      <Kpis
        items={[
          { label: "Registered solar", value: `${reg.toFixed(1)} MW`, note: "in the Pronovo register" },
          { label: "Estimated from meter data", value: `${est.toFixed(1)} MW`, note: `${(est - reg).toFixed(1)} MW more than registered` },
          { label: "Likely unregistered systems", value: String(unreg), note: "mostly balcony solar" },
          { label: "Consumption hidden at noon", value: `${Math.round((noon.hidden / noon.gross) * 100)}%`, note: "today at 13:00" },
        ]}
      />
      <section className="panel">
        <h2>What the meters see vs. real consumption, today</h2>
        <p className="sub">The gap is solar produced and used on site. When clouds pass, it comes back as grid load within minutes.</p>
        <div className="legend" style={{ marginBottom: 6 }}>
          <span><i style={{ background: "var(--ink)" }} /> Measured at the meters</span>
          <span><i style={{ background: "var(--hydro)" }} /> Estimated real consumption</span>
          <span><i style={{ background: "#f2c230", height: 10 }} /> Hidden solar</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={btm} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={11} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
            <Tooltip formatter={(v: number) => `${v} MW`} />
            <Area dataKey="hidden" name="Hidden solar" fill="#f2c230" fillOpacity={0.3} stroke="#f2c230" />
            <Line dataKey="gross" name="Estimated real consumption" stroke="#0e6b70" dot={false} strokeWidth={2} />
            <Line dataKey="net" name="Measured" stroke="#172630" dot={false} strokeWidth={1.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>By area</h2>
            <p className="sub">Unregistered systems found by their daily pattern in the meter data</p>
          </div>
          <button className="btn" onClick={() => toast("List of 153 likely unregistered systems exported for the connection team")}>Export list</button>
        </div>
        <table>
          <thead><tr><th>Area</th><th className="r">Registered</th><th className="r">Estimated</th><th className="r">Difference</th><th className="r">Likely unregistered</th></tr></thead>
          <tbody>
            {btmAreas.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td className="r">{a.registered.toFixed(1)} MW</td>
                <td className="r">{a.estimated.toFixed(1)} MW</td>
                <td className="r" style={{ fontWeight: 600 }}>+{(a.estimated - a.registered).toFixed(1)} MW</td>
                <td className="r">{a.unregistered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
