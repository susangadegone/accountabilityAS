import { useState, useEffect } from "react";

const TASK_COUNT = 5;
const USERS = ["Suz", "Aki"];
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxRukPoFiLYbUN_wJu0iZG6l6WT34ynDT49q7gbqbQK_KIiiFc7XqSr0p4r0jEFh-M9Bw/exec";
const STATUS_LABELS = { done: "Done", partial: "Partial", skipped: "Skipped" };

function today() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function lsGet(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function lsDel(key) { try { localStorage.removeItem(key); } catch {} }

const inputStyle = { width: "100%", padding: "8px 12px", fontSize: 14, border: "0.5px solid #ccc", borderRadius: 8, color: "#111", fontFamily: "inherit", background: "#fff" };
const primaryBtn = { padding: "9px 20px", fontSize: 14, fontWeight: 500, borderRadius: 8, background: "#111", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" };
const secondaryBtn = { padding: "7px 16px", fontSize: 13, borderRadius: 8, border: "0.5px solid #ccc", background: "transparent", color: "#555", cursor: "pointer", fontFamily: "inherit" };

function Label({ children }) {
  return <p style={{ fontSize: 12, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>{children}</p>;
}
function Divider() {
  return <hr style={{ border: "none", borderTop: "0.5px solid #eee", margin: "1.5rem 0" }} />;
}
function Hint({ children, style }) {
  return <p style={{ fontSize: 13, color: "#888", marginBottom: 12, ...style }}>{children}</p>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("plan");

  if (!user) return <UserSelect onSelect={setUser} />;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: "#111", margin: 0 }}>Daily accountability</h2>
          <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0" }}>Signed in as {user}</p>
        </div>
        <button onClick={() => setUser(null)} style={{ ...secondaryBtn, fontSize: 12 }}>Switch user</button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[["plan", "Plan"], ["checkin", "Check in"], ["goals", "Goals"], ["weekly", "Weekly"], ["meeting", "Meeting prep"], ["info", "Info"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 8,
            border: "0.5px solid", borderColor: tab === key ? "transparent" : "#ccc",
            background: tab === key ? "#111" : "transparent",
            color: tab === key ? "#fff" : "#555",
            cursor: "pointer", fontFamily: "inherit",
          }}>{label}</button>
        ))}
      </div>

      {tab === "plan" && <PlanTab user={user} />}
      {tab === "checkin" && <CheckinTab user={user} />}
      {tab === "goals" && <GoalsTab user={user} />}
      {tab === "weekly" && <WeeklyTab user={user} />}
      {tab === "meeting" && <MeetingTab user={user} />}
      {tab === "info" && <InfoTab />}
    </div>
  );
}

