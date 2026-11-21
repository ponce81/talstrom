import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { imbalanceDays } from "./tradingData";
import { axis, chf, Head, Kpis } from "./ui";

export default function Imbalance() {
  const total = imbalanceDays.reduce((s, d) => s + d.total, 0);
  const load = imbalanceDays.reduce((s, d) => s + d.load, 0);
  const pv = imbalanceDays.reduce((s, d) => s + d.pv, 0);
  const sched = imbalanceDays.reduce((s, d) => s + d.sched, 0);
  const worst = [...imbalanceDays].sort((a, b) => b.total - a.total).slice(0, 4);
  const causes: Record<string, string> = {
    [worst[0].t]: "Cold snap: heat-pump load 9% above forecast all evening.",
    [worst[1].t]: "Fog stayed until noon, so rooftop PV came in 40% below forecast.",
    [worst[2].t]: "Schedule update for 17:00–17:15 rejected; the deal was not covered.",
    [worst[3].t]: "Normal forecast error spread over the day.",
  };

  return (
    <div className="stack">
      <Head title="Imbalance costs" text="What the difference between your schedule and real consumption cost you, and why. Swissgrid settles every quarter-hour you were off." />
      <Kpis
        items={[
          { label: "Last 30 days", value: chf(total), note: "imbalance costs", tone: "bad" },
          { label: "Per MWh supplied", value: "1.44", note: "CHF/MWh, down from 1.92 in September", tone: "good" },
          { label: "Load forecast error", value: `${Math.round((load / total) * 100)}%`, note: "of the cost" },
          { label: "Solar forecast error", value: `${Math.round((pv / total) * 100)}%`, note: "of the cost" },
        ]}
      />
      <section className="panel">
        <h2>Cost per day, by cause</h2>
        <p className="sub">Last 30 days, CHF</p>
        <div className="legend" style={{ marginBottom: 6 }}>
          <span><i style={{ background: "var(--hydro)" }} /> Load forecast</span>
          <span><i style={{ background: "#f2c230" }} /> Solar forecast</span>
          <span><i style={{ background: "var(--short)" }} /> Schedule problems</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={imbalanceDays} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={3} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={48} />
            <Tooltip formatter={(v: number) => chf(v)} />
            <Bar dataKey="load" name="Load forecast" stackId="a" fill="#0e6b70" />
            <Bar dataKey="pv" name="Solar forecast" stackId="a" fill="#f2c230" />
            <Bar dataKey="sched" name="Schedule problems" stackId="a" fill="#b8443a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>Most expensive days</h2>
        <p className="sub">Total for {sched ? "the period includes " + chf(sched) + " from schedule problems" : "the period"}</p>
        <table>
          <thead><tr><th>Day</th><th className="r">Cost</th><th>What happened</th></tr></thead>
          <tbody>
            {worst.map((d) => (
              <tr key={d.t}><td>{d.t}</td><td className="r">{chf(d.total)}</td><td>{causes[d.t]}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
