import { useState } from "react";
import { congestion } from "./gridData";
import { useToast } from "../../App";
import { Head, Kpis } from "../trading/ui";

function cellColor(v: number) {
  if (v >= 95) return "#b8443a";
  if (v >= 85) return "#e0a520";
  if (v >= 65) return "#4f8f93";
  if (v >= 40) return "#9cc9c6";
  return "#e3eaed";
}

export default function Congestion() {
  const toast = useToast();
  const [requested, setRequested] = useState(false);
  const hot = congestion.flatMap((f) => f.hours.map((v, h) => ({ f: f.name, h, v }))).filter((x) => x.v >= 95);

  return (
    <div className="stack">
      <Head
        title="Congestion forecast"
        text="Tomorrow's loading of each feeder, hour by hour, from the same grid model and the live load forecast. Where it gets tight, ask the trading desk for flexibility."
        actions={
          <button className="btn primary" disabled={requested} onClick={() => { setRequested(true); toast("Flexibility request sent: reduce Oberried 3 by 0.5 MW, Sat 18–19h. It appears in Trading, Flexibility."); }}>
            {requested ? "Flexibility requested" : "Request flexibility"}
          </button>
        }
      />
      <Kpis
        items={[
          { label: "Hours above 95%", value: String(hot.length), note: hot.length ? `${hot[0].f}, ${hot[0].h}–${hot[0].h + 1}h` : "none", tone: hot.length ? "bad" : "good" },
          { label: "Highest loading", value: `${Math.max(...congestion.flatMap((f) => f.hours))}%`, note: "Saturday 14 Nov" },
          { label: "Flexibility available", value: "2.1 MW", note: "heat-pump pool and battery" },
          { label: "Forecast updated", value: "15:00", note: "next at 18:00" },
        ]}
      />
      <section className="panel">
        <h2>Feeder loading, Saturday 14 November</h2>
        <p className="sub">Percent of each feeder's limit, by hour</p>
        <div className="table-wrap">
          <div className="heat" style={{ gridTemplateColumns: `130px repeat(24, minmax(26px, 1fr))` }}>
            <div />
            {Array.from({ length: 24 }, (_, h) => <div key={h} className="hh">{h % 3 === 0 ? `${String(h).padStart(2, "0")}h` : ""}</div>)}
            {congestion.map((f) => (
              <div key={f.name} style={{ display: "contents" }}>
                <div className="hn">{f.name}</div>
                {f.hours.map((v, h) => (
                  <div key={h} className="hc" style={{ background: cellColor(v), color: v >= 65 ? "#fff" : "#172630" }} title={`${f.name}, ${h}–${h + 1}h: ${v}%`}>
                    {v >= 85 ? v : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="scale" style={{ marginTop: 12 }}>
          <span><i style={{ background: "#9cc9c6" }} />40–65%</span>
          <span><i style={{ background: "#4f8f93" }} />65–85%</span>
          <span><i style={{ background: "#e0a520" }} />85–95%</span>
          <span><i style={{ background: "#b8443a" }} />95% and above</span>
        </div>
      </section>
    </div>
  );
}