function UserSelect({ onSelect }) {
  return (
    <div style={{ maxWidth: 400, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Who are you?</h2>
      <p style={{ fontSize: 14, color: "#888", marginBottom: "2rem" }}>Your data stays separate in the app.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {USERS.map(u => (
          <button key={u} onClick={() => onSelect(u)} style={{ ...primaryBtn, fontSize: 16, padding: "12px 32px" }}>{u}</button>
        ))}
      </div>
    </div>
  );
}

function PlanTab({ user }) {
  const key = `plan_${user}`;
  const [date, setDate] = useState(today());
  const [tasks, setTasks] = useState(Array(TASK_COUNT).fill(""));
  const [schedule, setSchedule] = useState([{ time: "Morning", activity: "" }, { time: "Afternoon", activity: "" }]);
  const [intention, setIntention] = useState("");
  const [saved, setSaved] = useState(false);
  const goals = lsGet(`goals_${user}`) || [];

  useEffect(() => {
    const p = lsGet(key);
    if (p) { setDate(p.date || today()); setTasks(p.tasks || Array(TASK_COUNT).fill("")); setSchedule(p.schedule || []); setIntention(p.intention || ""); setSaved(true); }
  }, [user, key]);

  function save() {
    const filled = tasks.filter(t => t.trim());
    if (!filled.length) return alert("Add at least one task.");
    const plan = { date, tasks, schedule, intention };
    lsSet(key, plan);
    setSaved(true);
    alert("Plan saved!");
  }

  function clear() {
    lsDel(key);
    setTasks(Array(TASK_COUNT).fill(""));
    setSchedule([{ time: "Morning", activity: "" }, { time: "Afternoon", activity: "" }]);
    setIntention("");
    setDate(today());
    setSaved(false);
  }

  return (
    <div>
      {saved && <p style={{ fontSize: 13, color: "#3B6D11", marginBottom: "1rem", padding: "8px 12px", background: "#EAF3DE", borderRadius: 8 }}>Plan saved for {date}</p>}
      <Label>Date</Label>
      <input value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, marginBottom: "1.5rem" }} />

      <Divider />
      <Label>Top 5 tasks for today</Label>
      <Hint>Be specific. These are the things that actually move the needle today.</Hint>
      {Array.from({ length: TASK_COUNT }, (_, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#aaa", minWidth: 18 }}>{i + 1}.</span>
          <input
            value={tasks[i]}
            onChange={e => { const n = [...tasks]; n[i] = e.target.value; setTasks(n); }}
            placeholder={`Task ${i + 1}${goals.length ? " (type task name)" : ""}`}
            style={inputStyle}
          />
        </div>
      ))}

      <Divider />
      <Label>Rough schedule (optional)</Label>
      {schedule.map((block, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input value={block.time} onChange={e => { const n = [...schedule]; n[i] = { ...n[i], time: e.target.value }; setSchedule(n); }} placeholder="Time" style={{ ...inputStyle, width: 110, minWidth: 110 }} />
          <input value={block.activity} onChange={e => { const n = [...schedule]; n[i] = { ...n[i], activity: e.target.value }; setSchedule(n); }} placeholder="What you plan to do" style={inputStyle} />
          <button onClick={() => setSchedule(schedule.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 20, padding: "4px 6px" }}>×</button>
        </div>
      ))}
      <button onClick={() => setSchedule([...schedule, { time: "", activity: "" }])} style={secondaryBtn}>+ add block</button>

      <Divider />
      <Label>Intention for the day</Label>
      <textarea value={intention} onChange={e => setIntention(e.target.value)} placeholder="What would make today a good day? One sentence is enough." style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6 }} />

      <div style={{ marginTop: "1.5rem", display: "flex", gap: 8 }}>
        <button onClick={save} style={primaryBtn}>Save plan →</button>
        <button onClick={clear} style={secondaryBtn}>Clear</button>
      </div>
    </div>
  );
}

