import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { shadow } from "./forecastData";
import { useToast } from "../../App";
import { axis, Head, Status } from "../trading/ui";

export default function Models() {
  const toast = useToast();
  const [promoted, setPromoted] = useState(false);
  const live = shadow.reduce((s, d) => s + d.live, 0) / shadow.length;
  const ch = shadow.reduce((s, d) => s + d.challenger, 0) / shadow.length;

  const rows = [
    { name: "Grid load, gradient boosting", version: promoted ? "v15" : "v14", role: "Live", note: promoted ? "Promoted today" : "Live since 2 Sep" },
    { name: "Grid load, gradient boosting with satellite data", version: "v15", role: promoted ? "Retired" : "Challenger", note: promoted ? "Now live" : "In test for 21 days" },
    { name: "Grid load, seasonal baseline", version: "v3", role: "Fallback", note: "Used if the live model fails or data is missing" },
    { name: "Rooftop PV, irradiance model", version: "v9", role: "Live", note: "Live since 14 Jul" },
    { name: "Heat pumps, temperature model", version: "v6", role: "Retraining", note: "Started 14:20 after high error" },
  ];

  return (
    <div className="stack">
      <Head title="Models" text="Which models are live, which are being tested, and what takes over if one fails. A new model runs in the background and only goes live once it has proven better." />
      <section className="reco" aria-label="Model ready">
        <span aria-hidden style={{ fontSize: 20 }}>⇧</span>
        <div>
          <h2>{promoted ? "Version 15 is live" : "Version 15 is ready to go live"}</h2>
          <p>
            {promoted
              ? "The previous version stays available. If accuracy drops, Talstrom switches back automatically."
              : `Tested for 21 days next to the live model: average error ${ch.toFixed(2)}% instead of ${live.toFixed(2)}%. It adds satellite cloud data, which mainly helps on foggy days.`}
          </p>
        </div>
        {!promoted && (
          <div className="reco-actions">
            <button className="btn primary" onClick={() => { setPromoted(true); toast("Version 15 is now live. The change is recorded in the audit trail."); }}>Make live</button>
          </div>
        )}
      </section>
      <div className="grid-2">
        <section className="panel">
          <h2>Live vs. challenger</h2>
          <p className="sub">Day-ahead error per day while both ran</p>
          <div className="legend" style={{ marginBottom: 6 }}>
            <span><i style={{ background: "#9fb3bd" }} /> Version 14 (live)</span>
            <span><i style={{ background: "var(--hydro)" }} /> Version 15 (challenger)</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={shadow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={4} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={36} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line dataKey="live" name="Version 14" stroke="#9fb3bd" dot={false} strokeWidth={2} />
              <Line dataKey="challenger" name="Version 15" stroke="#0e6b70" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>Fallback rules</h2>
          <p className="sub">What happens when something goes wrong</p>
          <ul className="list">
            <li><div><strong>Live model fails</strong><small>Seasonal baseline takes over within one run</small></div></li>
            <li><div><strong>Weather feed missing</strong><small>Use the other provider; if both fail, last run shifted by one day</small></div></li>
            <li><div><strong>Meter data late</strong><small>Fill from similar days, mark as estimated</small></div></li>
            <li><div><strong>Accuracy worse than baseline 3 days in a row</strong><small>Alert, and retrain automatically</small></div></li>
          </ul>
        </section>
      </div>
      <section className="panel">
        <h2>All models</h2>
        <table>
          <thead><tr><th>Model</th><th>Version</th><th>Role</th><th>Note</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.version}</td>
                <td><Status s={r.role === "Live" ? "Connected" : r.role === "Challenger" || r.role === "Retraining" ? "Pending" : "Queued"} /> <span style={{ marginLeft: 4 }}>{r.role}</span></td>
                <td style={{ color: "var(--muted)" }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
