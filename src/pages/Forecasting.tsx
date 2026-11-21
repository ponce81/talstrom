import { useMemo, useState } from "react";
import { Area, Bar, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart } from "recharts";
import { RefreshCw } from "lucide-react";
import { forecastSeries, models, NOW_QH, qhLabel, today, weather, week } from "../data";
import { useToast } from "../App";

type Horizon = "Intraday" | "Day-ahead" | "Next 7 days";

export default function Forecasting() {
  const toast = useToast();
  const [series, setSeries] = useState<keyof typeof forecastSeries | "Rooftop PV">("Total grid load");
  const [horizon, setHorizon] = useState<Horizon>("Intraday");

  const data = useMemo(() => {
    if (horizon === "Next 7 days") {
      const k = series === "Rooftop PV" ? 0.1 : forecastSeries[series];
      return week.map((d) => ({ t: d.t, forecast: +(d.forecast * k).toFixed(1), band: [+(d.p10 * k).toFixed(1), +(d.p90 * k).toFixed(1)], actual: null }));
    }
    return today.map((d) => {
      if (series === "Rooftop PV") {
        return { t: d.t, forecast: d.pv, band: [+(d.pv * 0.8).toFixed(1), +(d.pv * 1.2).toFixed(1)], actual: d.pvActual };
      }
      const k = forecastSeries[series];
      const shift = horizon === "Day-ahead" ? 1.4 : 1;
      return {
        t: d.t,
        forecast: +(d.forecast * k).toFixed(1),
        band: [+((d.forecast - (d.forecast - d.p10) * shift) * k).toFixed(1), +((d.forecast + (d.p90 - d.forecast) * shift) * k).toFixed(1)],
        actual: d.actual === null ? null : +(d.actual * k).toFixed(1),
      };
    });
  }, [series, horizon]);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Load and production</h1>
          <p>Load and production forecasts for your grid, with the range we expect the real value to fall in 80% of the time.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => toast("Forecast refreshed with the 15:00 weather run")}>
            <RefreshCw size={16} /> Refresh forecast
          </button>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head" style={{ flexWrap: "wrap", marginBottom: 12 }}>
          <label className="field">
            What to forecast
            <select value={series} onChange={(e) => setSeries(e.target.value as typeof series)}>
              {[...Object.keys(forecastSeries), "Rooftop PV"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="seg" role="tablist" aria-label="Horizon" style={{ alignSelf: "flex-end" }}>
            {(["Intraday", "Day-ahead", "Next 7 days"] as Horizon[]).map((h) => (
              <button key={h} role="tab" aria-selected={horizon === h} className={horizon === h ? "on" : ""} onClick={() => setHorizon(h)}>
                {h}
              </button>
            ))}
          </div>
        </div>
        <div className="legend" style={{ marginBottom: 6 }}>
          <span><i style={{ background: "var(--hydro)" }} /> Forecast</span>
          <span><i style={{ background: "var(--hydro-soft)", height: 10 }} /> 80% range</span>
          {horizon !== "Next 7 days" && <span><i style={{ background: "var(--ink)" }} /> Measured</span>}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" interval={horizon === "Next 7 days" ? 11 : 11} tick={{ fontSize: 12, fill: "#5b6c76" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#5b6c76" }} tickLine={false} axisLine={false} width={44} unit="" />
            <Tooltip formatter={(v: number | number[]) => (Array.isArray(v) ? `${v[0]}–${v[1]} MW` : `${v} MW`)} />
            <Area dataKey="band" name="80% range" fill="#d6ecea" stroke="none" />
            <Line dataKey="forecast" name="Forecast" stroke="#0e6b70" dot={false} strokeWidth={2} />
            <Line dataKey="actual" name="Measured" stroke="#172630" dot={false} strokeWidth={1.6} />
            {horizon !== "Next 7 days" && <ReferenceLine x={qhLabel(NOW_QH)} stroke="#f2c230" strokeWidth={2} label={{ value: "now", fill: "#5b6c76", fontSize: 12, position: "top" }} />}
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <div className="grid-2">
        <section className="panel">
          <h2>Models</h2>
          <p className="sub">Accuracy over the last 7 days. The live model feeds trading and settlement.</p>
          <table>
            <thead>
              <tr><th>Model</th><th>Forecasts</th><th className="r">Error (MAPE)</th><th>Last trained</th><th>Status</th></tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{m.target}</td>
                  <td className="r">{m.mape.toFixed(1)}%</td>
                  <td>{m.trained}</td>
                  <td><span className={`status ${m.status === "Live" ? "s-completed" : m.status === "Retraining" ? "s-running" : "s-queued"}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h2>Weather input, Bern region</h2>
          <p className="sub">Temperature and solar irradiance used by today's forecast</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weather} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={{ fontSize: 12, fill: "#5b6c76" }} tickLine={false} />
              <YAxis yAxisId="i" tick={{ fontSize: 12, fill: "#5b6c76" }} tickLine={false} axisLine={false} width={36} />
              <Tooltip />
              <Bar yAxisId="i" dataKey="irr" name="Irradiance W/m²" fill="#f2c230" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="sub" style={{ margin: "8px 0 0" }}>Temperature from 2 °C at 06h to a high of 8 °C at noon.</p>
        </section>
      </div>
    </div>
  );
}