function CheckinTab({ user }) {
  const planKey = `plan_${user}`;
  const plan = lsGet(planKey);
  const [taskStatus, setTaskStatus] = useState({});
  const [notes, setNotes] = useState("");
  const [honestTake, setHonestTake] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  function setStatus(idx, status) {
    setTaskStatus(prev => ({ ...prev, [idx]: prev[idx] === status ? null : status }));
  }

  async function submit() {
    if (!plan) return;
    setLoading(true);
    setSubmitted(true);

    const statuses = plan.tasks.filter(t => t.trim()).map((t, i) => `${i + 1}. ${t} — ${taskStatus[i] || "not marked"}`).join("\n");
    const goals = (lsGet(`goals_${user}`) || []).map(g => g.title).join(", ") || "none set";

    const prompt = `You're helping ${user} stay accountable to their goals. Be direct, warm, honest — like a smart friend who notices patterns. Don't be a cheerleader but don't pile on.

Check-in for ${plan.date}:

Tasks and how they went:
${statuses}

What happened: ${notes || "(nothing noted)"}
Honest take: ${honestTake || "(nothing noted)"}
Active goals: ${goals}

Give:
1. A brief read on how the day went (2-3 sentences)
2. One pattern you notice (good or worth watching)
3. One concrete thing to try tomorrow

Keep it tight.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 1000 }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "No response.";
      setSummary(text);

      const sheetsUrl = SHEETS_URL;
      if (sheetsUrl) {
        const row = {
          type: "checkin", user, date: plan.date,
          tasks: plan.tasks.filter(t => t.trim()).join(" | "),
          statuses: plan.tasks.filter(t => t.trim()).map((_, i) => taskStatus[i] || "not marked").join(" | "),
          notes, honestTake, claudeFeedback: text,
          timestamp: new Date().toISOString()
        };
        await fetch(sheetsUrl + "?data=" + encodeURIComponent(JSON.stringify(row)), { method: "GET", mode: "no-cors" }).catch(() => {});
      }
    } catch (e) {
      setSummary("Couldn't connect. Try again.");
    }
    setLoading(false);
  }

  if (!plan) return <p style={{ fontSize: 14, color: "#888", padding: "1rem 0" }}>No plan saved yet. Go to <strong>Plan my day</strong> first.</p>;

  if (submitted) return (
    <div>
      <p style={{ fontSize: 13, color: "#888", marginBottom: "1.2rem" }}>{plan.date}</p>
      {loading ? <p style={{ fontSize: 14, color: "#888" }}>Reading your day...</p> : (
        <div>
          <Label>Your check-in</Label>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "#222", background: "#f9f9f8", border: "0.5px solid #e5e5e0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", whiteSpace: "pre-wrap" }}>{summary}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setSubmitted(false); setSummary(""); }} style={secondaryBtn}>Edit check-in</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: "#888", marginBottom: "1.2rem" }}>{plan.date}</p>
      <Label>How did each task go?</Label>
      {plan.tasks.filter(t => t.trim()).map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid #eee" }}>
          <span style={{ fontSize: 14, flex: 1, paddingRight: 12, color: taskStatus[i] === "skipped" ? "#aaa" : "#111", textDecoration: taskStatus[i] === "done" ? "line-through" : "none" }}>{t}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["done", "partial", "skipped"].map(s => (
              <button key={s} onClick={() => setStatus(i, s)} style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 99, border: "0.5px solid", cursor: "pointer", fontFamily: "inherit",
                borderColor: taskStatus[i] === s ? "transparent" : "#ddd",
                background: taskStatus[i] === s ? (s === "done" ? "#d1fae5" : s === "partial" ? "#fef3c7" : "#fee2e2") : "transparent",
                color: taskStatus[i] === s ? (s === "done" ? "#065f46" : s === "partial" ? "#92400e" : "#991b1b") : "#888",
              }}>{STATUS_LABELS[s]}</button>
            ))}
          </div>
        </div>
      ))}

      <Divider />
      <Label>What happened?</Label>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything that shifted, got in the way, or surprised you." style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} />

      <Divider />
      <Label>One honest take</Label>
      <textarea value={honestTake} onChange={e => setHonestTake(e.target.value)} placeholder="What's the real story of today?" style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6 }} />

      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={submit} style={primaryBtn} disabled={loading}>{loading ? "Thinking..." : "Get my check-in →"}</button>
      </div>
    </div>
  );
}

function GoalsTab({ user }) {
  const key = `goals_${user}`;
  const [goals, setGoals] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("life");
  const [newTarget, setNewTarget] = useState("");

  useEffect(() => { setGoals(lsGet(key) || []); }, [user, key]);

  function add() {
    if (!newTitle.trim()) return;
    const updated = [...goals, { id: Date.now(), title: newTitle.trim(), type: newType, target: newTarget.trim(), created: today() }];
    setGoals(updated);
    lsSet(key, updated);
    setNewTitle(""); setNewTarget("");
  }

  function remove(id) {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    lsSet(key, updated);
  }

  return (
    <div>
      <Hint>Set your big goals here. These inform your daily tasks and weekly check-ins.</Hint>

      {goals.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {goals.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 12px", border: "0.5px solid #eee", borderRadius: 8, marginBottom: 8, background: "#fafaf9" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111", margin: "0 0 2px" }}>{g.title}</p>
                <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{g.type === "life" ? "Life goal" : "Project"}{g.target ? ` · Target: ${g.target}` : ""}</p>
              </div>
              <button onClick={() => remove(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 18, padding: "0 4px" }}>×</button>
            </div>
          ))}
        </div>
      )}

      <Divider />
      <Label>Add a goal</Label>
      <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Goal title" style={{ ...inputStyle, marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select value={newType} onChange={e => setNewType(e.target.value)} style={{ ...inputStyle, width: 160 }}>
          <option value="life">Life goal</option>
          <option value="project">Project</option>
        </select>
        <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Target date (optional)" style={inputStyle} />
      </div>
      <button onClick={add} style={primaryBtn}>Add goal →</button>
    </div>
  );
}

function WeeklyTab({ user }) {
  const [moved, setMoved] = useState("");
  const [stalled, setStalled] = useState("");
  const [commitment, setCommitment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const goals = lsGet(`goals_${user}`) || [];
  const otherUser = USERS.find(u => u !== user);
  const otherWeekly = lsGet(`weekly_${otherUser}`);

  async function submit() {
    if (!moved.trim()) return alert("Fill in at least the first field.");
    setLoading(true);
    setSubmitted(true);
    lsSet(`weekly_${user}`, { moved, stalled, commitment, date: today() });

    const goalList = goals.map(g => g.title).join(", ") || "none set";
    const otherContext = otherWeekly ? `\n\n${otherUser}'s week:\n- Moved forward: ${otherWeekly.moved}\n- Stalled: ${otherWeekly.stalled}\n- Commitment: ${otherWeekly.commitment}` : "";

    const prompt = `You're helping ${user} and ${otherUser} stay accountable to their goals together. Be direct, honest, warm.

${user}'s week:
- Which goal moved forward: ${moved}
- Which stalled: ${stalled}
- Commitment for next week: ${commitment}
- Active goals: ${goalList}
${otherContext}

Give:
1. A read on ${user}'s week (2-3 sentences)
${otherWeekly ? `2. One observation about how both people are doing together\n3. One thing worth discussing in your next meeting` : "2. One pattern worth watching\n3. One thing to focus on next week"}

Keep it honest and tight.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 1000 }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "No response.";
      setSummary(text);

      const sheetsUrl = SHEETS_URL;
      if (sheetsUrl) {
        await fetch(sheetsUrl + "?data=" + encodeURIComponent(JSON.stringify({ type: "weekly", user, date: today(), moved, stalled, commitment, claudeFeedback: text, timestamp: new Date().toISOString() })), { method: "GET", mode: "no-cors" }).catch(() => {});
      }
    } catch (e) {
      setSummary("Couldn't connect. Try again.");
    }
    setLoading(false);
  }

  if (submitted) return (
    <div>
      {loading ? <p style={{ fontSize: 14, color: "#888" }}>Reading your week...</p> : (
        <div>
          <Label>Weekly reflection</Label>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "#222", background: "#f9f9f8", border: "0.5px solid #e5e5e0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", whiteSpace: "pre-wrap" }}>{summary}</div>
          {otherWeekly && <p style={{ fontSize: 13, color: "#888" }}>Both check-ins read together. ✓</p>}
          <button onClick={() => { setSubmitted(false); setSummary(""); }} style={secondaryBtn}>Edit</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Hint>Do this once a week. If {otherUser} has already submitted theirs, Claude will read both together.</Hint>
      {otherWeekly && <p style={{ fontSize: 13, color: "#3B6D11", padding: "8px 12px", background: "#EAF3DE", borderRadius: 8, marginBottom: "1.2rem" }}>{otherUser} already submitted their weekly. Claude will read both together. ✓</p>}

      <Label>Which goal moved forward this week?</Label>
      <textarea value={moved} onChange={e => setMoved(e.target.value)} placeholder="What actually progressed?" style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6, marginBottom: "1.5rem" }} />

      <Label>Which goal stalled?</Label>
      <textarea value={stalled} onChange={e => setStalled(e.target.value)} placeholder="What didn't move, and why?" style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6, marginBottom: "1.5rem" }} />

      <Label>What are you committing to next week?</Label>
      <textarea value={commitment} onChange={e => setCommitment(e.target.value)} placeholder="One concrete thing." style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6, marginBottom: "1.5rem" }} />

      <button onClick={submit} style={primaryBtn} disabled={loading}>{loading ? "Thinking..." : "Get weekly reflection →"}</button>
    </div>
  );
}

function MeetingTab({ user }) {
  const [meetingType, setMeetingType] = useState("45");
  const [cover, setCover] = useState("");
  const [stuck, setStuck] = useState("");
  const [need, setNeed] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const otherUser = USERS.find(u => u !== user);

  async function submit() {
    if (!cover.trim()) return alert("Add at least what you want to cover.");
    setLoading(true);
    setSubmitted(true);

    const goals = (lsGet(`goals_${user}`) || []).map(g => g.title).join(", ") || "none set";

    const prompt = `${user} is prepping for a ${meetingType}-minute meeting with ${otherUser}. Help them walk in ready.

What they want to cover: ${cover}
Where they're stuck: ${stuck || "(nothing noted)"}
What they need from ${otherUser}: ${need || "(nothing noted)"}
Active goals: ${goals}

Give:
1. A suggested agenda for the ${meetingType} minutes (keep it realistic)
2. One thing to make sure they don't leave without resolving
3. One question worth asking ${otherUser}

Be practical and direct.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 1000 }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "No response.";
      setSummary(text);

      const sheetsUrl = SHEETS_URL;
      if (sheetsUrl) {
        await fetch(sheetsUrl + "?data=" + encodeURIComponent(JSON.stringify({ type: "meeting_prep", user, date: today(), meetingType, cover, stuck, need, claudeFeedback: text, timestamp: new Date().toISOString() })), { method: "GET", mode: "no-cors" }).catch(() => {});
      }
    } catch (e) {
      setSummary("Couldn't connect. Try again.");
    }
    setLoading(false);
  }

  if (submitted) return (
    <div>
      {loading ? <p style={{ fontSize: 14, color: "#888" }}>Building your prep...</p> : (
        <div>
          <Label>Meeting prep — {meetingType} min with {otherUser}</Label>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "#222", background: "#f9f9f8", border: "0.5px solid #e5e5e0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", whiteSpace: "pre-wrap" }}>{summary}</div>
          <button onClick={() => { setSubmitted(false); setSummary(""); }} style={secondaryBtn}>Edit</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Hint>Fill this out before you meet with {otherUser}. Takes 2 minutes.</Hint>

      <Label>Meeting length</Label>
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {["45", "30"].map(t => (
          <button key={t} onClick={() => setMeetingType(t)} style={{
            padding: "7px 18px", fontSize: 14, borderRadius: 8, border: "0.5px solid",
            borderColor: meetingType === t ? "transparent" : "#ccc",
            background: meetingType === t ? "#111" : "transparent",
            color: meetingType === t ? "#fff" : "#555",
            cursor: "pointer", fontFamily: "inherit",
          }}>{t} min</button>
        ))}
      </div>

      <Label>What do you want to cover?</Label>
      <textarea value={cover} onChange={e => setCover(e.target.value)} placeholder="Topics, updates, decisions you need to make together." style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6, marginBottom: "1.5rem" }} />

      <Label>Where are you stuck?</Label>
      <textarea value={stuck} onChange={e => setStuck(e.target.value)} placeholder="Anything you're spinning on that the meeting could unblock." style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6, marginBottom: "1.5rem" }} />

      <Label>What do you need from {otherUser}?</Label>
      <textarea value={need} onChange={e => setNeed(e.target.value)} placeholder="Input, a decision, a reality check — be specific." style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6, marginBottom: "1.5rem" }} />

      <button onClick={submit} style={primaryBtn} disabled={loading}>{loading ? "Building prep..." : "Get meeting prep →"}</button>
    </div>
  );
}

