import { useState } from "react";
import { ppas } from "./tradingData";
import { chf, Head, Kpis, Status, Meter } from "./ui";

export default function PPAs() {
  const [sel, setSel] = useState(ppas[0].name);
  const p = ppas.find((x) => x.name === sel)!;
  const mtm = ppas.reduce((s, x) => s + x.mtm, 0);
  const shortfall = p.produced - p.expected;

  return (
    <div className="stack">
      <Head title="PPAs" text="Long-term contracts with power plants. See how much each one actually produced, what that power was worth, and its value today." />
      <Kpis
        items={[
          { label: "Contracts", value: String(ppas.length), note: "24.6 MW contracted" },
          { label: "Value today", value: chf(mtm), note: "mark-to-market, all PPAs", tone: mtm >= 0 ? "good" : "bad" },
          { label: "Produced in November", value: `${ppas.reduce((s, x) => s + x.produced, 0).toLocaleString("de-CH")} MWh`, note: "−4.6% vs. expected" },
          { label: "Guarantees of origin", value: "3 of 4", note: "issued for October" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>Contracts</h2>
          <p className="sub">Select one for details. Prices in CHF/MWh.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Plant</th><th>Type</th><th className="r">Price</th><th className="r">Capture price</th><th className="r">Value today</th></tr></thead>
              <tbody>
                {ppas.map((x) => (
                  <tr key={x.name} className={`click ${x.name === sel ? "sel" : ""}`} onClick={() => setSel(x.name)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(x.name)}>
                    <td>{x.name}</td>
                    <td>{x.type}</td>
                    <td className="r">{x.price.toFixed(2)}</td>
                    <td className="r">{x.capture.toFixed(2)}</td>
                    <td className="r" style={{ color: x.mtm < 0 ? "var(--short)" : "var(--long)" }}>{chf(x.mtm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel detail">
          <h2>{p.name}</h2>
          <p className="sub">{p.seller}, {p.capacity}, until {p.until}</p>
          <dl>
            <div><dt>Produced in November</dt><dd>{p.produced.toLocaleString("de-CH")} MWh</dd></div>
            <div><dt>Expected</dt><dd>{p.expected.toLocaleString("de-CH")} MWh</dd></div>
            <div><dt>Contract price</dt><dd>{p.price.toFixed(2)} CHF/MWh</dd></div>
            <div><dt>Market value of its power</dt><dd>{p.capture.toFixed(2)} CHF/MWh</dd></div>
            <div><dt>Guarantees of origin</dt><dd><Status s={p.goo} /></dd></div>
            <div><dt>Value today</dt><dd>{chf(p.mtm)}</dd></div>
          </dl>
          <p style={{ margin: "0 0 6px", fontSize: 14 }}>Production against expectation</p>
          <Meter used={p.produced} limit={p.expected} />
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--muted)" }}>
            {shortfall < 0
              ? `${Math.abs(shortfall)} MWh short this month. You buy the missing power at market prices, which is the main risk of this contract.`
              : `${shortfall} MWh above expectation this month.`}
          </p>
        </section>
      </div>
    </div>
  );
}
