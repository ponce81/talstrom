import { useState } from "react";
import { Upload } from "lucide-react";
import { dataIssues, modelSources } from "./gridData";
import { useToast } from "../../App";
import { Head, Kpis, Status } from "../trading/ui";

export default function GridModel() {
  const toast = useToast();
  const [issues, setIssues] = useState(dataIssues);
  const score = 91 + (dataIssues.length - issues.length) * 2;

  return (
    <div className="stack">
      <Head
        title="Grid model"
        text="One model of your grid, built from your GIS, planning files and meter data. Fix the gaps here and every study uses the corrected data."
        actions={<button className="btn" onClick={() => toast("Choose a NEPLAN, PowerFactory, CIM or GIS export to import")}><Upload size={16} /> Import model</button>}
      />
      <Kpis
        items={[
          { label: "Data quality", value: `${score}%`, note: "of objects complete and consistent", tone: score >= 95 ? "good" : "" },
          { label: "Lines and cables", value: "412 km", note: "38 km medium voltage" },
          { label: "Transformer stations", value: "186", note: "4 substations" },
          { label: "Meters linked to the grid", value: "99.9%", note: `${issues.some((i) => i.id === "Q-2") ? "38" : "0"} not linked` },
        ]}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>Gaps to fix</h2>
          <p className="sub">{issues.length ? "Each has a suggested fix. Accepting it creates a new model version." : "No open gaps. The model is ready for studies."}</p>
          <ul className="list">
            {issues.map((i) => (
              <li key={i.id} className="gap">
                <span className={`dot ${i.severity}`} style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 6, flex: "none" }} aria-label={`${i.severity} priority`} />
                <div>
                  <strong>{i.text}</strong>
                  <small>Suggested: {i.fix}</small>
                </div>
                <div className="row-actions">
                  <button className="btn primary" onClick={() => { setIssues(issues.filter((x) => x.id !== i.id)); toast("Fix applied. Model version 143 created."); }}>Apply fix</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Sources</h2>
          <p className="sub">Imported automatically every night</p>
          <ul className="list">
            {modelSources.map((s) => (
              <li key={s.name}>
                <div>
                  <strong>{s.name}</strong>
                  <small>{s.system}, {s.records}, {s.last}</small>
                </div>
                <Status s={s.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
