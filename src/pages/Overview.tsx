import { Link } from "react-router-dom";
import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { alerts, NOW_QH, today, qhLabel, runs } from "../data";
import { ROLES, useRole } from "../App";

const KPIS = {
  dso: [
    { label: "Peak load today", value: "170 MW", note: "forecast at 18:15", tone: "" },
    { label: "Highest feeder loading", value: "92%", note: "Oberried 3, 18:00–19:15", tone: "bad" },
    { label: "Meter data received", value: "99.4%", note: "312 intervals missing", tone: "" },
    { label: "PV hosting left", value: "14.1 MW", note: "across 7 feeders", tone: "" },
  ],
  trader: [
    { label: "Open position tomorrow", value: "−6 MW", note: "Saturday, short 17–20h", tone: "bad" },
    { label: "Today's P&L", value: "+CHF 18,420", note: "intraday and day-ahead", tone: "good" },
    { label: "Day-ahead base, Sat", value: "96.80", note: "CHF/MWh, Swiss zone", tone: "" },
    { label: "Forecast error, last 7 days", value: "2.4%", note: "MAPE, grid load", tone: "" },
  ],
  settlement: [
    { label: "Runs this month", value: "14", note: "2 need review", tone: "bad" },
    { label: "October revision", value: "+0.62%", note: "vs. initial run", tone: "" },
    { label: "Meter data received", value: "99.4%", note: "312 intervals missing", tone: "" },
    { label: "Next run", value: "06:00", note: "initial run, 13 Nov", tone: "" },
  ],
  admin: [
    { label: "Peak load today", value: "170 MW", note: "forecast at 18:15", tone: "" },
    { label: "Open position tomorrow", value: "−6 MW", note: "Saturday, short 17–20h", tone: "bad" },
    { label: "Settlement runs to review", value: "1", note: "October, revision 1", tone: "" },
    { label: "Highest feeder loading", value: "92%", note: "Oberried 3", tone: "bad" },
  ],
} as const;

const ALERT_PAGES: Record<string, string> = { "/grid/power-flow": "/grid", "/settlement/exceptions": "/settlement", "/trading/positions": "/trading", "/forecasting/models": "/forecasting" };

export default function Overview() {
  const { role } = useRole();
  const allowed = ROLES[role].pages;
  const peakIdx = today.reduce((m, d, i) => (d.forecast > today[m].forecast ? i : m), 0);
  const actualNow = today[NOW_QH].actual!;
  const forecastNow = today[NOW_QH].forecast;
  const dev = ((actualNow - forecastNow) / forecastNow) * 100;
  const shownAlerts = alerts.filter((a) => allowed.includes(ALERT_PAGES[a.to]));

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Good afternoon, {ROLES[role].person.split(" ")[0]}</h1>
          <p>Here is where the grid stands at the 16:30 quarter-hour, and what needs your attention before the evening peak.</p>
        </div>
      </div>

      <section className="panel ribbon" aria-label="Today's load">
        <div className="panel-head">
          <div>
            <h2>Grid load today</h2>
            <p className="sub">Measured load against forecast, in 15-minute intervals</p>
          </div>
          <div className="legend">
            <span><i style={{ background: "#7fd0cc" }} /> Measured</span>
            <span><i style={{ background: "#e4edf1", opacity: 0.6 }} /> Forecast</span>
            <span><i style={{ background: "#f2c230" }} /> Rooftop PV</span>
          </div>
        </div>
        <div className="ribbon-stats">
          <div><strong className="num">{actualNow.toFixed(1)} MW</strong><span>load now</span></div>
          <div><strong className="num">{dev > 0 ? "+" : "−"}{Math.abs(dev).toFixed(1)}%</strong><span>vs. forecast</span></div>
          <div><strong className="num">{today[peakIdx].forecast.toFixed(0)} MW</strong><span>peak expected at {qhLabel(peakIdx)}</span></div>
          <div><strong className="num">{today[NOW_QH].price.toFixed(2)}</strong><span>CHF/MWh intraday</span></div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={today} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="t" interval={11} tick={{ fill: "#9fb3bd", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9fb3bd", fontSize: 12 }} axisLine={false} tickLine={false} width={44} domain={[0, 240]} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 0 }} formatter={(v: number) => `${v} MW`} />
            <Area dataKey="pv" name="Rooftop PV" fill="#f2c230" fillOpacity={0.25} stroke="#f2c230" strokeWidth={1.5} />
            <Line dataKey="forecast" name="Forecast" stroke="#e4edf1" strokeOpacity={0.55} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            <Line dataKey="actual" name="Measured" stroke="#7fd0cc" dot={false} strokeWidth={2.5} />
            <ReferenceLine x={qhLabel(NOW_QH)} stroke="#f2c230" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="qh-strip" aria-hidden>
          {today.map((d) => (
            <i key={d.i} className={d.i === NOW_QH ? "now" : d.i < NOW_QH ? "past" : d.i >= peakIdx - 3 && d.i <= peakIdx + 3 ? "peak" : ""} />
          ))}
        </div>
      </section>

      <section className="kpis" aria-label="Key figures">
        {KPIS[role].map((k) => (
          <div className="kpi" key={k.label}>
            <span>{k.label}</span>
            <strong className="num">{k.value}</strong>
            <small className={k.tone}>{k.note}</small>
          </div>
        ))}
      </section>

      <div className={allowed.includes("/settlement") ? "grid-2" : "stack"}>
        <section className="panel">
          <h2>Needs attention</h2>
          <p className="sub">Sorted by impact on today's operation</p>
          <ul className="alerts">
            {shownAlerts.map((a) => (
              <li key={a.text}>
                <span className={`dot ${a.level}`} aria-label={`${a.level} priority`} />
                <div>
                  <div>{a.text}</div>
                  <Link to={a.to}>Open {a.where.toLowerCase()}</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {allowed.includes("/settlement") && (
        <section className="panel">
          <h2>Latest settlement runs</h2>
          <p className="sub">Balance group Talwerke Netz</p>
          <table>
            <tbody>
              {runs.slice(0, 4).map((r) => (
                <tr key={r.id}>
                  <td>{r.period}<br /><small style={{ color: "var(--muted)" }}>{r.kind}</small></td>
                  <td className="r">
                    <span className={`status ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        )}
      </div>
    </div>
  );
}

export function statusClass(s: string) {
  return s === "Completed" ? "s-completed" : s === "Running" ? "s-running" : s === "Needs review" ? "s-review" : "s-queued";
}
