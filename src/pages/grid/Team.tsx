import { useState } from "react";
import { UserPlus } from "lucide-react";
import { comments as initial, team } from "./gridData";
import { ROLES, useRole, useToast } from "../../App";
import { Head } from "../trading/ui";

export default function Team() {
  const toast = useToast();
  const { role } = useRole();
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");

  return (
    <div className="stack">
      <Head
        title="Team and access"
        text="Your engineers, field staff, consultants and municipalities work on the same model, each with the access they need and nothing more."
        actions={<button className="btn primary" onClick={() => toast("Invitation form opened. External access always gets an end date.")}><UserPlus size={16} /> Invite</button>}
      />
      <div className="grid-2">
        <section className="panel">
          <h2>People with access</h2>
          <p className="sub">External access ends automatically</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Can</th><th>Access until</th></tr></thead>
              <tbody>
                {team.map((m) => (
                  <tr key={m.name}>
                    <td>{m.name}<br /><small style={{ color: "var(--muted)" }}>{m.org}</small></td>
                    <td>{m.role}</td>
                    <td>{m.access}</td>
                    <td>{m.until || "No end date"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <h2>Discussion: Sonnenberg substation study</h2>
          <p className="sub">Comments stay with the study and its model version</p>
          <ul className="timeline wide">
            {comments.map((c, i) => (
              <li key={i}>
                <span className="t">{c.at.replace("Today ", "")}</span>
                <div><strong>{c.who}</strong><div style={{ fontSize: 14 }}>{c.text}</div></div>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              setComments([...comments, { who: ROLES[role].person, at: "16:31", text }]);
              setText("");
              toast("Comment posted. Participants are notified.");
            }}
            style={{ display: "flex", gap: 8, marginTop: 12 }}
          >
            <input style={{ flex: 1 }} placeholder="Write a comment" value={text} onChange={(e) => setText(e.target.value)} aria-label="Comment" />
            <button className="btn primary" type="submit">Post</button>
          </form>
        </section>
      </div>
    </div>
  );
}
