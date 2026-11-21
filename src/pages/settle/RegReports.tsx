import { useState } from "react";
import { regReports } from "./settleData";
import { useToast } from "../../App";
import { Head, Status } from "../trading/ui";

export default function RegReports() {
  const toast = useToast();
  const [rows, setRows] = useState(regReports);

  return (
    <div className="stack">
      <Head title="Regulatory reports" text="Reports for ElCom, Swissgrid, the federal statistics office and the canton, filled from settled data. Every figure links back to the runs it came from." />
      <section className="panel">
        <h2>Reports</h2>
        <p className="sub">By due date</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Report</th><th>Contains</th><th>Due</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td style={{ fontSize: 13.5, color: "var(--muted)" }}>{r.detail}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.due}</td>
                  <td><Status s={r.status} /></td>
                  <td className="r">
                    {r.status === "Ready to send" ? (
                      <button className="btn primary" onClick={() => { setRows(rows.map((x) => (x.name === r.name ? { ...x, status: "Sent" } : x))); toast(`${r.name} sent`); }}>Send</button>
                    ) : (
                      <button className="btn" onClick={() => toast(`${r.name} opened`)}>Open</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
