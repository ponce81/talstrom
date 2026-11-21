import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { legDay, legMembers, legs } from "./settleData";
import { useToast } from "../../App";
import { axis, Head, Status } from "../trading/ui";

export default function Communities() {
  const toast = useToast();
  const [sel, setSel] = useState(legs[0].name);
  const l = legs.find((x) => x.name === sel)!;

  return (
    <div className="stack">
      <Head title="LEG and ZEV" text="Local electricity communities (LEG) share solar power over the public grid and get a grid-fee discount. Self-consumption groups (ZEV) share it behind one connection. Both are settled every 15 minutes." />
      <div className="grid-2">
        <section className="panel">
          <h2>Communities</h2>
          <p className="sub">October 2026. Select one for details.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Community</th><th className="r">Members</th><th className="r">Shared</th><th className="r">Grid-fee discount</th><th>Status</th></tr></thead>
              <tbody>
                {legs.map((x) => (
                  <tr key={x.name} className={`click ${x.name === sel ? "sel" : ""}`} onClick={() => setSel(x.name)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(x.name)}>
                    <td>{x.name}</td>
                    <td className="r">{x.members}</td>
                    <td className="r">{x.shared.toFixed(1)} MWh</td>
                    <td className="r">{x.discount ? `${x.discount}%` : "Not applicable"}</td>
                    <td><Status s={x.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <h2>{l.name}, a typical day</h2>
          <p className="sub">kW. Shared energy is what members produce and use at the same time.</p>
          <div className="legend" style={{ marginBottom: 6 }}>
            <span><i style={{ background: "#0e6b70", height: 10 }} /> Shared</span>
            <span><i style={{ background: "#9fb3bd", height: 10 }} /> From the grid</span>
            <span><i style={{ background: "#f2c230", height: 10 }} /> Sent to the grid</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={legDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={3} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={36} />
              <Tooltip formatter={(v: number) => `${v} kW`} />
              <Area dataKey="shared" name="Shared" stackId="1" fill="#0e6b70" stroke="none" fillOpacity={0.9} />
              <Area dataKey="grid" name="From the grid" stackId="1" fill="#9fb3bd" stroke="none" fillOpacity={0.8} />
              <Area dataKey="export" name="Sent to the grid" stackId="1" fill="#f2c230" stroke="none" fillOpacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Members of {l.name}, October</h2>
            <p className="sub">kWh. Each member's share is allocated every 15 minutes in proportion to their consumption.</p>
          </div>
          <button className="btn" onClick={() => toast(`Member statements for ${l.name} created and sent to the community manager`)}>Send member statements</button>
        </div>
        <table>
          <thead><tr><th>Member</th><th>Role</th><th className="r">Consumed</th><th className="r">From the community</th><th className="r">Share</th><th className="r">Produced</th></tr></thead>
          <tbody>
            {legMembers.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td style={{ color: m.role.includes("no smart") ? "var(--short)" : undefined }}>{m.role}</td>
                <td className="r">{m.consumed.toLocaleString("de-CH")}</td>
                <td className="r">{m.fromLeg.toLocaleString("de-CH")}</td>
                <td className="r">{Math.round((m.fromLeg / m.consumed) * 100)}%</td>
                <td className="r">{m.produced ? m.produced.toLocaleString("de-CH") : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
