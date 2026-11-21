import { useState } from "react";
import { Send } from "lucide-react";
import { reports as initial } from "./tradingData";
import { useToast } from "../../App";
import { Head, Kpis, Status } from "./ui";

export default function Reporting() {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const ready = rows.filter((r) => r.status === "Ready to send");

  function sendAll() {
    if (!ready.length) return toast("Nothing waiting to be sent");
    setRows(rows.map((r) => (r.status === "Ready to send" ? { ...r, status: "Sent" } : r)));
    toast(`${ready.length} report${ready.length > 1 ? "s" : ""} sent to ElCom`);
  }

  return (
    <div className="stack">
      <Head
        title="Reporting"
        text="Trade and order reports for the regulators, built automatically from your deals: ElCom in Switzerland, and REMIT for trades on EU markets."
        actions={<button className="btn primary" onClick={sendAll}><Send size={16} /> Send ready reports</button>}
      />
      <Kpis
        items={[
          { label: "Ready to send", value: String(ready.length), note: "due today 23:59", tone: ready.length ? "bad" : "good" },
          { label: "Rejected", value: String(rows.filter((r) => r.status === "Rejected").length), note: "needs a correction" },
          { label: "On time this year", value: "99.6%", note: "1 late report, in March" },
          { label: "Trades reported today", value: "15", note: "of 15" },
        ]}
      />
      <section className="panel">
        <h2>Reports</h2>
        <p className="sub">Newest first</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Report</th><th>Regulator</th><th className="r">Records</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.content}<br /><small style={{ color: r.status === "Rejected" ? "var(--short)" : "var(--muted)" }}>{r.status === "Rejected" ? "Rejected: missing contract ID for 2 bilateral deals. Correct in Deals and resend." : r.id}</small></td>
                  <td>{r.regime}</td>
                  <td className="r">{r.count}</td>
                  <td>{r.due}</td>
                  <td><Status s={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
