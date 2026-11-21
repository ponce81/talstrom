import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { priceForecast } from "./forecastData";
import { axis, Head, Kpis } from "../trading/ui";

export default function Prices() {
  const base = priceForecast.reduce((s, p) => s + p.forecast, 0) / 24;
  const peak = priceForecast.slice(8, 20).reduce((s, p) => s + p.forecast, 0) / 12;
  const max = priceForecast.reduce((m, p) => (p.forecast > m.forecast ? p : m));

  return (
    <div className="stack">
      <Head title="Prices" text="Forecast of Sunday's day-ahead prices for the Swiss zone, before tomorrow's auction at 12:00. It feeds the trading recommendations and the battery plan." />
      <Kpis
        items={[
          { label: "Base, Sun 15 Nov", value: base.toFixed(2), note: "CHF/MWh, forecast" },
          { label: "Peak, 08–20h", value: peak.toFixed(2), note: "CHF/MWh, forecast" },
          { label: "Most expensive hour", value: max.t, note: `${max.forecast.toFixed(2)} CHF/MWh` },
          { label: "Error, last 30 days", value: "7.9 CHF", note: "average per hour" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>Day-ahead forecast, Sunday 15 November</h2>
          <p className="sub">CHF/MWh by hour, with the 80% range. Dashed: last Sunday's result.</p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={priceForecast} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={2} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
              <Tooltip formatter={(v: number | number[]) => (Array.isArray(v) ? `${v[0]}–${v[1]}` : v)} />
              <Area dataKey="band" name="80% range" fill="#d6ecea" stroke="none" />
              <Line dataKey="lastSunday" name="Last Sunday" stroke="#9fb3bd" strokeDasharray="4 4" dot={false} />
              <Line dataKey="forecast" name="Forecast" stroke="#0e6b70" dot={false} strokeWidth={2.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>What drives Sunday's prices</h2>
          <p className="sub">Compared with last Sunday</p>
          <ul className="list">
            <li><div><strong>Less wind in Germany</strong><small>Raises evening prices by about 9 CHF/MWh</small></div></li>
            <li><div><strong>Colder in Switzerland and France</strong><small>Higher heating demand, about +6 CHF/MWh at 18–20h</small></div></li>
            <li><div><strong>Low reservoir levels in Valais</strong><small>Hydro producers hold back water, supporting peak prices</small></div></li>
            <li><div><strong>More sun at midday</strong><small>Lowers 11–15h by about 5 CHF/MWh</small></div></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
