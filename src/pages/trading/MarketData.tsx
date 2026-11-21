import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RefreshCw } from "lucide-react";
import { connections, dayAheadPrices } from "./tradingData";
import { useToast } from "../../App";
import { axis, Head, Kpis, Status } from "./ui";

export default function MarketData() {
  const toast = useToast();
  const ch = dayAheadPrices.map((d) => d.ch);
  const base = ch.reduce((a, b) => a + b, 0) / 24;
  const peak = ch.slice(8, 20).reduce((a, b) => a + b, 0) / 12;

  return (
    <div className="stack">
      <Head title="Market data" text="Prices and results from the exchanges and Swissgrid, and the health of each connection." />
      <Kpis
        items={[
          { label: "Day-ahead base, Sat", value: base.toFixed(2), note: "CHF/MWh, Swiss zone" },
          { label: "Day-ahead peak, Sat", value: peak.toFixed(2), note: "08–20h" },
          { label: "Highest hour", value: Math.max(...ch).toFixed(2), note: `${ch.indexOf(Math.max(...ch))}–${ch.indexOf(Math.max(...ch)) + 1}h` },
          { label: "Gap to Germany", value: `+${(base - dayAheadPrices.reduce((a, d) => a + d.de, 0) / 24).toFixed(2)}`, note: "Swiss base minus German base" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>Day-ahead prices, Saturday 14 November</h2>
          <p className="sub">CHF/MWh by hour, Switzerland against its neighbours</p>
          <div className="legend" style={{ marginBottom: 6 }}>
            <span><i style={{ background: "var(--hydro)" }} /> Switzerland</span>
            <span><i style={{ background: "#9fb3bd" }} /> Germany</span>
            <span><i style={{ background: "#e0a520" }} /> France</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dayAheadPrices} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={2} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
              <Tooltip />
              <Line dataKey="de" name="Germany" stroke="#9fb3bd" dot={false} strokeWidth={1.5} />
              <Line dataKey="fr" name="France" stroke="#e0a520" dot={false} strokeWidth={1.5} />
              <Line dataKey="ch" name="Switzerland" stroke="#0e6b70" dot={false} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Connections</h2>
              <p className="sub">Last successful sync</p>
            </div>
            <button className="btn" onClick={() => toast("All connections checked. Trade confirmations are still delayed at the provider.")}><RefreshCw size={16} /> Check</button>
          </div>
          <ul className="list">
            {connections.map((c) => (
              <li key={c.name}>
                <div>
                  <strong>{c.name}</strong>
                  <small>{c.kind}, {c.last}</small>
                </div>
                <Status s={c.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
