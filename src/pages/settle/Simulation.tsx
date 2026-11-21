import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useToast } from "../../App";
import { axis, chf, Head, Kpis } from "../trading/ui";

export default function Simulation() {
  const toast = useToast();
  const [peakRate, setPeakRate] = useState(12);
  const [offRate, setOffRate] = useState(5);
  const [share, setShare] = useState(15);
  const [ran, setRan] = useState(false);

  // Very simple mock model of a time-of-use household grid tariff applied to 2025 data
  const today = 2_904_300 * 12;
  const sim = Math.round(today * ((peakRate * 0.42 + offRate * 0.58) / 7.9));
  const shifted = +((share / 100) * (peakRate - offRate) * 0.11).toFixed(2);
  const bills = [
    { group: "Small flat", now: 410, sim: Math.round(410 * (sim / today) * 0.97) },
    { group: "House, gas heating", now: 690, sim: Math.round(690 * (sim / today)) },
    { group: "House, heat pump", now: 1_480, sim: Math.round(1_480 * (sim / today) * 0.92) },
    { group: "House, solar + EV", now: 960, sim: Math.round(960 * (sim / today) * 0.88) },
  ];

  return (
    <div className="stack">
      <Head
        title="Simulation"
        text="Try a new tariff on last year's real 15-minute data before it goes live. See what it does to revenue, peak load and typical customers' bills."
        actions={<button className="btn primary" onClick={() => { setRan(true); toast("Simulation finished on 2025 data: 36,410 households, 1.28 billion values"); }}>Run on 2025 data</button>}
      />
      <section className="panel">
        <h2>New household tariff: time of use</h2>
        <p className="sub">Rp./kWh. Peak hours are 17–21h on weekdays.</p>
        <div className="grid-2e" style={{ gap: 18 }}>
          <label className="slider">Peak rate<input type="range" min={6} max={20} step={0.5} value={peakRate} onChange={(e) => setPeakRate(+e.target.value)} /><span className="num">{peakRate.toFixed(1)}</span></label>
          <label className="slider">Off-peak rate<input type="range" min={2} max={10} step={0.5} value={offRate} onChange={(e) => setOffRate(+e.target.value)} /><span className="num">{offRate.toFixed(1)}</span></label>
          <label className="slider">Customers who shift load<input type="range" min={0} max={50} step={5} value={share} onChange={(e) => setShare(+e.target.value)} /><span className="num">{share}%</span></label>
        </div>
      </section>
      {ran ? (
        <>
          <Kpis
            items={[
              { label: "Yearly revenue", value: chf(sim), note: `${sim >= today ? "+" : "−"}${Math.abs(((sim - today) / today) * 100).toFixed(1)}% vs. today`, tone: Math.abs(sim - today) / today > 0.03 ? "bad" : "good" },
              { label: "Evening peak", value: `−${shifted} MW`, note: "shifted out of 17–21h" },
              { label: "Bills going up", value: `${bills.filter((b) => b.sim > b.now).length} of 4`, note: "typical customer types" },
              { label: "Regulatory check", value: Math.abs(sim - today) / today <= 0.03 ? "Passes" : "Too far off", note: "revenue must stay cost-based", tone: Math.abs(sim - today) / today <= 0.03 ? "good" : "bad" },
            ]}
          />
          <section className="panel">
            <h2>Yearly grid bill, typical customers</h2>
            <p className="sub">CHF per year</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bills} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="group" tick={axis} tickLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} width={48} />
                <Tooltip formatter={(v: number) => chf(v)} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="now" name="Today" fill="#c8d3d8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="sim" name="New tariff" fill="#0e6b70" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </>
      ) : (
        <section className="panel"><p style={{ margin: 0, color: "var(--muted)" }}>Set the rates, then run the simulation on 2025 data to see the results.</p></section>
      )}
    </div>
  );
}
