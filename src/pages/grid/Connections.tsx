import { useState } from "react";
import { connectionRequests, ConnStatus } from "./gridData";
import { useToast } from "../../App";
import { Head, Kpis } from "../trading/ui";

const TONE: Record<ConnStatus, string> = { Approved: "s-completed", "Approved with conditions": "s-review", "Needs study": "s-bad", New: "s-running" };
const ADDRESSES = [
  { a: "Schulweg 7, Oberried", feeder: "Oberried 3", free: { pv: 0, load: 20 } },
  { a: "Bahnhofstrasse 22, Muri", feeder: "Muri Dorf", free: { pv: 120, load: 60 } },
  { a: "Sonnenhalde 3, Sonnenberg", feeder: "Sonnenberg 2", free: { pv: 32, load: 140 } },
  { a: "Allmendstrasse 40, Allmend", feeder: "Allmend 2", free: { pv: 2400, load: 480 } },
];
const KINDS = ["Rooftop PV", "Heat pump", "Wallbox", "Battery"];

export default function Connections() {
  const toast = useToast();
  const [rows, setRows] = useState(connectionRequests);
  const [sel, setSel] = useState(rows[0].id);
  const [addr, setAddr] = useState(ADDRESSES[0].a);
  const [kind, setKind] = useState("Rooftop PV");
  const [kw, setKw] = useState(28);
  const [checking, setChecking] = useState(false);
  const r = rows.find((x) => x.id === sel)!;

  function decide(kindOf: string, kwOf: number, address: string): { status: ConnStatus; note: string; feeder: string } {
    const a = ADDRESSES.find((x) => x.a === address) ?? ADDRESSES[0];
    if (kwOf > 100) return { status: "Needs study", note: "Above 100 kW, so a detailed medium-voltage study is required.", feeder: a.feeder };
    const free = kindOf === "Rooftop PV" ? a.free.pv : a.free.load;
    if (kwOf <= free) return { status: "Approved", note: `Fits. ${free - kwOf} kW stays free at this connection point.`, feeder: a.feeder };
    if (kindOf === "Rooftop PV") return { status: "Approved with conditions", note: `Feed-in limited to ${Math.max(30, Math.round((free / kwOf) * 100) || 70)}% of panel power at noon, because voltage would go above 1.10 p.u. The limit can be lifted after the planned cable upgrade in 2029.`, feeder: a.feeder };
    return { status: "Approved with conditions", note: "Allowed if the device can be switched off for up to 2 hours in the evening peak (heat-pump tariff).", feeder: a.feeder };
  }

  function check(id = sel) {
    setChecking(true);
    window.setTimeout(() => {
      const req = rows.find((x) => x.id === id)!;
      const res = decide(req.kind, req.kw, req.address);
      setRows(rows.map((x) => (x.id === id ? { ...x, ...res } : x)));
      setChecking(false);
      toast(`Checked in 0.8 s: ${res.status.toLowerCase()}`);
    }, 800);
  }

  function addAndCheck() {
    const id = `CR-2611-0${42 + rows.length - connectionRequests.length}`;
    const res = decide(kind, kw, addr);
    setRows([{ id, address: addr, kind, kw, received: "Just now", ...res }, ...rows]);
    setSel(id);
    toast(`Checked in 0.8 s: ${res.status.toLowerCase()}`);
  }

  return (
    <div className="stack">
      <Head title="Connection requests" text="Requests to connect solar, heat pumps, chargers and batteries. Each is checked against the grid model and measured loading in seconds." />
      <Kpis
        items={[
          { label: "Open requests", value: String(rows.filter((x) => x.status === "New" || x.status === "Needs study").length), note: "1 new, 1 needs a study" },
          { label: "Average answer time", value: "1.2 days", note: "was 3 weeks before automatic checks", tone: "good" },
          { label: "Approved automatically", value: "82%", note: "this year" },
          { label: "With conditions", value: "14%", note: "mostly solar feed-in limits" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>Requests</h2>
          <p className="sub">Newest first. Select one to see the decision.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Address</th><th>Type</th><th className="r">Power</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id} className={`click ${x.id === sel ? "sel" : ""}`} onClick={() => setSel(x.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(x.id)}>
                    <td>{x.address}</td>
                    <td>{x.kind}</td>
                    <td className="r">{x.kw} kW</td>
                    <td>{x.received}</td>
                    <td><span className={`status ${TONE[x.status]}`}>{x.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="stack">
          <section className="panel detail">
            <h2>{r.kind}, {r.kw} kW</h2>
            <p className="sub">{r.address}, feeder {r.feeder}</p>
            {r.status === "New" ? (
              <>
                <p style={{ margin: "0 0 12px", fontSize: 14 }}>Not checked yet.</p>
                <button className="btn primary" onClick={() => check()} disabled={checking}>{checking ? "Checking…" : "Check connection"}</button>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 12px" }}><span className={`status ${TONE[r.status]}`}>{r.status}</span></p>
                <p style={{ margin: "0 0 12px", fontSize: 14 }}>{r.note}</p>
                {r.status !== "Needs study" && <button className="btn" onClick={() => toast(`Decision letter for ${r.address} sent to the installer`)}>Send decision to installer</button>}
              </>
            )}
          </section>
          <section className="panel">
            <h2>Quick check</h2>
            <p className="sub">For phone enquiries from installers</p>
            <div className="stack" style={{ gap: 12 }}>
              <label className="field">Address<select value={addr} onChange={(e) => setAddr(e.target.value)}>{ADDRESSES.map((a) => <option key={a.a}>{a.a}</option>)}</select></label>
              <div className="grid-2e" style={{ gap: 12 }}>
                <label className="field">Type<select value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
                <label className="field">Power (kW)<input type="number" min={1} value={kw} onChange={(e) => setKw(+e.target.value)} /></label>
              </div>
              <button className="btn primary" style={{ justifyContent: "center" }} onClick={addAndCheck}>Check and save request</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
