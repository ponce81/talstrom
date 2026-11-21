import { useState } from "react";
import { Send } from "lucide-react";
import { schedules as initial } from "./tradingData";
import { useToast } from "../../App";
import { Head, Kpis, Status } from "./ui";

export default function Schedules() {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [sending, setSending] = useState(false);
  const changed = 6.0;

  function submit() {
    setSending(true);
    window.setTimeout(() => {
      const v = rows.filter((r) => r.delivery === "Sat 14 Nov").length + 1;
      setRows([{ id: `SCH-1114-v${v}`, delivery: "Sat 14 Nov", kind: "Intraday update", version: v, sent: "16:31", status: "Accepted", mwh: 3_337.6, note: "" }, ...rows]);
      setSending(false);
      toast(`Schedule version ${v} for Saturday accepted by Swissgrid`);
    }, 1200);
  }

  return (
    <div className="stack">
      <Head
        title="Schedules"
        text="The schedules you send to Swissgrid for each delivery day. Every new deal changes the schedule, and every version is kept."
        actions={<button className="btn primary" onClick={submit} disabled={sending}><Send size={16} /> {sending ? "Sending…" : "Send schedule update"}</button>}
      />
      <Kpis
        items={[
          { label: "Next deadline", value: "17:15", note: "intraday update for Saturday", tone: "bad" },
          { label: "Not yet sent", value: `${changed} MW`, note: "from deals since 16:14" },
          { label: "Saturday status", value: "Accepted", note: "version 3, sent 16:14", tone: "good" },
          { label: "Rejected this week", value: "1", note: "Friday version 6", tone: "" },
        ]}
      />
      <section className="panel">
        <h2>Versions</h2>
        <p className="sub">Newest first. A rejected version stays on record with Swissgrid's reason.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Delivery day</th><th>Type</th><th className="r">Version</th><th>Sent</th><th className="r">Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.delivery}</td>
                  <td>{r.kind}{r.note && <><br /><small style={{ color: "var(--short)" }}>{r.note}</small></>}</td>
                  <td className="r">{r.version}</td>
                  <td>{r.sent}</td>
                  <td className="r">{r.mwh.toLocaleString("de-CH", { minimumFractionDigits: 1 })} MWh</td>
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
