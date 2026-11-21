import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ROLES, useRole } from "../../App";
import LoadProduction from "../Forecasting";
import Segments from "./Segments";
import BehindMeter from "./BehindMeter";
import Prices from "./Prices";
import Ranges from "./Ranges";
import Why from "./Why";
import Events from "./Events";
import History from "./History";
import Feeds from "./Feeds";
import Accuracy from "./Accuracy";
import Models from "./Models";
import Delivery from "./Delivery";
import Alerts from "./Alerts";

export const FORECAST_PAGES = [
  { group: "Forecasts", items: [
    { path: "load", label: "Load and production", el: <LoadProduction /> },
    { path: "segments", label: "Segments and areas", el: <Segments /> },
    { path: "btm", label: "Behind-the-meter solar", el: <BehindMeter /> },
    { path: "prices", label: "Prices", el: <Prices /> },
  ]},
  { group: "Understand and adjust", items: [
    { path: "ranges", label: "Ranges", el: <Ranges /> },
    { path: "why", label: "Why it changed", el: <Why /> },
    { path: "events", label: "Events and adjustments", el: <Events /> },
    { path: "history", label: "Forecast history", el: <History /> },
  ]},
  { group: "Run and control", items: [
    { path: "feeds", label: "Data feeds", el: <Feeds /> },
    { path: "accuracy", label: "Accuracy", el: <Accuracy /> },
    { path: "models", label: "Models", el: <Models />, badge: 1 },
    { path: "delivery", label: "Delivery", el: <Delivery /> },
    { path: "alerts", label: "Alerts", el: <Alerts />, badge: 2 },
  ]},
];

export const FORECAST_LABELS: Record<string, string> = Object.fromEntries(FORECAST_PAGES.flatMap((g) => g.items.map((i) => [i.path, i.label])));

export default function ForecastLayout() {
  const { role } = useRole();
  const allowed = ROLES[role].forecasting;
  const groups = FORECAST_PAGES.map((g) => ({ ...g, items: g.items.filter((i) => allowed.includes(i.path)) })).filter((g) => g.items.length);
  const first = groups[0]?.items[0]?.path ?? "load";

  return (
    <div>
      <nav className="subnav" aria-label="Forecasting sections">
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
