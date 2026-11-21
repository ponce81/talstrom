import { useState } from "react";
import { events as initial } from "./forecastData";
import { ROLES, useRole, useToast } from "../../App";
import { Head } from "../trading/ui";

export default function Events() {
  const toast = useToast();
  const { role } = useRole();
  const [rows, setRows] = useState(initial);
  const [date, setDate] = useState("2026-11-28");
  const [hours, setHours] = useState("18–22h");
  const [pct, setPct] = useState(5);
  const [reason, setReason] = useState("");

  function add() {
    if (!reason.trim()) return toast("Add a reason. Every adjustment is recorded with it.");
    const d = new Date(date + "T12:00:00");
    const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const who = ROLES[role].person.split(" ").map((p, i) => (i === 0 ? p[0] + "." : p)).join(" ");
    setRows([{ date: label, name: reason, effect: `${pct > 0 ? "+" : "−"}${Math.abs(pct)}%, ${hours}`, by: who, kind: "Manual adjustment" }, ...rows]);
    setReason("");
    toast("Adjustment saved. Accuracy reports show it separately, so you can see if it helped.");
  }

  return (
    <div className="stack">
      <Head title="Events and adjustments" text="Holidays come from the cantonal calendars. Anything the model can't know, like a factory shutdown or a big event, you add here." />
      <div className="grid-2">
        <section className="panel">
          <h2>Coming up</h2>
          <p className="sub">Next 8 weeks</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>What</th><th>Effect on forecast</th><th>Added by</th></tr></thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.date + e.name}>
                    <td style={{ whiteSpace: "nowrap" }}>{e.date}</td>
                    <td>{e.name}<br /><small style={{ color: "var(--muted)" }}>{e.kind}</small></td>
                    <td>{e.effect}</td>
                    <td>{e.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <h2>New adjustment</h2>
          <p className="sub">Applied on top of the model's forecast</p>
          <div className="stack" style={{ gap: 12 }}>
            <label className="field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <div className="grid-2e" style={{ gap: 12 }}>
              <label className="field">Hours<select value={hours} onChange={(e) => setHours(e.target.value)}><option>All day</option><option>6–12h</option><option>12–18h</option><option>18–22h</option></select></label>
              <label className="field">Change (%)<input type="number" step={0.5} value={pct} onChange={(e) => setPct(+e.target.value)} /></label>
            </div>
            <label className="field">Reason<input value={reason} placeholder="e.g. Christmas market, Muri" onChange={(e) => setReason(e.target.value)} /></label>
            <button className="btn primary" style={{ justifyContent: "center" }} onClick={add}>Save adjustment</button>
          </div>
        </section>
      </div>
    </div>
  );
}
