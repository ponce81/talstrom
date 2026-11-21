import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ROLES, useRole } from "../../App";
import Runs from "../Settlement";
import MeterData from "./MeterData";
import Exceptions from "./Exceptions";
import BalanceGroups from "./BalanceGroups";
import GridBilling from "./GridBilling";
import Communities from "./Communities";
import Prosumers from "./Prosumers";
import Switching from "./Switching";
import Reconciliation from "./Reconciliation";
import Simulation from "./Simulation";
import Audit from "./Audit";
import PeriodClose from "./PeriodClose";
import RegReports from "./RegReports";

export const SETTLE_PAGES = [
  { group: "Data", items: [
    { path: "meter-data", label: "Metering data", el: <MeterData /> },
    { path: "exceptions", label: "Exceptions", el: <Exceptions />, badge: 5 },
  ]},
  { group: "Settle", items: [
    { path: "runs", label: "Runs", el: <Runs /> },
    { path: "balance-groups", label: "Balance groups", el: <BalanceGroups /> },
    { path: "grid-billing", label: "Grid usage", el: <GridBilling /> },
    { path: "communities", label: "LEG and ZEV", el: <Communities /> },
    { path: "prosumers", label: "Feed-in", el: <Prosumers /> },
    { path: "switching", label: "Supplier switching", el: <Switching /> },
  ]},
  { group: "Check and close", items: [
    { path: "reconciliation", label: "Reconciliation", el: <Reconciliation /> },
    { path: "simulation", label: "Simulation", el: <Simulation /> },
    { path: "audit", label: "Audit trail", el: <Audit /> },
    { path: "close", label: "Period close", el: <PeriodClose /> },
    { path: "reports", label: "Regulatory reports", el: <RegReports /> },
  ]},
];

export const SETTLE_LABELS: Record<string, string> = Object.fromEntries(SETTLE_PAGES.flatMap((g) => g.items.map((i) => [i.path, i.label])));

export default function SettleLayout() {
  const { role } = useRole();
  const allowed = ROLES[role].settlement;
  const groups = SETTLE_PAGES.map((g) => ({ ...g, items: g.items.filter((i) => allowed.includes(i.path)) })).filter((g) => g.items.length);
  const first = groups.flatMap((g) => g.items).find((i) => i.path === "runs")?.path ?? groups[0]?.items[0]?.path ?? "runs";

  return (
    <div>
      <nav className="subnav" aria-label="Settlement sections">
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
        {groups.flatMap((g) => g.items).map((i) => <Route key={i.path} path={i.path} element={i.el} />)}
        <Route path="*" element={<Navigate to={first} replace />} />
      </Routes>
    </div>
  );
}
