import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Activity, LineChart, Receipt, ArrowLeftRight, Network, ChevronDown, Bell } from "lucide-react";
import Overview from "./pages/Overview";
import ForecastLayout, { FORECAST_LABELS } from "./pages/forecast/ForecastLayout";
import SettleLayout, { SETTLE_LABELS } from "./pages/settle/SettleLayout";
import Trading from "./pages/Trading";
import GridLayout, { GRID_LABELS } from "./pages/grid/GridLayout";
import { TODAY } from "./data";
import { TRADING_LABELS } from "./pages/trading/TradingLayout";

export type Role = "dso" | "trader" | "settlement" | "admin";

const ALL_TRADING = ["positions", "deals", "schedules", "market", "imbalance", "flexibility", "ppas", "pnl", "risk", "approvals", "reporting", "invoicing"];

const ALL_GRID = ["model", "measured", "power-flow", "connections", "hosting", "scenarios", "measures", "investments", "congestion", "history", "reports", "team"];

const ALL_SETTLE = ["meter-data", "exceptions", "runs", "balance-groups", "grid-billing", "communities", "prosumers", "switching", "reconciliation", "simulation", "audit", "close", "reports"];
const ALL_FORECAST = ["load", "segments", "btm", "prices", "ranges", "why", "events", "history", "feeds", "accuracy", "models", "delivery", "alerts"];

export const ROLES: Record<Role, { label: string; person: string; pages: string[]; trading: string[]; grid: string[]; forecasting: string[]; settlement: string[] }> = {
  dso: { label: "Grid operator", person: "Andrea Keller", pages: ["/", "/grid", "/forecasting", "/settlement"], trading: [], grid: ALL_GRID, forecasting: ["load", "segments", "btm", "ranges", "why", "events", "history", "accuracy", "alerts"], settlement: ["meter-data", "exceptions", "runs", "balance-groups", "grid-billing", "communities", "prosumers", "switching", "simulation", "audit", "reports"] },
  trader: { label: "Energy trader", person: "Luca Meier", pages: ["/", "/trading", "/forecasting"], trading: ALL_TRADING, grid: [], forecasting: ["load", "prices", "ranges", "why", "events", "history", "accuracy", "alerts"], settlement: [] },
  settlement: { label: "Settlement analyst", person: "Sofia Rossi", pages: ["/", "/settlement", "/trading", "/forecasting"], trading: ["pnl", "approvals", "reporting", "invoicing"], grid: [], forecasting: ["load", "history", "accuracy", "feeds", "delivery"], settlement: ALL_SETTLE },
  admin: { label: "Administrator", person: "Marco Huber", pages: ["/", "/forecasting", "/settlement", "/trading", "/grid"], trading: ALL_TRADING, grid: ALL_GRID, forecasting: ALL_FORECAST, settlement: ALL_SETTLE },
};

const NAV: Record<string, { label: string; icon: ReactNode }> = {
  "/": { label: "Overview", icon: <Activity size={18} /> },
  "/forecasting": { label: "Forecasting", icon: <LineChart size={18} /> },
  "/settlement": { label: "Settlement", icon: <Receipt size={18} /> },
  "/trading": { label: "Trading", icon: <ArrowLeftRight size={18} /> },
  "/grid": { label: "Grid planning", icon: <Network size={18} /> },
};

const RoleCtx = createContext<{ role: Role; setRole: (r: Role) => void }>({ role: "admin", setRole: () => {} });
export const useRole = () => useContext(RoleCtx);

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

function crumb(path: string) {
  if (path.startsWith("/trading/")) {
    const sub = TRADING_LABELS[path.split("/")[2]];
    return sub ? `Trading / ${sub}` : "Trading";
  }
  if (path.startsWith("/settlement/")) {
    const sub = SETTLE_LABELS[path.split("/")[2]];
    return sub ? `Settlement / ${sub}` : "Settlement";
  }
  if (path.startsWith("/forecasting/")) {
    const sub = FORECAST_LABELS[path.split("/")[2]];
    return sub ? `Forecasting / ${sub}` : "Forecasting";
  }
  if (path.startsWith("/grid/")) {
    const sub = GRID_LABELS[path.split("/")[2]];
    return sub ? `Grid planning / ${sub}` : "Grid planning";
  }
  return NAV[path]?.label ?? "";
}

function Shell() {
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const allowed = ROLES[role].pages;

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
            <path d="M2 20 L9 8 L13 14 L17 6 L24 20 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M2 22 H24" stroke="var(--volt)" strokeWidth="2.5" />
          </svg>
          <span>Talstrom</span>
        </div>

        <div className="role">
          <button className="role-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
            <span className="avatar">{ROLES[role].person.split(" ").map((p) => p[0]).join("")}</span>
            <span className="role-text">
              <strong>{ROLES[role].person}</strong>
              <small>{ROLES[role].label}</small>
            </span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <ul className="role-menu" role="menu">
              {(Object.keys(ROLES) as Role[]).map((r) => (
                <li key={r}>
                  <button
                    role="menuitem"
                    className={r === role ? "on" : ""}
                    onClick={() => {
                      setRole(r);
                      setOpen(false);
                    }}
                  >
                    {ROLES[r].label}
                    <small>{ROLES[r].person}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav>
          {allowed.map((p) => (
            <NavLink key={p} to={p === "/trading" ? "/trading" : p} end={p === "/"} className={({ isActive }) => (isActive ? "nav on" : "nav")}>
              {NAV[p].icon}
              {NAV[p].label}
            </NavLink>
          ))}
        </nav>

        <div className="rail-foot">
          <span>Talwerke AG</span>
          <span>Balance group 12XTALWERKE-NETZ</span>
          <span className="demo">Demo data</span>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="crumb">{crumb(loc.pathname)}</span>
          <span className="clock">
            <span className="live-dot" aria-hidden /> {TODAY}, 16:30 quarter-hour
          </span>
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="badge">4</span>
          </button>
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Overview />} />
            {allowed.includes("/forecasting") && <Route path="/forecasting/*" element={<ForecastLayout />} />}
            {allowed.includes("/settlement") && <Route path="/settlement/*" element={<SettleLayout />} />}
            {allowed.includes("/trading") && <Route path="/trading/*" element={<Trading />} />}
            {allowed.includes("/grid") && <Route path="/grid/*" element={<GridLayout />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>("admin");
  const [toast, setToast] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <RoleCtx.Provider value={{ role, setRole }}>
      <ToastCtx.Provider value={show}>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
        <div className={toast ? "toast show" : "toast"} role="status" aria-live="polite">
          {toast}
        </div>
      </ToastCtx.Provider>
    </RoleCtx.Provider>
  );
}
