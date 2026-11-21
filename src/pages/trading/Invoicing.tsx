import { useState } from "react";
import { invoices } from "./tradingData";
import { useToast } from "../../App";
import { chf, Head, Kpis, Status } from "./ui";

export default function Invoicing() {
  const toast = useToast();
  const [sel, setSel] = useState("INV-AL-2610");
  const inv = invoices.find((i) => i.id === sel)!;
  const diffs = invoices.filter((i) => i.status === "Difference");
  const diffSum = diffs.reduce((s, i) => s + ((i.invoiced ?? 0) - i.expected), 0);

  return (
    <div className="stack">
      <Head title="Invoicing" text="Counterparty invoices checked against your own deals and delivered volumes. Only differences need your attention." />
      <Kpis
        items={[
          { label: "October invoices", value: `${invoices.filter((i) => i.invoiced !== null).length} of ${invoices.length}`, note: "received" },
          { label: "Matched", value: String(invoices.filter((i) => i.status === "Matched").length), note: "no action needed", tone: "good" },
          { label: "Differences", value: chf(diffSum, 2), note: `${diffs.length} invoices billed higher than expected`, tone: "bad" },
          { label: "Payment run", value: "20 Nov", note: "matched invoices only" },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>October 2026</h2>
          <p className="sub">Select an invoice to see what differs</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Counterparty</th><th className="r">Expected</th><th className="r">Invoiced</th><th className="r">Difference</th><th>Status</th></tr></thead>
              <tbody>
                {invoices.map((i) => {
                  const d = i.invoiced === null ? null : i.invoiced - i.expected;
                  return (
                    <tr key={i.id} className={`click ${i.id === sel ? "sel" : ""}`} onClick={() => setSel(i.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(i.id)}>
                      <td>{i.counterparty}</td>
                      <td className="r">{chf(i.expected, 2)}</td>
                      <td className="r">{i.invoiced === null ? "–" : chf(i.invoiced, 2)}</td>
                      <td className="r" style={{ color: d ? "var(--short)" : undefined }}>{d === null ? "–" : d === 0 ? "0" : chf(d, 2)}</td>
                      <td><Status s={i.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel detail">
          <h2>{inv.counterparty}</h2>
          <p className="sub">{inv.id}, {inv.period}</p>
          {inv.status === "Difference" ? (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 14 }}>
                {inv.counterparty.startsWith("Alpiq")
                  ? "The invoice prices 12 Oct, 18–19h at 142.10 CHF/MWh. Your deal D-87422 has 130.80. The volume matches."
                  : "Swissgrid's imbalance volume for 21 Oct is 14.2 MWh higher than your meter data. Corrected meter data arrived after their cut-off."}
              </p>
              <div className="row-actions">
                <button className="btn" onClick={() => toast(`Dispute sent to ${inv.counterparty} with the deal confirmation attached`)}>Dispute</button>
                <button className="btn primary" onClick={() => toast("Difference accepted and booked. It is recorded in the audit trail.")}>Accept difference</button>
              </div>
            </>
          ) : inv.status === "Not received" ? (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 14 }}>Expected by 10 November. Payment is due in 30 days from receipt.</p>
              <button className="btn" onClick={() => toast(`Reminder sent to ${inv.counterparty}`)}>Send reminder</button>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Every line matches your deals and delivered volumes. It is included in the next payment run.</p>
          )}
        </section>
      </div>
    </div>
  );
}
