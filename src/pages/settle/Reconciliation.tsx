import { useState } from "react";
import { reconciliation } from "./settleData";
import { useToast } from "../../App";
import { Head, Kpis, Status } from "../trading/ui";

export default function Reconciliation() {
  const toast = useToast();
  const [sel, setSel] = useState(reconciliation[0].item);
  const r = reconciliation.find((x) => x.item === sel)!;
  const diffs = reconciliation.filter((x) => x.status === "Difference").length;

  return (
    <div className="stack">
      <Head title="Reconciliation" text="Your settlement figures compared with Swissgrid's, the suppliers' and your own billing. Differences come with the most likely cause." />
      <Kpis
        items={[
          { label: "Checks for October", value: String(reconciliation.length), note: "Swissgrid, suppliers, billing" },
          { label: "Matched", value: String(reconciliation.length - diffs), note: "no action needed", tone: "good" },
          { label: "Differences", value: String(diffs), note: "all explained", tone: "bad" },
          { label: "Net effect", value: "CHF 1,671", note: "to claim back from Swissgrid" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>October 2026</h2>
          <p className="sub">Select a line to see the cause</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Check</th><th className="r">Ours</th><th className="r">Theirs</th><th className="r">Difference</th><th>Status</th></tr></thead>
              <tbody>
                {reconciliation.map((x) => (
                  <tr key={x.item} className={`click ${x.item === sel ? "sel" : ""}`} onClick={() => setSel(x.item)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(x.item)}>
                    <td>{x.item}</td>
                    <td className="r">{x.ours}</td>
                    <td className="r">{x.theirs}</td>
                    <td className="r" style={{ color: x.status === "Difference" ? "var(--short)" : undefined }}>{x.diff}</td>
                    <td><Status s={x.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel detail">
          <h2>{r.item}</h2>
          <p className="sub">October 2026</p>
          {r.status === "Difference" ? (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 14 }}>{r.cause}.</p>
              <div className="row-actions">
                <button className="btn" onClick={() => toast("Difference accepted and recorded")}>Accept</button>
                <button className="btn primary" onClick={() => toast("Correction request sent with the corrected meter data attached")}>Request correction</button>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Both sides match exactly.</p>
          )}
        </section>
      </div>
    </div>
  );
}
