import { useState } from "react";
import { Bar, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { flexAssets, flexPlan } from "./tradingData";
import { useToast } from "../../App";
import { axis, chf, Head, Kpis } from "./ui";

export default function Flexibility() {
  const toast = useToast();
  const [applied, setApplied] = useState(false);
  const [asset, setAsset] = useState(flexAssets[0].name);
  const total = flexAssets.reduce((s, a) => s + a.value, 0);

  return (
    <div className="stack">
      <Head
        title="Flexibility"
        text="Batteries, heat pumps and chargers you can shift. The plan below is optimised against Saturday's prices and your open position."
        actions={
          <button className="btn primary" disabled={applied} onClick={() => { setApplied(true); toast("Plan for Saturday applied. Battery and heat-pump pool will follow it."); }}>
            {applied ? "Plan applied" : "Apply plan for Saturday"}
          </button>
        }
      />
      <Kpis
        items={[
          { label: "Value of the plan", value: chf(total), note: "vs. not using flexibility", tone: "good" },
          { label: "Covers of your evening gap", value: "2.6 MW", note: "of the 6 MW short, 17–20h" },
          { label: "Battery cycles", value: "1.4", note: "within the 2 per day warranty" },
          { label: "Grid limits", value: "Respected", note: "Oberried 3 kept under 95%", tone: "good" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head" style={{ marginBottom: 6 }}>
            <div>
              <h2>Plan for Saturday: {asset}</h2>
              <p className="sub" style={{ margin: 0 }}>Bars: charging (below zero) and discharging (above). Line: charge level in MWh.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={flexPlan} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={axis} tickLine={false} interval={1} />
              <YAxis yAxisId="mw" tick={axis} tickLine={false} axisLine={false} width={36} domain={[-4, 8]} ticks={[-4, -2, 0, 2, 4, 6, 8]} />
              <Tooltip />
              <ReferenceLine yAxisId="mw" y={0} stroke="#5b6c76" />
              <Bar yAxisId="mw" dataKey="dispatch" name="MW (+ discharge, − charge)" radius={[3, 3, 3, 3]}>
                {flexPlan.map((d) => <Cell key={d.t} fill={d.dispatch > 0 ? "#2e8a5a" : "#0e6b70"} />)}
              </Bar>
              <Line yAxisId="mw" dataKey="soc" name="Charge level, MWh" stroke="#e0a520" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>Assets</h2>
          <p className="sub">Select one to see its plan</p>
          <ul className="list">
            {flexAssets.map((a) => (
              <li key={a.name}>
                <button className={`list-btn ${asset === a.name ? "on" : ""}`} onClick={() => setAsset(a.name)}>
                  <strong>{a.name}</strong>
                  <small>{a.type}, {a.power}, {a.energy}</small>
                  <small>{a.state}. Plan value {chf(a.value)}</small>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
