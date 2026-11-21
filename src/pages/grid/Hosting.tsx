import { useState } from "react";
import { areas } from "./gridData";
import { Head } from "../trading/ui";

type Kind = "pv" | "hp" | "ev";
const LABEL: Record<Kind, string> = { pv: "Rooftop solar", hp: "Heat pumps", ev: "EV chargers" };

function color(kw: number) {
  if (kw < 50) return "#b8443a";
  if (kw < 200) return "#e0a520";
  if (kw < 450) return "#4f8f93";
  return "#9cc9c6";
}

export default function Hosting() {
  const [kind, setKind] = useState<Kind>("pv");
  const [sel, setSel] = useState("A2");
  const a = areas.find((x) => x.id === sel)!;

  return (
    <div className="stack">
      <Head
        title="Hosting capacity"
        text="How much more solar, heat-pump or charger power each part of the grid can take without reinforcement. Share this map with installers to cut down on requests that can't be approved."
        actions={
          <div className="seg" role="tablist" aria-label="Type">
            {(Object.keys(LABEL) as Kind[]).map((k) => (
              <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{LABEL[k]}</button>
            ))}
          </div>
        }
      />
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{LABEL[kind]}: capacity left</h2>
              <p className="sub">Click an area for details</p>
            </div>
            <div className="scale">
              <span><i style={{ background: "#b8443a" }} />under 50 kW</span>
              <span><i style={{ background: "#e0a520" }} />50–200</span>
              <span><i style={{ background: "#4f8f93" }} />200–450</span>
              <span><i style={{ background: "#9cc9c6" }} />more</span>
            </div>
          </div>
          <svg viewBox="0 0 760 430" className="feeder-map" role="img" aria-label="Hosting capacity map">
            <path d="M0 210 C 180 230, 380 190, 760 220" stroke="#c8d3d8" strokeWidth={10} fill="none" />
            <path d="M330 0 C 320 160, 360 300, 340 430" stroke="#c8d3d8" strokeWidth={6} fill="none" />
            {areas.map((x) => {
              const v = x[kind];
              const [cx, cy] = x.pts.split(" ").map((p) => p.split(",").map(Number)).reduce(([sx, sy], [px, py], _, arr) => [sx + px / arr.length, sy + py / arr.length], [0, 0]);
              return (
                <g key={x.id} onClick={() => setSel(x.id)} style={{ cursor: "pointer" }} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(x.id)}>
                  <polygon points={x.pts} fill={color(v)} fillOpacity={0.85} stroke={x.id === sel ? "#172630" : "#fff"} strokeWidth={x.id === sel ? 3 : 2} />
                  <text x={cx} y={cy - 4} textAnchor="middle" fontSize={12} fontWeight={600} fill={v < 200 ? "#fff" : "#172630"}>{x.name}</text>
                  <text x={cx} y={cy + 13} textAnchor="middle" fontSize={12} fill={v < 200 ? "#fff" : "#172630"}>{v} kW</text>
                </g>
              );
            })}
          </svg>
        </section>
        <section className="panel detail">
          <h2>{a.name}</h2>
          <p className="sub">Capacity left before a limit is reached</p>
          <dl>
            <div><dt>Rooftop solar</dt><dd style={{ color: a.pv < 50 ? "var(--short)" : undefined }}>{a.pv} kW</dd></div>
            <div><dt>Heat pumps</dt><dd>{a.hp} kW</dd></div>
            <div><dt>EV chargers</dt><dd>{a.ev} kW</dd></div>
            <div><dt>First limit hit</dt><dd>{a.pv < 50 ? "Voltage at noon" : a.hp < 100 ? "Transformer in winter" : "None soon"}</dd></div>
          </dl>
          <p style={{ margin: 0, fontSize: 14 }}>
            {a.pv < 50
              ? "New solar here gets a feed-in limit until the cable upgrade in 2029. A battery or heat-pump flexibility would add about 150 kW."
              : "New connections up to these values are approved automatically."}
          </p>
        </section>
      </div>
    </div>
  );
}
