import { Copy } from "lucide-react";
import { deliveries } from "./forecastData";
import { useToast } from "../../App";
import { Head, Status } from "../trading/ui";

const SNIPPET = `GET /api/v1/forecasts/grid-load
    ?from=2026-11-14T00:00+01:00
    &to=2026-11-15T00:00+01:00
    &resolution=15min&ranges=p10,p50,p90
Authorization: Bearer <token>`;

export default function Delivery() {
  const toast = useToast();
  return (
    <div className="stack">
      <Head title="Delivery" text="Where the forecasts go. Inside Talstrom they flow straight into trading and grid planning; other systems get them by API, file or email." />
      <div className="grid-2">
        <section className="panel">
          <h2>Destinations</h2>
          <p className="sub">Last delivery</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>To</th><th>How</th><th>When</th><th>Last</th><th>Status</th></tr></thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.to}>
                    <td>{d.to}</td>
                    <td>{d.how}</td>
                    <td>{d.every}</td>
                    <td>{d.last}</td>
                    <td><Status s={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>API</h2>
              <p className="sub">For your own systems</p>
            </div>
            <button className="btn" onClick={() => { navigator.clipboard?.writeText(SNIPPET).catch(() => {}); toast("Example request copied"); }}><Copy size={16} /> Copy</button>
          </div>
          <pre className="code">{SNIPPET}</pre>
          <p className="sub" style={{ margin: "12px 0 0" }}>Returns 15-minute values with ranges, the run time and the model version.</p>
        </section>
      </div>
    </div>
  );
}
