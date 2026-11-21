import { useMemo, useState } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { transformers, weekProfile } from "./gridData";
import { axis, Head, Kpis, Meter } from "../trading/ui";

export default function MeasuredLoading() {
  const [sel, setSel] = useState(transformers[0].id);
  const t = transformers.find((x) => x.id === sel)!;
  const data = useMemo(() => weekProfile(t.peakMeasured, t.rating), [t]);
  const surprises = transformers.filter((x) => x.peakMeasured - x.peakEstimated > 50).length;

  return (
    <div className="stack">
      <Head title="Measured loading" text="Real loading of every transformer station, added up from smart-meter readings instead of estimated from yearly consumption." />
      <Kpis
        items={[
          { label: "Smart-meter coverage", value: "87%", note: "of metering points send 15-min data" },
          { label: "Stations above 80%", value: String(transformers.filter((x) => x.peakMeasured / x.rating > 0.8).length), note: "at their winter peak", tone: "bad" },
          { label: "Higher than estimated", value: String(surprises), note: "by more than 50 kVA" },
          { label: "Period", value: "Last 12 months", note: "peak week shown below" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>{t.name} ({t.id}), peak week</h2>
          <p className="sub">Load in kVA from {t.meters}% of its meters. The dashed line is the transformer's rating.</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={47} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={44} domain={[0, Math.round(t.rating * 1.1)]} />
              <Tooltip formatter={(v: number) => `${v} kVA`} />
              <ReferenceLine y={t.rating} stroke="#b8443a" strokeDasharray="5 4" label={{ value: `${t.rating} kVA rating`, fill: "#b8443a", fontSize: 12, position: "insideTopRight" }} />
              <Area dataKey="kva" stroke="#0e6b70" fill="#d6ecea" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </section>
        <section className="panel detail">
          <h2>Measured vs. estimated</h2>
          <p className="sub">Until now, peaks were estimated from yearly consumption</p>
          <dl>
            <div><dt>Measured peak</dt><dd>{t.peakMeasured} kVA</dd></div>
            <div><dt>Old estimate</dt><dd>{t.peakEstimated} kVA</dd></div>
            <div><dt>Loading at peak</dt><dd style={{ color: t.peakMeasured / t.rating > 0.85 ? "var(--short)" : undefined }}>{Math.round((t.peakMeasured / t.rating) * 100)}%</dd></div>
            <div><dt>Solar connected</dt><dd>{t.pv} kW</dd></div>
          </dl>
          <p style={{ margin: 0, fontSize: 14 }}>
            {t.peakMeasured > t.peakEstimated + 50
              ? `The real peak is ${t.peakMeasured - t.peakEstimated} kVA higher than estimated, mostly heat pumps installed since 2023.`
              : "The estimate was close. No change to the plan needed."}
          </p>
        </section>
      </div>
      <section className="panel">
        <h2>All transformer stations</h2>
        <p className="sub">Select one to see its peak week</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Station</th><th className="r">Rating</th><th className="r">Measured peak</th><th className="r">Old estimate</th><th style={{ width: "22%" }}>Loading</th><th className="r">%</th></tr></thead>
            <tbody>
              {transformers.map((x) => (
                <tr key={x.id} className={`click ${x.id === sel ? "sel" : ""}`} onClick={() => setSel(x.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(x.id)}>
                  <td>{x.name}<br /><small style={{ color: "var(--muted)" }}>{x.id}</small></td>
                  <td className="r">{x.rating} kVA</td>
                  <td className="r">{x.peakMeasured} kVA</td>
                  <td className="r" style={{ color: "var(--muted)" }}>{x.peakEstimated} kVA</td>
                  <td><Meter used={x.peakMeasured} limit={x.rating} /></td>
                  <td className="r" style={{ fontWeight: 600 }}>{Math.round((x.peakMeasured / x.rating) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
