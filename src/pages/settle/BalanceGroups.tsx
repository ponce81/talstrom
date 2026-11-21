import { useState } from "react";
import { Send } from "lucide-react";
import { balanceGroups as initial } from "./settleData";
import { useToast } from "../../App";
import { Head, Kpis, Status } from "../trading/ui";

export default function BalanceGroups() {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const rejected = rows.filter((r) => r.status === "Rejected");

  function resend() {
    if (!rejected.length) return toast("Nothing to resend");
    setRows(rows.map((r) => (r.status === "Rejected" ? { ...r, status: "Accepted", sent: "Just now" } : r)));
    toast("Resent with metering point list 2026-11-01. Accepted by Swissgrid.");
  }

  return (
    <div className="stack">
      <Head
        title="Balance groups"
        text="Your grid's consumption added up per balance group and supplier, every 15 minutes, and sent to Swissgrid and the suppliers as SDAT-CH messages."
        actions={<button className="btn primary" onClick={resend}><Send size={16} /> Resend rejected</button>}
      />
      <Kpis
        items={[
          { label: "Balance groups in your grid", value: String(rows.length), note: "including grid losses" },
          { label: "October, revision 1", value: `${rows.reduce((s, r) => s + r.mwh, 0).toLocaleString("de-CH", { maximumFractionDigits: 0 })} MWh`, note: "sent 10 Nov 06:00" },
          { label: "Rejected", value: String(rejected.length), note: rejected.length ? rejected[0].name : "none", tone: rejected.length ? "bad" : "good" },
          { label: "Next deadline", value: "10 Dec", note: "October final" },
        ]}
      />
      <section className="panel">
        <h2>October 2026, revision 1</h2>
        <p className="sub">Volume per balance group, and the status of the message to Swissgrid</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Balance group</th><th>Supplier</th><th className="r">Metering points</th><th className="r">Volume</th><th>Sent</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}<br /><small style={{ color: "var(--muted)" }}>{r.id}</small></td>
                  <td>{r.supplier}</td>
                  <td className="r">{r.points ? r.points.toLocaleString("de-CH") : "–"}</td>
                  <td className="r">{r.mwh.toLocaleString("de-CH", { minimumFractionDigits: 1 })} MWh</td>
                  <td>{r.sent}</td>
                  <td><Status s={r.status} />{r.status === "Rejected" && <><br /><small style={{ color: "var(--short)" }}>Unknown metering point list version</small></>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
