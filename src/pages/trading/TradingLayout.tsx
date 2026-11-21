import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ROLES, useRole } from "../../App";
import Positions from "./Positions";
import Deals from "./Deals";
import Schedules from "./Schedules";
import MarketData from "./MarketData";
import Imbalance from "./Imbalance";
import Flexibility from "./Flexibility";
import PPAs from "./PPAs";
import PnL from "./PnL";
import Risk from "./Risk";
import Approvals from "./Approvals";
import Reporting from "./Reporting";
import Invoicing from "./Invoicing";

export const TRADING_PAGES = [
  { group: "Daily operations", items: [
    { path: "positions", label: "Positions", el: <Positions /> },
    { path: "deals", label: "Deals", el: <Deals /> },
    { path: "schedules", label: "Schedules", el: <Schedules /> },
    { path: "market", label: "Market data", el: <MarketData /> },
  ]},
  { group: "Optimisation", items: [
    { path: "imbalance", label: "Imbalance costs", el: <Imbalance /> },
    { path: "flexibility", label: "Flexibility", el: <Flexibility /> },
    { path: "ppas", label: "PPAs", el: <PPAs /> },
  ]},
  { group: "Control", items: [
    { path: "pnl", label: "P&L", el: <PnL /> },
    { path: "risk", label: "Risk limits", el: <Risk /> },
    { path: "approvals", label: "Approvals", el: <Approvals />, badge: 3 },
    { path: "reporting", label: "Reporting", el: <Reporting /> },
    { path: "invoicing", label: "Invoicing", el: <Invoicing /> },
  ]},
];

export const TRADING_LABELS: Record<string, string> = Object.fromEntries(
  TRADING_PAGES.flatMap((g) => g.items.map((i) => [i.path, i.label]))
);

export default function TradingLayout() {
  const { role } = useRole();
  const allowed = ROLES[role].trading;
  const groups = TRADING_PAGES.map((g) => ({ ...g, items: g.items.filter((i) => allowed.includes(i.path)) })).filter((g) => g.items.length);
  const first = groups[0]?.items[0]?.path ?? "positions";

  return (
    <div className="trading">
      <nav className="subnav" aria-label="Trading sections">
        {groups.map((g) => (
          <div className="subnav-group" key={g.group}>
            <span className="subnav-label">{g.group}</span>
            <div className="subnav-items">
              {g.items.map((i) => (
                <NavLink key={i.path} to={i.path} className={({ isActive }) => (isActive ? "sub on" : "sub")}>
                  {i.label}
                  {"badge" in i && i.badge ? <span className="count">{i.badge}</span> : null}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <Routes>
        <Route index element={<Navigate to={first} replace />} />
        {groups.flatMap((g) => g.items).map((i) => (
          <Route key={i.path} path={i.path} element={i.el} />
        ))}
        <Route path="*" element={<Navigate to={first} replace />} />
      </Routes>
    </div>
  );
}
