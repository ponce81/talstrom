import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ROLES, useRole } from "../../App";
import GridModel from "./GridModel";
import MeasuredLoading from "./MeasuredLoading";
import PowerFlow from "../GridPlanning";
import Connections from "./Connections";
import Hosting from "./Hosting";
import Scenarios from "./Scenarios";
import Measures from "./Measures";
import Investments from "./Investments";
import Congestion from "./Congestion";
import ModelHistory from "./ModelHistory";
import GridReports from "./GridReports";
import Team from "./Team";

export const GRID_PAGES = [
  { group: "Understand the grid", items: [
    { path: "model", label: "Grid model", el: <GridModel />, badge: 4 },
    { path: "measured", label: "Measured loading", el: <MeasuredLoading /> },
    { path: "power-flow", label: "Power flow", el: <PowerFlow /> },
  ]},
  { group: "Connect and plan", items: [
    { path: "connections", label: "Connection requests", el: <Connections />, badge: 1 },
    { path: "hosting", label: "Hosting capacity", el: <Hosting /> },
    { path: "scenarios", label: "Scenarios", el: <Scenarios /> },
    { path: "measures", label: "Measures", el: <Measures /> },
    { path: "investments", label: "Investment plan", el: <Investments /> },
  ]},
  { group: "Operate and control", items: [
    { path: "congestion", label: "Congestion forecast", el: <Congestion /> },
    { path: "history", label: "Model history", el: <ModelHistory /> },
    { path: "reports", label: "Reports", el: <GridReports /> },
    { path: "team", label: "Team and access", el: <Team /> },
  ]},
];

export const GRID_LABELS: Record<string, string> = Object.fromEntries(GRID_PAGES.flatMap((g) => g.items.map((i) => [i.path, i.label])));

export default function GridLayout() {
  const { role } = useRole();
  const allowed = ROLES[role].grid;
  const groups = GRID_PAGES.map((g) => ({ ...g, items: g.items.filter((i) => allowed.includes(i.path)) })).filter((g) => g.items.length);
  const first = groups[0]?.items[0]?.path ?? "power-flow";

  return (
    <div>
      <nav className="subnav" aria-label="Grid planning sections">
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
        <Route index element={<Navigate to="power-flow" replace />} />
        {groups.flatMap((g) => g.items).map((i) => <Route key={i.path} path={i.path} element={i.el} />)}
        <Route path="*" element={<Navigate to={first} replace />} />
      </Routes>
    </div>
  );
}
