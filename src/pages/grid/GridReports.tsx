import { useState } from "react";
import { FileText } from "lucide-react";
import { gridReports } from "./gridData";
import { useToast } from "../../App";
import { Head, Status } from "../trading/ui";

export default function GridReports() {
  const toast = useToast();
  const [rows, setRows] = useState(gridReports);

  return (
    <div className="stack">
      <Head
        title="Reports"
        text="Reports for the regulator, the board and the municipalities, built from the current model, scenarios and investment plan. Every figure links back to its source."
        actions={<button className="btn primary" onClick={() => toast("New report started: choose regulator, board or municipality")}><FileText size={16} /> New report</button>}
      />
      <section className="panel">
        <h2>Reports</h2>
        <p className="sub">Most recent first</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Report</th><th>For</th><th>Period</th><th>Updated</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.kind}</td>
                  <td>{r.period}</td>
                  <td>{r.updated}</td>
                  <td><Status s={r.status === "Draft" ? "Pending" : r.status} /></td>
                  <td className="r">
                    {r.status === "Ready to send" ? (
                      <button className="btn" onClick={() => { setRows(rows.map((x) => (x.name === r.name ? { ...x, status: "Sent", updated: "Just now" } : x))); toast("Board summary sent"); }}>Send</button>
                    ) : (
                      <button className="btn" onClick={() => toast(`${r.name} downloaded as PDF`)}>Download</button>
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
