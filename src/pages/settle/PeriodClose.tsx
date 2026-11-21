import { useState } from "react";
import { Lock } from "lucide-react";
import { closeChecklist, periods as initialPeriods } from "./settleData";
import { useToast } from "../../App";
import { Head, Status } from "../trading/ui";

export default function PeriodClose() {
  const toast = useToast();
  const [checks, setChecks] = useState(closeChecklist);
  const [periods, setPeriods] = useState(initialPeriods);
  const done = checks.filter((c) => c.done).length;
  const ready = done === checks.length;

  return (
    <div className="stack">
      <Head title="Period close" text="Close a month once its final run is checked and approved. A locked period can't change; later corrections go into the next revision with a clear reference." />
      <div className="grid-2">
        <section className="panel">
          <h2>Periods</h2>
          <p className="sub">Most recent first</p>
          <table>
            <thead><tr><th>Period</th><th>Revision</th><th>Final</th><th>Status</th></tr></thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.period}>
                  <td>{p.period}</td>
                  <td>{p.revision}</td>
                  <td>{p.final}</td>
                  <td><Status s={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h2>Close October 2026</h2>
          <p className="sub">{done} of {checks.length} steps done</p>
          <ul className="checklist">
            {checks.map((c) => (
              <li key={c.id}>
                <label>
                  <input type="checkbox" checked={c.done} onChange={() => setChecks(checks.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)))} />
                  <span>{c.text}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            className="btn primary"
            disabled={!ready}
            onClick={() => {
              setPeriods(periods.map((p) => (p.period === "October 2026" ? { ...p, status: "Locked", final: "Approved today", locked: true } : p)));
              toast("October 2026 locked. Later corrections go into revision 2 of November.");
            }}
          >
            <Lock size={16} /> Lock October
          </button>
          {!ready && <p className="sub" style={{ margin: "8px 0 0" }}>Tick every step to lock the period. In the real product, steps are ticked automatically where the system can check them.</p>}
        </section>
      </div>
    </div>
  );
}
