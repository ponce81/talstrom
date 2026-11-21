import { useState } from "react";
import { Zap } from "lucide-react";
import { feeders, Feeder } from "../data";
import { useToast } from "../App";

type Scenario = "Today" | "2030" | "2035";
const SCEN: Record<Scenario, { key: keyof Feeder; text: string }> = {
  Today: { key: "loading", text: "Measured peak loading this year." },
  "2030": { key: "loading2030", text: "PV +40%, 1,800 more heat pumps, 2,500 more EV chargers." },
  "2035": { key: "loading2035", text: "PV +85%, 4,100 more heat pumps, 6,800 more EV chargers." },
};

function color(l: number) {
  if (l >= 100) return "#b8443a";
  if (l >= 85) return "#e0a520";
  if (l >= 65) return "#4f8f93";
  return "#9cc9c6";
}

export default function GridPlanning() {
  const toast = useToast();
  const [scen, setScen] = useState<Scenario>("Today");
  const [running, setRunning] = useState(false);
  const [sel, setSel] = useState<string>("F-OB-03");
  const key = SCEN[scen].key;
  const load = (f: Feeder) => f[key] as number;
  const over = feeders.filter((f) => load(f) >= 100);
  const selF = feeders.find((f) => f.id === sel)!;

  function run() {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      toast(`Power flow finished for ${scen === "Today" ? "today" : scen}: ${over.length} feeder${over.length === 1 ? "" : "s"} over limit`);
    }, 1400);
  }

  // Schematic layout: substations on the left, feeders as lines with 5 nodes.
  const subs = Array.from(new Set(feeders.map((f) => f.substation)));
  const rowH = 46;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Power flow</h1>
          <p>Peak loading of your medium-voltage feeders, today and in future scenarios. Click a feeder to see its details.</p>
        </div>
        <div className="actions">
          <div className="seg" role="tablist" aria-label="Scenario">
            {(["Today", "2030", "2035"] as Scenario[]).map((s) => (
              <button key={s} role="tab" aria-selected={scen === s} className={scen === s ? "on" : ""} onClick={() => setScen(s)}>
                {s}
              </button>
            ))}
          </div>
          <button className="btn primary" onClick={run} disabled={running}>
            <Zap size={16} /> {running ? "Running power flow…" : "Run power flow"}
          </button>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Feeder loading, {scen === "Today" ? "today" : `scenario ${scen}`}</h2>
              <p className="sub">{SCEN[scen].text}</p>
            </div>
            <div className="scale" aria-label="Loading scale">
              <span><i style={{ background: "#9cc9c6" }} />under 65%</span>
              <span><i style={{ background: "#4f8f93" }} />65–85%</span>
              <span><i style={{ background: "#e0a520" }} />85–100%</span>
              <span><i style={{ background: "#b8443a" }} />over limit</span>
            </div>
          </div>
          <svg className="feeder-map" viewBox={`0 0 760 ${feeders.length * rowH + 20}`} role="img" aria-label="Feeder schematic">
            {subs.map((s) => {
              const rows = feeders.map((f, i) => ({ f, i })).filter((x) => x.f.substation === s);
              const y0 = rows[0].i * rowH + 20;
              const y1 = rows[rows.length - 1].i * rowH + 20;
              return (
                <g key={s}>
                  <rect x={8} y={y0 - 12} width={120} height={y1 - y0 + 24} rx={8} fill="#e9eef0" stroke="#d3dce0" />
                  <text x={68} y={(y0 + y1) / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={600} fill="#172630">{s.replace("UW ", "")}</text>
                </g>
              );
            })}
            {feeders.map((f, i) => {
              const y = i * rowH + 20;
              const l = load(f);
              const c = color(l);
              const on = f.id === sel;
              return (
                <g key={f.id} onClick={() => setSel(f.id)} style={{ cursor: "pointer" }} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(f.id)}>
                  <rect x={128} y={y - 18} width={630} height={36} fill={on ? "#d6ecea" : "transparent"} rx={6} />
                  <line x1={128} y1={y} x2={600} y2={y} stroke={c} strokeWidth={on ? 6 : 4} strokeLinecap="round" />
                  {[0, 1, 2, 3, 4].map((n) => (
                    <circle key={n} cx={190 + n * 100} cy={y} r={on ? 7 : 6} fill="#fff" stroke={c} strokeWidth={3} />
                  ))}
                  <text x={612} y={y + 5} fontSize={13} fill="#172630" fontWeight={on ? 700 : 500}>{f.name}</text>
                  <text x={750} y={y + 5} fontSize={13} textAnchor="end" fill={l >= 100 ? "#b8443a" : "#5b6c76"} fontWeight={650}>{l}%</text>
                </g>
              );
            })}
          </svg>
        </section>

        <section className="panel detail">
          <h2>{selF.name}</h2>
          <p className="sub">{selF.id}, fed from {selF.substation}</p>
          <dl>
            <div><dt>Peak loading today</dt><dd>{selF.loading}%</dd></div>
            <div><dt>In 2030</dt><dd style={{ color: selF.loading2030 >= 100 ? "var(--short)" : undefined }}>{selF.loading2030}%</dd></div>
            <div><dt>In 2035</dt><dd style={{ color: selF.loading2035 >= 100 ? "var(--short)" : undefined }}>{selF.loading2035}%</dd></div>
            <div><dt>Lowest voltage</dt><dd>{selF.voltageMin.toFixed(2)} p.u.</dd></div>
            <div><dt>PV that can still connect</dt><dd>{selF.pvHosting.toFixed(1)} MW</dd></div>
          </dl>
          {selF.loading2035 >= 100 ? (
            <p style={{ margin: 0, fontSize: 14 }}>
              This feeder goes over its limit by {selF.loading2030 >= 100 ? "2030" : "2035"}. Options to test: a flexibility contract with heat-pump owners, a battery at the feeder end, or a second cable.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>No action needed in any scenario.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>All feeders</h2>
        <p className="sub">{over.length === 0 ? "No feeder is over its limit in this scenario." : `${over.length} feeder${over.length === 1 ? " is" : "s are"} over the limit in this scenario.`}</p>
        <table>
          <thead>
            <tr><th>Feeder</th><th>Substation</th><th>Loading</th><th className="r">%</th><th className="r">PV hosting left</th><th className="r">Lowest voltage</th></tr>
          </thead>
          <tbody>
            {[...feeders].sort((a, b) => load(b) - load(a)).map((f) => (
              <tr key={f.id} className={`click ${f.id === sel ? "sel" : ""}`} onClick={() => setSel(f.id)}>
                <td>{f.name}</td>
                <td>{f.substation}</td>
                <td><div className="load-bar"><i style={{ width: `${Math.min(load(f), 125) / 1.25}%`, background: color(load(f)) }} /></div></td>
                <td className="r" style={{ color: load(f) >= 100 ? "var(--short)" : undefined, fontWeight: 600 }}>{load(f)}%</td>
                <td className="r">{f.pvHosting.toFixed(1)} MW</td>
                <td className="r">{f.voltageMin.toFixed(2)} p.u.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
