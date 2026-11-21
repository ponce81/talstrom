import { useState } from "react";
import { exceptions as initial } from "./settleData";
import { useToast } from "../../App";
import { Head } from "../trading/ui";

export default function Exceptions() {
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState("All");
  const areas = ["All", ...Array.from(new Set(initial.map((e) => e.area)))];
  const shown = items.filter((e) => filter === "All" || e.area === filter);

  function resolve(id: string, accept: boolean) {
    setItems(items.filter((e) => e.id !== id));
    toast(accept ? "Suggestion applied. The change is in the audit trail." : "Moved to manual handling and assigned to you");
  }

  return (
    <div className="stack">
      <Head title="Exceptions" text="Only what needs a person. Everything else in settlement runs by itself. Each exception comes with a suggested fix." />
      <section className="panel">
        <div className="panel-head" style={{ marginBottom: 8 }}>
          <div>
            <h2>{items.length ? `${items.length} open` : "Nothing open"}</h2>
            <p className="sub" style={{ margin: 0 }}>Most urgent first</p>
          </div>
          <label className="field">
            Area
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {areas.map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </div>
        <ul className="list">
          {shown.map((e) => (
            <li key={e.id} className="gap">
              <span className={`dot ${e.severity}`} style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 6, flex: "none" }} aria-label={`${e.severity} priority`} />
              <div>
                <strong>{e.what}</strong>
                <small>Suggested: {e.suggestion}</small>
                <small>{e.area}, {e.id}</small>
              </div>
              <div className="row-actions">
                <button className="btn" onClick={() => resolve(e.id, false)}>Handle myself</button>
                <button className="btn primary" onClick={() => resolve(e.id, true)}>Apply suggestion</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
