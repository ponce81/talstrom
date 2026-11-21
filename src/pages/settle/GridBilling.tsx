import { Download } from "lucide-react";
import { tariffs } from "./settleData";
import { useToast } from "../../App";
import { chf, Head, Kpis } from "../trading/ui";

export default function GridBilling() {
  const toast = useToast();
  const total = tariffs.reduce((s, t) => s + t.revenue, 0);
  return (
    <div className="stack">
      <Head
        title="Grid usage"
        text="Grid charges for every connection in October, calculated per tariff from the settled 15-minute values. The billing data goes to SAP for the invoices."
        actions={<button className="btn" onClick={() => toast("Billing data for October sent to SAP IS-U (45,136 lines)")}><Download size={16} /> Send to SAP</button>}
      />
      <Kpis
        items={[
          { label: "Grid usage, October", value: chf(total), note: "all tariffs" },
          { label: "Customers on dynamic tariff", value: "1,820", note: "4.0% of households" },
          { label: "Their average saving", value: "CHF 6.40", note: "per month vs. standard tariff", tone: "good" },
          { label: "Peak load shifted", value: "1.1 MW", note: "evening peak, dynamic + heat-pump tariffs" },
        ]}
      />
      <section className="panel">
        <h2>Tariffs</h2>
        <p className="sub">Energy in Rp./kWh, power in CHF per kW and month, base fee in CHF per month</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tariff</th><th>How it's charged</th><th className="r">Customers</th><th className="r">Energy</th><th className="r">Power</th><th className="r">Base fee</th><th className="r">October</th></tr></thead>
            <tbody>
              {tariffs.map((t) => (
                <tr key={t.name}>
                  <td>{t.name}</td>
                  <td style={{ fontSize: 13.5 }}>{t.kind}</td>
                  <td className="r">{t.customers.toLocaleString("de-CH")}</td>
                  <td className="r">{t.energy.toFixed(1)}</td>
                  <td className="r">{t.power === null ? "–" : t.power.toFixed(1)}</td>
                  <td className="r">{t.base.toFixed(2)}</td>
                  <td className="r">{chf(t.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