function InfoTab() {
  const row = (title, children) => (
    <div style={{ marginBottom: "1.2rem", padding: "10px 12px", border: "0.5px solid #eee", borderRadius: 8, background: "#fafaf9" }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#111", margin: "0 0 4px" }}>{title}</p>
      <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.6 }}>{children}</p>
    </div>
  );

  return (
    <div>
      <Hint>How saving works in this app — read this if something seems to disappear.</Hint>

      <Label>Saved on this device only</Label>
      {row("Plan", "Saved when you click \"Save plan →\". Stays until you click Clear or save over it.")}
      {row("Goals", "Saved instantly when you add or remove a goal — no save button needed.")}
      {row("Weekly", "Saved automatically when you click \"Get weekly reflection →\".")}

      <Hint style={{ marginTop: "1rem" }}>
        ⚠️ This data lives in your browser on this device. If you use the app on a different
        device or browser, you won't see it there — each person's plans/goals are private to them.
      </Hint>

      <Divider />

      <Label>Logged to the shared Google Sheet</Label>
      {row("Check-in, Weekly, Meeting prep", "When you submit, your inputs and Claude's feedback are sent to the shared sheet you both can see.")}

      <Divider />

      <Label>What does NOT save</Label>
      {row("Check-in details", "Notes, honest take, and task statuses are only sent to the Sheet — not saved locally. Clicking \"Edit check-in\" resets these fields.")}
      {row("Meeting prep inputs", "Only logged to the Sheet — not saved locally.")}
      {row("Anything you type without clicking the main button", "Navigating away before clicking Save/Submit loses your input (except Goals, which auto-saves).")}

      <Hint style={{ marginTop: "1rem" }}><strong>Rule of thumb:</strong> always click the primary button (Save plan, Get my check-in, etc.) before leaving a tab.</Hint>
    </div>
  );
}