import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { switches as initial, switchVolume } from "./settleData";
import { useToast } from "../../App";
import { axis, Head, Status } from "../trading/ui";

export default function Switching() {
  const toast = useToast();
  const [rows, setRows] = useState(initial);

  return (
    <div className="stack">
      <Head title="Supplier switching" text="Customers moving between suppliers: checks, deadlines and the messages to both suppliers. Ready for the full market opening, when every household can switch." />
      <div className="grid-2">
        <section className="panel">
          <h2>Switches</h2>
          <p className="sub">Newest first</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Address</th><th>From → to</th><th>Switch date</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>{s.address}<br /><small style={{ color: "var(--muted)" }}>{s.id}, received {s.received}</small></td>
                    <td style={{ fontSize: 13.5 }}>{s.from}<br />→ {s.to}</td>
                    <td>{s.date}</td>
                    <td><Status s={s.status} /></td>
                    <td className="r">
                      {s.status === "Needs review" && (
                        <button className="btn primary" onClick={() => { setRows(rows.map((x) => (x.id === s.id ? { ...x, status: "Accepted" } : x))); toast("Switch accepted. Both suppliers informed, metering point moves on 1 Dec."); }}>Accept</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sub" style={{ margin: "12px 0 0" }}>Bahnhofstrasse 22 arrived close to the 10-day deadline. Accepting keeps 1 Dec as switch date.</p>
        </section>
        <section className="panel">
          <h2>Switches per year</h2>
          <p className="sub">* Estimate if all households can switch from 2027</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={switchVolume} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={44} />
              <Tooltip />
              <Bar dataKey="switches" name="Switches" radius={[4, 4, 0, 0]}>
                {switchVolume.map((v) => <Cell key={v.t} fill={v.t.includes("*") ? "#9cc9c6" : "#0e6b70"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
