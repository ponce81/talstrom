import { useState } from "react";
import { alertLog, alertRules } from "./forecastData";
import { useToast } from "../../App";
import { Head } from "../trading/ui";

export default function Alerts() {
  const toast = useToast();
  const [rules, setRules] = useState(alertRules);

  return (
    <div className="stack">
      <Head title="Alerts" text="Get told when a forecast goes wrong, data is missing, or the weather changes enough to matter for your position." />
      <div className="grid-2">
        <section className="panel">
          <h2>Today</h2>
          <p className="sub">Newest first</p>
          <ul className="alerts">
            {alertLog.map((a) => (
              <li key={a.at}>
                <span className={`dot ${a.level}`} aria-label={`${a.level} priority`} />
                <div><div>{a.text}</div><small style={{ color: "var(--muted)" }}>{a.at}</small></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Rules</h2>
          <p className="sub">Switch rules on or off</p>
          <ul className="list">
            {rules.map((r) => (
              <li key={r.id}>
                <div><strong>{r.name}</strong><small>{r.channel}</small></div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={r.on}
                    onChange={() => { setRules(rules.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x))); toast(`Rule ${r.on ? "switched off" : "switched on"}`); }}
                    aria-label={r.name}
                  />
                  <span />
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
