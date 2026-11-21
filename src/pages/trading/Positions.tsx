import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Cell, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lightbulb } from "lucide-react";
import { portfolios, positionRows } from "./tradingData";
import { useToast } from "../../App";
import { axis, chf, Head, Kpis, signed } from "./ui";

export default function Positions() {
  const toast = useToast();
  const nav = useNavigate();
  const [portfolio, setPortfolio] = useState<string>(portfolios[0]);
  const [dismissed, setDismissed] = useState(false);
  const short = positionRows.filter((p) => p.open < 0).reduce((s, p) => s + p.open, 0);
  const long = positionRows.filter((p) => p.open > 0).reduce((s, p) => s + p.open, 0);
  const evening = positionRows.filter((p) => p.h >= 17 && p.h <= 19);
  const eveningMw = evening.reduce((s, p) => s + p.open, 0) / evening.length;
  const imbalanceRisk = evening.reduce((s, p) => s + Math.abs(p.open) * (p.idPrice * 1.6 - p.idPrice), 0);

  return (
    <div className="stack">
      <Head
        title="Positions"
        text="Your position for Saturday 14 November: the live forecast of what you need, minus everything you have already bought or sold."
        actions={
          <label className="field">
            Portfolio
            <select value={portfolio} onChange={(e) => setPortfolio(e.target.value)}>
              {portfolios.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        }
      />

      {!dismissed && (
        <section className="reco" aria-label="Recommendation">
          <Lightbulb size={22} aria-hidden />
          <div>
            <h2>Buy {Math.abs(eveningMw).toFixed(1)} MW for 17–20h now</h2>
            <p>
              You are short in the evening peak. Intraday prices for those hours are {signed(evening[0].idPrice - evening[0].price, 0)} CHF/MWh above day-ahead and
              have risen for three days in a row. Leaving the gap open risks about {chf(imbalanceRisk)} in imbalance costs.
            </p>
            <p className="reco-meta">Based on the 15:00 load forecast (error 2.4%) and the last 30 Saturdays.</p>
          </div>
          <div className="reco-actions">
            <button className="btn primary" onClick={() => { toast(`Order ticket prepared: buy ${Math.abs(eveningMw).toFixed(1)} MW Sat 17–20h`); nav("../deals"); }}>Prepare order</button>
            <button className="btn" onClick={() => { setDismissed(true); toast("Recommendation dismissed. You'll be reminded at 18:00 if the gap is still open."); }}>Not now</button>
          </div>
        </section>
      )}

      <Kpis
        items={[
          { label: "Short, total", value: `−${Math.abs(short).toFixed(1)} MWh`, note: "evening peak, 17–20h", tone: "bad" },
          { label: "Long, total", value: `+${long.toFixed(1)} MWh`, note: "midday solar surplus" },
          { label: "Hedged for Saturday", value: "98.7%", note: "of forecast need" },
          { label: "Next schedule deadline", value: "17:15", note: "intraday update to Swissgrid" },
        ]}
      />

      <section className="panel">
        <h2>Open position by hour</h2>
        <p className="sub">Above zero is long, below zero is short. The shaded hours are covered by the recommendation.</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={positionRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={1} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
            <Tooltip formatter={(v: number) => `${v} MW`} />
            {!dismissed && <ReferenceArea x1="17h" x2="19h" fill="#f2c230" fillOpacity={0.18} />}
            <ReferenceLine y={0} stroke="#5b6c76" />
            <Bar dataKey="open" name="Open position" radius={[3, 3, 3, 3]}>
              {positionRows.map((p) => <Cell key={p.t} fill={p.open < 0 ? "#b8443a" : "#2e8a5a"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <h2>Hour by hour</h2>
        <p className="sub">Prices in CHF/MWh, Swiss zone</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Hour</th><th className="r">Forecast need</th><th className="r">Hedged</th><th className="r">Open</th><th className="r">Day-ahead</th><th className="r">Intraday now</th></tr>
            </thead>
            <tbody>
              {positionRows.filter((p) => p.h >= 6 && p.h <= 22).map((p) => (
                <tr key={p.t} className={p.h >= 17 && p.h <= 19 && !dismissed ? "sel" : ""}>
                  <td>{p.t}</td>
                  <td className="r">{p.need.toFixed(1)} MW</td>
                  <td className="r">{p.hedged.toFixed(1)} MW</td>
                  <td className="r" style={{ color: p.open < -1 ? "var(--short)" : p.open > 1 ? "var(--long)" : undefined, fontWeight: 600 }}>{signed(p.open)} MW</td>
                  <td className="r">{p.price.toFixed(2)}</td>
                  <td className="r">{p.idPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
