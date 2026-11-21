import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";
import { changes, drivers } from "./forecastData";
import { axis, Head } from "../trading/ui";

export default function Why() {
  // Waterfall: invisible base + visible delta
  let running = 0;
  const data = drivers.map((d) => {
    if (d.type === "base" || d.type === "total") {
      running = d.value;
      return { name: d.name, base: 0, value: d.value, type: d.type, label: `${d.value.toLocaleString("de-CH")} MWh` };
    }
    const start = d.value >= 0 ? running : running + d.value;
    running += d.value;
    return { name: d.name, base: start, value: Math.abs(d.value), type: d.type, label: `${d.value > 0 ? "+" : "−"}${Math.abs(d.value)} MWh` };
  });

  return (
    <div className="stack">
      <Head title="Why it changed" text="Plain explanations of what moves the forecast, so you can judge whether to trust it." />
      <section className="panel">
        <h2>Saturday's forecast compared with last Saturday</h2>
        <p className="sub">Energy for the whole day, MWh</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={axis} tickLine={false} interval={0} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={48} domain={[3100, 3360]} allowDataOverflow />
            <Tooltip formatter={(_v: number, _n: string, p: { payload?: { label?: string } }) => p.payload?.label ?? ""} />
            <Bar dataKey="base" stackId="w" fill="transparent" />
            <Bar dataKey="value" stackId="w" radius={[4, 4, 0, 0]}>
              {data.map((d) => <Cell key={d.name} fill={d.type === "up" ? "#b8443a" : d.type === "down" ? "#2e8a5a" : "#0e6b70"} />)}
              <LabelList dataKey="label" position="top" style={{ fontSize: 12, fill: "#172630" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h2>Changes since this morning</h2>
        <p className="sub">Each new run of the forecast, and what moved it</p>
        <ul className="timeline wide">
          {changes.map((c) => (
            <li key={c.at}><span className="t">{c.at}</span><div>{c.text}</div></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
