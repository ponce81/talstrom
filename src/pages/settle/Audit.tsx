import { useState } from "react";
import { Search } from "lucide-react";
import { auditTrail } from "./settleData";
import { useToast } from "../../App";
import { Head } from "../trading/ui";

export default function Audit() {
  const toast = useToast();
  const [q, setQ] = useState("CH1012301234500000000000000098765");
  const [traced, setTraced] = useState(false);

  return (
    <div className="stack">
      <Head title="Audit trail" text="Every number in settlement can be traced back to its meter values, estimates, tariff and rule versions, and to the people who approved it." />
      <section className="panel">
        <h2>Trace a number</h2>
        <p className="sub">Enter a metering point or run to see how its amount was calculated</p>
        <form onSubmit={(e) => { e.preventDefault(); setTraced(true); toast("Trace built from 2,976 values"); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input style={{ flex: 1, minWidth: 260 }} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Metering point or run" />
          <button className="btn primary" type="submit"><Search size={16} /> Trace</button>
        </form>
        {traced && (
          <ol className="trace">
            <li><strong>2,976 meter values</strong> for October, 15-min, from the head-end system. 2,972 measured, 4 estimated by rule G-01 v3.</li>
            <li><strong>Sum 412.6 kWh</strong>, of which 118.2 kWh in high-tariff hours.</li>
            <li><strong>Tariff "Households, standard" v9:</strong> 7.9 Rp./kWh high, 6.4 Rp./kWh low, base fee CHF 5.00.</li>
            <li><strong>Grid usage CHF 33.04</strong> in revision 1, CHF 0.21 more than the initial run (late correction on 21 Oct).</li>
            <li><strong>Approved</strong> as part of SR-2610-R1, pending second sign-off.</li>
          </ol>
        )}
      </section>
      <section className="panel">
        <h2>Recent changes</h2>
        <p className="sub">Read-only. Kept for 10 years.</p>
        <table>
          <thead><tr><th>When</th><th>Who</th><th>What</th><th>Reference</th></tr></thead>
          <tbody>
            {auditTrail.map((a) => (
              <tr key={a.at + a.what}>
                <td style={{ whiteSpace: "nowrap" }}>{a.at}</td>
                <td>{a.who}</td>
                <td>{a.what}</td>
                <td style={{ color: "var(--muted)" }}>{a.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
