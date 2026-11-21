import { useState } from "react";
import { deals as initial, Deal } from "./tradingData";
import { useToast } from "../../App";
import { Head, Status } from "./ui";

type Venue = "EPEX intraday" | "Bilateral" | "EEX futures";

export default function Deals() {
  const toast = useToast();
  const [deals, setDeals] = useState<Deal[]>(initial);
  const [filter, setFilter] = useState<"All" | "Open items">("All");
  const [venue, setVenue] = useState<Venue>("EPEX intraday");
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [product, setProduct] = useState("Sat 14, 17–20h");
  const [mw, setMw] = useState(6.0);
  const [price, setPrice] = useState(138);
  const [cp, setCp] = useState("Axpo Solutions");

  const shown = deals.filter((d) => filter === "All" || d.status !== "Confirmed");

  function save() {
    const overLimit = mw > 10;
    const status: Deal["status"] = overLimit ? "Awaiting approval" : venue === "Bilateral" ? "Awaiting confirmation" : "Confirmed";
    const d: Deal = {
      id: `D-${88214 + deals.length}`, time: "16:31", product, side, mw, price, venue,
      counterparty: venue === "Bilateral" ? cp : venue === "EEX futures" ? "ECC clearing" : "EPEX Spot", trader: "L. Meier", status,
    };
    setDeals([d, ...deals]);
    toast(
      overLimit ? `Deal ${d.id} saved and sent for approval: it is over your 10 MW limit`
      : venue === "Bilateral" ? `Deal ${d.id} saved. Confirmation sent to ${cp}`
      : `Order placed: ${side.toLowerCase()} ${mw} MW ${product} at ${price.toFixed(2)}`
    );
  }

  return (
    <div className="stack">
      <Head title="Deals" text="Every trade in one place: exchange orders, futures and bilateral contracts, with their confirmation status." />
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head" style={{ marginBottom: 12 }}>
            <div>
              <h2>Deals today</h2>
              <p className="sub" style={{ margin: 0 }}>Newest first</p>
            </div>
            <div className="seg" role="tablist" aria-label="Filter deals">
              {(["All", "Open items"] as const).map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Time</th><th>Product</th><th>Side</th><th className="r">MW</th><th className="r">Price</th><th>Counterparty</th><th>Status</th></tr>
              </thead>
              <tbody>
                {shown.map((d) => (
                  <tr key={d.id}>
                    <td>{d.time}</td>
                    <td>{d.product}<br /><small style={{ color: "var(--muted)" }}>{d.id}, {d.venue}</small></td>
                    <td className={d.side === "Buy" ? "buy" : "sell"}>{d.side}</td>
                    <td className="r">{d.mw}</td>
                    <td className="r">{d.price.toFixed(2)}</td>
                    <td>{d.counterparty}</td>
                    <td><Status s={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>New deal</h2>
          <p className="sub">Exchange orders go out directly. Bilateral deals wait for the counterparty's confirmation.</p>
          <div className="stack" style={{ gap: 14 }}>
            <label className="field">
              Where
              <select value={venue} onChange={(e) => setVenue(e.target.value as Venue)}>
                <option>EPEX intraday</option><option>EEX futures</option><option>Bilateral</option>
              </select>
            </label>
            {venue === "Bilateral" && (
              <label className="field">
                Counterparty
                <select value={cp} onChange={(e) => setCp(e.target.value)}>
                  <option>Axpo Solutions</option><option>Alpiq</option><option>BKW Energie</option><option>Energie 360°</option>
                </select>
              </label>
            )}
            <div className="seg" role="radiogroup" aria-label="Side">
              {(["Buy", "Sell"] as const).map((s) => (
                <button key={s} role="radio" aria-checked={side === s} className={side === s ? "on" : ""} onClick={() => setSide(s)}>{s}</button>
              ))}
            </div>
            <label className="field">
              Product
              <select value={product} onChange={(e) => setProduct(e.target.value)}>
                <option>Sat 14, 17–20h</option><option>Sat 14, 18–19h</option><option>Sat 14, base</option><option>Dec 2026, peak</option><option>Jan 2027, base</option><option>Q1 2027, base</option>
              </select>
            </label>
            <div className="grid-2e" style={{ gap: 12 }}>
              <label className="field">
                Quantity (MW)
                <input type="number" min={0.1} step={0.1} value={mw} onChange={(e) => setMw(+e.target.value)} />
              </label>
              <label className="field">
                Price (CHF/MWh)
                <input type="number" step={0.01} value={price} onChange={(e) => setPrice(+e.target.value)} />
              </label>
            </div>
            {mw > 10 && <p className="hint">This is over your 10 MW single-deal limit. It will need a second sign-off.</p>}
            <button className="btn primary" style={{ justifyContent: "center" }} onClick={save}>
              {venue === "Bilateral" ? "Save deal" : "Place order"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
