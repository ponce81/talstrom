import { limits } from "./tradingData";
import { Head, Kpis, Meter } from "./ui";

export default function Risk() {
  const breaches = limits.filter((l) => l.used > l.limit);
  const near = limits.filter((l) => l.used <= l.limit && l.used / l.limit >= 0.7);

  return (
    <div className="stack">
      <Head title="Risk limits" text="How much of each limit is used right now. Deals that would go over a limit are held for a second sign-off." />
      <Kpis
        items={[
          { label: "Value at risk, 1 day", value: "CHF 1.62 m", note: "65% of the CHF 2.5 m limit" },
          { label: "Limits over", value: String(breaches.length), note: breaches.map((b) => b.owner).join(", ") || "none", tone: breaches.length ? "bad" : "good" },
          { label: "Limits above 70%", value: String(near.length), note: "watch list" },
          { label: "Largest credit exposure", value: "CHF 2.9 m", note: "Axpo Solutions, 73% of limit" },
        ]}
      />
      <section className="panel">
        <h2>All limits</h2>
        <p className="sub">Updated with every deal and every new exchange price</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Limit</th><th>Applies to</th><th style={{ width: "26%" }}>Used</th><th className="r">Used</th><th className="r">Limit</th></tr></thead>
            <tbody>
              {limits.map((l) => {
                const over = l.used > l.limit;
                return (
                  <tr key={l.name}>
                    <td>{l.name}{over && <><br /><small style={{ color: "var(--short)" }}>Over the limit: deal D-88199 waits for approval</small></>}</td>
                    <td>{l.owner}</td>
                    <td><Meter used={l.used} limit={l.limit} /></td>
                    <td className="r" style={{ color: over ? "var(--short)" : undefined, fontWeight: 600 }}>{l.used} {l.unit}</td>
                    <td className="r">{l.limit} {l.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
