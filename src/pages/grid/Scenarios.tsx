import { useState } from "react";
import { scenarioDefaults } from "./gridData";
import { useToast } from "../../App";
import { Head, Kpis } from "../trading/ui";

type Row = (typeof scenarioDefaults)[number];
const YEARS = ["2030", "2035"] as const;

function impact(rows: Row[], year: string) {
  const f = year === "2030" ? 0.55 : 1;
  const pv = rows.reduce((s, r) => s + r.pv, 0) / rows.length;
  const hp = rows.reduce((s, r) => s + r.hp, 0) / rows.length;
  const ev = rows.reduce((s, r) => s + r.ev, 0) / rows.length;
  const feeders = Math.min(7, Math.round((pv * 0.02 + hp * 0.04 + ev * 0.02) * f));
  const stations = Math.round((pv * 0.25 + hp * 0.4 + ev * 0.22) * f);
  const cost = +((feeders * 0.45 + stations * 0.09) * 1).toFixed(1);
  return { feeders, stations, cost, driver: hp * 0.04 > pv * 0.02 ? "Heat pumps" : "Solar" };
}

export default function Scenarios() {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(scenarioDefaults);
  const [year, setYear] = useState<(typeof YEARS)[number]>("2035");
  const res = impact(rows, year);

  function set(i: number, key: "pv" | "hp" | "ev", v: number) {
    setRows(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  }

  return (
    <div className="stack">
      <Head
        title="Scenarios"
        text="Set how fast solar, heat pumps and EVs grow in each municipality. The grid model is recalculated for every hour of a typical year."
        actions={
          <>
            <div className="seg" role="tablist" aria-label="Year">
              {YEARS.map((y) => <button key={y} role="tab" aria-selected={year === y} className={year === y ? "on" : ""} onClick={() => setYear(y)}>{y}</button>)}
            </div>
            <button className="btn primary" onClick={() => toast(`Scenario saved as "Talwerke ${year}, version 4" and shared with the measures page`)}>Save scenario</button>
          </>
        }
      />
      <Kpis
        items={[
          { label: "Feeders over their limit", value: String(res.feeders), note: `of 7, in ${year}`, tone: res.feeders ? "bad" : "good" },
          { label: "Transformer stations over", value: String(res.stations), note: "of 186" },
          { label: "Reinforcement if built in copper", value: `CHF ${res.cost} m`, note: "before flexibility measures" },
          { label: "Main driver", value: res.driver, note: res.driver === "Solar" ? "voltage at noon in summer" : "evening peak in winter" },
        ]}
      />
      <section className="panel">
        <h2>Assumptions by municipality</h2>
        <p className="sub">Growth until 2035 compared with today. Values for 2030 are interpolated.</p>
        <div className="table-wrap">
          <table className="sliders">
            <thead><tr><th>Municipality</th><th>Rooftop solar</th><th>Heat pumps</th><th>EVs</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.municipality}>
                  <td>{r.municipality}</td>
                  {(["pv", "hp", "ev"] as const).map((k) => (
                    <td key={k}>
                      <label className="slider">
                        <input type="range" min={0} max={150} step={5} value={r[k]} onChange={(e) => set(i, k, +e.target.value)} aria-label={`${r.municipality} ${k}`} />
                        <span className="num">+{r[k]}%</span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sub" style={{ margin: "12px 0 0" }}>Oberried's values follow its municipal energy plan from 2023. The municipality can view this scenario.</p>
      </section>
    </div>
  );
}
