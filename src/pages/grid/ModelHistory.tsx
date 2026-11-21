import { useState } from "react";
import { versions } from "./gridData";
import { useToast } from "../../App";
import { Head } from "../trading/ui";

export default function ModelHistory() {
  const toast = useToast();
  const [a, setA] = useState(140);
  const [b, setB] = useState(142);
  const [asOf, setAsOf] = useState("2026-10-01");

  return (
    <div className="stack">
      <Head title="Model history" text="Every change to the grid model is a new version: who made it, from which source, and which studies used it. Any past study can be re-run on exactly the model it used." />
      <div className="grid-2">
        <section className="panel">
          <h2>Versions</h2>
          <p className="sub">Newest first</p>
          <ul className="timeline wide">
            {versions.map((v) => (
              <li key={v.v}>
                <span className="t">v{v.v}</span>
                <div>
                  <strong>{v.what}</strong>
                  <div className="sub" style={{ margin: 0 }}>{v.by}, {v.at}. Source: {v.source}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <div className="stack">
          <section className="panel">
            <h2>Compare two versions</h2>
            <p className="sub">See what changed between them</p>
            <div className="grid-2e" style={{ gap: 12, marginBottom: 12 }}>
              <label className="field">From<select value={a} onChange={(e) => setA(+e.target.value)}>{versions.map((v) => <option key={v.v} value={v.v}>v{v.v}</option>)}</select></label>
              <label className="field">To<select value={b} onChange={(e) => setB(+e.target.value)}>{versions.map((v) => <option key={v.v} value={v.v}>v{v.v}</option>)}</select></label>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 14 }}>
              {a === b ? "Pick two different versions." : `${Math.abs(b - a) * 3 + 2} objects changed, including 1 cable section and 1 transformer tap position. Power flow results differ by up to 4% on Muri Dorf.`}
            </p>
            <button className="btn" disabled={a === b} onClick={() => toast(`Differences between v${Math.min(a, b)} and v${Math.max(a, b)} highlighted in the power flow view`)}>Show on the grid</button>
          </section>
          <section className="panel">
            <h2>Open the model as of a date</h2>
            <p className="sub">For audits and disputes: the grid exactly as it was known then</p>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <label className="field">Date<input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></label>
              <button className="btn primary" onClick={() => toast(`Model as of ${asOf} opened read-only (version 131)`)}>Open read-only</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
