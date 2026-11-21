import { ReactNode } from "react";

export const chf = (n: number, digits = 0) =>
  (n < 0 ? "−" : "") + "CHF " + Math.abs(n).toLocaleString("de-CH", { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const signed = (n: number, digits = 1) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(digits);

export function Head({ title, text, actions }: { title: string; text: string; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export function Kpis({ items }: { items: { label: string; value: string; note: string; tone?: "good" | "bad" | "" }[] }) {
  return (
    <section className="kpis">
      {items.map((k) => (
        <div className="kpi" key={k.label}>
          <span>{k.label}</span>
          <strong className="num">{k.value}</strong>
          <small className={k.tone ?? ""}>{k.note}</small>
        </div>
      ))}
    </section>
  );
}

const TONE: Record<string, string> = {
  Confirmed: "s-completed", Accepted: "s-completed", Matched: "s-completed", Connected: "s-completed", Issued: "s-completed", Sent: "s-running",
  "Awaiting confirmation": "s-review", "Awaiting approval": "s-review", "Ready to send": "s-review", Delayed: "s-review", Difference: "s-review", Pending: "s-review",
  Rejected: "s-bad", "Not received": "s-queued", Queued: "s-queued",
  "Needs review": "s-review", Completed: "s-completed", Estimated: "s-running", Corrected: "s-completed", Locked: "s-queued", Open: "s-running", "In review": "s-review",
};

export function Status({ s }: { s: string }) {
  return <span className={`status ${TONE[s] ?? "s-queued"}`}>{s}</span>;
}

export function Meter({ used, limit }: { used: number; limit: number }) {
  const pct = (used / limit) * 100;
  const c = pct >= 100 ? "var(--short)" : pct >= 80 ? "#e0a520" : "var(--hydro)";
  return (
    <div className="load-bar" role="meter" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.min(pct, 100)}%`, background: c }} />
    </div>
  );
}

export const axis = { fontSize: 12, fill: "#5b6c76" };
