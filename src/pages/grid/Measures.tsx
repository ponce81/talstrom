import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { measures } from "./gridData";
import { useToast } from "../../App";
import { axis, chf, Head } from "../trading/ui";

const npv = (m: (typeof measures)[number]) => m.capex + m.opex * 10;

export default function Measures() {
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>(["M2", "M5"]);
  const data = measures.map((m) => ({ name: m.name.replace(/,.*$/, "").replace(" (630 kVA)", ""), cost: Math.round(npv(m) / 1000), id: m.id, kind: m.kind }));
  const combo = measures.filter((m) => picked.includes(m.id));
  const comboCost = combo.reduce((s, m) => s + npv(m), 0);
  const comboUntil = combo.length ? Math.max(...combo.map((m) => m.solvesUntil)) + (combo.length > 1 ? 2 : 0) : 0;

  return (
    <div className="stack">
      <Head title="Measures" text="Options for feeder Oberried 3, which goes over its limit in 2029. Compare building more grid with using flexibility, over 10 years." />
      <div className="grid-2">
        <section className="panel">
          <h2>Cost over 10 years</h2>
          <p className="sub">Investment plus running costs, in CHF thousands. Negative running costs are revenue.</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <XAxis type="number" tick={axis} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axis} tickLine={false} axisLine={false} width={190} />
              <Tooltip formatter={(v: number) => `CHF ${v}k`} />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {data.map((d) => <Cell key={d.id} fill={picked.includes(d.id) ? "#0e6b70" : d.kind === "Flexibility" ? "#9cc9c6" : "#c8d3d8"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="panel detail">
          <h2>Your combination</h2>
          <p className="sub">Tick measures in the table to combine them</p>
          <dl>
            <div><dt>Cost over 10 years</dt><dd>{chf(comboCost)}</dd></div>
            <div><dt>Solves the problem until</dt><dd>{comboUntil || "–"}</dd></div>
            <div><dt>Compared with the cable</dt><dd style={{ color: comboCost < npv(measures[0]) ? "var(--long)" : "var(--short)" }}>{chf(comboCost - npv(measures[0]))}</dd></div>
            <div><dt>Ready</dt><dd>{combo.length ? combo.map((m) => m.lead).sort().pop() : "–"}</dd></div>
          </dl>
          <p style={{ margin: "0 0 12px", fontSize: 14 }}>
            {comboUntil >= 2033
              ? `This postpones the second cable to about ${comboUntil}, when it can be combined with planned road works.`
              : "This doesn't postpone the cable for long. Add another measure."}
          </p>
          <button className="btn primary" disabled={!combo.length} onClick={() => toast(`${combo.length} measures added to the investment plan`)}>Add to investment plan</button>
        </section>
      </div>
      <section className="panel">
        <h2>Options</h2>
        <p className="sub">Flexibility measures are allowed under the new electricity law and count as grid costs.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th></th><th>Measure</th><th>Type</th><th className="r">Investment</th><th className="r">Per year</th><th>Ready in</th><th className="r">Solves until</th><th>Note</th></tr></thead>
            <tbody>
              {measures.map((m) => (
                <tr key={m.id} className={picked.includes(m.id) ? "sel" : ""}>
                  <td><input type="checkbox" aria-label={`Include ${m.name}`} checked={picked.includes(m.id)} onChange={() => setPicked(picked.includes(m.id) ? picked.filter((x) => x !== m.id) : [...picked, m.id])} /></td>
                  <td>{m.name}</td>
                  <td>{m.kind}</td>
                  <td className="r">{chf(m.capex)}</td>
                  <td className="r">{chf(m.opex)}</td>
                  <td>{m.lead}</td>
                  <td className="r">{m.solvesUntil}</td>
                  <td style={{ fontSize: 13, color: "var(--muted)" }}>{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
