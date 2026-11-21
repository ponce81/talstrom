import { useState } from "react";
import { approvals as initial, audit as initialAudit } from "./tradingData";
import { ROLES, useRole, useToast } from "../../App";
import { Head } from "./ui";

export default function Approvals() {
  const toast = useToast();
  const { role } = useRole();
  const me = ROLES[role].person;
  const short = me.split(" ").map((p, i) => (i === 0 ? p[0] + "." : p)).join(" ");
  const [items, setItems] = useState(initial);
  const [log, setLog] = useState(initialAudit);

  function decide(id: string, ok: boolean) {
    const a = items.find((i) => i.id === id)!;
    if (a.by === short) {
      toast("You created this item, so someone else has to approve it");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
    setLog([{ at: "16:31", who: short, what: `${ok ? "Approved" : "Rejected"}: ${a.what}` }, ...log]);
    toast(`${ok ? "Approved" : "Rejected"}. The decision is recorded in the audit trail.`);
  }

  return (
    <div className="stack">
      <Head title="Approvals" text="Four-eyes control: items that need a second person's sign-off, and a complete record of who changed what." />
      <div className="grid-2">
        <section className="panel">
          <h2>Waiting for you</h2>
          <p className="sub">{items.length ? `${items.length} item${items.length > 1 ? "s" : ""} need a second sign-off` : "Nothing to approve."}</p>
          <ul className="list">
            {items.map((a) => (
              <li key={a.id} className="approval">
                <div>
                  <strong>{a.what}</strong>
                  <small>{a.why}. Requested by {a.by}, {a.at}.</small>
                </div>
                <div className="row-actions">
                  <button className="btn" onClick={() => decide(a.id, false)}>Reject</button>
                  <button className="btn primary" onClick={() => decide(a.id, true)}>Approve</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Audit trail, today</h2>
          <p className="sub">Read-only. Kept for 10 years.</p>
          <ul className="timeline">
            {log.map((e, i) => (
              <li key={i}>
                <span className="t">{e.at}</span>
                <div><strong>{e.who}</strong> {e.what}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
