import { useState } from "react";
import { Play, Download } from "lucide-react";
import { runBreakdown, runs as initialRuns, SettlementRun } from "../data";
import { useToast } from "../App";
import { statusClass } from "./Overview";

const chf = (n: number) => "CHF " + n.toLocaleString("de-CH", { maximumFractionDigits: 0 });
const mwh = (n: number) => n.toLocaleString("de-CH", { maximumFractionDigits: 1 }) + " MWh";

export default function Settlement() {
  const toast = useToast();
  const [runs, setRuns] = useState<SettlementRun[]>(initialRuns);
  const [selId, setSelId] = useState("SR-2610-R1");
  const [filter, setFilter] = useState<"All" | "Needs review" | "Running">("All");
  const sel = runs.find((r) => r.id === selId)!;
  const shown = runs.filter((r) => filter === "All" || r.status === filter);

  function startRevision() {
    const id = `SR-2610-R2`;
    if (runs.some((r) => r.id === id)) return toast("Revision 2 for October is already queued");
    setRuns([{ ...sel, id, kind: "Revision 2", status: "Queued", created: "Just now", delta: null }, ...runs]);
    toast("Revision 2 for October queued");
  }

  function approve() {
    setRuns(runs.map((r) => (r.id === sel.id ? { ...r, status: "Completed" } : r)));
    toast(`${sel.period}, ${sel.kind.toLowerCase()} approved`);
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Settlement runs</h1>
          <p>Every run is versioned. Revision runs re-use corrected meter data and show what changed since the previous version.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => toast("Export started: October revision 1 as ebIX XML")}>
            <Download size={16} /> Export
          </button>
          <button className="btn primary" onClick={startRevision}>
            <Play size={16} /> Start revision run
          </button>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head" style={{ marginBottom: 12 }}>
            <div>
              <h2>Runs</h2>
              <p className="sub" style={{ margin: 0 }}>Select a run to see its breakdown</p>
            </div>
            <div className="seg" role="tablist" aria-label="Filter runs">
              {(["All", "Needs review", "Running"] as const).map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Period</th><th>Run</th><th>Group</th><th className="r">Volume</th><th className="r">Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={`click ${r.id === selId ? "sel" : ""}`} onClick={() => setSelId(r.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelId(r.id)}>
                  <td style={{ whiteSpace: "nowrap" }}>{r.period}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.kind}</td>
                  <td>{r.group.replace("Talwerke ", "")}</td>
                  <td className="r">{r.mwh ? mwh(r.mwh) : "–"}</td>
                  <td className="r">{r.chf ? chf(r.chf) : "–"}</td>
                  <td><span className={`status ${statusClass(r.status)}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel detail" aria-live="polite">
          <h2>{sel.period}, {sel.kind.toLowerCase()}</h2>
          <p className="sub">{sel.id}, created {sel.created}</p>
          <dl>
            <div><dt>Volume</dt><dd>{sel.mwh ? mwh(sel.mwh) : "–"}</dd></div>
            <div><dt>Amount</dt><dd>{sel.chf ? chf(sel.chf) : "–"}</dd></div>
            <div><dt>Metering points</dt><dd>{sel.points ? sel.points.toLocaleString("de-CH") : "–"}</dd></div>
            <div><dt>Estimated intervals</dt><dd>{sel.missing.toLocaleString("de-CH")}</dd></div>
            <div><dt>Change vs. previous</dt><dd>{sel.delta === null ? "First version" : `${sel.delta > 0 ? "+" : ""}${sel.delta.toFixed(2)}%`}</dd></div>
            <div><dt>Status</dt><dd><span className={`status ${statusClass(sel.status)}`}>{sel.status}</span></dd></div>
          </dl>
          {sel.status === "Needs review" && (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 14 }}>
                Heat-pump volumes rose 1.8% after 2,140 meters sent late corrections. Check them before approving.
              </p>
              <button className="btn primary" onClick={approve}>Approve run</button>
            </>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Breakdown by customer group</h2>
        <p className="sub">October 2026, revision 1 compared with the initial run</p>
        <table>
          <thead>
            <tr><th>Customer group</th><th className="r">Volume</th><th className="r">Initial run</th><th className="r">Change</th><th className="r">Amount</th></tr>
          </thead>
          <tbody>
            {runBreakdown.map((b) => {
              const d = ((b.mwh - b.prev) / b.prev) * 100;
              return (
                <tr key={b.category}>
                  <td>{b.category}</td>
                  <td className="r">{mwh(b.mwh)}</td>
                  <td className="r" style={{ color: "var(--muted)" }}>{mwh(b.prev)}</td>
                  <td className="r" style={{ color: Math.abs(d) > 1.5 ? "var(--short)" : "inherit", fontWeight: Math.abs(d) > 1.5 ? 650 : 400 }}>
                    {d > 0 ? "+" : ""}{d.toFixed(2)}%
                  </td>
                  <td className="r">{chf(b.chf)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
