# Talstrom – UI mock

A clickable front-end mock of a SaaS for Swiss grid operators, energy suppliers and traders. It covers forecasting, settlement runs, trading positions and grid planning. All data is generated in `src/data.ts`; nothing connects to a server.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## What to try

- **Switch role** with the person menu at the top left. Grid operator, energy trader, settlement analyst and administrator each see different pages and key figures.
- **Forecasting:** a module with 13 screens:
  - Load and production, Segments and areas, Behind-the-meter solar, Prices
  - Ranges (uncertainty), Why it changed, Events and adjustments, Forecast history
  - Data feeds, Accuracy (vs. a baseline), Models (live vs. challenger), Delivery (API, files), Alerts
  Try making model version 15 live, adding a manual adjustment, or switching alert rules.
- **Settlement:** a module with 13 screens:
  - Metering data (checks and estimates), Exceptions (with suggested fixes)
  - Runs, Balance groups (SDAT-CH to Swissgrid), Grid usage (tariffs incl. dynamic), LEG and ZEV, Feed-in, Supplier switching
  - Reconciliation, Simulation (test a new tariff on 2025 data), Audit trail (trace any number), Period close, Regulatory reports
  Try applying an exception fix, running a tariff simulation, or tracing a metering point.
- **Trading:** a module with 12 screens, grouped as daily operations, optimisation and control:
  - Positions (with a buy recommendation), Deals, Schedules, Market data
  - Imbalance costs, Flexibility (battery and heat-pump plan), PPAs
  - P&L, Risk limits, Approvals (four-eyes and audit trail), Reporting (ElCom/REMIT), Invoicing
  Try a deal over 10 MW: it goes to Approvals. Switch to the settlement analyst to see the reduced trading view.
- **Grid planning:** a module with 12 screens:
  - Grid model (data gaps with suggested fixes), Measured loading (smart meters vs. old estimates), Power flow
  - Connection requests (automatic checks), Hosting capacity map, Scenarios (sliders per municipality), Measures (cable vs. flexibility), Investment plan
  - Congestion forecast (request flexibility from trading), Model history (compare versions, open as of a date), Reports, Team and access
  Try the quick connection check, tick measures to combine them, or drag the scenario sliders.

## Structure

```
src/
  App.tsx          shell, navigation, role switcher, toasts
  data.ts          deterministic mock data
  styles.css       design tokens and all styles
  pages/
    Overview.tsx
    Forecasting.tsx
    Settlement.tsx
    Trading.tsx
    GridPlanning.tsx
```

Stack: Vite, React 18, TypeScript, React Router, Recharts, Lucide icons. Font: Archivo (Google Fonts).
