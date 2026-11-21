import { feedIn } from "./settleData";
import { useToast } from "../../App";
import { chf, Head, Kpis } from "../trading/ui";

export default function Prosumers() {
  const toast = useToast();
  const mwh = feedIn.reduce((s, f) => s + f.mwh, 0);
  const amount = feedIn.reduce((s, f) => s + f.amount, 0);
  const systems = feedIn.reduce((s, f) => s + f.systems, 0);

  return (
    <div className="stack">
      <Head
        title="Feed-in"
        text="Payments to customers who feed solar, hydro or battery power into the grid, and the guarantees of origin that go with it."
        actions={<button className="btn primary" onClick={() => toast(`Payment file for ${systems.toLocaleString("de-CH")} producers created for the bank`)}>Create payment file</button>}
      />
      <Kpis
        items={[
          { label: "Producers paid", value: systems.toLocaleString("de-CH"), note: "October 2026" },
          { label: "Energy fed in", value: `${mwh.toLocaleString("de-CH", { maximumFractionDigits: 0 })} MWh`, note: "−38% vs. September (less sun)" },
          { label: "Payments", value: chf(amount), note: "before VAT" },
          { label: "Guarantees of origin", value: `${feedIn.reduce((s, f) => s + f.goo, 0).toLocaleString("de-CH")}`, note: "MWh registered with Pronovo" },
        ]}
      />
      <section className="panel">
        <h2>October 2026 by producer type</h2>
        <p className="sub">Rates in Rp./kWh, based on the quarterly market price</p>
        <table>
          <thead><tr><th>Type</th><th className="r">Systems</th><th className="r">Fed in</th><th className="r">Rate</th><th className="r">Payment</th><th className="r">Guarantees of origin</th></tr></thead>
          <tbody>
            {feedIn.map((f) => (
              <tr key={f.kind}>
                <td>{f.kind}</td>
                <td className="r">{f.systems.toLocaleString("de-CH")}</td>
                <td className="r">{f.mwh.toLocaleString("de-CH", { minimumFractionDigits: 1 })} MWh</td>
                <td className="r">{f.rate.toFixed(1)}</td>
                <td className="r">{chf(f.amount)}</td>
                <td className="r">{f.goo ? `${f.goo.toLocaleString("de-CH")} MWh` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
