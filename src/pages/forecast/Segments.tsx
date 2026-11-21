import { useState } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { areas, segments } from "./forecastData";
import { axis, Head } from "../trading/ui";

const SEG = [
  { key: "households", label: "Households", color: "#9cc9c6" },
  { key: "ci", label: "Commerce and industry", color: "#4f8f93" },
  { key: "hp", label: "Heat pumps", color: "#0e6b70" },
  { key: "ev", label: "EV charging", color: "#172630" },
  { key: "pv", label: "Rooftop solar (reduces load)", color: "#f2c230" },
] as const;

export default function Segments() {
  const [area, setArea] = useState("All areas");
  const k = area === "All areas" ? 1 : (areas.find((a) => a.name === area)!.peak / 170);
  const data = segments.map((d) => ({ t: d.t, households: +(d.households * k).toFixed(1), ci: +(d.ci * k).toFixed(1), hp: +(d.hp * k).toFixed(1), ev: +(d.ev * k).toFixed(1), pv: +(d.pv * k).toFixed(1) }));

  return (
    <div className="stack">
      <Head
        title="Segments and areas"
        text="Today's forecast split by type of customer and by grid area. Forecasting each part separately is more accurate, and it is what grid planning needs."
        actions={
          <label className="field">
            Area
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option>All areas</option>
              {areas.map((a) => <option key={a.name}>{a.name}</option>)}
            </select>
          </label>
        }
      />
      <section className="panel">
        <h2>Forecast by segment, {area === "All areas" ? "whole grid" : area}</h2>
        <p className="sub">MW in 15-minute steps. Solar is shown below zero because it lowers what the grid has to supply.</p>
        <div className="legend" style={{ marginBottom: 6 }}>
          {SEG.map((s) => <span key={s.key}><i style={{ background: s.color, height: 10 }} /> {s.label}</span>)}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} stackOffset="sign">
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={11} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
            <Tooltip formatter={(v: number) => `${v} MW`} />
            <ReferenceLine y={0} stroke="#5b6c76" />
            {SEG.map((s) => <Area key={s.key} dataKey={s.key} name={s.label} stackId="1" stroke="none" fill={s.color} fillOpacity={0.9} />)}
          </AreaChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>By grid area</h2>
        <p className="sub">These forecasts feed the congestion forecast in grid planning</p>
        <table>
          <thead><tr><th>Area</th><th className="r">Peak today</th><th className="r">Error, last 7 days</th><th className="r">Heat-pump share at peak</th><th className="r">Solar installed</th></tr></thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.name} className={`click ${a.name === area ? "sel" : ""}`} onClick={() => setArea(a.name)}>
                <td>{a.name}</td>
                <td className="r">{a.peak.toFixed(1)} MW</td>
                <td className="r">{a.error.toFixed(1)}%</td>
                <td className="r">{a.hp}%</td>
                <td className="r">{a.pv.toFixed(1)} MW</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
