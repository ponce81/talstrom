import { Download } from "lucide-react";
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { projects } from "./gridData";
import { useToast } from "../../App";
import { axis, Head, Kpis, Status } from "../trading/ui";

const Y0 = 2027, Y1 = 2036;
const years = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i);
const KCOL: Record<string, string> = { Reinforcement: "#0e6b70", Flexibility: "#e0a520", Renewal: "#9fb3bd" };

export default function Investments() {
  const toast = useToast();
  const perYear = years.map((y) => ({
    t: String(y),
    cost: +projects.filter((p) => y >= p.start && y <= p.end).reduce((s, p) => s + p.cost / (p.end - p.start + 1), 0).toFixed(2),
  }));
  const total = projects.reduce((s, p) => s + p.cost, 0);
  const flex = projects.filter((p) => p.kind === "Flexibility").reduce((s, p) => s + p.cost, 0);

  return (
    <div className="stack">
      <Head
        title="Investment plan"
        text="Grid projects for the next 10 years, from the measures you chose and the scenarios behind them. This is the basis for the network development plan."
        actions={<button className="btn" onClick={() => toast("Investment plan exported to Excel for the board")}><Download size={16} /> Export</button>}
      />
      <Kpis
        items={[
          { label: "Total, 2027–2036", value: `CHF ${total.toFixed(1)} m`, note: `${projects.length} projects` },
          { label: "Of which flexibility", value: `CHF ${flex.toFixed(2)} m`, note: `${Math.round((flex / total) * 100)}% of the plan` },
          { label: "Postponed by flexibility", value: "CHF 0.9 m", note: "of copper moved beyond 2036", tone: "good" },
          { label: "Yearly budget", value: "CHF 1.2 m", note: "set by the board" },
        ]}
      />
      <section className="panel">
        <h2>Timeline</h2>
        <p className="sub">Bars show when each project is built</p>
        <div className="gantt" style={{ gridTemplateColumns: `minmax(220px, 1.4fr) repeat(${years.length}, 1fr) 90px 110px` }}>
          <div className="gh" />
          {years.map((y) => <div key={y} className="gh c">{y}</div>)}
          <div className="gh r">Cost</div>
          <div className="gh" style={{ paddingLeft: 12 }}>Status</div>
          {projects.map((p) => (
            <div className="grow" key={p.name} style={{ display: "contents" }}>
              <div className="gname">{p.name}</div>
              {years.map((y) => (
                <div key={y} className="gcell">
                  {y >= p.start && y <= p.end && <i style={{ background: KCOL[p.kind], borderRadius: `${y === p.start ? 5 : 0}px ${y === p.end ? 5 : 0}px ${y === p.end ? 5 : 0}px ${y === p.start ? 5 : 0}px` }} />}
                </div>
              ))}
              <div className="gcell r num">CHF {p.cost.toFixed(2)} m</div>
              <div className="gcell" style={{ paddingLeft: 12 }}><Status s={p.status === "Approved" ? "Accepted" : p.status === "Planned" ? "Queued" : "Pending"} /></div>
            </div>
          ))}
        </div>
        <div className="legend" style={{ marginTop: 12 }}>
          {Object.entries(KCOL).map(([k, c]) => <span key={k}><i style={{ background: c, height: 8 }} /> {k}</span>)}
        </div>
      </section>
      <section className="panel">
        <h2>Spending per year</h2>
        <p className="sub">CHF millions. The dashed line is the yearly budget.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={perYear} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={36} />
            <Tooltip formatter={(v: number) => `CHF ${v} m`} />
            <ReferenceLine y={1.2} stroke="#b8443a" strokeDasharray="5 4" />
            <Bar dataKey="cost" fill="#0e6b70" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
