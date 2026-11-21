import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { issues, vintages } from "./forecastData";
import { useToast } from "../../App";
import { axis, Head } from "../trading/ui";

const V = [
  { key: "Wed 12:00", color: "#c8d3d8" },
  { key: "Thu 15:00", color: "#9cc9c6" },
  { key: "Fri 06:00", color: "#0e6b70" },
];

export default function History() {
  const toast = useToast();
  return (
    <div className="stack">
      <Head title="Forecast history" text="Every forecast run is kept. See how the forecast for a day developed, and what was known at any point in time, for trading reviews and audits." />
      <section className="panel">
        <h2>Today's forecast, as it developed</h2>
        <p className="sub">Three runs for Friday 13 November, against what the meters measured so far</p>
        <div className="legend" style={{ marginBottom: 6 }}>
          {V.map((v) => <span key={v.key}><i style={{ background: v.color }} /> Run {v.key}</span>)}
          <span><i style={{ background: "#f2c230" }} /> Measured</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={vintages} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" tick={axis} tickLine={false} interval={5} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={40} domain={[100, 190]} />
            <Tooltip formatter={(v: number) => `${v} MW`} />
            {V.map((v) => <Line key={v.key} dataKey={v.key} name={`Run ${v.key}`} stroke={v.color} dot={false} strokeWidth={2} />)}
            <Line dataKey="actual" name="Measured" stroke="#e0a520" dot={false} strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>Runs</h2>
        <p className="sub">Newest first. Error is the average for the whole day once the real values are in.</p>
        <table>
          <thead><tr><th>Run</th><th>For</th><th>Model</th><th className="r">Day total</th><th className="r">Error</th><th></th></tr></thead>
          <tbody>
            {issues.map((r) => (
              <tr key={r.issued}>
                <td>{r.issued}</td>
                <td>{r.for}</td>
                <td>{r.by}</td>
                <td className="r">{r.total.toLocaleString("de-CH", { minimumFractionDigits: 1 })} MWh</td>
                <td className="r">{r.error === null ? "–" : `${r.error.toFixed(1)}%`}</td>
                <td className="r"><button className="btn" onClick={() => toast(`Run ${r.issued} opened with the exact data it used`)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
