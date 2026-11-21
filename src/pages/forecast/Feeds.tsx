import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { completeness, feeds } from "./forecastData";
import { useToast } from "../../App";
import { axis, Head, Kpis, Status } from "../trading/ui";

export default function Feeds() {
  const toast = useToast();
  const [filled, setFilled] = useState(false);
  return (
    <div className="stack">
      <Head
        title="Data feeds"
        text="Everything the forecasts are built from. Missing meter values are filled automatically from similar days and marked, so you always know what was estimated."
        actions={<button className="btn primary" disabled={filled} onClick={() => { setFilled(true); toast("312 missing intervals filled from similar days and marked as estimated"); }}>{filled ? "Gaps filled" : "Fill gaps now"}</button>}
      />
      <Kpis
        items={[
          { label: "Meter data today", value: filled ? "100%" : "99.4%", note: filled ? "312 intervals estimated" : "312 intervals missing", tone: filled ? "good" : "bad" },
          { label: "Weather providers", value: "2", note: "MeteoSwiss and ECMWF, blended" },
          { label: "Latest weather run", value: "15:00", note: "next at 18:00" },
          { label: "Feeds with problems", value: "1", note: "Swissgrid actuals delayed" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>Feeds</h2>
          <p className="sub">Last received</p>
          <ul className="list">
            {feeds.map((f) => (
              <li key={f.name}>
                <div><strong>{f.name}</strong><small>{f.source}, every {f.latency}, {f.coverage}. Last: {f.last}</small></div>
                <Status s={f.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Meter data completeness</h2>
          <p className="sub">Last 14 days, % of 15-min values received on time</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={completeness} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={2} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={44} domain={[98.5, 100]} unit="%" allowDataOverflow />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="received" name="Received" fill="#0e6b70" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
