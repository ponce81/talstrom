import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { books, pnlDays } from "./tradingData";
import { axis, chf, Head, Kpis } from "./ui";

export default function PnL() {
  const realised = books.reduce((s, b) => s + b.realised, 0);
  const unrealised = books.reduce((s, b) => s + b.unrealised, 0);

  return (
    <div className="stack">
      <Head title="P&L" text="Profit and loss by day and by book. Open positions are valued at today's exchange settlement prices (mark-to-market)." />
      <Kpis
        items={[
          { label: "Today", value: "+CHF 18,420", note: "+CHF 4,210 since 12:00", tone: "good" },
          { label: "Month to date", value: "+CHF 96,180", note: "realised and unrealised", tone: "good" },
          { label: "Realised, year to date", value: chf(realised), note: "closed and delivered" },
          { label: "Unrealised", value: chf(unrealised), note: "open positions at today's prices" },
        ]}
      />
      <section className="panel">
        <h2>Daily P&L</h2>
        <p className="sub">Last 20 trading days, CHF</p>
        <div className="legend" style={{ marginBottom: 6 }}>
          <span><i style={{ background: "var(--hydro)" }} /> Realised</span>
          <span><i style={{ background: "#9cc9c6" }} /> Change in unrealised</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={pnlDays} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={2} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => chf(v)} />
            <ReferenceLine y={0} stroke="#5b6c76" />
            <Bar dataKey="realised" name="Realised" stackId="p" fill="#0e6b70" />
            <Bar dataKey="unrealised" name="Change in unrealised" stackId="p" fill="#9cc9c6" />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>By book</h2>
        <p className="sub">Year to date</p>
        <table>
          <thead><tr><th>Book</th><th className="r">Realised</th><th className="r">Unrealised</th><th className="r">Total</th><th className="r">Open position</th></tr></thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.book}>
                <td>{b.book}</td>
                <td className="r">{chf(b.realised)}</td>
                <td className="r" style={{ color: b.unrealised < 0 ? "var(--short)" : undefined }}>{chf(b.unrealised)}</td>
                <td className="r" style={{ fontWeight: 650 }}>{chf(b.realised + b.unrealised)}</td>
                <td className="r">{b.open}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
